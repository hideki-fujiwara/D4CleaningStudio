import React, { useCallback, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, ConnectionLineType, Panel } from "reactflow";
import "reactflow/dist/style.css";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { nodeTypes } from "./CustomNodes";

// 初期ノードデータ（カスタムスタイル付き）
const initialNodes = [
  {
    id: "1",
    type: "customText",
    data: {
      title: "データプロセッサ",
      content: "入力データを処理して\n結果を出力します",
      style: {
        header: {
          text: "データプロセッサ",
          bgColor: "bg-purple-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-white",
          borderColor: "border-purple-500",
        },
        content: {
          bgColor: "bg-purple-50",
          textColor: "text-purple-900",
          borderColor: "border-purple-300",
        },
      },
      leftItems: [
        { id: 0, text: "Raw Data", type: "input", bgColor: "bg-blue-200", textColor: "text-blue-800", handleColor: "bg-blue-600" },
        { id: 1, text: "Config", type: "input", bgColor: "bg-green-200", textColor: "text-green-800", handleColor: "bg-green-600" },
        { id: 2, text: "Rules", type: "input", bgColor: "bg-yellow-200", textColor: "text-yellow-800", handleColor: "bg-yellow-600" },
      ],
      rightItems: [
        { id: 0, text: "Clean Data", type: "output", bgColor: "bg-emerald-200", textColor: "text-emerald-800", handleColor: "bg-emerald-600" },
        { id: 1, text: "Error Log", type: "output", bgColor: "bg-red-200", textColor: "text-red-800", handleColor: "bg-red-600" },
        { id: 2, text: "Stats", type: "output", bgColor: "bg-orange-200", textColor: "text-orange-800", handleColor: "bg-orange-600" },
      ],
    },
    position: { x: 250, y: 25 },
  },
  {
    id: "2",
    type: "customSimple",
    data: {
      label: "バリデーター",
      description: "データの妥当性をチェック",
      style: {
        header: {
          bgColor: "bg-red-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
        },
        content: {
          bgColor: "bg-red-50",
          textColor: "text-red-700",
        },
      },
    },
    position: { x: 600, y: 300 },
  },
  {
    id: "3",
    type: "customSimple",
    data: {
      label: "データ出力",
      description: "処理結果を出力",
      style: {
        header: {
          bgColor: "bg-green-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
        },
        content: {
          bgColor: "bg-green-50",
          textColor: "text-green-700",
        },
      },
    },
    position: { x: 100, y: 500 },
  },
  {
    id: "4",
    type: "input",
    data: { label: "開始" },
    position: { x: 50, y: 500 },
  },
  {
    id: "5",
    type: "output",
    data: { label: "完了" },
    position: { x: 650, y: 500 },
  },
  // 大きなハードディスクノード
  {
    id: "storage1",
    type: "customSimple",
    data: {
      label: "プライマリストレージ",
      subtitle: "メインデータベース",
      description: "顧客データとトランザクション情報を格納するメインストレージシステム。高速アクセスとデータ整合性を保証します。",
      iconType: "hard",
      specs: {
        容量: "2TB SSD",
        インターフェース: "NVMe",
        速度: "3,500 MB/s",
        用途: "データベース",
      },
      style: {
        header: {
          bgColor: "bg-emerald-500",
          textColor: "text-white",
        },
        content: {
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-900",
        },
      },
    },
    position: { x: 100, y: 100 },
  },
  // CSV入力ノード（シンプル版）
  {
    id: "csv1",
    type: "inputFileCsv",
    data: {
      color: "#20b2aa", // ティール色
      fileName: "customers.csv",
    },
    position: { x: 100, y: 200 },
  },
  // 設定ファイルCSV（青色版）
  {
    id: "csv2",
    type: "inputFileCsv",
    data: {
      color: "#3b82f6", // 青色
      fileName: "config.csv",
    },
    position: { x: 100, y: 400 },
  },
];

// 初期エッジデータ
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    type: "smoothstep",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    type: "smoothstep",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    type: "smoothstep",
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    type: "smoothstep",
  },
];

/**
 * FlowEditor コンポーネント
 *
 * React Flowを使用したフローチャートエディタ
 * ノードの追加、接続、移動などの基本的な編集機能を提供
 */
function FlowEditor() {
  // React Flow状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ノードカウンター（新しいノードのID生成用）
  const [nodeCounter, setNodeCounter] = useState(6);

  /**
   * エッジ接続時のコールバック
   */
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: Math.random() > 0.5, // ランダムでアニメーション
      };
      setEdges((eds) => addEdge(newEdge, eds));
      ConsoleMsg("info", "新しいエッジを追加しました", newEdge);
    },
    [setEdges]
  );

  /**
   * 新しいノードを追加する
   */
  const addNode = useCallback(
    (nodeType = "customSimple") => {
      const newNode = {
        id: `${nodeCounter}`,
        type: nodeType,
        data:
          nodeType === "customText"
            ? {
                title: `テキスト ${nodeCounter}`,
                content: "新しいテキストノード",
              }
            : {
                label: `ノード ${nodeCounter}`,
                description: "新しいノード",
              },
        position: {
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeCounter((prev) => prev + 1);
      ConsoleMsg("info", "新しいノードを追加しました", newNode);
    },
    [nodeCounter, setNodes]
  );

  /**
   * テキストノードを追加
   */
  const addTextNode = useCallback(() => {
    addNode("customText");
  }, [addNode]);

  /**
   * シンプルノードを追加
   */
  const addSimpleNode = useCallback(() => {
    addNode("customSimple");
  }, [addNode]);

  /**
   * すべてのノードをクリア
   */
  const clearNodes = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);
    ConsoleMsg("info", "すべてのノードをクリアしました");
  }, [setNodes, setEdges]);

  /**
   * 初期状態にリセット
   */
  const resetFlow = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setNodeCounter(6);
    ConsoleMsg("info", "フローを初期状態にリセットしました");
  }, [setNodes, setEdges]);

  /**
   * ノード選択時のコールバック
   */
  const onNodeClick = useCallback((event, node) => {
    ConsoleMsg("info", "ノードが選択されました", node);
  }, []);

  /**
   * エッジ選択時のコールバック
   */
  const onEdgeClick = useCallback((event, edge) => {
    ConsoleMsg("info", "エッジが選択されました", edge);
  }, []);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        className="bg-base-100"
        proOptions={{
          hideAttribution: true,
        }}
      >
        {/* コントロールパネル */}
        <Panel position="top-left" className="space-x-2 space-y-2 flex flex-col">
          <div className="space-x-2">
            <button onClick={addTextNode} className="rounded bg-teal-500 px-3 py-2 text-sm text-white transition-colors hover:bg-teal-600">
              テキストノード追加
            </button>
            <button onClick={addSimpleNode} className="rounded bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600">
              シンプルノード追加
            </button>
          </div>
          <div className="space-x-2">
            <button onClick={resetFlow} className="rounded bg-secondary px-3 py-2 text-sm text-secondary-content transition-colors hover:bg-secondary/90">
              リセット
            </button>
            <button onClick={clearNodes} className="rounded bg-error px-3 py-2 text-sm text-error-content transition-colors hover:bg-error/90">
              クリア
            </button>
          </div>
        </Panel>

        {/* 情報パネル */}
        <Panel position="top-right" className="text-sm">
          <div className="rounded bg-base-200 p-2 text-base-content">
            <div>ノード: {nodes.length}</div>
            <div>エッジ: {edges.length}</div>
            <div className="mt-2 text-xs">
              <div>テキストノード: {nodes.filter((n) => n.type === "customText").length}</div>
              <div>シンプルノード: {nodes.filter((n) => n.type === "customSimple").length}</div>
            </div>
          </div>
        </Panel>

        {/* ミニマップ */}
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "customText":
                return "#14b8a6";
              case "customSimple":
                return "#3b82f6";
              case "input":
                return "#22c55e";
              case "output":
                return "#ef4444";
              default:
                return "#6b7280";
            }
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-base-300"
        />

        {/* コントロール */}
        <Controls className="bg-base-200 text-base-content" showZoom={true} showFitView={true} showInteractive={true} />

        {/* 背景 */}
        <Background variant="dots" gap={20} size={1} color="#94a3b8" className="bg-base-100" />
      </ReactFlow>
    </div>
  );
}

export default FlowEditor;
