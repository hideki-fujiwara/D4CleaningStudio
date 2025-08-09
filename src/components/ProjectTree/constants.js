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
  // 選択状態のスタイル
  selected: "selected:bg-accent selected:text-accent-content",
  // 基本スタイル
  base: "text-base-content cursor-default group outline-none",
  // フォーカス時のスタイル
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
