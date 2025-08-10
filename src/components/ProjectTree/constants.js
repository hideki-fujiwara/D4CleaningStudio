/**
 * ProjectTree コンポーネントで使用する定数
 */

// デフォルトのプロジェクト名
export const DEFAULT_PROJECT_NAME = "D4CleaningStudio";

// ツリー初期化時に展開されるキー
export const INITIAL_EXPANDED_KEYS = ["root", "src"];

/**
 * ツリーアイテムのスタイル定義
 */
export const TREE_ITEM_STYLES = {
  // 基本スタイル
  base: "text-base-content cursor-default group outline-none",
  // 選択状態のスタイル
  selected: "selected:bg-base-300 selected:text-accent-content ",
  // 基本スタイル
  focus: "focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2",
  // ホバー時のスタイル
  hover: "hover:bg-base-200",
};

/**
 * シェブロン（展開/折りたたみボタン）のスタイル定義
 */
export const CHEVRON_STYLES = {
  // 基本スタイル - サイズとアニメーション
  base: "shrink-0 w-6 h-6 transition-transform duration-200 inline-flex items-center justify-center",
  // ボタンスタイル - 背景とフォーカス状態
  button: "bg-transparent border-0 cursor-default outline-none focus-visible:outline-2 focus-visible:outline-accent rounded",
};

/**
 * フォルダ用コンテキストメニュー項目定義（順序保持）
 * type: ハンドラーに渡す識別子
 * label: 表示文字列
 * danger: 強調（削除など）
 * divider: "divider" 文字列で区切り
 */
export const FOLDER_CONTEXT_MENU_ITEMS = [
  { type: "new-file",   label: "新しいファイル" },
  { type: "new-folder", label: "新しいフォルダ" },
  { type: "refresh",    label: "更新" },
  { type: "collapse",   label: "折りたたむ" },
  "divider",
  { type: "rename",     label: "名前変更" },
  { type: "delete",     label: "削除", danger: true },
  "divider",
  { type: "__close",    label: "閉じる" },
];
