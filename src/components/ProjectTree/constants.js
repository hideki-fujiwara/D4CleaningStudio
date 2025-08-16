/**
 * ProjectTree コンポーネント用定数定義
 * 
 * 機能:
 *  - スタイル定数の一元管理
 *  - メニュー項目とアクション定義
 *  - ドラッグ&ドロップ設定
 *  - ファイルタイプ分類
 */

/* ================================ 基本設定 ================================ */

/**
 * デフォルトのプロジェクト名（設定未取得時に表示）
 */
export const DEFAULT_PROJECT_NAME = "D4CleaningStudio";

/**
 * 初期展開しておきたいツリーノードのキー配列
 */
export const INITIAL_EXPANDED_KEYS = ["root", "src"];

/* ============================== スタイル定数 ============================== */

/**
 * ツリーアイテムのスタイル定義
 */
export const TREE_ITEM_STYLES = {
  base: "group/tree-item relative outline-none",
  content: "flex items-center justify-between py-0.5 px-1 rounded-sm cursor-pointer select-none",
  contentHover: "hover:bg-base-200",
  contentSelected: "bg-primary/10 text-primary",
  contentDragging: "opacity-50",
  placeholder: "pointer-events-none opacity-60 italic",
  indent: "ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]",
};

/**
 * シェブロン（展開ボタン）のスタイル
 */
export const CHEVRON_STYLES = {
  base: "w-6 h-6 shrink-0 flex items-center justify-center",
  button: "hover:bg-base-300 rounded transition-transform duration-200",
  expanded: "rotate-90",
  icon: "w-4 h-4",
};

/**
 * ツールバーのスタイル
 */
export const TOOLBAR_STYLES = {
  container: "shrink-0 flex items-center gap-0.5 opacity-0 group-hover/tree-item:opacity-100 transition-opacity mr-2",
  button: "btn btn-ghost btn-xs w-6 h-6 p-0 min-h-0",
};

/**
 * ドロップゾーンのスタイル
 */
export const DROP_ZONE_STYLES = {
  base: "h-full flex flex-col bg-base-100 relative",
  active: "ring-2 ring-primary/50 bg-base-200/50",
  content: "flex-1 min-h-0 flex flex-col overflow-y-auto",
};

/* ============================= アクション定数 ============================= */

/**
 * コンテキストメニューのアクション種別
 */
export const CONTEXT_MENU_ACTIONS = {
  NEW_FILE: "new-file",
  NEW_FOLDER: "new-folder",
  REFRESH: "refresh",
  COLLAPSE: "collapse",
  RENAME: "rename",
  DELETE: "delete",
  COPY: "copy",
  CUT: "cut",
  PASTE: "paste",
  CLOSE: "__close",
};

/**
 * フォルダ右クリック時のコンテキストメニュー定義
 */
export const FOLDER_CONTEXT_MENU_ITEMS = [
  // ファイル操作
  { 
    type: CONTEXT_MENU_ACTIONS.NEW_FILE, 
    label: "新しいファイル", 
    shortcut: "Ctrl+N" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.NEW_FOLDER, 
    label: "新しいフォルダ", 
    shortcut: "Ctrl+Shift+N" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.REFRESH, 
    label: "更新", 
    shortcut: "F5" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.COLLAPSE, 
    label: "折りたたむ", 
    shortcut: "Alt+-" 
  },
  
  "divider",
  
  // 編集操作
  { 
    type: CONTEXT_MENU_ACTIONS.COPY, 
    label: "コピー", 
    shortcut: "Ctrl+C" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.CUT, 
    label: "カット", 
    shortcut: "Ctrl+X" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.PASTE, 
    label: "貼り付け", 
    shortcut: "Ctrl+V" 
  },
  
  "divider",
  
  // 変更・削除操作
  { 
    type: CONTEXT_MENU_ACTIONS.RENAME, 
    label: "名前変更", 
    shortcut: "F2" 
  },
  { 
    type: CONTEXT_MENU_ACTIONS.DELETE, 
    label: "削除", 
    shortcut: "Del", 
    danger: true 
  },
  
  "divider",
  
  // システム操作
  { 
    type: CONTEXT_MENU_ACTIONS.CLOSE, 
    label: "閉じる", 
    shortcut: "Esc" 
  },
];

/* ========================== ドラッグ&ドロップ設定 ========================== */

/**
 * ドラッグ&ドロップのMIMEタイプ
 */
export const DRAG_DROP_TYPES = {
  FILE_TREE_ITEM: "application/x-file-tree-item",
  TEXT_PLAIN: "text/plain",
};

/**
 * ファイルタイプ分類
 */
export const FILE_TYPES = {
  FILE: "file",
  FOLDER: "folder",
  PLACEHOLDER: "placeholder",
};

/* ============================== バリデーション ============================== */

/**
 * ファイル名バリデーション用正規表現
 */
export const FILE_NAME_PATTERNS = {
  // 使用禁止文字 (Windows/Linux/macOS共通)
  INVALID_CHARS: /[<>:"/\\|?*]/,
  
  // 予約ファイル名 (Windows)
  RESERVED_NAMES: /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,
  
  // 最大長制限
  MAX_LENGTH: 255,
};

/**
 * サポートされるファイル拡張子とMIMEタイプ
 */
export const SUPPORTED_FILE_TYPES = {
  // テキストファイル
  TEXT: ['.txt', '.md', '.readme'],
  
  // プログラムファイル
  JAVASCRIPT: ['.js', '.jsx', '.mjs'],
  TYPESCRIPT: ['.ts', '.tsx', '.d.ts'],
  
  // スタイルファイル
  CSS: ['.css', '.scss', '.sass', '.less'],
  
  // 設定ファイル
  CONFIG: ['.json', '.xml', '.yaml', '.yml', '.toml'],
  
  // 画像ファイル
  IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
};

/* =============================== 設定値 =============================== */

/**
 * パフォーマンス関連の設定
 */
export const PERFORMANCE_CONFIG = {
  // 仮想化のしきい値（この数を超えるとvirtualization有効）
  VIRTUALIZATION_THRESHOLD: 1000,
  
  // ファイル監視のデバウンス時間（ミリ秒）
  FILE_WATCH_DEBOUNCE: 300,
  
  // ツリー更新のスロットル時間（ミリ秒）
  TREE_UPDATE_THROTTLE: 100,
};

/**
 * アニメーション設定
 */
export const ANIMATION_CONFIG = {
  // 展開/折りたたみのアニメーション時間
  EXPAND_DURATION: 200,
  
  // ドラッグ&ドロップのフェード時間
  DRAG_FADE_DURATION: 150,
  
  // ホバー効果の遅延時間
  HOVER_DELAY: 100,
};
