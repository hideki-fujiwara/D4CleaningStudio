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
import { useCallback, useState, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import ConsoleMsg from "../../../../utils/ConsoleMsg";
import { initialNodes, initialEdges } from "../data/initialData";
import { useCopyPaste } from "./useCopyPaste";

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
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  // ノードカウンター（新しいノードのID生成用）
  const [nodeCounter, setNodeCounter] = useState(6);

  // ドラッグ&ドロップ状態
  const [isDragOver, setIsDragOver] = useState(false);

  // React Flowコンテナへの参照
  const reactFlowWrapper = useRef(null);

  // ========================================================================================
  // 履歴管理（Undo/Redo）
  // ========================================================================================

  // 履歴スタック
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const maxHistorySize = 250; // 最大履歴数

  // 履歴操作中フラグ（履歴復元時に新しい履歴を作成しないため）
  const isRestoringHistory = useRef(false);

  // 履歴への状態保存
  const saveToHistory = useCallback(
    (nodes, edges) => {
      // 履歴復元中は新しい履歴を作成しない
      if (isRestoringHistory.current) {
        return;
      }

      const newState = {
        nodes: JSON.parse(JSON.stringify(nodes)), // 選択状態も含めて保存
        edges: JSON.parse(JSON.stringify(edges)),
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // 最新の履歴と比較して変化がない場合は保存しない
        if (prev.length > 0) {
          const lastState = prev[prev.length - 1];

          // ノードとエッジの内容を比較（タイムスタンプを除く）
          const isNodesEqual = JSON.stringify(lastState.nodes) === JSON.stringify(newState.nodes);
          const isEdgesEqual = JSON.stringify(lastState.edges) === JSON.stringify(newState.edges);

          if (isNodesEqual && isEdgesEqual) {
            ConsoleMsg("info", "状態に変化がないため履歴保存をスキップしました");
            return prev; // 変化がない場合は履歴を追加しない
          }
        }

        // 現在のインデックス以降の履歴を削除（新しい操作が行われた場合）
        const newHistory = prev.slice(0, currentHistoryIndex + 1);
        newHistory.push(newState);

        // 履歴サイズ制限
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          setCurrentHistoryIndex((prev) => Math.max(0, prev - 1));
        } else {
          setCurrentHistoryIndex(newHistory.length - 1);
        }

        ConsoleMsg("info", `履歴を保存しました (${newHistory.length}/${maxHistorySize})`);
        return newHistory;
      });
    },
    [currentHistoryIndex, maxHistorySize]
  );

  // ノード変更時の履歴保存用タイマー
  const saveHistoryTimeoutRef = useRef(null);
  // 選択変更のバッチ処理用
  const selectionBatchTimeoutRef = useRef(null);
  // 前回の選択状態を記憶（選択変更の検出用）
  const previousSelectionRef = useRef(new Set());

  // 選択変更ハンドラー（ReactFlowのonSelectionChangeで使用）
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      // 履歴復元中は履歴保存をスキップ
      if (isRestoringHistory.current) {
        return;
      }

      // 現在の選択状態を取得
      const currentSelection = new Set(selectedNodes.map((node) => node.id));
      const previousSelection = previousSelectionRef.current;

      // 選択状態に変更があるかチェック
      const hasSelectionChanged =
        currentSelection.size !== previousSelection.size || [...currentSelection].some((id) => !previousSelection.has(id)) || [...previousSelection].some((id) => !currentSelection.has(id));

      if (hasSelectionChanged) {
        // 選択状態を更新
        previousSelectionRef.current = new Set(currentSelection);

        // 既存のタイマーをクリア（onNodesChangeとの重複を避ける）
        if (selectionBatchTimeoutRef.current) {
          clearTimeout(selectionBatchTimeoutRef.current);
        }

        // 選択変更専用のデバウンス（複数選択をまとめる）
        selectionBatchTimeoutRef.current = setTimeout(() => {
          // 履歴復元中でないことを再確認
          if (isRestoringHistory.current) {
            return;
          }

          // 最新の状態を取得して履歴に保存
          const latestNodes = getNodes();
          const latestEdges = getEdges();
          saveToHistory(latestNodes, latestEdges);
          ConsoleMsg("info", `選択状態を履歴に保存しました (onSelectionChange経由、選択中: ${currentSelection.size}個)`);
        }, 50); // 50ms後に履歴保存（onNodesChangeより短く設定して優先）
      }
    },
    [saveToHistory, getNodes, getEdges]
  );

  // ノード変更時のカスタムハンドラー（履歴保存付き）
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // 履歴復元中は履歴保存をスキップ
      if (isRestoringHistory.current) {
        return;
      }

      // 変更の種類を分析
      const hasPositionChanges = changes.some((change) => change.type === "position");
      const hasSelectChanges = changes.some((change) => change.type === "select");
      const hasOtherChanges = changes.some((change) => change.type !== "position" && change.type !== "select");

      // 位置変更のみの場合は履歴に保存しない（マウス操作を除外）
      if (hasPositionChanges && !hasSelectChanges && !hasOtherChanges) {
        return;
      }

      // 選択変更がある場合（onSelectionChangeのバックアップとして機能）
      if (hasSelectChanges) {
        // 既存のタイマーをクリア
        if (selectionBatchTimeoutRef.current) {
          clearTimeout(selectionBatchTimeoutRef.current);
        }

        // 選択変更専用のデバウンス（複数選択をまとめる）
        selectionBatchTimeoutRef.current = setTimeout(() => {
          // 履歴復元中でないことを再確認
          if (isRestoringHistory.current) {
            return;
          }

          // 最新の状態を取得して履歴に保存
          const latestNodes = getNodes();
          const latestEdges = getEdges();
          saveToHistory(latestNodes, latestEdges);
          ConsoleMsg("info", `選択状態を履歴に保存しました (onNodesChange経由)`);
        }, 100); // 100ms後に履歴保存
      }

      // その他の変更（追加、削除など）の場合
      if (hasOtherChanges) {
        // デバウンス処理（連続する変更を一つの履歴として扱う）
        if (saveHistoryTimeoutRef.current) {
          clearTimeout(saveHistoryTimeoutRef.current);
        }

        saveHistoryTimeoutRef.current = setTimeout(() => {
          // 履歴復元中でないことを再確認
          if (isRestoringHistory.current) {
            return;
          }

          // 最新の状態を取得して履歴に保存
          const latestNodes = getNodes();
          const latestEdges = getEdges();
          saveToHistory(latestNodes, latestEdges);
        }, 100); // 100ms後に履歴保存
      }
    },
    [onNodesChange, saveToHistory, getNodes, getEdges]
  );

  // エッジ変更時のカスタムハンドラー（履歴保存付き）
  const handleEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);

      // 履歴復元中は履歴保存をスキップ
      if (isRestoringHistory.current) {
        return;
      }

      // エッジの削除など重要な変更は即座に履歴保存
      const hasImportantChange = changes.some((change) => change.type === "remove" || change.type === "add");

      if (hasImportantChange) {
        setTimeout(() => {
          // 履歴復元中でないことを再確認
          if (isRestoringHistory.current) {
            return;
          }
          saveToHistory(nodes, edges);
        }, 100);
      }
    },
    [onEdgesChange, nodes, edges, saveToHistory]
  );

  // ノードドラッグ開始時の位置記録
  const dragStartPositions = useRef({});

  // ノードドラッグ開始時のハンドラー
  const handleNodeDragStart = useCallback((event, node) => {
    // ドラッグ開始時の位置を記録
    dragStartPositions.current[node.id] = {
      x: node.position.x,
      y: node.position.y,
    };
  }, []);

  // ノードドラッグ完了時のハンドラー（位置変更を履歴に保存）
  const handleNodeDragStop = useCallback(
    (event, node) => {
      // 履歴復元中は履歴保存をスキップ
      if (isRestoringHistory.current) {
        return;
      }

      // ドラッグ開始時の位置と比較
      const startPos = dragStartPositions.current[node.id];
      if (startPos) {
        const moved = Math.abs(startPos.x - node.position.x) > 1 || Math.abs(startPos.y - node.position.y) > 1; // 1px以上移動した場合

        if (moved) {
          // 実際に移動した場合のみ履歴保存
          setTimeout(() => {
            if (isRestoringHistory.current) {
              return;
            }
            saveToHistory(nodes, edges);
            ConsoleMsg("info", "ノード移動を履歴に保存しました");
          }, 100);
        } else {
          ConsoleMsg("info", "ノードが移動していないため履歴保存をスキップしました");
        }

        // 記録をクリア
        delete dragStartPositions.current[node.id];
      }
    },
    [nodes, edges, saveToHistory]
  );

  // 初期状態を履歴に保存
  useEffect(() => {
    if (history.length === 0) {
      saveToHistory(getInitialNodes(), getInitialEdges());
    }
  }, [saveToHistory, history.length]);

  // 取り消し（Undo）
  const undo = useCallback(() => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;
      const prevState = history[prevIndex];

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setCurrentHistoryIndex(prevIndex);

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);

      ConsoleMsg("info", `操作を取り消しました (${prevIndex + 1}/${history.length})`);
    } else {
      ConsoleMsg("warning", "これ以上取り消しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // やり直し（Redo）
  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const nextState = history[nextIndex];

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(nextIndex);

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);

      ConsoleMsg("info", `操作をやり直しました (${nextIndex + 1}/${history.length})`);
    } else {
      ConsoleMsg("warning", "これ以上やり直しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+Z（取り消し）
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Ctrl+R（やり直し）
      else if (event.ctrlKey && event.key === "r") {
        event.preventDefault();
        redo();
      }
      // Ctrl+Shift+Z（やり直し - 代替）
      else if (event.ctrlKey && event.shiftKey && event.key === "Z") {
        event.preventDefault();
        redo();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ========================================================================================
  // コピー・ペースト機能
  // ========================================================================================

  // コピー・ペースト機能を使用（履歴保存機能付き）
  const copyPasteHook = useCopyPaste(saveToHistory, setNodes, nodes, edges);

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
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);

      // 履歴に保存
      saveToHistory(nodes, newEdges);

      // ログ出力
      ConsoleMsg("info", "新しいエッジを追加しました", newEdge);
    },
    [setEdges, edges, nodes, saveToHistory]
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
        selected: true, // 新しく作成されたノードを選択状態にする
        data: {
          label: `ノード ${nodeCounter}`,
          ...additionalData,
        },
      };

      // 他のノードの選択を解除して、新しいノードのみを選択状態にする
      const deselectedNodes = nodes.map((node) => ({
        ...node,
        selected: false,
      }));

      const newNodes = [...deselectedNodes, newNode];
      setNodes(newNodes);
      setNodeCounter((counter) => counter + 1);

      // 履歴に保存
      saveToHistory(newNodes, edges);

      ConsoleMsg("info", `新しい${nodeType}ノードを追加しました`, newNode);

      return newNode;
    },
    [nodeCounter, getNodeSize, setNodes, nodes, edges, saveToHistory]
  );

  /**
   * フローをリセット
   */
  const resetFlow = useCallback(() => {
    const initialNodesData = getInitialNodes();
    const initialEdgesData = getInitialEdges();

    setNodes(initialNodesData);
    setEdges(initialEdgesData);
    setNodeCounter(6);

    // 履歴に保存
    saveToHistory(initialNodesData, initialEdgesData);

    ConsoleMsg("info", "フローをリセットしました");
  }, [setNodes, setEdges, saveToHistory]);

  /**
   * 全ノードとエッジをクリア
   */
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);

    // 履歴に保存
    saveToHistory([], []);

    ConsoleMsg("warning", "全てのノードとエッジをクリアしました");
  }, [setNodes, setEdges, saveToHistory]);

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
  // クリーンアップ処理
  // ========================================================================================

  // コンポーネントのアンマウント時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (saveHistoryTimeoutRef.current) {
        clearTimeout(saveHistoryTimeoutRef.current);
      }
      if (selectionBatchTimeoutRef.current) {
        clearTimeout(selectionBatchTimeoutRef.current);
      }
    };
  }, []);

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

    // React Flow ハンドラー（履歴管理付き）
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    onConnect,
    onNodeDragStart: handleNodeDragStart,
    onNodeDragStop: handleNodeDragStop,
    onSelectionChange: handleSelectionChange,

    // ノード追加関数
    onAddTextNode,
    onAddSimpleNode,
    onAddCsvNode,

    // フロー操作
    onReset: resetFlow,
    onClearAll: clearAll,

    // 履歴管理
    undo,
    redo,
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length - 1,
    historyLength: history.length,
    currentHistoryIndex,

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
