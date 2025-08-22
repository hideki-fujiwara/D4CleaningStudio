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
import React from "react";
import ReactFlow, { MiniMap, Controls, Background, ConnectionLineType, Panel, ReactFlowProvider } from "reactflow";
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
function FlowEditorInner({ initialMode }) {
  // ========================================================================================
  // カスタムフック使用
  // ========================================================================================

  // メインロジック（状態管理、ノード操作）
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onAddTextNode, onAddSimpleNode, onAddCsvNode, onReset, onClearAll, nodeCount, edgeCount, addNode } = useFlowEditor(initialMode);

  // ドラッグ&ドロップ（HTML5版）
  const { reactFlowWrapper, isDragOver, onDrop, onDragOver, onDragLeave } = useHtmlDragAndDrop(addNode);

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
      />

      {/* メインフローエリア */}
      <div className="flex-1 relative" ref={reactFlowWrapper} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          className={`bg-base-100 transition-all duration-300 ${isDragOver ? "ring-2 ring-primary ring-inset" : ""}`}
          proOptions={{
            hideAttribution: true, // React Flowのクレジット表示を隠す
          }}
          fitView
          attributionPosition="bottom-left"
        >
          {/* 背景グリッド */}
          <Background variant="dots" gap={20} size={1} color="#cbd5e1" />

          {/* ズーム・パンコントロール */}
          <Controls position="bottom-right" className="bg-base-100 shadow-lg rounded-lg border border-base-300" />

          {/* ミニマップ */}
          <MiniMap
            position="bottom-left"
            className="bg-base-100 shadow-lg rounded-lg border border-base-300 opacity-80 hover:opacity-100 transition-opacity"
            nodeColor="#6366f1"
            maskColor="rgba(0, 0, 0, 0.1)"
          />

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
 * @param {string} props.initialMode - 初期モード（"default" | "empty"）
 */
function FlowEditor({ initialMode = "default" }) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner initialMode={initialMode} />
    </ReactFlowProvider>
  );
}

// ========================================================================================
// エクスポート
// ========================================================================================

export default FlowEditor;
