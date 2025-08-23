/**
 * ================================================================
 * ファイル保存機能カスタムフック
 * ================================================================
 *
 * FlowEditorのファイル保存機能を分離したカスタムフック
 * 保存、名前をつけて保存、新規ファイル、ファイルを開く機能を提供
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */

import { useState, useCallback, useRef } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * ファイル保存機能カスタムフック
 *
 * @param {Object} params - パラメータ
 * @param {Function} params.exportFlowData - フローデータ出力関数
 * @param {Function} params.getNodes - ノード取得関数
 * @param {Function} params.getEdges - エッジ取得関数
 * @param {number} params.nodeCounter - 現在のノードカウンター
 * @param {string} params.initialFilePath - 初期ファイルパス
 * @param {string} params.initialFileName - 初期ファイル名
 * @param {Function} params.onHistoryReset - 履歴リセットコールバック
 * @param {Function} params.onNewFlow - 新規フロー作成コールバック
 * @returns {Object} ファイル保存機能
 */
export const useFileSave = ({ exportFlowData, getNodes, getEdges, nodeCounter, initialFilePath, initialFileName, onHistoryReset, onNewFlow }) => {
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // 現在のファイルパス（null = 新規ファイル）
  const [currentFilePath, setCurrentFilePath] = useState(initialFilePath);

  // ファイル名（表示用）
  const [displayFileName, setDisplayFileName] = useState(initialFileName);

  // 保存状態
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 最後に保存された状態（変更検知用）
  const [lastSavedState, setLastSavedState] = useState(null);

  // 保存確認ダイアログ用の状態
  const pendingCloseCallback = useRef(null);

  // 保存処理中フラグ
  const isSaving = useRef(false);

  // ファイル読み込み中フラグ（削除予定 - useFileLoadに移行）
  const isLoading = useRef(false);

  // ========================================================================================
  // ユーティリティ関数
  // ========================================================================================

  /**
   * デフォルトの保存パスを取得
   */
  const getDefaultSavePath = useCallback(async (fileName) => {
    try {
      const srcPath = await window.__TAURI__.path.join(await window.__TAURI__.path.appDir(), "src");
      return await window.__TAURI__.path.join(srcPath, `${fileName}.d4flow`);
    } catch (error) {
      console.error("デフォルトパス取得エラー:", error);
      return `${fileName}.d4flow`;
    }
  }, []);

  // ========================================================================================
  // 保存機能
  // ========================================================================================

  /**
   * ファイル保存機能（Ctrl+S）
   */
  const saveFlow = useCallback(async () => {
    try {
      // 保存処理中フラグを設定
      isSaving.current = true;

      const flowData = exportFlowData();
      const jsonString = JSON.stringify(flowData, null, 2);

      if (currentFilePath) {
        // 既存ファイルに上書き保存
        await writeTextFile(currentFilePath, jsonString);
        setHasUnsavedChanges(false);

        // 保存成功時に履歴をリセット
        if (onHistoryReset) {
          onHistoryReset();
        }

        // 最後の保存状態を更新
        setLastSavedState({
          nodes: JSON.stringify(getNodes()),
          edges: JSON.stringify(getEdges()),
          nodeCounter: nodeCounter,
        });

        ConsoleMsg("success", `ファイルを保存しました: ${displayFileName}`);
      } else {
        // 新規ファイルなので名前をつけて保存のダイアログを表示
        const defaultPath = await getDefaultSavePath(displayFileName);
        const filePath = await save({
          filters: [
            {
              name: "D4 Flow Files",
              extensions: ["d4flow"],
            },
            {
              name: "JSON Files",
              extensions: ["json"],
            },
          ],
          defaultPath: defaultPath,
        });

        if (filePath) {
          // ファイルに保存
          await writeTextFile(filePath, jsonString);

          // ファイル名を抽出（パスから拡張子を除いたファイル名）
          const fileNameOnly = filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");

          // 状態を更新
          setCurrentFilePath(filePath);
          setDisplayFileName(fileNameOnly);
          setHasUnsavedChanges(false);

          // 保存成功時に履歴をリセット
          if (onHistoryReset) {
            onHistoryReset();
          }

          setLastSavedState({
            nodes: JSON.stringify(getNodes()),
            edges: JSON.stringify(getEdges()),
            nodeCounter: nodeCounter,
          });

          ConsoleMsg("success", `ファイルを保存しました: ${fileNameOnly}`);
        }
      }
    } catch (error) {
      ConsoleMsg("error", `保存中にエラーが発生しました: ${error.message}`);
      console.error("保存エラー:", error);
    } finally {
      // 保存処理完了後にフラグをリセット
      isSaving.current = false;
    }
  }, [currentFilePath, displayFileName, exportFlowData, getDefaultSavePath, onHistoryReset, getNodes, getEdges, nodeCounter]);

  /**
   * 名前をつけて保存機能（Ctrl+Shift+S）
   */
  const saveAsFlow = useCallback(async () => {
    try {
      // 保存処理中フラグを設定
      isSaving.current = true;

      const flowData = exportFlowData();
      const jsonString = JSON.stringify(flowData, null, 2);

      // Tauriのファイル保存ダイアログを表示
      const defaultPath = await getDefaultSavePath(displayFileName);
      const filePath = await save({
        filters: [
          {
            name: "D4 Flow Files",
            extensions: ["d4flow"],
          },
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        defaultPath: defaultPath,
      });

      if (filePath) {
        // ファイルに保存
        await writeTextFile(filePath, jsonString);

        // ファイル名を抽出（パスから拡張子を除いたファイル名）
        const fileNameOnly = filePath
          .split(/[\\/]/)
          .pop()
          .replace(/\.[^/.]+$/, "");

        // 状態を更新
        setCurrentFilePath(filePath);
        setDisplayFileName(fileNameOnly);
        setHasUnsavedChanges(false);

        // 保存成功時に履歴をリセット
        if (onHistoryReset) {
          onHistoryReset();
        }

        // 最後の保存状態を更新
        setLastSavedState({
          nodes: JSON.stringify(getNodes()),
          edges: JSON.stringify(getEdges()),
          nodeCounter: nodeCounter,
        });

        ConsoleMsg("success", `ファイルを保存しました: ${fileNameOnly}`);
      }
    } catch (error) {
      ConsoleMsg("error", `保存中にエラーが発生しました: ${error.message}`);
      console.error("名前をつけて保存エラー:", error);
    } finally {
      // 保存処理完了後にフラグをリセット
      isSaving.current = false;
    }
  }, [exportFlowData, displayFileName, getDefaultSavePath, onHistoryReset, getNodes, getEdges, nodeCounter]);

  /**
   * 新規ファイル作成機能（Ctrl+N）
   */
  const newFlow = useCallback(() => {
    if (hasUnsavedChanges) {
      const result = confirm("未保存の変更があります。新規ファイルを作成しますか？変更は失われます。");
      if (!result) return;
    }

    // 現在のタブで新規フローを開始する場合の処理
    // ファイル状態をリセット
    setCurrentFilePath(null);
    setDisplayFileName("NewFile");
    setHasUnsavedChanges(false);
    setLastSavedState(null);

    // 履歴をリセット
    if (onHistoryReset) {
      onHistoryReset();
    }

    // フローデータをリセット（ノード・エッジクリア）
    if (onNewFlow) {
      onNewFlow();
    }

    ConsoleMsg("info", "新規フローを作成しました");
  }, [hasUnsavedChanges, onHistoryReset, onNewFlow]);



  // ========================================================================================
  // タブクローズ確認
  // ========================================================================================

  /**
   * タブクローズ要求処理
   */
  const requestTabClose = useCallback(async () => {
    return new Promise((resolve) => {
      if (hasUnsavedChanges) {
        const result = confirm("未保存の変更があります。保存しますか？");
        if (result) {
          // 保存してからクローズ
          pendingCloseCallback.current = resolve;
          saveFlow();
        } else {
          // 保存せずにクローズ
          resolve(true);
        }
      } else {
        // 変更がないのでそのままクローズ
        resolve(true);
      }
    });
  }, [hasUnsavedChanges, saveFlow]);

  // ========================================================================================
  // 変更検知
  // ========================================================================================

  /**
   * 未保存変更状態を設定
   */
  const setUnsavedChanges = useCallback((hasChanges) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  /**
   * ファイルパスを設定（外部から呼び出し用）
   */
  const setCurrentFilePathExternal = useCallback((filePath) => {
    setCurrentFilePath(filePath);
  }, []);

  /**
   * ファイル名を設定（外部から呼び出し用）
   */
  const setDisplayFileNameExternal = useCallback((fileName) => {
    setDisplayFileName(fileName);
  }, []);

  // ========================================================================================
  // 返り値
  // ========================================================================================

  return {
    // ファイル情報
    currentFilePath,
    fileName: displayFileName,
    hasUnsavedChanges,

    // ファイル操作
    saveFlow,
    saveAsFlow,
    newFlow,

    // タブ管理
    requestTabClose,

    // 変更検知
    setUnsavedChanges,
    setCurrentFilePath: setCurrentFilePathExternal,
    setDisplayFileName: setDisplayFileNameExternal,

    // フラグ
    isSaving: isSaving.current,
    isLoading: isLoading.current,
  };
};
