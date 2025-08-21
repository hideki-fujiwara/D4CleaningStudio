import { useState, useEffect, useCallback, useRef } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import ConsoleMsg from "../../../utils/ConsoleMsg";
import { loadStore } from "../../../utils/StoreManager";
import { DEFAULT_PROJECT_NAME, INITIAL_EXPANDED_KEYS } from "../constants";

/**
 * プロジェクトツリーの状態管理を行うカスタムフック
 * ファイルシステムの読み込み、ツリーの操作、イベントハンドリングを提供
 *
 * @returns {Object} ツリーの状態とハンドラー関数
 */
export const useProjectTree = () => {
  // === 状態管理 ===
  // ツリーで展開されているノードのキーを管理（Set形式）
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(["root"]));

  // ツリーで選択されているノードのキーを管理（Set形式）
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());

  // プロジェクト名を管理（設定ファイルから読み込み）
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);

  // ファイルシステムの階層構造を管理（ツリー表示用のデータ）
  const [filesystem, setFilesystem] = useState(() => [
    {
      id: "root",
      name: DEFAULT_PROJECT_NAME,
      children: [],
    },
  ]);

  // 読み込み中かどうかを管理
  const [loading, setLoading] = useState(false);

  // エラーメッセージ
  const [error, setError] = useState(null);

  // 初期化が完了したかどうかを追跡（useEffectの重複実行を防ぐ）
  const isInitializedRef = useRef(false);

  // 前回の展開状態を保持（新規展開ノードの検出に使用）
  const prevExpandedRef = useRef(new Set(["root"]));

  // フォルダクリック時に復元するため、直近の「ファイル選択」を保持
  const lastFileSelectionRef = useRef(new Set());

  // === ファイルシステム操作関数 ===

  /**
   * ファイルシステムのエントリーを1階層分だけツリーノードに変換
   * @param {Array} entries - ファイルシステムのエントリー配列
   * @param {string} parentPath - 親ディレクトリのパス
   * @returns {Promise<Array>} 変換されたノード配列
   */
  const mapOneLevelAsync = useCallback(async (entries, parentPath) => {
    const list = await Promise.all(
      (entries ?? []).map(async (e, index) => {
        const name = e?.name ?? "unknown";
        // パスを結合（Tauriのjoin関数を使用）
        const fullPath = e?.path ?? (await join(parentPath ?? "", name));
        // ユニークなIDを生成（パスベース）
        const id = String(fullPath ?? `${parentPath ?? ""}/${name}-${index}`);
        const isFile = e?.isFile === true;

        return {
          id, // ノードの一意識別子
          name, // 表示名（ファイル/フォルダ名）
          path: fullPath, // フルパス
          parentPath: parentPath ?? null, // 親ディレクトリのパス
          isFile, // ファイルかどうか
          isDirectory: !isFile, // ディレクトリかどうか
        };
      })
    );
    return list;
  }, []);

  /**
   * ツリーから指定されたIDのノードを検索
   * @param {Array} nodes - 検索対象のノード配列
   * @param {string} id - 検索するノードのID
   * @returns {Object|null} 見つかったノードまたはnull
   */
  const findNodeById = useCallback(function findNodeById(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return n;
      // 子ノードがある場合は再帰的に検索
      if (n.children?.length) {
        const hit = findNodeById(n.children, id);
        if (hit) return hit;
      }
    }
    return null;
  }, []);

  /**
   * 指定されたIDのノードの子ノードを置換
   * @param {Array} nodes - 対象のノード配列
   * @param {string} id - 置換するノードのID
   * @param {Array} children - 新しい子ノード配列
   * @returns {Array} 更新されたノード配列
   */
  const setChildrenById = useCallback(function setChildrenById(nodes, id, children) {
    return nodes.map((n) => {
      if (n.id === id) {
        // 対象ノードの場合は子ノードを置換
        return { ...n, children };
      }
      if (n.children?.length) {
        // 子ノードがある場合は再帰的に処理
        return { ...n, children: setChildrenById(n.children, id, children) };
      }
      return n;
    });
  }, []);

  // === 非同期読み込み関数 ===

  /**
   * 指定されたディレクトリパスからファイルシステムを読み込み
   * @param {string} dirPath - 読み込むディレクトリのパス
   * @param {string} currentProjectName - 現在のプロジェクト名
   */
  const loadFilesystem = useCallback(
    async (dirPath, currentProjectName) => {
      try {
        setLoading(true);
        setError(null);
        ConsoleMsg("info", `ルートディレクトリ読み込み開始: ${dirPath}`);

        // TauriのreadDir APIでディレクトリ内容を取得
        const entries = await readDir(dirPath);
        // 1階層分をツリーノードに変換
        const children = await mapOneLevelAsync(entries, dirPath);

        // ルートノードを含むファイルシステムツリーを設定
        setFilesystem([
          {
            id: "root",
            name: currentProjectName || DEFAULT_PROJECT_NAME,
            dirPath: dirPath, // ディレクトリパスを保存
            path: dirPath,
            isDirectory: true,
            isFile: false,
            children, // 読み込んだ子ノード
          },
        ]);

        ConsoleMsg("info", `ルートディレクトリ読み込み完了: ${children.length} 件`);
      } catch (error) {
        // エラー時は空のツリーを設定
        const msg = error instanceof Error ? error.message : String(error);
        ConsoleMsg("error", `ルートディレクトリ読み込みエラー: ${msg}`);
        setFilesystem([
          {
            id: "root",
            name: currentProjectName || DEFAULT_PROJECT_NAME,
            isDirectory: true,
            isFile: false,
            children: [],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [mapOneLevelAsync]
  );

  /**
   * 設定ファイルからプロジェクト名を読み込み
   * @returns {Promise<string>} 読み込まれたプロジェクト名
   */
  const loadProjectName = useCallback(async () => {
    try {
      const config = await loadStore();
      const name = config?.projectConfig?.name || DEFAULT_PROJECT_NAME;
      setProjectName(name);
      ConsoleMsg("info", `プロジェクト名読み込み: ${name}`);
      return name;
    } catch (error) {
      ConsoleMsg("error", `プロジェクト名読み込みエラー: ${error?.message || error}`);
      setProjectName(DEFAULT_PROJECT_NAME);
      return DEFAULT_PROJECT_NAME;
    }
  }, []);

  /**
   * 設定ファイルからディレクトリパスを取得してファイルシステムを読み込み
   */
  const loadFilesystemFromConfig = useCallback(async () => {
    try {
      const config = await loadStore();
      let dirPath = config?.projectConfig?.filepath;
      const currentProjectName = config?.projectConfig?.name || DEFAULT_PROJECT_NAME;

      if (!dirPath) {
        // パスが設定されていない場合は空のツリーを表示
        ConsoleMsg("info", "filepath未設定：空のツリーを表示");
        setFilesystem([
          {
            id: "root",
            name: currentProjectName,
            children: [],
            isDirectory: true,
            isFile: false,
          },
        ]);
        return;
      }

      // Windows形式のパス区切りを正規化
      dirPath = dirPath.replace(/\\/g, "/");
      ConsoleMsg("info", `設定から読み込んだパス: ${dirPath}`);

      // ファイルシステムを読み込み
      await loadFilesystem(dirPath, currentProjectName);
    } catch (error) {
      // エラー時は空のツリーを設定
      ConsoleMsg("error", `設定読み込みエラー: ${error?.message || error}`);
      setFilesystem([
        {
          id: "root",
          name: DEFAULT_PROJECT_NAME,
          children: [],
          isDirectory: true,
          isFile: false,
        },
      ]);
    }
  }, [loadFilesystem]);

  /**
   * 指定されたフォルダーの子ノードを遅延読み込み
   * @param {string} nodeId - 読み込み対象のノードID
   */
  const ensureChildrenLoaded = useCallback(
    async (nodeId) => {
      ConsoleMsg("debug", `ensureChildrenLoaded 開始: ${nodeId}`);

      // 現在のファイルシステム状態を取得
      let currentFilesystem;
      setFilesystem((prev) => {
        currentFilesystem = prev;
        return prev;
      });

      // 対象ノードを検索
      const target = findNodeById(currentFilesystem ?? [], nodeId);

      // ノードが見つからない場合はスキップ
      if (!target) {
        ConsoleMsg("warn", `ノードが見つかりません: ${nodeId}`);
        return;
      }

      // ディレクトリでない場合はスキップ
      if (!target.isDirectory) {
        ConsoleMsg("debug", `ファイルなのでスキップ: ${nodeId}`);
        return;
      }

      // すでに読み込み済みの場合はスキップ
      if (target.children !== undefined) {
        ConsoleMsg("debug", `すでにロード済み: ${nodeId}`);
        return;
      }

      try {
        ConsoleMsg("info", `子を読み込み中: ${target.path}`);

        // ディレクトリの内容を読み込み
        const entries = await readDir(target.path);
        const children = await mapOneLevelAsync(entries, target.path);

        // ファイルシステムツリーを更新
        setFilesystem((prev) => setChildrenById(prev, nodeId, children));
        ConsoleMsg("info", `子の読み込み完了: ${target.path} -> ${children.length} 件`);
      } catch (error) {
        ConsoleMsg("error", `子読み込み失敗: ${target.path} - ${error?.message || error}`);
        // エラー時は空配列を設定して再試行ループを防ぐ
        setFilesystem((prev) => setChildrenById(prev, nodeId, []));
      }
    },
    [findNodeById, mapOneLevelAsync, setChildrenById]
  );

  // === イベントハンドラー ===

  /**
   * ツリーノードの展開状態変更ハンドラー
   * @param {Set|string} keys - 展開されているキーのSet
   */
  const handleExpandedChange = useCallback(
    (keys) => {
      // "all"の場合は何もしない
      if (keys === "all") return;

      const newKeys = keys instanceof Set ? keys : new Set(keys);
      const prevKeys = prevExpandedRef.current;

      // 新しく展開されたキーを特定
      const newlyExpanded = [...newKeys].filter((key) => !prevKeys.has(key));

      ConsoleMsg("debug", `展開状態変更:`, {
        previous: [...prevKeys],
        current: [...newKeys],
        newlyExpanded,
      });

      // 新しく展開されたフォルダーの子を遅延ロード
      newlyExpanded.forEach((nodeId) => {
        if (nodeId !== "root") {
          ConsoleMsg("debug", `新規展開ノードの子を読み込み: ${nodeId}`);
          ensureChildrenLoaded(nodeId);
        }
      });

      // 展開状態を更新
      setExpandedKeys(newKeys);
      prevExpandedRef.current = newKeys;
    },
    [ensureChildrenLoaded]
  );

  /**
   * 選択変更ハンドラー (フォルダは選択しない / クリックでトグル展開のみ)
   * 仕様:
   *  - フォルダクリック: 展開/折りたたみ + 子遅延ロード (選択状態は変えない)
   *  - ファイルクリック: 選択状態を更新
   */
  const handleSelectionChange = useCallback(
    (keys) => {
      if (keys === "all") return;

      const firstKey = keys?.values?.().next?.().value;
      if (!firstKey) return;

      const node = findNodeById(filesystem, firstKey);
      if (!node) return;

      // ---- ディレクトリの場合: 選択を無効化し、展開トグルのみ ----
      if (node.isDirectory) {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          if (next.has(firstKey)) {
            if (firstKey !== "root") next.delete(firstKey);
          } else {
            next.add(firstKey);
            ensureChildrenLoaded(firstKey);
          }
          next.add("root");
          prevExpandedRef.current = next;
          return next;
        });

        // 選択状態は「最後に選んだファイル」に戻す (なければ空)
        setSelectedKeys(() => new Set(lastFileSelectionRef.current));
        return;
      }

      // ---- ファイルの場合: 通常の選択処理 ----
      setSelectedKeys(keys);
      lastFileSelectionRef.current = new Set(keys); // ファイル選択を記録
    },
    [filesystem, findNodeById, ensureChildrenLoaded]
  );

  /**
   * ツリーノードのアクション（ダブルクリックなど）ハンドラー
   * @param {string} key - アクションが実行されたノードのキー
   */
  const handleAction = useCallback((key) => {
    ConsoleMsg("info", `アクション: ${key}`);
  }, []);

  /**
   * ツリーの更新ボタンのハンドラー
   * プロジェクト名とファイルシステムを再読み込み
   */
  const handleRefresh = useCallback(() => {
    ConsoleMsg("info", "ツリー更新");
    // 非同期処理を順次実行（無限ループを防ぐため）
    loadProjectName().then(() => {
      loadFilesystemFromConfig();
    });
  }, [loadProjectName, loadFilesystemFromConfig]);

  /**
   * すべてのフォルダを折りたたむボタンのハンドラー
   */
  const handleCollapseAll = useCallback(() => {
    // ルートノードのみ展開状態にリセット
    setExpandedKeys(new Set(["root"]));
    prevExpandedRef.current = new Set(["root"]);
    ConsoleMsg("info", "すべて折りたたみ");
  }, []);

  /**
   * 新しいファイル作成ボタンのハンドラー
   * TODO: 実装予定
   */
  const handleNewFile = useCallback(() => {
    ConsoleMsg("info", "新しいファイル作成");
  }, []);

  /**
   * 新しいフォルダ作成ボタンのハンドラー
   * TODO: 実装予定
   */
  const handleNewFolder = useCallback(() => {
    ConsoleMsg("info", "新しいフォルダ作成");
  }, []);

  // === 初期化処理 ===

  /**
   * コンポーネント初期化時に一度だけ実行される処理
   * プロジェクト名とファイルシステムを読み込み
   */
  useEffect(() => {
    // 初期化フラグで重複実行を防ぐ
    if (isInitializedRef.current) return;

    isInitializedRef.current = true;
    ConsoleMsg("info", "ProjectTree初期化開始");

    // 非同期初期化処理
    const initialize = async () => {
      await loadProjectName(); // プロジェクト名を読み込み
      await loadFilesystemFromConfig(); // ファイルシステムを読み込み
    };

    initialize();
  }, []); // 空の依存配列で一度だけ実行

  // === 戻り値 ===
  // カスタムフックが提供する状態とハンドラー関数
  return {
    // 状態
    expandedKeys,
    selectedKeys,
    projectName,
    filesystem,
    loading,
    error,
    // ハンドラー
    handleSelectionChange,
    handleExpandedChange,
    handleAction,
    handleRefresh,
    handleCollapseAll,
    handleNewFile,
    handleNewFolder,
    // ユーティリティ
    loadProjectName,
    loadFilesystemFromConfig,
    setFilesystem,
    ensureChildrenLoaded,
    loadFilesystem,
    // 追加: 外部で展開状態を直接操作したいケース用
    setExpandedKeys, // ← これを追加
  };
};
