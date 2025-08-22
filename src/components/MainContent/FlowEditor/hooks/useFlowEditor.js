/**
 * ================================================================
 * FlowEditor カスタムフック
 * ================================================================
 *
 * FlowEditorで使用するロジックを管理するカスタムフック
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */
import { useCallback, useState, useRef } from "react";
import { useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import ConsoleMsg from "../../../../utils/ConsoleMsg";
import { initialNodes, initialEdges } from "../data/initialData";

/**
 * FlowEditorのメインロジックを管理するフック
 * @param {string} initialMode - 初期モード（"default" | "empty"）
 */
export const useFlowEditor = (initialMode = "default") => {
  // ========================================================================================
  // 初期データ設定
  // ========================================================================================

  const getInitialNodes = () => {
    const nodes = initialMode === "empty" ? [] : initialNodes;
    console.log("getInitialNodes:", nodes.length, "nodes");
    return nodes;
  };

  const getInitialEdges = () => {
    const edges = initialMode === "empty" ? [] : initialEdges;
    console.log("getInitialEdges:", edges.length, "edges");
    return edges;
  };

  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // React Flow状態管理（ノードとエッジ）
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // React Flowのユーティリティ関数（座標変換用）
  const { screenToFlowPosition } = useReactFlow();

  // ノードカウンター（新しいノードのID生成用）
  const [nodeCounter, setNodeCounter] = useState(6);

  // ドラッグ&ドロップ状態
  const [isDragOver, setIsDragOver] = useState(false);

  // React Flowコンテナへの参照
  const reactFlowWrapper = useRef(null);

  // ========================================================================================
  // エッジ接続処理
  // ========================================================================================

  /**
   * エッジ接続時のコールバック
   * ユーザーがノード間を接続した際に呼び出される
   */
  const onConnect = useCallback(
    (params) => {
      // 新しいエッジの設定
      const newEdge = {
        ...params,
        type: "smoothstep", // 滑らかなカーブの接続線
        animated: Math.random() > 0.5, // 50%の確率でアニメーション
      };

      // エッジ状態を更新
      setEdges((eds) => addEdge(newEdge, eds));

      // ログ出力
      ConsoleMsg("info", "新しいエッジを追加しました", newEdge);
    },
    [setEdges]
  );

  // ========================================================================================
  // ノードサイズ管理
  // ========================================================================================

  /**
   * ノードのサイズを取得（ノードタイプに基づく推定値）
   * ドロップ時の中心座標調整に使用
   */
  const getNodeSize = useCallback((nodeType) => {
    switch (nodeType) {
      case "customText":
        return { width: 300, height: 200 };
      case "customSimple":
        return { width: 200, height: 120 };
      case "inputFileCsv":
        return { width: 180, height: 100 };
      case "input":
      case "output":
      default:
        return { width: 150, height: 50 };
    }
  }, []);

  // ========================================================================================
  // ノード操作関数
  // ========================================================================================

  /**
   * 新しいノードを追加
   */
  const addNode = useCallback(
    (nodeType, position, additionalData = {}) => {
      const nodeSize = getNodeSize(nodeType);
      const adjustedPosition = {
        x: position.x - nodeSize.width / 2,
        y: position.y - nodeSize.height / 2,
      };

      const newNode = {
        id: `node_${nodeCounter}`,
        type: nodeType,
        position: adjustedPosition,
        data: {
          label: `ノード ${nodeCounter}`,
          ...additionalData,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setNodeCounter((counter) => counter + 1);

      ConsoleMsg("info", `新しい${nodeType}ノードを追加しました`, newNode);

      return newNode;
    },
    [nodeCounter, getNodeSize, setNodes]
  );

  /**
   * フローをリセット
   */
  const resetFlow = useCallback(() => {
    setNodes(getInitialNodes());
    setEdges(getInitialEdges());
    setNodeCounter(6);
    ConsoleMsg("info", "フローをリセットしました");
  }, [setNodes, setEdges, initialMode]);

  /**
   * 全ノードとエッジをクリア
   */
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);
    ConsoleMsg("warning", "全てのノードとエッジをクリアしました");
  }, [setNodes, setEdges]);

  // ========================================================================================
  // 個別ノード追加関数
  // ========================================================================================

  /**
   * テキストノードを追加
   */
  const onAddTextNode = useCallback(() => {
    const position = { x: 250 + Math.random() * 100, y: 250 + Math.random() * 100 };
    const additionalData = {
      title: "新しいテキストノード",
      content: "ここにテキストを入力",
    };
    addNode("customText", position, additionalData);
  }, [addNode]);

  /**
   * シンプルノードを追加
   */
  const onAddSimpleNode = useCallback(() => {
    const position = { x: 250 + Math.random() * 100, y: 250 + Math.random() * 100 };
    const additionalData = {
      label: "新しいノード",
      description: "ノードの説明",
    };
    addNode("customSimple", position, additionalData);
  }, [addNode]);

  /**
   * CSVノードを追加
   */
  const onAddCsvNode = useCallback(() => {
    const position = { x: 250 + Math.random() * 100, y: 250 + Math.random() * 100 };
    const additionalData = {
      fileName: "data.csv",
      color: "#3b82f6",
    };
    addNode("inputFileCsv", position, additionalData);
  }, [addNode]);

  // ========================================================================================
  // 戻り値
  // ========================================================================================

  return {
    // 状態
    nodes,
    edges,
    nodeCounter,
    nodeCount: nodes.length,
    edgeCount: edges.length,

    // React Flow ハンドラー
    onNodesChange,
    onEdgesChange,
    onConnect,

    // ノード追加関数
    onAddTextNode,
    onAddSimpleNode,
    onAddCsvNode,

    // フロー操作
    onReset: resetFlow,
    onClearAll: clearAll,

    // ユーティリティ
    screenToFlowPosition,
    getNodeSize,
    addNode,
    setNodes,
    setEdges,
  };
};
