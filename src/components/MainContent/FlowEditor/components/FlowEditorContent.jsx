/**
 * ================================================================
 * FlowEditorContent コンポーネント
 * ================================================================
 *
 * FlowEditorのメインコンテンツ実装
 * ReactFlowProvider内で動作する必要があるため分離
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import React, { useState, useCallback } from "react";
import { ReactFlow, MiniMap, Controls, Background, BackgroundVariant, ConnectionLineType, Panel, NodeResizer, ReactFlowProvider } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "../Nodes/CustomNodes";
import FlowEditorToolbar from "../FlowEditorToolbar";
import { useFlowEditor } from "../hooks/useFlowEditor";
import { useHtmlDragAndDrop } from "../hooks/useHtmlDragAndDrop";

/**
 * FlowEditorのメインコンテンツ実装
 * ReactFlowProvider内で動作する必要があるため分離
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
function FlowEditorContent({ initialMode, loadedData, filePath, fileName, tabId, onCreateNewTab, onUpdateTab, onRequestTabClose, onHistoryChange }) {
  return (
    <ReactFlowProvider>
      <FlowEditorContentInner
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

/**
 * ReactFlowProvider内で動作するメインコンポーネント
 */
function FlowEditorContentInner({ initialMode, loadedData, filePath, fileName, tabId, onCreateNewTab, onUpdateTab, onRequestTabClose, onHistoryChange }) {
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

  // グローバルキーボードイベントリスナー（コピー&ペースト機能）
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      // 入力フィールドにフォーカスがある場合は処理しない
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA" || event.target.contentEditable === "true") {
        return;
      }

      // Ctrl+C または Cmd+C でコピー
      if ((event.ctrlKey || event.metaKey) && event.key === "c") {
        event.preventDefault();
        if (copyPaste && typeof copyPaste.copySelectedNodes === "function") {
          copyPaste.copySelectedNodes();
        }
      }
      // Ctrl+V または Cmd+V でペースト
      else if ((event.ctrlKey || event.metaKey) && event.key === "v") {
        event.preventDefault();
        if (copyPaste && typeof copyPaste.pasteNodes === "function") {
          copyPaste.pasteNodes();
        }
      }
      // Ctrl+X または Cmd+X でカット
      else if ((event.ctrlKey || event.metaKey) && event.key === "x") {
        event.preventDefault();
        if (copyPaste && typeof copyPaste.cutSelectedNodes === "function") {
          copyPaste.cutSelectedNodes();
        }
      }
    };

    // グローバルイベントリスナーを登録
    document.addEventListener("keydown", handleKeyDown);

    // クリーンアップ
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [copyPaste]);

  // 履歴情報が変更されたときに親に通知
  React.useEffect(() => {
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

  // ズーム状態管理
  const [zoom, setZoom] = useState(1);
  const [isZoomDisabled, setIsZoomDisabled] = useState(false);

  // ノード選択変更時のコールバック（ReactFlowの標準動作を活用）
  const handleSelectionChange = useCallback(
    (params) => {
      if (onSelectionChange) {
        onSelectionChange(params);
      }
    },
    [onSelectionChange]
  );

  // ドラッグ開始時のコールバック（ReactFlowの標準動作を活用）
  const handleNodeDragStart = useCallback(
    (event, node) => {
      // ReactFlowの標準動作に委ねる
      if (onNodeDragStart) {
        onNodeDragStart(event, node);
      }
    },
    [onNodeDragStart]
  );

  // ズーム変更時のコールバック
  const onMove = useCallback(() => {
    // ReactFlowのズーム値を取得する処理は削除
  }, []);

  // ズーム無効状態変更ハンドラー
  const handleZoomDisableChange = useCallback((disabled) => {
    setIsZoomDisabled(disabled);
  }, []);

  // ズーム率変更ハンドラー（スライダー用）
  const handleZoomChange = useCallback(
    (newZoom) => {
      if (!isZoomDisabled) {
        // ReactFlowのズーム変更処理は削除
        setZoom(newZoom);
      }
    },
    [isZoomDisabled]
  );

  // ========================================================================================
  // レンダリング
  // ========================================================================================

  return (
    <div className="h-full flex flex-col">
      {/* ツールバー */}
      <FlowEditorToolbar
        onAddTextNode={onAddTextNode}
        onAddSimpleNode={onAddSimpleNode}
        onAddCsvNode={onAddCsvNode}
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
      <div className="w-full h-full" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onMouseMove={copyPaste.updateMousePosition}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionChange={handleSelectionChange}
          onMove={onMove}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          style={{
            width: "100%",
            height: "100%",
            ...(isDragOver && {
              outline: "2px solid #3b82f6",
              outlineOffset: "-2px",
            }),
          }}
          zoomOnScroll={!isZoomDisabled}
          zoomOnPinch={!isZoomDisabled}
          zoomOnDoubleClick={!isZoomDisabled}
          panOnScroll={false}
          panOnScrollMode="free"
          panOnDrag={[1, 2]}
          deleteKeyCode={null}
          multiSelectionKeyCode={["Meta", "Control", "Shift"]}
          selectionMode="partial"
          selectionOnDrag={true}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          maxZoom={3.0}
          minZoom={0.5}
          proOptions={{
            account: "paid-pro",
            hideAttribution: true,
            hideDevTools: true,
          }}
        >
          {/* 背景グリッド */}
          <Background
            id={`background-${tabId}`} // タブIDベースのユニークなID
            variant={BackgroundVariant.Dots}
            gap={20}
            size={2}
            color="rgba(75, 85, 99, 1)" // ダークモード用のドット色（グレー600、透明度100%）
            style={{
              opacity: isZoomDisabled ? 0.25 : 1,
            }}
          />
          {/* ズーム・パンコントロール */}
          <Controls
            position="bottom-right"
            showZoom={!isZoomDisabled}
            showFitView={!isZoomDisabled}
            showInteractive={!isZoomDisabled}
            style={{
              backgroundColor: isZoomDisabled ? "rgba(254, 243, 199, 0.95)" : "rgba(255, 255, 255, 0.95)", // ロック時は黄色背景
              border: isZoomDisabled ? "2px solid rgba(245, 158, 11, 0.8)" : "2px solid rgba(229, 231, 235, 0.8)", // ロック時は黄色境界線
              color: isZoomDisabled ? "#92400e" : "#374151", // ロック時は暗い黄色、通常時はダークグレー
            }}
          />

          {/* ミニマップ */}
          <MiniMap
            id={`minimap-${tabId}`} // タブIDベースのユニークなID
            position="bottom-left"
            nodeColor="rgba(75, 85, 99, 1)"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
          {/* ファイル名とステータス表示 */}
          <Panel position="top-right" style={{ pointerEvents: "none" }}>
            <div
              style={{
                backgroundColor: "rgba(55, 65, 81, 1)", // ダークモード用の背景色（グレー700、透明度100%）
                color: "#f9fafb", // ダークモード用のテキスト色（グレー50）
                borderRadius: "6px 0 0 6px",
                padding: "8px",
                fontSize: "14px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
                minWidth: "280px",
                maxWidth: "350px",
              }}
            >
              {/* ファイル名行 */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", borderBottom: "1px solid #4b5563", paddingBottom: "4px" }}>
                <span style={{ fontWeight: "500" }}>{displayFileName}</span>
                {hasUnsavedChanges && <span style={{ color: "#fbbf24", fontSize: "12px" }}>●</span>}
              </div>

              {/* 選択ノード詳細情報 */}
              <div style={{ fontSize: "12px", color: "#d1d5db" }}>
                {(() => {
                  const selectedNodes = nodes.filter((n) => n.selected);
                  if (selectedNodes.length > 0) {
                    if (selectedNodes.length === 1) {
                      const selectedNode = selectedNodes[0];
                      return (
                        <div>
                          <div style={{ marginBottom: "6px" }}>
                            <strong style={{ color: "#f3f4f6" }}>選択中ノード:</strong>
                            <div style={{ marginLeft: "8px", marginTop: "2px" }}>
                              <div>
                                <strong>ラベル:</strong> {selectedNode.data?.label || selectedNode.type || "ノード"}
                              </div>
                              <div>
                                <strong>ID:</strong> {selectedNode.id}
                              </div>
                              <div>
                                <strong>タイプ:</strong> {selectedNode.type}
                              </div>
                              <div>
                                <strong>座標:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
                              </div>
                              {selectedNode.width && selectedNode.height && (
                                <div>
                                  <strong>サイズ:</strong> {Math.round(selectedNode.width)} × {Math.round(selectedNode.height)}
                                </div>
                              )}
                              {selectedNode.data?.description && (
                                <div>
                                  <strong>説明:</strong> {selectedNode.data.description}
                                </div>
                              )}
                              <div>
                                <strong>選択:</strong> {selectedNode.selected ? "✓" : "✗"}
                              </div>
                              <div>
                                <strong>ドラッグ可能:</strong> {selectedNode.draggable !== false ? "✓" : "✗"}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", borderTop: "1px solid #4b5563", paddingTop: "4px" }}>
                            総計: ノード {nodeCount}個 | エッジ {edgeCount}個
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          <div style={{ marginBottom: "6px" }}>
                            <strong style={{ color: "#f3f4f6" }}>複数選択中:</strong> {selectedNodes.length}個のノード
                          </div>
                          <div style={{ marginLeft: "8px", marginBottom: "6px" }}>
                            {selectedNodes.slice(0, 3).map((node, index) => (
                              <div key={node.id} style={{ marginBottom: "2px" }}>
                                <span style={{ fontWeight: "500" }}>{index + 1}.</span> {node.data?.label || node.type}
                                <span style={{ color: "#9ca3af" }}>
                                  {" "}
                                  ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                                </span>
                              </div>
                            ))}
                            {selectedNodes.length > 3 && <div style={{ color: "#9ca3af", fontStyle: "italic" }}>...他 {selectedNodes.length - 3}個</div>}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", borderTop: "1px solid #4b5563", paddingTop: "4px" }}>
                            総計: ノード {nodeCount}個 | エッジ {edgeCount}個
                          </div>
                        </div>
                      );
                    }
                  } else {
                    return (
                      <div>
                        <div style={{ marginBottom: "4px" }}>
                          <strong style={{ color: "#f3f4f6" }}>フロー統計:</strong>
                        </div>
                        <div style={{ marginLeft: "8px" }}>
                          <div>ノード: {nodeCount}個</div>
                          <div>エッジ: {edgeCount}個</div>
                          <div style={{ color: "#9ca3af", fontSize: "11px", marginTop: "4px" }}>ノードをクリックして詳細を表示</div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </Panel>
          {/* ズーム無効時のオーバーレイ */}
          {isZoomDisabled && (
            <Panel position="bottom-right" style={{ pointerEvents: "none" }}>
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: "8px",
                  padding: "8px",
                  color: "#92400e",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                🔒 ズーム操作が無効です
              </div>
            </Panel>
          )}
          {/* ドラッグ&ドロップヒント */}
          {isDragOver && (
            <Panel position="center" style={{ pointerEvents: "none" }}>
              <div
                style={{
                  backgroundColor: "rgba(55, 65, 81, 1)", // ダークモード背景（透明度100%）
                  border: "2px dashed #60a5fa",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
                }}
              >
                <div style={{ color: "#60a5fa", fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>📍 ノードをドロップ</div>
                <div style={{ color: "#93c5fd", fontSize: "14px" }}>ここにドラッグしたノードが配置されます</div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default FlowEditorContent;
