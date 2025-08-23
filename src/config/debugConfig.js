/**
 * デバッグ設定
 * 開発・テスト時の動作を制御
 */

const DebugConfig = {
  // F5キーによるリロードを許可するかどうか
  // true: F5でブラウザリロードを許可（テスト時など）
  // false: F5リロードを無効化（通常運用時）
  allowF5Reload: process.env.NODE_ENV === "development" || process.env.REACT_APP_DEBUG_MODE === "true",

  // その他のデバッグ設定
  enableConsoleLogging: process.env.NODE_ENV === "development",
  enableKeyboardLogging: false, // キーボードイベントのログ出力
};

export default DebugConfig;
