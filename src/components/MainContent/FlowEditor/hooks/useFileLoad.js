/**
 * ================================================================
 * ファイル読み込み機能カスタムフック
 * ================================================================
 *
 * FlowEditorのファイル読み込み機能を分離したカスタムフック
 * ファイルを開く機能を提供
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */

import { useState, useCallback, useRef } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * ファイル読み込み機能カスタムフック
 *
 * @param {Object} params - パラメータ
 * @param {Function} params.setNodes - ノード設定関数
 * @param {Function} params.setEdges - エッジ設定関数
 * @param {Function} params.setNodeCounter - ノードカウンター設定関数
 * @param {Function} params.onFileLoaded - ファイル読み込み完了コールバック
 * @param {Function} params.onHistoryReset - 履歴リセットコールバック
 * @param {Function} params.onHistoryInitialize - 履歴初期化コールバック（読み込み状態を基準として設定）
 * @param {Function} params.onCreateNewTab - 新規タブ作成コールバック
 * @param {Function} params.hasUnsavedChanges - 未保存の変更があるかどうかを取得する関数
 * @returns {Object} ファイル読み込み機能
 */
export const useFileLoad = ({ setNodes, setEdges, setNodeCounter, onFileLoaded = null, onHistoryReset = null, onHistoryInitialize = null, onCreateNewTab = null, hasUnsavedChanges = () => false }) => {
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // ファイル読み込み中フラグ
  const isLoading = useRef(false);

  // 読み込み状態
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // ========================================================================================
  // ファイル読み込み機能
  // ========================================================================================

  /**
   * ファイルを開く機能（Ctrl+O）
   * 既存のタブでファイルを開く
   */
  const openFlow = useCallback(async () => {
    try {
      // 未保存の変更がある場合は確認
      if (hasUnsavedChanges()) {
        const result = confirm("未保存の変更があります。ファイルを開きますか？変更は失われます。");
        if (!result) return;
      }

      // Tauriのファイル選択ダイアログを表示
      const filePath = await open({
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
      });

      if (filePath) {
        // ファイル読み込み中フラグを設定
        isLoading.current = true;
        setIsLoadingFile(true);

        const fileContent = await readTextFile(filePath);
        const flowData = JSON.parse(fileContent);

        if (flowData && typeof flowData === "object") {
          // フローデータを設定
          const newNodes = flowData.nodes || [];
          const newEdges = flowData.edges || [];
          const newNodeCounter = flowData.nodeCounter || 1;

          setNodes(newNodes);
          setEdges(newEdges);
          setNodeCounter(newNodeCounter);

          // ファイル名を抽出
          const fileNameOnly = filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");

          // まず履歴をリセット
          if (onHistoryReset) {
            onHistoryReset();
          }

          // 短い遅延後に読み込み状態を履歴の基準として初期化
          setTimeout(() => {
            if (onHistoryInitialize) {
              onHistoryInitialize(newNodes, newEdges);
            }
          }, 100);

          // ファイル読み込み完了コールバック
          if (onFileLoaded) {
            onFileLoaded({
              filePath,
              fileName: fileNameOnly,
              flowData,
            });
          }

          ConsoleMsg("success", `ファイルを開きました: ${fileNameOnly}`);
          return {
            success: true,
            filePath,
            fileName: fileNameOnly,
            flowData,
          };
        } else {
          ConsoleMsg("error", "無効なファイル形式です");
          return { success: false, error: "無効なファイル形式です" };
        }
      }
    } catch (error) {
      ConsoleMsg("error", `ファイルの読み込みに失敗しました: ${error.message}`);
      console.error("ファイル読み込みエラー:", error);
      return { success: false, error: error.message };
    } finally {
      // ファイル読み込み完了後にフラグをリセット
      isLoading.current = false;
      setIsLoadingFile(false);
    }
  }, [setNodes, setEdges, setNodeCounter, onHistoryReset, onFileLoaded, hasUnsavedChanges]);

  /**
   * 新しいタブでファイルを開く機能
   */
  const openFlowInNewTab = useCallback(async () => {
    try {
      // Tauriのファイル選択ダイアログを表示
      const filePath = await open({
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
      });

      if (filePath && onCreateNewTab) {
        // ファイル読み込み中フラグを設定
        isLoading.current = true;
        setIsLoadingFile(true);

        const fileContent = await readTextFile(filePath);
        const flowData = JSON.parse(fileContent);

        if (flowData && typeof flowData === "object") {
          // ファイル名を抽出
          const fileNameOnly = filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");

          // 新しいタブを作成してファイルを開く
          onCreateNewTab({
            id: `flow-editor-${Date.now()}`,
            title: fileNameOnly,
            icon: "📄",
            component: "FlowEditor",
            closable: true,
            hasUnsavedChanges: false,
            props: {
              initialMode: "loaded",
              loadedData: flowData,
              filePath: filePath,
              fileName: fileNameOnly,
            },
          });

          ConsoleMsg("success", `新しいタブでファイルを開きました: ${fileNameOnly}`);
          return {
            success: true,
            filePath,
            fileName: fileNameOnly,
            flowData,
          };
        } else {
          ConsoleMsg("error", "無効なファイル形式です");
          return { success: false, error: "無効なファイル形式です" };
        }
      }
    } catch (error) {
      ConsoleMsg("error", `ファイルの読み込みに失敗しました: ${error.message}`);
      console.error("ファイル読み込みエラー:", error);
      return { success: false, error: error.message };
    } finally {
      // ファイル読み込み完了後にフラグをリセット
      isLoading.current = false;
      setIsLoadingFile(false);
    }
  }, [onCreateNewTab]);

  /**
   * ファイルデータから直接読み込む機能
   * （プログラム内でのファイル読み込み用）
   */
  const loadFlowData = useCallback(
    (flowData, fileName = "LoadedFile") => {
      try {
        if (flowData && typeof flowData === "object") {
          // フローデータを設定
          const newNodes = flowData.nodes || [];
          const newEdges = flowData.edges || [];
          const newNodeCounter = flowData.nodeCounter || 1;

          setNodes(newNodes);
          setEdges(newEdges);
          setNodeCounter(newNodeCounter);

          // まず履歴をリセット
          if (onHistoryReset) {
            onHistoryReset();
          }

          // 短い遅延後に読み込み状態を履歴の基準として初期化
          setTimeout(() => {
            if (onHistoryInitialize) {
              onHistoryInitialize(newNodes, newEdges);
            }
          }, 100);

          // ファイル読み込み完了コールバック
          if (onFileLoaded) {
            onFileLoaded({
              filePath: null,
              fileName,
              flowData,
            });
          }

          ConsoleMsg("success", `フローデータを読み込みました: ${fileName}`);
          return { success: true, fileName, flowData };
        } else {
          ConsoleMsg("error", "無効なフローデータです");
          return { success: false, error: "無効なフローデータです" };
        }
      } catch (error) {
        ConsoleMsg("error", `フローデータの読み込みに失敗しました: ${error.message}`);
        console.error("フローデータ読み込みエラー:", error);
        return { success: false, error: error.message };
      }
    },
    [setNodes, setEdges, setNodeCounter, onHistoryReset, onFileLoaded]
  );

  // ========================================================================================
  // 返り値
  // ========================================================================================

  return {
    // ファイル読み込み機能
    openFlow,
    openFlowInNewTab,
    loadFlowData,

    // 状態
    isLoadingFile,
    isLoading: isLoading.current,
  };
};
