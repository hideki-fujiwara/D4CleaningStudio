import { useState, useEffect, useCallback } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
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

  // 展開されているノードのキー
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(INITIAL_EXPANDED_KEYS));

  // 選択されているノードのキー
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());

  // プロジェクト名
  const [projectName, setProjectName] = useState(DEFAULT_PROJECT_NAME);

  // ファイルシステムのツリー構造
  const [filesystem, setFilesystem] = useState(() => [{ id: "root", name: DEFAULT_PROJECT_NAME, children: [] }]);

  // === ヘルパー関数 ===

  /**
   * Tauri の readDir 結果をツリー構造にマッピング
   *
   * @param {Array} entries - readDir の結果
   * @returns {Array} ツリー構造のデータ
   */
  const mapEntries = useCallback((entries) => {
    return (entries ?? [])
      .filter(Boolean) // null/undefined を除外
      .map((entry, index) => {
        // ID の生成（パスがあればそれを使用、なければ fallback）
        const rawId = entry?.path || `${entry?.name ?? "item"}-${index}`;
        const id = String(rawId);

        // 表示名の生成（ファイル名を抽出）
        const name =
          entry?.name ||
          id
            .replace(/[\\/]+$/, "")
            .split(/[\\/]/)
            .pop() ||
          "unknown";

        // 子要素の再帰的処理
        const children = Array.isArray(entry?.children) ? mapEntries(entry.children) : [];

        return { id, name, children };
      });
  }, []);

  // === データローダー ===

  /**
   * 設定からプロジェクト名を読み込む
   */
  const loadProjectName = useCallback(async () => {
    try {
      const config = await loadStore();
      const name = config?.projectConfig?.name || DEFAULT_PROJECT_NAME;
      setProjectName(name);
      ConsoleMsg("info", `プロジェクト名: ${name}`);
    } catch (error) {
      ConsoleMsg("error", `プロジェクト名読み込みエラー: ${error.message}`);
      setProjectName(DEFAULT_PROJECT_NAME);
    }
  }, []);

  /**
   * 指定されたディレクトリパスからファイルシステムを読み込む
   *
   * @param {string} dirPath - 読み込むディレクトリのパス
   */
  const loadFilesystem = useCallback(
    async (dirPath) => {
      try {
        // Tauri のファイルシステム API を使用して再帰的に読み込み
        const entries = await readDir(dirPath, { recursive: true });

        // ルートノードとしてプロジェクト名とパスを設定
        setFilesystem([
          {
            id: "root",
            name: projectName,
            dirPath: dirPath, // 実際のディレクトリパスを保存
            children: mapEntries(entries),
          },
        ]);

        ConsoleMsg("info", `ファイルツリー読み込み完了: ${dirPath}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        ConsoleMsg("error", `ファイルツリー読み込みエラー: ${errorMessage}`);

        // エラー時は空のツリーを設定
        setFilesystem([{ id: "root", name: projectName, children: [] }]);
      }
    },
    [projectName, mapEntries]
  );

  /**
   * 設定ファイルからディレクトリパスを取得してファイルシステムを読み込む
   */
  const loadFilesystemFromConfig = useCallback(async () => {
    try {
      const config = await loadStore();
      const dirPath = config?.projectConfig?.filepath;

      if (!dirPath) {
        ConsoleMsg("info", "filepath未設定：空のツリーを表示");
        setFilesystem([{ id: "root", name: projectName, children: [] }]);
        return;
      }

      await loadFilesystem(dirPath);
    } catch (error) {
      ConsoleMsg("error", `設定読み込みエラー: ${error.message}`);
      setFilesystem([{ id: "root", name: projectName, children: [] }]);
    }
  }, [projectName, loadFilesystem]);

  // === イベントハンドラー ===

  /**
   * ツリーアイテムの選択変更時のハンドラー
   *
   * @param {Set|string} keys - 選択されたキーのセット
   */
  const handleSelectionChange = useCallback((keys) => {
    if (keys === "all") return; // 全選択は対応しない

    setSelectedKeys(keys);

    // 最初に選択されたアイテムをログに出力
    const firstKey = keys?.values?.().next?.().value;
    if (firstKey) {
      ConsoleMsg("info", `選択: ${firstKey}`);
    }
  }, []);

  /**
   * ツリーアイテムの展開状態変更時のハンドラー
   *
   * @param {Set|string} keys - 展開されたキーのセット
   */
  const handleExpandedChange = useCallback((keys) => {
    if (keys === "all") return; // 全展開は対応しない
    setExpandedKeys(keys);
  }, []);

  /**
   * ツリーアイテムのアクション実行時のハンドラー（ダブルクリックなど）
   *
   * @param {string} key - アクションが実行されたアイテムのキー
   */
  const handleAction = useCallback((key) => {
    ConsoleMsg("info", `アクション: ${key}`);
  }, []);

  /**
   * ツリーの更新ボタンのハンドラー
   */
  const handleRefresh = useCallback(() => {
    ConsoleMsg("info", "ツリー更新");
    // プロジェクト名とファイルシステムを並行して再読み込み
    Promise.all([loadProjectName(), loadFilesystemFromConfig()]);
  }, [loadProjectName, loadFilesystemFromConfig]);

  /**
   * 全て折りたたみボタンのハンドラー
   */
  const handleCollapseAll = useCallback(() => {
    setExpandedKeys(new Set(["root"])); // ルートのみ展開状態を維持
    ConsoleMsg("info", "すべて折りたたみ");
  }, []);

  // === 戻り値 ===
  return {
    // 状態
    expandedKeys, // 展開されているキー
    selectedKeys, // 選択されているキー
    projectName, // プロジェクト名
    filesystem, // ファイルシステムのツリー構造

    // イベントハンドラー
    handleSelectionChange, // 選択変更ハンドラー
    handleExpandedChange, // 展開状態変更ハンドラー
    handleAction, // アクション実行ハンドラー
    handleRefresh, // 更新ハンドラー
    handleCollapseAll, // 全て折りたたみハンドラー

    // データローダー
    loadProjectName, // プロジェクト名読み込み
    loadFilesystemFromConfig, // 設定からファイルシステム読み込み

    // セッター（外部から状態を変更する場合に使用）
    setFilesystem, // ファイルシステム状態の直接設定
  };
};
