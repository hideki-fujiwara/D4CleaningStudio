

import { useState, useEffect, useCallback, useRef } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { join } from "@tauri-apps/api/path";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { loadStore } from "../../utils/StoreManager";
import { DEFAULT_PROJECT_NAME, INITIAL_EXPANDED_KEYS } from "./constants";

/**
 * プロジェクトツリーの状態管理を行うカスタムフック
 * ファイルシステムの読み込み、ツリーの操作、イベントハンドリングを提供
 *
 * @returns {Object} ツリーの状態とハンドラー関数
 */
export const useProjectTree = () => {
  // === 状態管理 ===
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(["root"]));
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);
  const [filesystem, setFilesystem] = useState(() => [
    {
      id: "root",
      name: DEFAULT_PROJECT_NAME,
      children: [],
    },
  ]);

  // 初期化状態を追跡
  const isInitializedRef = useRef(false);
  const prevExpandedRef = useRef(new Set(["root"]));

  // === 1階層分をツリーノードへ変換 ===
  const mapOneLevelAsync = useCallback(async (entries, parentPath) => {
    const list = await Promise.all(
      (entries ?? []).map(async (e, index) => {
        const name = e?.name ?? "unknown";
        const fullPath = e?.path ?? (await join(parentPath ?? "", name));
        const id = String(fullPath ?? `${parentPath ?? ""}/${name}-${index}`);
        const isFile = e?.isFile === true;

        return {
          id,
          name,
          path: fullPath,
          parentPath: parentPath ?? null,
          isFile,
          isDirectory: !isFile,
        };
      })
    );
    return list;
  }, []);

  // === ツリーから id を探す ===
  const findNodeById = useCallback(function findNodeById(nodes, id) {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children?.length) {
        const hit = findNodeById(n.children, id);
        if (hit) return hit;
      }
    }
    return null;
  }, []);

  // === 指定ノードの children を置換 ===
  const setChildrenById = useCallback(function setChildrenById(nodes, id, children) {
    return nodes.map((n) => {
      if (n.id === id) {
        return { ...n, children };
      }
      if (n.children?.length) {
        return { ...n, children: setChildrenById(n.children, id, children) };
      }
      return n;
    });
  }, []);

  // === loadFilesystem関数をuseCallbackで定義（projectNameに依存しないように修正） ===
  const loadFilesystem = useCallback(async (dirPath, currentProjectName) => {
    try {
      ConsoleMsg("info", `ルートディレクトリ読み込み開始: ${dirPath}`);
      const entries = await readDir(dirPath);
      const children = await mapOneLevelAsync(entries, dirPath);

      setFilesystem([
        {
          id: "root",
          name: currentProjectName || DEFAULT_PROJECT_NAME,
          dirPath: dirPath,
          path: dirPath,
          isDirectory: true,
          isFile: false,
          children,
        },
      ]);

      ConsoleMsg("info", `ルートディレクトリ読み込み完了: ${children.length} 件`);
    } catch (error) {
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
    }
  }, [mapOneLevelAsync]);

  // === プロジェクト名を読み込む（単独で実行） ===
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

  // === 設定ファイルからディレクトリパスを取得してファイルシステムを読み込む ===
  const loadFilesystemFromConfig = useCallback(async () => {
    try {
      const config = await loadStore();
      let dirPath = config?.projectConfig?.filepath;
      const currentProjectName = config?.projectConfig?.name || DEFAULT_PROJECT_NAME;

      if (!dirPath) {
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

      // パスを正規化
      dirPath = dirPath.replace(/\\/g, "/");
      ConsoleMsg("info", `設定から読み込んだパス: ${dirPath}`);

      await loadFilesystem(dirPath, currentProjectName);
    } catch (error) {
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
  }, [loadFilesystem]); // loadFilesystemのみに依存

  // === 指定フォルダーの子を遅延ロード ===
  const ensureChildrenLoaded = useCallback(
    async (nodeId) => {
      ConsoleMsg("debug", `ensureChildrenLoaded 開始: ${nodeId}`);

      let currentFilesystem;
      setFilesystem((prev) => {
        currentFilesystem = prev;
        return prev;
      });

      const target = findNodeById(currentFilesystem ?? [], nodeId);

      // すでにロード済みまたはディレクトリでない場合はスキップ
      if (!target) {
        ConsoleMsg("warn", `ノードが見つかりません: ${nodeId}`);
        return;
      }

      if (!target.isDirectory) {
        ConsoleMsg("debug", `ファイルなのでスキップ: ${nodeId}`);
        return;
      }

      if (target.children !== undefined) {
        ConsoleMsg("debug", `すでにロード済み: ${nodeId}`);
        return;
      }

      try {
        ConsoleMsg("info", `子を読み込み中: ${target.path}`);
        const entries = await readDir(target.path);
        const children = await mapOneLevelAsync(entries, target.path);

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

  // === 展開状態変更ハンドラー ===
  const handleExpandedChange = useCallback(
    (keys) => {
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

      // 状態を更新
      setExpandedKeys(newKeys);
      prevExpandedRef.current = newKeys;
    },
    [ensureChildrenLoaded]
  );

  // === その他のハンドラー ===
  const handleSelectionChange = useCallback((keys) => {
    if (keys === "all") return;
    setSelectedKeys(keys);
    const firstKey = keys?.values?.().next?.().value;
    if (firstKey) {
      ConsoleMsg("info", `選択: ${firstKey}`);
    }
  }, []);

  const handleAction = useCallback((key) => {
    ConsoleMsg("info", `アクション: ${key}`);
  }, []);

  const handleRefresh = useCallback(() => {
    ConsoleMsg("info", "ツリー更新");
    // 同期的に実行して無限ループを防ぐ
    loadProjectName().then(() => {
      loadFilesystemFromConfig();
    });
  }, [loadProjectName, loadFilesystemFromConfig]);

  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set(["root"]));
    prevExpandedRef.current = new Set(["root"]);
    ConsoleMsg("info", "すべて折りたたみ");
  }, []);

  const handleNewFile = useCallback(() => {
    ConsoleMsg("info", "新しいファイル作成");
  }, []);

  const handleNewFolder = useCallback(() => {
    ConsoleMsg("info", "新しいフォルダ作成");
  }, []);

  // === 初期化（一度だけ実行） ===
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    ConsoleMsg("info", "ProjectTree初期化開始");
    
    const initialize = async () => {
      await loadProjectName();
      await loadFilesystemFromConfig();
    };
    
    initialize();
  }, []); // 空の依存配列で一度だけ実行

  // === 戻り値 ===
  return {
    expandedKeys,
    selectedKeys,
    projectName,
    filesystem,
    handleSelectionChange,
    handleExpandedChange,
    handleAction,
    handleRefresh,
    handleCollapseAll,
    handleNewFile,
    handleNewFolder,
    loadProjectName,
    loadFilesystemFromConfig,
    setFilesystem,
    ensureChildrenLoaded,
    loadFilesystem,
  };
};
