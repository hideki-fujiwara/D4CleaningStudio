/**
 * ================================================================
 * FlowEditor カスタムフック（リファクタリング版）
 * ================================================================
 *
 * FlowEditorの主要機能を提供するカスタムフック
 * 保存機能と履歴管理機能を分離した軽量版
 *
 * キーボードショートカット:
 * - Ctrl+Z: Undo（取り消し）
 * - Ctrl+Y / Ctrl+Shift+Z: Redo（やり直し）
 * - Ctrl+S: Save（保存）
 * - Ctrl+Shift+S: Save As（名前をつけて保存）
 * - Ctrl+O: Open（ファイルを開く）
 * - Ctrl+N: New（新規ファイル）
 * - Ctrl+R: Reset（フローリセット）
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import ConsoleMsg from "../../../../utils/ConsoleMsg";
import DebugConfig from "../../../../utils/DebugConfig";
import { initialNodes, initialEdges } from "../data/initialData";
import { useCopyPaste } from "./useCopyPaste";
import { useFileSave } from "./useFileSave";
import { useFileLoad } from "./useFileLoad";
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
export const useFlowEditor = (
  initialMode = "default",
  loadedData = null,
  filePath = null,
  fileName = "NewFile",
  tabId = null,
  onCreateNewTab = null,
  onUpdateTab = null,
  onRequestTabClose = null
) => {
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
      // 履歴変更をFlowEditorInnerに通知（useFileLoadフック分離後も継続）
      console.log("履歴情報変更:", historyInfo);
    }
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
    nodeCounter,
    initialFilePath: filePath,
    initialFileName: fileName,
    onCreateNewTab,
    onHistoryReset: historyHook.resetHistory
  });

  // ========================================================================================
  // ファイル読み込みフック
  // ========================================================================================

  const fileLoadHook = useFileLoad({
    setNodes,
    setEdges,
    setNodeCounter,
    onFileLoaded: (fileInfo) => {
      // ファイル読み込み完了時の処理
      fileSaveHook.setCurrentFilePath(fileInfo.filePath);
      fileSaveHook.setDisplayFileName(fileInfo.fileName);
      fileSaveHook.setUnsavedChanges(false);
    },
    onHistoryReset: historyHook.resetHistory,
    onHistoryInitialize: historyHook.initializeHistory,
    onCreateNewTab,
    hasUnsavedChanges: () => fileSaveHook.hasUnsavedChanges
  });

  // ========================================================================================
  // 初期化処理
  // ========================================================================================

  // ファイル読み込み完了後に履歴をクリア（一度だけ実行）
  const [isInitialized, setIsInitialized] = useState(false);
  
  // デバッグ情報を確実に出力するuseEffect
  useEffect(() => {
    DebugConfig.logDebugInfo();
  }, []); // 初回のみ実行

  useEffect(() => {
    if (initialMode === "loaded" && !isInitialized) {
      console.log("ファイル読み込みモード - 履歴初期化開始");
      // 履歴をリセット
      historyHook.resetHistory();
      historyHook.setLoadingFlag(true);
      
      setTimeout(() => {
        historyHook.setLoadingFlag(false);
        // 読み込み完了後、現在の状態を履歴の基準として初期化
        historyHook.initializeHistory(nodes, edges);
        ConsoleMsg("info", "ファイル読み込み完了：履歴を初期化しました");
      }, 200);
      
      setIsInitialized(true);
    }
  }, [initialMode, isInitialized, nodes, edges]);

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
        historyHookRef.current.saveToHistory(nodes, newEdge);
      }, 50);
    },
    [edges, nodes]
  );

  // ノード選択変更
  const onSelectionChange = useCallback(
    (selection) => {
      console.log("選択変更:", selection);
      // 選択変更では履歴に保存しない（パフォーマンス向上のため）
    },
    []
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
        historyHookRef.current.saveToHistory(nodes, edges);
      }, 50);
    },
    [nodes, edges]
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
        historyHookRef.current.saveToHistory(newNodes, edges);
      }, 50);

      ConsoleMsg("info", `新しい${nodeType}を追加しました: ${newId}`);
      return newNode;
    },
    [nodes, edges, nodeCounter, getNodeSize]
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
    console.log("onReset が呼び出されました");
    console.trace("onReset の呼び出し元を確認");
    
    const resetNodes = initialMode === "empty" ? [] : initialNodes;
    const resetEdges = initialMode === "empty" ? [] : initialEdges;
    
    setNodes(resetNodes);
    setEdges(resetEdges);
    setNodeCounter(1);
    
    // 履歴をリセット
    historyHookRef.current.resetHistory();
    
    ConsoleMsg("info", "フローを初期状態にリセットしました");
  }, [initialMode]);

  // すべてクリア機能
  const onClearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);
    
    // 履歴をリセット
    historyHookRef.current.resetHistory();
    
    ConsoleMsg("info", "すべてのノードとエッジをクリアしました");
  }, []);

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
        historyHookRef.current.saveToHistory(newNodes, newEdges);
      }, 50);
    },
  });

  // ========================================================================================
  // キーボードショートカット
  // ========================================================================================

  // 最新のフック関数を参照するためのRef
  const historyHookRef = useRef();
  const fileSaveHookRef = useRef();
  const fileLoadHookRef = useRef();
  
  // Refを更新
  historyHookRef.current = historyHook;
  fileSaveHookRef.current = fileSaveHook;
  fileLoadHookRef.current = fileLoadHook;

  useEffect(() => {
    const handleKeyDown = (event) => {
      // デバッグ用：キー情報をログ出力
      if (event.ctrlKey && (event.key === "r" || event.key === "R")) {
        console.log("キー情報:", {
          key: event.key,
          code: event.code,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
          metaKey: event.metaKey
        });
      }

      // Ctrl+Z（取り消し）
      if (event.ctrlKey && (event.key === "z" || event.key === "Z") && !event.shiftKey) {
        event.preventDefault();
        console.log(`Undo実行: Ctrl+${event.key}`);
        historyHookRef.current.undo();
      }

      // Ctrl+Y または Ctrl+Shift+Z（やり直し）- 一般的な2つのパターンに対応
      if (event.ctrlKey && ((event.key === "y" || event.key === "Y") || ((event.key === "z" || event.key === "Z") && event.shiftKey))) {
        event.preventDefault();
        const keyCombo = event.shiftKey ? `Shift+${event.key}` : event.key;
        console.log(`Redo実行: Ctrl+${keyCombo}`);
        historyHookRef.current.redo();
      }

      // Ctrl+S（保存）
      if (event.ctrlKey && event.key === "s" && !event.shiftKey) {
        event.preventDefault();
        fileSaveHookRef.current.saveFlow();
      }

      // Ctrl+Shift+S（名前をつけて保存）
      if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        fileSaveHookRef.current.saveAsFlow();
      }

      // Ctrl+O（ファイルを開く）
      if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        fileLoadHookRef.current.openFlow();
      }

      // Ctrl+N（新規ファイル）
      if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        fileSaveHookRef.current.newFlow();
      }

      // Ctrl+R（リセット）- ブラウザのリロードを防ぐ
      if (event.ctrlKey && (event.key === "r" || event.key === "R")) {
        event.preventDefault();
        event.stopPropagation(); // イベントの伝播も停止
        console.log(`FlowEditor: Ctrl+${event.key} キーボードショートカットでリセット実行`);
        ConsoleMsg("info", `Ctrl+${event.key}: フローをリセットします`);
        onReset();
      }

      // F5（リロード）処理 - 設定に基づいて制御
      if (event.key === "F5") {
        const isDebugMode = DebugConfig.isDebugMode;
        const allowReload = DebugConfig.allowF5Reload;
        
        console.log(`🔄 F5キー押下 - デバッグモード: ${isDebugMode}, リロード許可: ${allowReload}`);
        
        if (!allowReload) {
          event.preventDefault();
          event.stopPropagation();
          console.log("❌ F5 リロードを防止（本番モード）");
          ConsoleMsg("info", "F5 リロードを防止（本番モード）");
        } else {
          console.log("✅ F5 リロードを許可（デバッグモード）");
          ConsoleMsg("info", "F5 リロードを許可（デバッグモード）");
        }
      }
    };

    // キャプチャフェーズでイベントを捕捉
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []); // 空の依存配列で一度だけ登録

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
    initializeHistory: historyHook.initializeHistory,

    // ファイル保存
    saveFlow: fileSaveHook.saveFlow,
    saveAsFlow: fileSaveHook.saveAsFlow,
    newFlow: fileSaveHook.newFlow,
    currentFilePath: fileSaveHook.currentFilePath,
    fileName: fileSaveHook.fileName,
    hasUnsavedChanges: fileSaveHook.hasUnsavedChanges,
    requestTabClose: fileSaveHook.requestTabClose,

    // ファイル読み込み
    openFlow: fileLoadHook.openFlow,
    openFlowInNewTab: fileLoadHook.openFlowInNewTab,
    loadFlowData: fileLoadHook.loadFlowData,
    isLoadingFile: fileLoadHook.isLoadingFile,

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
