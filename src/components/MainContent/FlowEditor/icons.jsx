/**
 * ================================================================
 * FlowEditor用アイコンコンポーネント定義
 * ================================================================
 *
 * FlowEditorのツールバーで使用するすべてのSVGアイコンを定義
 * 各アイコンはカラーとサイズをプロパティで制御可能
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */
import React from "react";

// ================================================================
// ベースアイコンコンポーネント
// ================================================================

/**
 * 共通のSVGアイコンベース
 * 他のアイコンで共通で使用する基本構造を定義
 */
const BaseIcon = ({ children, className = "w-4 h-4", color = "currentColor", ...props }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" {...props}>
    {children}
  </svg>
);

// ================================================================
// ファイル操作関連アイコン
// ================================================================

/**
 * 保存アイコン
 * ファイルの保存機能を表現（フロッピーディスク）
 * キーボードショートカット: Ctrl+S
 */
export const SaveIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M7 3v6h10V3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM9 3v6m0 8h6m-6 4v-4m6 4v-4" 
    />
  </svg>
);

/**
 * 別名で保存アイコン
 * ファイルの別名保存機能を表現（フロッピーディスク・ワーニング色）
 * キーボードショートカット: Ctrl+Shift+S
 */
export const SaveAsIcon = ({ className = "w-4 h-4 text-[color:var(--color-warning)]", color }) => (
  <svg className={className} fill="none" stroke={color || "currentColor"} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M7 3v6h10V3M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM9 3v6m0 8h6m-6 4v-4m6 4v-4" 
    />
  </svg>
);

// ================================================================
// 編集操作関連アイコン
// ================================================================

/**
 * 元に戻すアイコン
 * Undo機能を表現（左向きの曲線矢印）
 * キーボードショートカット: Ctrl+Z
 */
export const UndoIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

/**
 * やり直しアイコン
 * Redo機能を表現（右向きの曲線矢印）
 * キーボードショートカット: Ctrl+Y
 */
export const RedoIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
  </svg>
);

// ================================================================
// フロー実行関連アイコン
// ================================================================

/**
 * 実行アイコン
 * フローの実行機能を表現（再生ボタン）
 * デフォルトカラー: 緑色（成功・実行を表現）
 * キーボードショートカット: F5
 */
export const PlayIcon = ({ className = "w-4 h-4", color = "#22c55e" }) => (
  <svg className={className} fill={color} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

/**
 * ステップ実行アイコン
 * フローのステップ実行機能を表現（右向き矢印）
 * キーボードショートカット: F10
 */
export const StepIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// ================================================================
// 表示設定関連アイコン
// ================================================================

/**
 * グリッド表示アイコン
 * グリッド表示の切り替え機能を表現（4分割グリッド）
 * ToggleButtonで使用（ON/OFF状態を持つ）
 */
export const GridIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    />
  </svg>
);

/**
 * スナップ機能アイコン
 * スナップ機能の切り替えを表現（四隅からの矢印）
 * ToggleButtonで使用（ON/OFF状態を持つ）
 */
export const SnapIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

// ================================================================
// ノード追加関連アイコン
// ================================================================

/**
 * テキストノードアイコン
 * テキストノードの追加機能を表現（ドキュメント）
 * フロー内でテキスト情報を扱うノード用
 */
export const TextIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/**
 * シンプルノードアイコン
 * 基本的な処理ノードの追加機能を表現（ボックス構造）
 * 汎用的な処理ステップを表現するノード用
 */
export const NodeIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
    />
  </svg>
);

/**
 * CSVノードアイコン
 * CSVファイル入力ノードの追加機能を表現（データチャート）
 * CSV形式のデータを扱うノード用
 */
export const CsvIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

// ================================================================
// フロー操作関連アイコン
// ================================================================

/**
 * リセットアイコン
 * フローの初期化機能を表現（リフレッシュ矢印）
 * 現在の状態を初期状態に戻す
 */
export const ResetIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

/**
 * 削除アイコン
 * 全てのノードをクリアする機能を表現（ゴミ箱）
 * ⚠️ 注意：この操作は復元できない危険な操作
 * デフォルトカラー: 通常はcurrentColorだが、FlowEditorではエラー色(#ef4444)を指定
 */
export const TrashIcon = ({ className = "w-4 h-4", color = "currentColor" }) => (
  <svg className={className} fill="none" stroke={color} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

// ================================================================
// ユーティリティ関数
// ================================================================

/**
 * ファイル拡張子に基づくアイコン選択
 *
 * ファイル名から拡張子を抽出し、適切なvscode-iconsのCSSクラスを返す
 * UnoCSS/Tailwind + アイコンライブラリ（@iconify-json/vscode-icons）使用時
 *
 * @param {string} filename - ファイル名（拡張子含む）
 * @returns {string} - vscode-iconsのCSSクラス名
 *
 * @example
 * getFileIcon("sample.js")     // => "i-vscode-icons-file-type-js-official"
 * getFileIcon("data.csv")      // => "i-vscode-icons-default-file"
 * getFileIcon("image.png")     // => "i-vscode-icons-file-type-image"
 */
export const getFileIcon = (filename) => {
  // ファイル名から拡張子を抽出（小文字に変換）
  const ext = filename.split(".").pop()?.toLowerCase();

  // 拡張子に応じてCSSクラスを返す
  switch (ext) {
    // JavaScript関連
    case "js":
    case "jsx":
      return "i-vscode-icons-file-type-js-official";

    // TypeScript関連
    case "ts":
    case "tsx":
      return "i-vscode-icons-file-type-typescript-official";

    // スタイルシート
    case "css":
      return "i-vscode-icons-file-type-css";

    // マークアップ言語
    case "html":
      return "i-vscode-icons-file-type-html";

    // データフォーマット
    case "json":
      return "i-vscode-icons-file-type-json";

    // ドキュメント
    case "md":
      return "i-vscode-icons-file-type-markdown";

    // 画像ファイル
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return "i-vscode-icons-file-type-image";

    // デフォルト（未対応の拡張子）
    default:
      return "i-vscode-icons-default-file";
  }
};

// ================================================================
// エクスポート情報
// ================================================================

/**
 * エクスポートされるコンポーネント一覧:
 *
 * 【ファイル操作】
 * - SaveIcon: 保存
 * - SaveAsIcon: 別名で保存
 *
 * 【編集操作】
 * - UndoIcon: 元に戻す
 * - RedoIcon: やり直し
 *
 * 【実行操作】
 * - PlayIcon: 実行
 * - StepIcon: ステップ実行
 *
 * 【表示設定】
 * - GridIcon: グリッド表示
 * - SnapIcon: スナップ機能
 *
 * 【ノード追加】
 * - TextIcon: テキストノード
 * - NodeIcon: シンプルノード
 * - CsvIcon: CSVノード
 *
 * 【フロー操作】
 * - ResetIcon: リセット
 * - TrashIcon: 全削除
 *
 * 【ユーティリティ】
 * - getFileIcon: ファイルアイコン選択関数
 */
