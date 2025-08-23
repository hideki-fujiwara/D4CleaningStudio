// デバッグ設定を管理するファイル
class DebugConfig {
  static get isDebugMode() {
    // 環境変数REACT_APP_DEBUG_MODEがtrueの場合はデバッグモード
    // 複数の方法で環境変数を取得を試行
    const viteEnv = import.meta.env.REACT_APP_DEBUG_MODE;
    const processEnv = typeof process !== "undefined" && process.env && process.env.REACT_APP_DEBUG_MODE;
    const isDebug = viteEnv === "true" || processEnv === "true";

    console.log("🔧 Debug Config Check:");
    console.log("  - import.meta.env.REACT_APP_DEBUG_MODE:", viteEnv);
    console.log("  - process.env.REACT_APP_DEBUG_MODE:", processEnv);
    console.log("  - Final isDebugMode:", isDebug);

    return isDebug;
  }

  static get allowF5Reload() {
    // デバッグモードの場合はF5リロードを許可
    return this.isDebugMode;
  }

  static logDebugInfo() {
    console.log("🔧 Debug Mode:", this.isDebugMode ? "ON" : "OFF");
    console.log("🔄 F5 Reload:", this.allowF5Reload ? "ENABLED" : "DISABLED");
  }
}

export default DebugConfig;
