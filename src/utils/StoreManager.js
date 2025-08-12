import { load } from "@tauri-apps/plugin-store";
import { configDir } from "@tauri-apps/api/path";
import ConsoleMsg from "./ConsoleMsg";

const STORE_FILE = "D4CleaningStudio.config";

/**
 * ストアインスタンスを取得
 * @returns {Promise<Store>} ストアインスタンス
 */
async function getStore() {
  try {
    const dir = `${await configDir()}\\D4CleaningStudio`;
    return await load(`${dir}\\${STORE_FILE}`);
  } catch (error) {
    ConsoleMsg("error", `ストア取得エラー: ${error}`);
    throw error;
  }
}

/**
 * STORE プラグイン経由で設定を読み込む
 * @returns {Promise<{projectConfig: object, windowConfig: object, windowState: object}>}
 */
export async function loadStore() {
  try {
    ConsoleMsg("info", "ストアから設定を読み込み開始");
    // 設定ディレクトリのパス
    const dir = `${await configDir()}\\D4CleaningStudio`;
    // ストアファイルをオープン（なければ自動生成）
    const store = await load(`${dir}\\${STORE_FILE}`);
    ConsoleMsg("debug", `ストアパス: ${dir}\\${STORE_FILE}`);

    // キー取得（未定義なら空オブジェクト）
    const projectConfig = (await store.get("project_config")) ?? {};
    const windowConfig = (await store.get("window_config")) ?? {};
    const windowState = (await store.get("window_state")) ?? {};

    const cfg = { projectConfig, windowConfig, windowState };
    ConsoleMsg("info", "読み込んだ設定:", cfg);
    return cfg;
  } catch (error) {
    ConsoleMsg("error", `ストア読み込みエラー: ${error}`);
    throw error;
  }
}

/**
 * STORE プラグイン経由で設定を保存する
 * @param {{projectConfig: object, windowConfig: object, windowState: object}} config
 */
export async function saveStore({ projectConfig, windowConfig, windowState }) {
  try {
    ConsoleMsg("info", "ストアへの設定保存開始");
    const dir = `${await configDir()}\\D4CleaningStudio`;
    const store = await load(`${dir}\\${STORE_FILE}`);
    ConsoleMsg("debug", `ストアパス: ${dir}\\${STORE_FILE}`);

    // キーを書き込み
    await store.set("project_config", projectConfig);
    await store.set("window_config", windowConfig);
    await store.set("window_state", windowState);
    // 永続化
    await store.save();
    ConsoleMsg("info", "ストアへの保存が完了しました");
  } catch (error) {
    ConsoleMsg("error", `ストア保存エラー: ${error}`);
    throw error;
  }
}

/**
 * メインパネルレイアウトをストアから読み込む
 * @returns {{ horizontal: number[], vertical: number[] }}
 */
export async function loadMainPanelLayout() {
  const cfg = await loadStore();
  // windowState.main_panel_layout があればそれを返し、なければデフォルト値を返す
  return (
    cfg.windowState?.main_panel_layout ?? {
      horizontal: [15, 70, 15],
      vertical: [85, 15],
    }
  );
}

/**
 * メインパネルレイアウトをストアへ保存する
 * @param {number[]} horizontal
 * @param {number[]} vertical
 */
export async function saveMainPanelLayout(horizontal, vertical) {
  // フロート値を整数に丸めてから保存
  const hInts = horizontal.map((n) => Math.round(n));
  const vInts = vertical.map((n) => Math.round(n));
  const cfg = await loadStore();
  const newCfg = {
    ...cfg,
    windowState: {
      ...cfg.windowState,
      main_panel_layout: { horizontal: hInts, vertical: vInts },
    },
  };
  await saveStore(newCfg);
}

/**
 * 古い設定形式を新しい形式に移行
 * @param {object} oldConfig 古い設定
 * @returns {object} 新しい設定
 */
function migrateProjectConfig(oldConfig) {
  if (!oldConfig) return null;

  // 新しい形式に変換
  const newConfig = {
    name: oldConfig.name,
    description: oldConfig.description,
    filepath: oldConfig.projectPath || oldConfig.filepath, // projectPathを優先してfilepathに統合
    createdAt: oldConfig.createdAt,
    version: oldConfig.version || "1.0.0",
    type: oldConfig.type || "D4CleaningStudio",
    remarks: oldConfig.remarks || "",
    settings: oldConfig.settings || {},
  };

  return newConfig;
}

/**
 * プロジェクト設定を取得（移行処理付き）
 * @returns {Promise<object>} プロジェクト設定
 */
export async function getProjectConfig() {
  try {
    const config = await loadStore();
    const projectConfig = config.projectConfig;

    // 古い形式の場合は移行
    if (projectConfig && (projectConfig.configPath || projectConfig.projectPath)) {
      console.log("古い設定形式を検出しました。新しい形式に移行します。");
      const migratedConfig = migrateProjectConfig(projectConfig);

      // 移行した設定を保存
      await setProjectConfig(migratedConfig);
      return migratedConfig;
    }

    return projectConfig;
  } catch (error) {
    console.error("プロジェクト設定の取得に失敗しました:", error);
    return null;
  }
}

/**
 * プロジェクト設定を保存
 * @param {object} projectConfig プロジェクト設定
 * @returns {Promise<void>}
 */
export async function setProjectConfig(projectConfig) {
  try {
    const config = await loadStore();

    // 不要なフィールドを削除して保存
    const cleanConfig = {
      name: projectConfig.name,
      description: projectConfig.description,
      filepath: projectConfig.filepath,
      createdAt: projectConfig.createdAt,
      version: projectConfig.version || "1.0.0",
      type: projectConfig.type || "D4CleaningStudio",
      remarks: projectConfig.remarks || "",
      settings: projectConfig.settings || {},
    };

    config.projectConfig = cleanConfig;
    await saveStore(config);
    console.log("プロジェクト設定を保存しました:", cleanConfig);
  } catch (error) {
    console.error("プロジェクト設定の保存に失敗しました:", error);
    throw error;
  }
}

/**
 * プロジェクト設定を更新
 * @param {object} updates 更新するプロジェクト設定
 * @returns {Promise<void>}
 */
export async function updateProjectConfig(updates) {
  try {
    const cfg = await loadStore();
    const newCfg = {
      ...cfg,
      projectConfig: {
        ...cfg.projectConfig,
        ...updates,
      },
    };
    await saveStore(newCfg);
    ConsoleMsg("info", "プロジェクト設定を更新しました");
  } catch (error) {
    ConsoleMsg("error", `プロジェクト設定の更新エラー: ${error}`);
    throw error;
  }
}

/**
 * プロジェクト名を更新
 * @param {string} name 新しいプロジェクト名
 * @returns {Promise<void>}
 */
export async function updateProjectName(name) {
  try {
    await updateProjectConfig({ name });
    ConsoleMsg("info", `プロジェクト名を更新: ${name}`);
  } catch (error) {
    ConsoleMsg("error", `プロジェクト名の更新エラー: ${error}`);
    throw error;
  }
}

const config = await loadStore();
const projectName = config.projectConfig?.name || "D4CleaningStudio";
