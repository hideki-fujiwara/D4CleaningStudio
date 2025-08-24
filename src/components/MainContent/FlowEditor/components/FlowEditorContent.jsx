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
import { ReactFlow, MiniMap, Controls, Background, ConnectionLineType, Panel, ReactFlowProvider, NodeResizer } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "../CustomNodes";
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
  const [selectedNodes, setSelectedNodes] = useState([]);

  // ノード選択変更時のコールバック
  const handleSelectionChange = useCallback(
    (params) => {
      setSelectedNodes(params.nodes);
      onSelectionChange(params);
    },
    [onSelectionChange]
  );

  // ドラッグ開始時のコールバック（必ず選択状態にする）
  const handleNodeDragStart = useCallback(
    (event, node) => {
      // ドラッグ開始時に必ずそのノードを選択状態にする
      const nodeElement = nodes.find((n) => n.id === node.id);
      if (nodeElement && !nodeElement.selected) {
        // ReactFlowの状態を更新して選択状態にする
        const updatedNodes = nodes.map((n) => ({
          ...n,
          selected: n.id === node.id,
        }));
        // onNodesChangeを呼び出してReactFlowの状態を更新
        onNodesChange([
          {
            type: "select",
            id: node.id,
            selected: true,
          },
          ...nodes
            .filter((n) => n.id !== node.id && n.selected)
            .map((n) => ({
              type: "select",
              id: n.id,
              selected: false,
            })),
        ]);
        setSelectedNodes([{ ...nodeElement, selected: true }]);
      }
      onNodeDragStart(event, node);
    },
    [nodes, onNodeDragStart, onNodesChange]
  );

  // ノードクリック時のコールバック（必ず選択状態にする）
  const handleNodeClick = useCallback(
    (event, node) => {
      // クリック時に必ずそのノードを選択状態にする
      const nodeElement = nodes.find((n) => n.id === node.id);
      if (nodeElement) {
        // ReactFlowの状態を更新して選択状態にする
        onNodesChange([
          {
            type: "select",
            id: node.id,
            selected: true,
          },
          ...nodes
            .filter((n) => n.id !== node.id && n.selected)
            .map((n) => ({
              type: "select",
              id: n.id,
              selected: false,
            })),
        ]);
        setSelectedNodes([{ ...nodeElement, selected: true }]);
      }
    },
    [nodes, onNodesChange]
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
      <div className="flex-1 relative w-full h-full" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onMouseMove={copyPaste.updateMousePosition}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeDragStart={handleNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            onSelectionChange={handleSelectionChange}
            onMove={onMove}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            className={`w-full h-full bg-base-100 transition-all duration-300 ${isDragOver ? "ring-2 ring-primary ring-inset" : ""} ${isZoomDisabled ? "cursor-not-allowed" : ""}`}
            zoomOnScroll={!isZoomDisabled}
            zoomOnPinch={!isZoomDisabled}
            zoomOnDoubleClick={!isZoomDisabled}
            panOnScroll={false}
            panOnScrollMode="free"
            panOnDrag={[2]} // 右クリック（マウスボタン2）でパン操作
            deleteKeyCode={null} // デフォルトの削除機能を無効化（カスタム削除機能を使用）
            multiSelectionKeyCode={["Meta", "Control", "Shift"]} // 複数選択をCtrl/Cmd/Shiftキーで有効化
            selectionKeyCode={null} // 範囲選択を有効化（空白エリアでの左ドラッグで範囲選択）
            selectionMode="partial" // 部分的に重なっているノードも選択対象に含める
            selectNodesOnDrag={false} // ドラッグ時の自動選択を無効化（範囲選択と区別）
            selectionOnDrag={true} // ドラッグによる範囲選択を有効化
            nodesDraggable={true} // ノードのドラッグを有効化
            nodesConnectable={true} // ノードの接続を有効化
            elementsSelectable={true} // 要素の選択を有効化
            proOptions={{
              hideAttribution: true, // クレジット非表示
              hideDevTools: true, // DevTools無効化
              account: "paid-pro", // Proアカウント設定
            }}
            fitView // ノードがある場合のみfitViewを実行
            defaultViewport={{ x: 0, y: 0, zoom: 1 }} // 初期ビューポートを設定
            maxZoom={3.0} // 最大ズーム倍率を300%に制限
            minZoom={0.5} // 最小ズーム倍率を50%に制限
            attributionPosition="bottom-left"
          >
            {/* 背景グリッド */}
            <Background
              id={`background-${tabId}`} // タブIDベースのユニークなID
              variant="dots"
              gap={20}
              size={2}
              color="#94a3b8"
              style={{
                opacity: isZoomDisabled ? 0.3 : 1,
              }}
            />

            {/* ズーム・パンコントロール */}
            <Controls
              id={`controls-${tabId}`} // タブIDベースのユニークなID
              position="bottom-right"
              showZoom={!isZoomDisabled}
              showFitView={!isZoomDisabled}
              showInteractive={!isZoomDisabled}
              style={{}}
            />

            {/* ミニマップ */}
            <MiniMap
              id={`minimap-${tabId}`} // タブIDベースのユニークなID
              position="bottom-left"
              nodeColor="#6366f1"
              maskColor="rgba(0, 0, 0, 0.1)"
              style={{}}
            />

            {/* ファイル名とステータス表示 */}
            <Panel position="top-right" style={{ pointerEvents: "none" }}>
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "6px 0 0 6px",
                  padding: "8px",
                  fontSize: "14px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  minWidth: "280px",
                  maxWidth: "350px",
                }}
              >
                {/* ファイル名行 */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px" }}>
                  <span style={{ fontWeight: "500" }}>{displayFileName}</span>
                  {hasUnsavedChanges && <span style={{ color: "#f59e0b", fontSize: "12px" }}>●</span>}
                </div>

                {/* 選択ノード詳細情報 */}
                <div style={{ fontSize: "12px", color: "#374151" }}>
                  {selectedNodes.length > 0 ? (
                    selectedNodes.length === 1 ? (
                      <div>
                        <div style={{ marginBottom: "6px" }}>
                          <strong style={{ color: "#1f2937" }}>選択中ノード:</strong>
                          <div style={{ marginLeft: "8px", marginTop: "2px" }}>
                            <div>
                              <strong>ラベル:</strong> {selectedNodes[0].data?.label || selectedNodes[0].type || "ノード"}
                            </div>
                            <div>
                              <strong>ID:</strong> {selectedNodes[0].id}
                            </div>
                            <div>
                              <strong>タイプ:</strong> {selectedNodes[0].type}
                            </div>
                            <div>
                              <strong>座標:</strong> ({Math.round(selectedNodes[0].position.x)}, {Math.round(selectedNodes[0].position.y)})
                            </div>
                            {selectedNodes[0].width && selectedNodes[0].height && (
                              <div>
                                <strong>サイズ:</strong> {Math.round(selectedNodes[0].width)} × {Math.round(selectedNodes[0].height)}
                              </div>
                            )}
                            {selectedNodes[0].data?.description && (
                              <div>
                                <strong>説明:</strong> {selectedNodes[0].data.description}
                              </div>
                            )}
                            <div>
                              <strong>選択:</strong> {selectedNodes[0].selected ? "✓" : "✗"}
                            </div>
                            <div>
                              <strong>ドラッグ可能:</strong> {selectedNodes[0].draggable !== false ? "✓" : "✗"}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280", borderTop: "1px solid #f3f4f6", paddingTop: "4px" }}>
                          総計: ノード {nodeCount}個 | エッジ {edgeCount}個
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ marginBottom: "6px" }}>
                          <strong style={{ color: "#1f2937" }}>複数選択中:</strong> {selectedNodes.length}個のノード
                        </div>
                        <div style={{ marginLeft: "8px", marginBottom: "6px" }}>
                          {selectedNodes.slice(0, 3).map((node, index) => (
                            <div key={node.id} style={{ marginBottom: "2px" }}>
                              <span style={{ fontWeight: "500" }}>{index + 1}.</span> {node.data?.label || node.type}
                              <span style={{ color: "#6b7280" }}>
                                {" "}
                                ({Math.round(node.position.x)}, {Math.round(node.position.y)})
                              </span>
                            </div>
                          ))}
                          {selectedNodes.length > 3 && <div style={{ color: "#6b7280", fontStyle: "italic" }}>...他 {selectedNodes.length - 3}個</div>}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280", borderTop: "1px solid #f3f4f6", paddingTop: "4px" }}>
                          総計: ノード {nodeCount}個 | エッジ {edgeCount}個
                        </div>
                      </div>
                    )
                  ) : (
                    <div>
                      <div style={{ marginBottom: "4px" }}>
                        <strong style={{ color: "#1f2937" }}>フロー統計:</strong>
                      </div>
                      <div style={{ marginLeft: "8px" }}>
                        <div>ノード: {nodeCount}個</div>
                        <div>エッジ: {edgeCount}個</div>
                        <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px" }}>ノードをクリックして詳細を表示</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            {/* ズーム無効時のオーバーレイ */}
            {isZoomDisabled && (
              <Panel position="top-right" style={{ pointerEvents: "none" }}>
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
                    border: "2px dashed #60a5fa",
                    borderRadius: "8px",
                    padding: "24px",
                    textAlign: "center",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div style={{ color: "#2563eb", fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>📍 ノードをドロップ</div>
                  <div style={{ color: "#3b82f6", fontSize: "14px" }}>ここにドラッグしたノードが配置されます</div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}

export default FlowEditorContent;
