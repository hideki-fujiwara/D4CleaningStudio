/**
 * ================================================================
 * FlowEditor メインコンポーネント
 * ================================================================
 *
 * ビジュアルフローエディタのメインコンポーネント
 * リファクタリング後：カスタムフックによるモジュラー設計
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import React, { useState, useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, ConnectionLineType, Panel, ReactFlowProvider, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import { nodeTypes } from "./CustomNodes";
import FlowEditorToolbar from "./FlowEditorToolbar";
import { useFlowEditor } from "./hooks/useFlowEditor";
import { useHtmlDragAndDrop } from "./hooks/useHtmlDragAndDrop";

// ========================================================================================
// メインFlowEditorコンポーネント（内部実装）
// ========================================================================================

/**
 * FlowEditorの内部実装
 * ReactFlowProvider内で動作する必要があるため分離
 */
function FlowEditorInner({ initialMode, loadedData, filePath, fileName, tabId, onCreateNewTab, onUpdateTab, onRequestTabClose, onHistoryChange }) {
  console.log("FlowEditorInner - Props received:", {
    initialMode,
    loadedData,
    filePath,
    fileName,
    onCreateNewTab: !!onCreateNewTab,
    onRequestTabClose: !!onRequestTabClose,
    onHistoryChange: !!onHistoryChange,
  });

  // ========================================================================================
  // カスタムフック使用
  // ========================================================================================

  // メインロジック（状態管理、ノード操作、履歴管理）
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    onSelectionChange,
    onAddTextNode,
    onAddSimpleNode,
    onAddCsvNode,
    onReset,
    onClearAll,
    nodeCount,
    edgeCount,
    addNode,
    copyPaste,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength,
    currentHistoryIndex,
    // ファイル保存機能
    saveFlow,
    saveAsFlow,
    newFlow,
    openFlow,
    hasUnsavedChanges,
    fileName: displayFileName,
    requestTabClose,
  } = useFlowEditor(initialMode, loadedData, filePath, fileName, tabId, onCreateNewTab, onUpdateTab, onRequestTabClose);

  // 履歴情報が変更されたときに親に通知
  React.useEffect(() => {
    console.log("履歴情報が変更されました:", { historyLength, currentHistoryIndex, canUndo, canRedo });
    if (onHistoryChange) {
      onHistoryChange({
        historyLength,
        currentHistoryIndex,
        canUndo,
        canRedo,
      });
    }
  }, [historyLength, currentHistoryIndex, canUndo, canRedo, onHistoryChange]);

  // ドラッグ&ドロップ（HTML5版）
  const { reactFlowWrapper, isDragOver, onDrop, onDragOver, onDragLeave } = useHtmlDragAndDrop(addNode);

  // React Flowのズーム情報を取得
  const { getZoom, setViewport, getViewport } = useReactFlow();
  const [zoom, setZoom] = useState(1);
  const [isZoomDisabled, setIsZoomDisabled] = useState(false);

  // ズーム変更時のコールバック
  const onMove = useCallback(() => {
    setZoom(getZoom());
  }, [getZoom]);

  // ズーム無効状態変更ハンドラー
  const handleZoomDisableChange = useCallback((disabled) => {
    console.log("ズーム制御状態変更:", disabled ? "ズーム無効" : "ズーム有効");
    setIsZoomDisabled(disabled);
  }, []);

  // ズーム率変更ハンドラー（スライダー用）
  const handleZoomChange = useCallback(
    (newZoom) => {
      if (!isZoomDisabled) {
        const currentViewport = getViewport();
        setViewport({
          x: currentViewport.x,
          y: currentViewport.y,
          zoom: newZoom,
        });
        setZoom(newZoom);
        console.log("スライダーでズーム変更:", Math.round(newZoom * 100) + "%");
      }
    },
    [isZoomDisabled, getViewport, setViewport]
  );

  // ========================================================================================
  // レンダリング
  // ========================================================================================

  // デバッグ用ログ
  console.log("FlowEditor レンダリング:", {
    isZoomDisabled,
    zoomOnScroll: !isZoomDisabled,
    zoomOnPinch: !isZoomDisabled,
    zoomOnDoubleClick: !isZoomDisabled,
    showZoom: !isZoomDisabled,
  });

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* ツールバー */}
      <FlowEditorToolbar
        onAddTextNode={onAddTextNode}
        onAddSimpleNode={onAddSimpleNode}
        onAddCsvNode={onAddCsvNode}
        onReset={onReset}
        onClearAll={onClearAll}
        nodeCount={nodeCount}
        edgeCount={edgeCount}
        zoom={zoom}
        isZoomDisabled={isZoomDisabled}
        onZoomDisableChange={handleZoomDisableChange}
        onZoomChange={handleZoomChange}
        copyPaste={copyPaste}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        historyLength={historyLength}
        currentHistoryIndex={currentHistoryIndex}
        saveFlow={saveFlow}
        saveAsFlow={saveAsFlow}
        newFlow={newFlow}
        openFlow={openFlow}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* メインフローエリア */}
      <div className="flex-1 relative" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onMouseMove={copyPaste.updateMousePosition}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={onSelectionChange}
          onMove={onMove}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          className={`bg-base-100 transition-all duration-300 ${isDragOver ? "ring-2 ring-primary ring-inset" : ""} ${isZoomDisabled ? "cursor-not-allowed" : ""}`}
          zoomOnScroll={!isZoomDisabled}
          zoomOnPinch={!isZoomDisabled}
          zoomOnDoubleClick={!isZoomDisabled}
          panOnScroll={true}
          panOnScrollMode="free"
          panOnDrag={[2]} // 右クリック（マウスボタン2）でパン操作
          deleteKeyCode={null} // デフォルトの削除機能を無効化（カスタム削除機能を使用）
          multiSelectionKeyCode={["Meta", "Control", "Shift"]} // 複数選択をCtrl/Cmd/Shiftキーで有効化
          selectionKeyCode={null} // 範囲選択を有効化（空白エリアでの左ドラッグで範囲選択）
          selectionMode="partial" // 部分的に重なっているノードも選択対象に含める
          selectNodesOnDrag={false} // ドラッグ時の自動選択を無効化（範囲選択と区別）
          selectionOnDrag={true} // ドラッグによる範囲選択を有効化
          proOptions={{
            hideAttribution: true, // クレジット非表示
            hideDevTools: true, // DevTools無効化
            account: "paid-pro", // Proアカウント設定
          }}
          fitView
          attributionPosition="bottom-left"
        >
          {/* 背景グリッド */}
          <Background variant="dots" gap={20} size={1} color={isZoomDisabled ? "#e2e8f0" : "#cbd5e1"} />

          {/* ズーム・パンコントロール */}
          <Controls
            position="bottom-right"
            className="bg-base-100 shadow-lg rounded-lg border border-base-300"
            showZoom={!isZoomDisabled}
            showFitView={!isZoomDisabled}
            showInteractive={!isZoomDisabled}
          />

          {/* ミニマップ */}
          <MiniMap
            position="bottom-left"
            className="bg-base-100 shadow-lg rounded-lg border border-base-300 opacity-80 hover:opacity-100 transition-opacity"
            nodeColor="#6366f1"
            maskColor="rgba(0, 0, 0, 0.1)"
          />

          {/* ファイル名とステータス表示 */}
          <Panel position="top-left" className="pointer-events-none">
            <div className="bg-base-100 border border-base-300 rounded-lg p-2 text-sm shadow-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayFileName}</span>
                {hasUnsavedChanges && <span className="text-warning text-xs">●</span>}
              </div>
            </div>
          </Panel>

          {/* ズーム無効時のオーバーレイ */}
          {isZoomDisabled && (
            <Panel position="top-right" className="pointer-events-none">
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-2 text-orange-800 text-sm font-medium shadow-lg">🔒 ズーム操作が無効です</div>
            </Panel>
          )}

          {/* ドラッグ&ドロップヒント */}
          {isDragOver && (
            <Panel position="center" className="pointer-events-none">
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-6 text-center shadow-lg">
                <div className="text-blue-600 text-lg font-semibold mb-2">📍 ノードをドロップ</div>
                <div className="text-blue-500 text-sm">ここにドラッグしたノードが配置されます</div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

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
 * @param {Function} props.onCreateNewTab - 新しいタブを作成する関数
 * @param {Function} props.onRequestTabClose - タブクローズ要求コールバック
 */
function FlowEditor({ initialMode = "default", loadedData = null, filePath = null, fileName = "NewFile", tabId, onCreateNewTab, onUpdateTab, onRequestTabClose, onHistoryChange }) {
  console.log("FlowEditor - Props received:", {
    initialMode,
    loadedData,
    filePath,
    fileName,
    onCreateNewTab: !!onCreateNewTab,
    onRequestTabClose: !!onRequestTabClose,
    onHistoryChange: !!onHistoryChange,
  });

  return (
    <ReactFlowProvider>
      <FlowEditorInner
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
