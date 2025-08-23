/**
 * ================================================================
 * FlowEditor カスタムフック（リファクタリング版）
 * ================================================================
 *
 * FlowEditorの主要機能を提供するカスタムフック
 * 保存機能と履歴管理機能を分離した軽量版
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import ConsoleMsg from "../../../../utils/ConsoleMsg";
import { initialNodes, initialEdges } from "../data/initialData";
import { useCopyPaste } from "./useCopyPaste";
import { useFileSave } from "./useFileSave";
import { useHistory } from "./useHistory";

/**
 * FlowEditorのメインロジックを管理するフック（リファクタリング版）
 * @param {string} initialMode - 初期モード（"default" | "empty" | "loaded"）
 * @param {Object} loadedData - ロードされたフローデータ（initialMode === "loaded"の場合）
 * @param {string} filePath - ファイルパス（既存ファイルの場合）
 * @param {string} fileName - ファイル名
 * @param {string} tabId - タブID
 * @param {Function} onCreateNewTab - 新しいタブを作成する関数
 * @param {Function} onUpdateTab - タブ更新関数
 * @param {Function} onRequestTabClose - タブクローズ確認コールバック
 */
export const useFlowEditor = (initialMode = "default", loadedData = null, filePath = null, fileName = "NewFile", tabId = null, onCreateNewTab = null, onUpdateTab = null, onRequestTabClose = null) => {
  // ========================================================================================
  // 初期データ設定
  // ========================================================================================

  const getInitialNodes = () => {
    if (initialMode === "loaded" && loadedData?.nodes) {
      console.log("getInitialNodes (loaded):", loadedData.nodes.length, "nodes");
      return loadedData.nodes;
    }
    const nodes = initialMode === "empty" ? [] : initialNodes;
    console.log("getInitialNodes:", nodes.length, "nodes");
    return nodes;
  };

  const getInitialEdges = () => {
    if (initialMode === "loaded" && loadedData?.edges) {
      console.log("getInitialEdges (loaded):", loadedData.edges.length, "edges");
      return loadedData.edges;
    }
    const edges = initialMode === "empty" ? [] : initialEdges;
    console.log("getInitialEdges:", edges.length, "edges");
    return edges;
  };

  // ========================================================================================
  // ReactFlow基本設定
  // ========================================================================================

  // ノード・エッジの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // ReactFlowのAPI取得
  const { screenToFlowPosition } = useReactFlow();

  // ノードカウンター（新しいノードのID生成用）
  const getInitialNodeCounter = () => {
    if (initialMode === "loaded" && loadedData?.nodeCounter) {
      return loadedData.nodeCounter;
    }
    if (initialMode === "loaded" && loadedData?.nodes) {
      // ノードIDから最大値を取得
      const maxId = Math.max(
        0,
        ...loadedData.nodes.map((node) => {
          const match = node.id.match(/\d+$/);
          return match ? parseInt(match[0], 10) : 0;
        })
      );
      return maxId + 1;
    }
    return 1;
  };

  const [nodeCounter, setNodeCounter] = useState(getInitialNodeCounter());

  // ========================================================================================
  // 履歴管理フック
  // ========================================================================================

  const historyHook = useHistory({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    onHistoryChange: (historyInfo) => {
      // 履歴変更をFlowEditorInnerに通知
      console.log("履歴情報変更:", historyInfo);
    },
  });

  // ========================================================================================
  // ファイル保存フック
  // ========================================================================================

  const fileSaveHook = useFileSave({
    exportFlowData: () => ({
      nodes,
      edges,
      nodeCounter,
      version: "1.0.0",
      createdAt: new Date().toISOString(),
    }),
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    setNodeCounter,
    nodeCounter,
    initialFilePath: filePath,
    initialFileName: fileName,
    onCreateNewTab,
    onHistoryReset: historyHook.resetHistory,
  });

  // ========================================================================================
  // 初期化処理
  // ========================================================================================

  // ファイル読み込み完了後に履歴をクリア
  useEffect(() => {
    if (initialMode === "loaded") {
      console.log("ファイル読み込みモード - 履歴リセット開始");
      // 履歴をリセット
      historyHook.resetHistory();
      historyHook.setLoadingFlag(true);

      setTimeout(() => {
        historyHook.setLoadingFlag(false);
        ConsoleMsg("info", "ファイル読み込み完了：履歴をリセットしました");
      }, 100);
    }
  }, [initialMode, historyHook]);

  // ========================================================================================
  // ノード操作
  // ========================================================================================

  // ノード接続
  const onConnect = useCallback(
    (params) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);

      // 履歴に保存
      setTimeout(() => {
        historyHook.saveToHistory(nodes, newEdge);
      }, 50);
    },
    [edges, nodes, historyHook]
  );

  // ノード選択変更
  const onSelectionChange = useCallback(
    (selection) => {
      console.log("選択変更:", selection);

      // 履歴に保存（選択変更のみの場合はデバウンス）
      setTimeout(() => {
        historyHook.saveToHistory(selection.nodes || nodes, edges);
      }, 300);
    },
    [nodes, edges, historyHook]
  );

  // ノードドラッグ開始
  const onNodeDragStart = useCallback((event, node) => {
    console.log("ノードドラッグ開始:", node.id);
  }, []);

  // ノードドラッグ終了
  const onNodeDragStop = useCallback(
    (event, node) => {
      console.log("ノードドラッグ終了:", node.id);

      // ドラッグ終了時に履歴に保存
      setTimeout(() => {
        historyHook.saveToHistory(nodes, edges);
      }, 50);
    },
    [nodes, edges, historyHook]
  );

  // ========================================================================================
  // ノード追加機能
  // ========================================================================================

  // ノードサイズを取得する関数
  const getNodeSize = useCallback((nodeType) => {
    const sizes = {
      textNode: { width: 200, height: 100 },
      simpleNode: { width: 150, height: 80 },
      csvNode: { width: 250, height: 120 },
      default: { width: 150, height: 80 },
    };
    return sizes[nodeType] || sizes.default;
  }, []);

  // 新しいノードを追加する関数
  const addNode = useCallback(
    (nodeType, position = null) => {
      const newId = `${nodeType}_${nodeCounter}`;
      const nodeSize = getNodeSize(nodeType);

      // ポジションが指定されていない場合は中央に配置
      const nodePosition = position || {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      const newNode = {
        id: newId,
        type: nodeType,
        position: nodePosition,
        data: {
          label: `${nodeType} ${nodeCounter}`,
          content: nodeType === "textNode" ? "新しいテキスト" : "",
        },
        style: {
          width: nodeSize.width,
          height: nodeSize.height,
        },
      };

      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
      setNodeCounter((prev) => prev + 1);

      // 履歴に保存
      setTimeout(() => {
        historyHook.saveToHistory(newNodes, edges);
      }, 50);

      ConsoleMsg("info", `新しい${nodeType}を追加しました: ${newId}`);
      return newNode;
    },
    [nodes, edges, nodeCounter, getNodeSize, historyHook]
  );

  // 各ノードタイプの追加関数
  const onAddTextNode = useCallback(() => addNode("textNode"), [addNode]);
  const onAddSimpleNode = useCallback(() => addNode("simpleNode"), [addNode]);
  const onAddCsvNode = useCallback(() => addNode("csvNode"), [addNode]);

  // ========================================================================================
  // フロー操作
  // ========================================================================================

  // リセット機能
  const onReset = useCallback(() => {
    const resetNodes = initialMode === "empty" ? [] : initialNodes;
    const resetEdges = initialMode === "empty" ? [] : initialEdges;

    setNodes(resetNodes);
    setEdges(resetEdges);
    setNodeCounter(1);

    // 履歴をリセット
    historyHook.resetHistory();

    ConsoleMsg("info", "フローを初期状態にリセットしました");
  }, [initialMode, historyHook]);

  // すべてクリア機能
  const onClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);

    // 履歴をリセット
    historyHook.resetHistory();

    ConsoleMsg("info", "すべてのノードとエッジをクリアしました");
  }, [historyHook]);

  // ========================================================================================
  // コピー・ペースト機能
  // ========================================================================================

  const copyPasteHook = useCopyPaste({
    nodes,
    edges,
    setNodes,
    setEdges,
    nodeCounter,
    setNodeCounter,
    onHistoryChange: (newNodes, newEdges) => {
      // コピー・ペースト操作後に履歴に保存
      setTimeout(() => {
        historyHook.saveToHistory(newNodes, newEdges);
      }, 50);
    },
  });

  // ========================================================================================
  // キーボードショートカット
  // ========================================================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Z（取り消し）
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        historyHook.undo();
      }

      // Ctrl+Y または Ctrl+Shift+Z（やり直し）
      if (event.ctrlKey && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
        event.preventDefault();
        historyHook.redo();
      }

      // Ctrl+S（保存）
      if (event.ctrlKey && event.key === "s" && !event.shiftKey) {
        event.preventDefault();
        fileSaveHook.saveFlow();
      }

      // Ctrl+Shift+S（名前をつけて保存）
      if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        fileSaveHook.saveAsFlow();
      }

      // Ctrl+O（ファイルを開く）
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        fileSaveHook.openFlow();
      }

      // Ctrl+N（新規ファイル）
      if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        fileSaveHook.newFlow();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [historyHook, fileSaveHook]);

  // ========================================================================================
  // タブ更新通知
  // ========================================================================================

  useEffect(() => {
    if (onUpdateTab && tabId) {
      const debounceTimer = setTimeout(() => {
        onUpdateTab(tabId, {
          hasUnsavedChanges: fileSaveHook.hasUnsavedChanges,
          title: fileSaveHook.fileName,
        });
      }, 500);

      return () => clearTimeout(debounceTimer);
    }
  }, [fileSaveHook.hasUnsavedChanges, fileSaveHook.fileName, onUpdateTab, tabId]);

  // ========================================================================================
  // 返り値
  // ========================================================================================

  return {
    // ReactFlow基本
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    onSelectionChange,

    // ノード操作
    nodeCount: nodes.length,
    edgeCount: edges.length,
    onAddTextNode,
    onAddSimpleNode,
    onAddCsvNode,
    onReset,
    onClearAll,

    // 履歴機能
    undo: historyHook.undo,
    redo: historyHook.redo,
    canUndo: historyHook.canUndo,
    canRedo: historyHook.canRedo,
    historyLength: historyHook.historyLength,
    currentHistoryIndex: historyHook.currentHistoryIndex,

    // ファイル保存
    saveFlow: fileSaveHook.saveFlow,
    saveAsFlow: fileSaveHook.saveAsFlow,
    openFlow: fileSaveHook.openFlow,
    newFlow: fileSaveHook.newFlow,
    currentFilePath: fileSaveHook.currentFilePath,
    fileName: fileSaveHook.fileName,
    hasUnsavedChanges: fileSaveHook.hasUnsavedChanges,
    requestTabClose: fileSaveHook.requestTabClose,

    // ユーティリティ
    screenToFlowPosition,
    getNodeSize,
    addNode,
    setNodes,
    setEdges,

    // コピー・ペースト機能
    copyPaste: copyPasteHook,
  };
};
