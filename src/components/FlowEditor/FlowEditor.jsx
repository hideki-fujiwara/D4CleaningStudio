import React, { useCallback, useState, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  Panel,
  useReactFlow,
  ReactFlowProvider, // 追加
} from "reactflow";
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
 * FlowEditor の内部コンポーネント（useReactFlowを使用する部分）
 */
function FlowEditorInner() {
  // React Flow状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow(); // これでエラーが解決される

  // ノードカウンター（新しいノードのID生成用）
  const [nodeCounter, setNodeCounter] = useState(6);

  // ドラッグ&ドロップ状態
  const [isDragOver, setIsDragOver] = useState(false);
  const reactFlowWrapper = useRef(null);

  /**
   * エッジ接続時のコールバック
   */
  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: "smoothstep",
        animated: Math.random() > 0.5,
      };
      setEdges((eds) => addEdge(newEdge, eds));
      ConsoleMsg("info", "新しいエッジを追加しました", newEdge);
    },
    [setEdges]
  );

  /**
   * ノードのサイズを取得（ノードタイプに基づく推定値）
   */
  const getNodeSize = useCallback((nodeType) => {
    switch (nodeType) {
      case "inputFileCsv":
        return { width: 200, height: 80 }; // CSVノードの推定サイズ
      case "inputFileJson":
        return { width: 200, height: 80 };
      case "inputFileXml":
        return { width: 200, height: 80 };
      case "inputFileText":
        return { width: 200, height: 80 };
      case "inputFile":
        return { width: 200, height: 80 };
      case "customText":
        return { width: 250, height: 200 }; // テキストノードの推定サイズ
      case "customSimple":
        return { width: 220, height: 150 }; // シンプルノードの推定サイズ
      default:
        return { width: 200, height: 100 };
    }
  }, []);

  /**
   * ドロップ位置を中心座標として調整
   */
  const adjustPositionToCenter = useCallback(
    (position, nodeType) => {
      const nodeSize = getNodeSize(nodeType);
      return {
        x: position.x - nodeSize.width / 2,
        y: position.y - nodeSize.height / 2,
      };
    },
    [getNodeSize]
  );

  /**
   * 新しいノードを追加する（中心座標調整版）
   */
  const addNode = useCallback(
    (nodeType = "customSimple") => {
      // ランダムな位置を生成
      const randomPosition = {
        x: Math.random() * 400 + 200, // 中央寄りに配置
        y: Math.random() * 300 + 100,
      };

      // 中心座標として調整
      const position = adjustPositionToCenter(randomPosition, nodeType);

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
        position,
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeCounter((prev) => prev + 1);
      ConsoleMsg("info", "新しいノードを追加しました", newNode);
    },
    [nodeCounter, setNodes, adjustPositionToCenter]
  );

  /**
   * CSVファイルノードを手動追加（中心座標調整版）
   */
  const addCsvNode = useCallback(() => {
    const randomPosition = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 100,
    };

    const position = adjustPositionToCenter(randomPosition, "inputFileCsv");

    const newNode = {
      id: `csv-${nodeCounter}`,
      type: "inputFileCsv",
      data: {
        fileName: `sample-${nodeCounter}.csv`,
        color: "#20b2aa",
        encoding: "UTF-8",
        delimiter: ",",
        hasHeader: true,
      },
      position,
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeCounter((prev) => prev + 1);
    ConsoleMsg("info", "CSVノードを追加しました", newNode);
  }, [nodeCounter, setNodes, adjustPositionToCenter]);

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

  /**
   * ファイルタイプに基づいてノードタイプを決定
   */
  const getNodeTypeFromFile = useCallback((file) => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();

    switch (extension) {
      case "csv":
        return "inputFileCsv";
      case "json":
        return "inputFileJson";
      case "xml":
        return "inputFileXml";
      case "txt":
        return "inputFileText";
      default:
        return "inputFile";
    }
  }, []);

  /**
   * ファイルに基づいてノードデータを生成
   */
  const createNodeDataFromFile = useCallback((file) => {
    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    const baseData = {
      fileName: fileName,
      fileSize: file.size,
      lastModified: file.lastModified,
    };

    switch (extension) {
      case "csv":
        return {
          ...baseData,
          color: "#20b2aa",
          encoding: "UTF-8",
          delimiter: ",",
          hasHeader: true,
        };
      case "json":
        return {
          ...baseData,
          color: "#f59e0b",
          format: "JSON",
        };
      case "xml":
        return {
          ...baseData,
          color: "#8b5cf6",
          format: "XML",
        };
      default:
        return {
          ...baseData,
          color: "#6b7280",
        };
    }
  }, []);

  /**
   * ドラッグオーバー処理
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragOver(true); // ここで状態をtrueに
  }, []);

  /**
   * ドラッグリーブ処理
   */
  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false); // ここで状態をfalseに
  }, []);

  /**
   * ファイルドロップ処理
   */
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = Array.from(event.dataTransfer.files);
      const filePath = event.dataTransfer.getData("application/x-file-path");
      const fileName = event.dataTransfer.getData("application/x-file-name");

      if (!reactFlowWrapper.current) return;

      // screenToFlowPositionに直接画面座標を渡す
      const screenPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      if (files.length > 0) {
        // 複数ファイルの場合
        files.forEach((file, index) => {
          const nodeType = getNodeTypeFromFile(file);

          // screenToFlowPositionを使ってFlow座標系に変換
          const flowPosition = screenToFlowPosition({
            x: screenPosition.x,
            y: screenPosition.y + index * 100, // ファイル間隔を100pxに（ノードの高さを考慮）
          });

          // ドロップ位置を中心座標として調整
          const position = adjustPositionToCenter(flowPosition, nodeType);

          const nodeData = createNodeDataFromFile(file);

          const newNode = {
            id: `file-${nodeCounter + index}-${Date.now()}`, // 重複を避けるためタイムスタンプ追加
            type: nodeType,
            data: nodeData,
            position,
          };

          setNodes((nds) => [...nds, newNode]);

          ConsoleMsg("info", "ファイルからノードを作成しました", {
            fileName: file.name,
            nodeType,
            dropPosition: flowPosition,
            adjustedPosition: position,
            clientPosition: screenPosition,
          });
        });

        setNodeCounter((prev) => prev + files.length);
      } else if (filePath && fileName) {
        // ProjectTreeからのドロップ
        const extension = fileName.split(".").pop()?.toLowerCase();
        const nodeType = extension === "csv" ? "inputFileCsv" : "inputFile";

        const flowPosition = screenToFlowPosition(screenPosition);

        // ドロップ位置を中心座標として調整
        const position = adjustPositionToCenter(flowPosition, nodeType);

        const newNode = {
          id: `tree-file-${nodeCounter}-${Date.now()}`,
          type: nodeType,
          data: {
            fileName: fileName,
            filePath: filePath,
            color: extension === "csv" ? "#20b2aa" : "#6b7280",
            ...(extension === "csv" && {
              encoding: "UTF-8",
              delimiter: ",",
              hasHeader: true,
            }),
          },
          position,
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeCounter((prev) => prev + 1);

        ConsoleMsg("info", "ProjectTreeからノードを作成しました", {
          fileName,
          filePath,
          nodeType,
          dropPosition: flowPosition,
          adjustedPosition: position,
          clientPosition: screenPosition,
        });
      }
    },
    [nodeCounter, setNodes, screenToFlowPosition, getNodeTypeFromFile, createNodeDataFromFile, adjustPositionToCenter]
  );

  /**
   * FlowEditor コンポーネント
   *
   * React Flowを使用したフローチャートエディタ
   * ノードの追加、接続、移動などの基本的な編集機能を提供
   */
  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        className={`bg-base-100 `}
        proOptions={{
          hideAttribution: true,
        }}
      >
        {/* ドラッグオーバー時のオーバーレイ */}
        {/* {isDragOver && (
          <div className="absolute inset-0 bg-primary bg-opacity-10 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-dashed border-primary">
              <div className="text-center">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-lg font-semibold text-primary">ファイルをドロップしてノードを作成</div>
                <div className="text-sm text-gray-600 mt-1">CSV, JSON, XML, TXTファイルに対応</div>
              </div>
            </div>
          </div>
        )} */}

        {/* コントロールパネル */}
        <Panel position="top-left" className="space-x-2 space-y-2 flex flex-col">
          <div className="space-x-2">
            <button onClick={addTextNode} className="rounded bg-teal-500 px-3 py-2 text-sm text-white transition-colors hover:bg-teal-600">
              テキストノード追加
            </button>
            <button onClick={addSimpleNode} className="rounded bg-blue-500 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-600">
              シンプルノード追加
            </button>
            <button onClick={addCsvNode} className="rounded bg-emerald-500 px-3 py-2 text-sm text-white transition-colors hover:bg-emerald-600">
              CSVノード追加
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

          {/* ファイルドロップ案内 */}
          <div className="mt-4 p-2 bg-info bg-opacity-20 rounded text-xs text-info-content">💡 ファイルをドラッグ&ドロップしてノードを作成できます</div>
        </Panel>

        {/* 情報パネル */}
        <Panel position="top-right" className="text-sm">
          <div className="rounded bg-base-200 p-2 text-base-content">
            <div>ノード: {nodes.length}</div>
            <div>エッジ: {edges.length}</div>
            <div className="mt-2 text-xs">
              <div>テキストノード: {nodes.filter((n) => n.type === "customText").length}</div>
              <div>シンプルノード: {nodes.filter((n) => n.type === "customSimple").length}</div>
              <div>CSVノード: {nodes.filter((n) => n.type === "inputFileCsv").length}</div>
              <div>ファイルノード: {nodes.filter((n) => n.type?.startsWith("inputFile")).length}</div>
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
              case "inputFileCsv":
                return "#20b2aa";
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

/**
 * FlowEditor メインコンポーネント（ReactFlowProviderでラップ）
 */
function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorInner />
    </ReactFlowProvider>
  );
}

export default FlowEditor;
