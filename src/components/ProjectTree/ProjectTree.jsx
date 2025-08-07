// ========================================================================================
// インポート
// ========================================================================================
import React, { useState, useEffect } from "react";
import { Tree, TreeItem, Button, Collection, TreeItemContent } from "react-aria-components";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { loadStore } from "../../utils/StoreManager"; // loadStore を使用

/**
 * プロジェクトツリーコンポーネント
 */
function ProjectTree({ currentSize }) {
  // ========================================================================================
  // 状態管理
  // ========================================================================================
  const [expandedKeys, setExpandedKeys] = useState(new Set(["root", "src"]));
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [projectName, setProjectName] = useState("D4CleaningStudio"); // デフォルト値

  // ========================================================================================
  // プロジェクト名の取得（project_config.name を使用）
  // ========================================================================================
  useEffect(() => {
    const loadProjectName = async () => {
      try {
        const config = await loadStore();
        const name = config.projectConfig?.name;

        if (name) {
          setProjectName(name);
          ConsoleMsg("info", `プロジェクト名を読み込み: ${name}`);
        } else {
          ConsoleMsg("info", `プロジェクト名が未設定のため、デフォルト値を使用: ${projectName}`);
        }
      } catch (error) {
        ConsoleMsg("error", `プロジェクト名の読み込みエラー: ${error.message}`);
        // エラー時はデフォルト値を使用
      }
    };

    loadProjectName();
  }, [projectName]);

  // ========================================================================================
  // プロジェクト構造データ（project_config.name を使用）
  // ========================================================================================
  const filesystem = [
    {
      id: "root",
      name: projectName, // project_config.name の値を使用
      children: [
        {
          id: "src",
          name: "src",
          children: [
            {
              id: "components",
              name: "components",
              children: [
                { id: "mainContent", name: "MainContent" },
                { id: "projectTree", name: "ProjectTree" },
                { id: "leftPanel", name: "LeftPanel" },
                { id: "gitHubPanel", name: "GitHubPanel" },
                { id: "menu", name: "Menu" },
              ],
            },
            {
              id: "utils",
              name: "utils",
              children: [
                { id: "storeManager", name: "StoreManager.js" },
                { id: "consoleMsg", name: "ConsoleMsg.js" },
                { id: "gitHubManager", name: "GitHubManager.js" },
              ],
            },
            { id: "app", name: "App.jsx" },
            { id: "main", name: "main.jsx" },
          ],
        },
        { id: "package", name: "package.json" },
        { id: "readme", name: "README.md" },
        { id: "tauri", name: "tauri.conf.json" },
      ],
    },
  ];

  // ========================================================================================
  // イベントハンドラー
  // ========================================================================================
  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    const selectedArray = Array.from(keys);
    if (selectedArray.length > 0) {
      ConsoleMsg("info", `ツリーアイテム選択: ${selectedArray[0]}`);
    }
  };

  const handleExpandedChange = (keys) => {
    setExpandedKeys(keys);
    ConsoleMsg("debug", `展開状態変更: ${Array.from(keys).join(", ")}`);
  };

  const handleAction = (key) => {
    ConsoleMsg("info", `ツリーアイテムアクション: ${key}`);
  };

  // ========================================================================================
  // ツールバーアクション
  // ========================================================================================
  const handleNewFile = () => {
    ConsoleMsg("info", "新しいファイル作成");
  };

  const handleNewFolder = () => {
    ConsoleMsg("info", "新しいフォルダ作成");
  };

  const handleRefresh = () => {
    ConsoleMsg("info", "ツリー更新");
  };

  const handleCollapseAll = () => {
    setExpandedKeys(new Set(["root"]));
    ConsoleMsg("info", "すべて折りたたみ");
  };

  // ========================================================================================
  // アイコンヘルパー
  // ========================================================================================
  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      // JavaScript/TypeScript - より具体的なアイコン
      case "js":
        return "i-lucide-zap text-yellow-500"; // 稲妻アイコン（JS）
      case "jsx":
        return "i-lucide-atom text-blue-500"; // 原子アイコン（React）
      case "ts":
        return "i-lucide-code-2 text-blue-600"; // コード2アイコン（TS）
      case "tsx":
        return "i-lucide-layers text-blue-700"; // レイヤーアイコン（TSX）

      // スタイル - デザイン関連アイコン
      case "css":
        return "i-lucide-paintbrush text-blue-400"; // ペイントブラシ
      case "scss":
      case "sass":
        return "i-lucide-palette text-pink-500"; // パレット
      case "less":
        return "i-lucide-brush text-indigo-500"; // ブラシ

      // マークアップ - 構造関連アイコン
      case "html":
      case "htm":
        return "i-lucide-layout text-orange-500"; // レイアウト
      case "xml":
        return "i-lucide-file-type text-orange-600"; // ファイルタイプ
      case "svg":
        return "i-lucide-shapes text-purple-500"; // 図形

      // データ - データ関連アイコン
      case "json":
        return "i-lucide-braces text-green-500"; // 波括弧
      case "yaml":
      case "yml":
        return "i-lucide-list text-red-500"; // リスト
      case "toml":
        return "i-lucide-file-key text-orange-400"; // ファイルキー
      case "csv":
        return "i-lucide-sheet text-green-600"; // シート

      // ドキュメント - 文書関連アイコン
      case "md":
      case "markdown":
        return "i-lucide-book-open text-blue-600"; // 本
      case "txt":
        return "i-lucide-file-text text-gray-500"; // テキスト
      case "pdf":
        return "i-lucide-file-down text-red-600"; // ダウンロード
      case "doc":
      case "docx":
        return "i-lucide-file-edit text-blue-700"; // 編集

      // 画像 - メディア関連アイコン
      case "png":
      case "jpg":
      case "jpeg":
        return "i-lucide-camera text-green-500"; // カメラ
      case "gif":
        return "i-lucide-film text-pink-400"; // フィルム
      case "webp":
        return "i-lucide-image text-purple-400"; // 画像
      case "ico":
        return "i-lucide-star text-yellow-600"; // 星

      // 設定ファイル - 設定関連アイコン
      case "env":
        return "i-lucide-key text-yellow-600"; // キー
      case "config":
      case "conf":
        return "i-lucide-cog text-gray-600"; // 歯車
      case "gitignore":
        return "i-lucide-eye-off text-orange-500"; // 目を閉じる

      // ビルド/パッケージ - ツール関連アイコン
      case "lock":
        return "i-lucide-shield text-yellow-500"; // シールド
      case "dockerfile":
        return "i-lucide-box text-blue-500"; // ボックス

      // プログラミング言語 - 言語別特徴的アイコン
      case "py":
        return "i-lucide-snake text-green-400"; // 蛇（Python）
      case "java":
        return "i-lucide-coffee text-brown-500"; // コーヒー（Java）
      case "php":
        return "i-lucide-server text-purple-600"; // サーバー
      case "rb":
        return "i-lucide-gem text-red-400"; // 宝石（Ruby）
      case "go":
        return "i-lucide-zap text-cyan-500"; // 稲妻（Go）
      case "rs":
        return "i-lucide-shield-check text-orange-600"; // 盾（Rust）
      case "cpp":
      case "c":
        return "i-lucide-cpu text-blue-800"; // CPU
      case "cs":
        return "i-lucide-hash text-purple-700"; // ハッシュ（C#）

      // データベース - データベース関連アイコン
      case "sql":
        return "i-lucide-database text-blue-500"; // データベース
      case "db":
      case "sqlite":
        return "i-lucide-hard-drive text-green-700"; // ハードドライブ

      // アーカイブ - 圧縮関連アイコン
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
        return "i-lucide-package text-yellow-700"; // パッケージ

      // 実行ファイル - 実行関連アイコン
      case "exe":
      case "msi":
        return "i-lucide-play-circle text-red-500"; // 再生サークル
      case "app":
      case "dmg":
        return "i-lucide-monitor text-gray-600"; // モニター

      // ログ - ログ関連アイコン
      case "log":
        return "i-lucide-scroll-text text-gray-600"; // スクロール

      // フォント - テキスト関連アイコン
      case "ttf":
      case "woff":
      case "woff2":
      case "eot":
        return "i-lucide-type text-purple-600"; // タイプ

      // 音声・動画 - メディア関連アイコン
      case "mp3":
      case "wav":
      case "flac":
        return "i-lucide-headphones text-green-600"; // ヘッドフォン
      case "mp4":
      case "avi":
      case "mov":
        return "i-lucide-video text-red-600"; // ビデオ

      // その他
      default:
        return "i-lucide-file text-gray-500"; // デフォルトファイル
    }
  };

  // ========================================================================================
  // レンダリング関数
  // ========================================================================================
  function renderItem(item) {
    const hasChildren = !!(item.children && item.children.length > 0);

    return (
      <TreeItem
        key={item.id}
        id={item.id}
        textValue={item.name}
        hasChildNodes={hasChildren}
        className="selected:bg-accent selected:text-accent-content text-base-content
                  cursor-default group outline-none focus-visible:outline-2 focus-visible:outline-accent
                  focus-visible:-outline-offset-2 hover:bg-base-200"
      >
        <TreeItemContent>
          {({ hasChildItems, isExpanded }) => (
            <div className="flex items-center space-x-2 py-2 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
              {hasChildItems ? (
                <Button
                  slot="chevron"
                  className={`shrink-0 w-6 h-6
                    ${isExpanded ? "rotate-90" : ""} transition-transform duration-200
                    inline-flex items-center justify-center bg-transparent border-0
                    cursor-default outline-none focus-visible:outline-2 focus-visible:outline-accent
                    hover:bg-base-300 rounded`}
                >
                  <div className="i-lucide-chevron-right w-4 h-4" />
                </Button>
              ) : (
                <div className="shrink-0 w-6 h-6" />
              )}
              <div className="flex items-center space-x-2">
                {hasChildItems ? <div className={`w-4 h-4 ${isExpanded ? "i-lucide-folder-open" : "i-lucide-folder"}`} /> : <div className={`w-4 h-4 ${getFileIcon(item.name)}`} />}
                <div className="text-sm">{item.name}</div>
              </div>
            </div>
          )}
        </TreeItemContent>
        <Collection items={item.children}>{renderItem}</Collection>
      </TreeItem>
    );
  }

  // ========================================================================================
  // メインレンダリング
  // ========================================================================================
  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* ヘッダー */}
      <div className="border-b border-base-200 p-3">
        <div className="flex items-center justify-between">
          <h2 id="tree-heading" className="text-sm font-semibold text-base-content">
            プロジェクトエキスプローラ
          </h2>
          <p className="text-xs text-accent">パネルサイズ: {currentSize?.toFixed(2)}%</p>
        </div>
      </div>

      {/* ツールバー */}
      <div className="border-b border-base-200 p-2">
        <div className="flex gap-2">
          <Button className="btn btn-sm btn-ghost flex items-center justify-center p-2 min-h-8 h-8 w-8" onPress={handleNewFile} aria-label="新しいファイル">
            <div className="i-lucide-file-text text-blue-500 w-4 h-4" />
          </Button>
          <Button className="btn btn-sm btn-ghost flex items-center justify-center p-2 min-h-8 h-8 w-8" onPress={handleNewFolder} aria-label="新しいフォルダ">
            <div className="i-lucide-folder-plus text-yellow-500 w-4 h-4" />
          </Button>
          <Button className="btn btn-sm btn-ghost flex items-center justify-center p-2 min-h-8 h-8 w-8" onPress={handleRefresh} aria-label="更新">
            <div className="i-lucide-rotate-cw text-green-500 w-4 h-4" />
          </Button>
          <Button className="btn btn-sm btn-ghost flex items-center justify-center p-2 min-h-8 h-8 w-8" onPress={handleCollapseAll} aria-label="すべて折りたたみ">
            <div className="i-lucide-minimize-2 text-red-500 w-4 h-4" />
          </Button>
        </div>
      </div>
      {/* ツリー表示エリア */}
      <div className="flex-1 overflow-y-auto p-2">
        <Tree
          aria-label="プロジェクトファイルツリー"
          aria-labelledby="tree-heading"
          selectionMode="single"
          selectionBehavior="replace"
          items={filesystem}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onSelectionChange={handleSelectionChange}
          onExpandedChange={handleExpandedChange}
          onAction={handleAction}
          className="border-separate border-spacing-0 w-full bg-base-100
                    overflow-auto rounded"
        >
          {renderItem}
        </Tree>
      </div>

      {/* フッター */}
      <div className="border-t border-base-200 p-2">
        <div className="text-xs text-base-content/70 flex items-center space-x-1">
          <div className="i-lucide-info w-3 h-3" />
          <span>{selectedKeys.size > 0 ? `選択中: ${Array.from(selectedKeys)[0]}` : "ファイルを選択してください"}</span>
        </div>
      </div>
      {/* デバッグ情報 */}
      <div className="border-b border-base-200 p-2 bg-info/10">
        <div className="text-xs text-base-content">
          <div className="flex items-center space-x-1">
            <div className="i-lucide-mouse-pointer-click w-3 h-3" />
            <span>選択: {Array.from(selectedKeys).join(", ") || "なし"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="i-lucide-unfold-horizontal w-3 h-3" />
            <span>展開: {Array.from(expandedKeys).join(", ") || "なし"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================================================
// エクスポート
// ========================================================================================
export default ProjectTree;
