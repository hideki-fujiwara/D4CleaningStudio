/**
 * ProjectTree コンポーネントで使用する定数定義
 * 
 * 役割:
 *  - 表示/スタイルに関する集中管理
 *  - 他コンポーネントからの再利用容易化
 *  - メニュー構成やショートカットを一元化
 * 
 * 使用例:
 *  import { TREE_ITEM_STYLES, FOLDER_CONTEXT_MENU_ITEMS } from "./constants";
 * 
 * メンテナンス時の注意:
 *  - スタイル変更は Tailwind CSS クラスで統一
 *  - メニュー項目追加時は対応するハンドラーも実装必要
 *  - 破壊的変更時は依存コンポーネント全体の動作確認を実施
 */

/* ============================= 基本設定 ============================= */

/** 
 * デフォルトのプロジェクト名（設定未取得時に表示）
 * @type {string}
 */
export const DEFAULT_PROJECT_NAME = "D4CleaningStudio";

/** 
 * 初期展開しておきたいツリーノードのキー配列
 * 新規プロジェクト読み込み時に自動展開される
 * @type {string[]}
 */
export const INITIAL_EXPANDED_KEYS = ["root", "src"];

/* ============================= ツリーアイテムスタイル ============================= */
/**
 * react-aria-components の <TreeItem> に付与するクラス群
 * 
 * 各スタイルの用途:
 *  - base: 全項目共通の基本スタイル
 *  - selected: 選択状態時の強調表示
 *  - focus: キーボードフォーカス時の可視化
 *  - hover: マウスホバー時のハイライト
 * 
 * カスタマイズガイド:
 *  - 選択色変更 → selected の背景/文字色を書き換え
 *  - フォーカスリング色変更 → focus 内の outline-* を変更
 *  - ホバー色調整 → hover の bg-* を変更
 * 
 * @type {Object.<string, string>}
 */
export const TREE_ITEM_STYLES = {
  /** 基本スタイル: 文字色 / カーソル / グループ化 (子孫の hover 制御用) */
  base: "text-base-content cursor-default group outline-none",
  
  /**
   * 選択状態: ライブラリが付与する data-[selected=true] 状態バリアント
   * NOTE: react-aria-components の仕様に合わせた属性セレクタを使用
   */
  selected: "selected:bg-base-300 selected:text-accent-content ",
  
  /** フォーカス可視リング: キーボード操作時の強調（アクセシビリティ対応） */
  focus: "focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2",
  
  /** ホバー行ハイライト: マウス操作時の視覚フィードバック */
  hover: "hover:bg-base-200",
};

/* ============================= シェブロン（展開トグル） ============================= */
/**
 * フォルダ展開/折りたたみボタンのスタイル定義
 * 
 * 動作仕様:
 *  - クリックで子要素の表示/非表示を切り替え
 *  - 展開時は右向き矢印が90度回転してdown向きになる
 *  - トランジションで滑らかなアニメーション
 * 
 * @type {Object.<string, string>}
 */
export const CHEVRON_STYLES = {
  /** サイズ / 配置 / トランジション設定 */
  base: "shrink-0 w-6 h-6 transition-transform duration-200 inline-flex items-center justify-center",
  
  /** ボタン状態: 透明背景 + キーボードフォーカス時リング表示 */
  button: "bg-transparent border-0 cursor-default outline-none focus-visible:outline-2 focus-visible:outline-accent rounded",
};

/* ============================= フォルダ用コンテキストメニュー ============================= */
/**
 * フォルダ右クリック時のメニュー定義
 * 
 * 項目オブジェクトの構造:
 *  - type: menuAction ハンドラーに渡される識別子
 *  - label: UI に表示される文字列
 *  - shortcut: 右端に表示するキーボードショートカット（表示のみ、実際の動作は別実装）
 *  - danger: 危険操作フラグ（削除など、text-error スタイルが適用される）
 *  - "divider": 文字列の場合は区切り線として描画
 * 
 * 拡張方法:
 *  1. 新しい項目をこの配列に追加
 *  2. ProjectTree.jsx の menuAction 関数に対応する case を追加
 *  3. 必要に応じて実際の処理ロジックを実装
 * 
 * @type {Array<Object|string>}
 */
export const FOLDER_CONTEXT_MENU_ITEMS = [
  // ファイル操作系
  { type: "new-file",   label: "新しいファイル",   shortcut: "Ctrl+N" },
  { type: "new-folder", label: "新しいフォルダ",   shortcut: "Ctrl+Shift+N" },
  { type: "refresh",    label: "更新",             shortcut: "F5" },
  { type: "collapse",   label: "折りたたむ",       shortcut: "Alt+-" },
  
  "divider", // 区切り線
  
  // 編集操作系  
  { type: "copy",       label: "コピー",           shortcut: "Ctrl+C" },
  { type: "cut",        label: "カット",           shortcut: "Ctrl+X" },
  { type: "paste",      label: "貼り付け",         shortcut: "Ctrl+V" },
  
  "divider", // 区切り線
  
  // 変更・削除系
  { type: "rename",     label: "名前変更",         shortcut: "F2" },
  { type: "delete",     label: "削除", danger: true, shortcut: "Del" }, // danger: 危険操作として強調
  
  "divider", // 区切り線
  
  // システム操作
  { type: "__close",    label: "閉じる",           shortcut: "Esc" }, // __close: 特殊な閉じる操作
];

/* ============================= 今後の拡張ヒント ============================= */
/**
 * 将来的な機能拡張のためのガイドライン
 * 
 * i18n（国際化）対応の場合:
 *  - 本ファイルを言語別に分割 (constants.ja.js / constants.en.js)
 *  - import 時に動的に切り替える仕組みを導入
 *  - または generateMenuItems(locale) のようなファクトリ関数で生成
 * 
 * テーマ切替対応の場合:
 *  - TREE_ITEM_STYLES / CHEVRON_STYLES にテーマ名での条件分岐を追加
 *  - CSS変数やTailwindのテーマシステムとの連携を検討
 * 
 * 動的ショートカット対応の場合:
 *  - ショートカット定義を別ファイル（shortcuts.js）で管理
 *  - ユーザー設定からの読み込み機能を実装
 *  - 実際のキーバインドとUI表示の同期を保証
 * 
 * パフォーマンス最適化の場合:
 *  - 頻繁に変更される設定と静的な設定を分離
 *  - useMemo / useCallback でのメモ化を検討
 *  - 大量データ対応時のvirtualization導入を検討
 */

// TODO: ユーザー設定からのカスタマイズ機能
// TODO: キーボードショートカットの実際の動作実装
// FIXME: selected スタイルがテーマによって見づらい場合がある
