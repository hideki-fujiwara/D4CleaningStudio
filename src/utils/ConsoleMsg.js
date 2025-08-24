import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";

/**
 * ログレベルに応じてメッセージを出力する関数
 * @param {string} level - ログレベル（log, debug, info, warn, error）
 * @param {string} message - メインメッセージ
 * @param {...any} args - 追加の引数（オブジェクトはJSON文字列化される）
 */
function ConsoleMsg(level, message, ...args) {
  // メッセージと追加引数をまとめて文字列化
  const fullMessage = [message, ...args].map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" ");

  // ログレベルに応じて出力先を切り替え
  switch (level) {
    case "log":
      trace(fullMessage); // 一般ログ
      console.log(`[LOG] ${fullMessage}`); // デバッグ用
      break;
    case "debug":
      debug(fullMessage); // デバッグログ
      console.log(`[DEBUG] ${fullMessage}`); // デバッグ用
      break;
    case "info":
      info(fullMessage); // 情報ログ
      console.log(`[INFO] ${fullMessage}`); // デバッグ用
      break;
    case "warn":
      warn(fullMessage); // 警告ログ
      console.log(`[WARN] ${fullMessage}`); // デバッグ用
      break;
    case "error":
      error(fullMessage); // エラーログ
      console.log(`[ERROR] ${fullMessage}`); // デバッグ用
      break;
    default:
      // 未知のレベルの場合はconsole.logで出力
      console.log("Unknown level:", level, fullMessage);
  }
}

export default ConsoleMsg;
