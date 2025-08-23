/**
 * ================================================================
 * FlowEditor メインコンポーネント
 * ================================================================
 *
 * ビジュアルフローエディタのメインコンポーネント
 * ReactFlowProviderでラップして提供
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import React from "react";
import { ReactFlowProvider } from "reactflow";
import FlowEditorContent from "./components/FlowEditorContent";

// ========================================================================================
// メインエクスポートコンポーネント
// ========================================================================================

/**
 * FlowEditorメインコンポーネント
 * ReactFlowProviderでラップして提供
 *
 * @param {Object} props - プロパティ
 * @param {string} props.initialMode - 初期モード（"default" | "empty" | "loaded"）
 * @param {Object} props.loadedData - ロードされたフローデータ
 * @param {string} props.filePath - ファイルパス
 * @param {string} props.fileName - ファイル名
 * @param {string} props.tabId - タブID
 * @param {Function} props.onCreateNewTab - 新しいタブを作成する関数
 * @param {Function} props.onUpdateTab - タブ更新コールバック
 * @param {Function} props.onRequestTabClose - タブクローズ要求コールバック
 * @param {Function} props.onHistoryChange - 履歴変更通知コールバック
 */
function FlowEditor({ 
  initialMode = "default", 
  loadedData = null, 
  filePath = null, 
  fileName = "NewFile", 
  tabId, 
  onCreateNewTab, 
  onUpdateTab, 
  onRequestTabClose, 
  onHistoryChange 
}) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent
        initialMode={initialMode}
        loadedData={loadedData}
        filePath={filePath}
        fileName={fileName}
        tabId={tabId}
        onCreateNewTab={onCreateNewTab}
        onUpdateTab={onUpdateTab}
        onRequestTabClose={onRequestTabClose}
        onHistoryChange={onHistoryChange}
      />
    </ReactFlowProvider>
  );
}

// ========================================================================================
// エクスポート
// ========================================================================================

export default FlowEditor;
