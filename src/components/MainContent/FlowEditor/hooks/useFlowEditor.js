/**
 * ================================================================
 * FlowEditor カスタムフック
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
 * - Escape: Clear Selection（選択解除）
 *
 * @author D4CleaningStudio
 * @version 2.0.0 (Refactored)
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useNodesState, useEdgesState, addEdge, useReactFlow } from "@xyflow/react";
import ConsoleMsg from "../../../../utils/ConsoleMsg";
import DebugConfig from "../../../../utils/DebugConfig";
import { initialNodes, initialEdges } from "../data/d4flow_sample";
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
      return loadedData.nodes;
    }
    const nodes = initialMode === "empty" ? [] : initialNodes;
    return nodes;
  };

  const getInitialEdges = () => {
    if (initialMode === "loaded" && loadedData?.edges) {
      return loadedData.edges;
    }
    const edges = initialMode === "empty" ? [] : initialEdges;
    return edges;
  };

  // ========================================================================================
  // ReactFlow基本設定
  // ========================================================================================

  // ノード・エッジの状態管理
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // ReactFlowのAPI取得
  const { screenToFlowPosition, fitView } = useReactFlow();

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
  // タブ更新用のRef
  // ========================================================================================

  const onUpdateTabRef = useRef(onUpdateTab);
  const tabIdRef = useRef(tabId);

  // 最新の値を保持
  useEffect(() => {
    onUpdateTabRef.current = onUpdateTab;
    tabIdRef.current = tabId;
  });

  // ========================================================================================
  // タブ更新処理（履歴変更時）
  // ========================================================================================

  // 履歴変更時のコールバック（直接通知されたhistoryLengthを使用）
  const handleHistoryChange = useCallback((historyInfo) => {
    if (onUpdateTabRef.current && tabIdRef.current) {
      const hasChanges = historyInfo.historyLength > 0;

      onUpdateTabRef.current(tabIdRef.current, {
        hasUnsavedChanges: hasChanges,
      });
    }
  }, []);

  // ========================================================================================
  // 履歴管理フック
  // ========================================================================================

  const historyHook = useHistory({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    onHistoryChange: (historyInfo) => {
      // 履歴変更をタブ更新に通知
      handleHistoryChange(historyInfo);
    },
    tabId: tabId,
    fileName: fileName,
  });

  // ========================================================================================
  // 新しいタブ作成機能
  // ========================================================================================

  // 新しいタブで新規フロー作成
  const newFlowInNewTab = useCallback(() => {
    if (onCreateNewTab) {
      // 新しいタブを作成
      onCreateNewTab({
        id: `flow-editor-${Date.now()}`,
        title: "NewFile",
        icon: "⧈",
        component: "FlowEditor",
        closable: true,
        hasUnsavedChanges: false,
        props: {
          initialMode: "empty",
        },
      });

      ConsoleMsg("info", "新しいタブで新規フローを作成しました");
    } else {
      ConsoleMsg("warn", "新しいタブ作成機能が利用できません");
    }
  }, [onCreateNewTab]);

  // ========================================================================================
  // ファイル保存フック
  // ========================================================================================

  // 新規フロー作成時の処理（現在のタブをクリアするだけ、使用されない）
  const handleNewFlow = useCallback(() => {
    // ノードとエッジをクリア
    setNodes([]);
    setEdges([]);
    setNodeCounter(1);
  }, [setNodes, setEdges]);

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
    onHistoryReset: historyHook.resetHistory,
    onNewFlow: handleNewFlow,
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
      
      // ファイル読み込み後にfitViewを実行（短い遅延後）
      setTimeout(() => {
        try {
          fitView({ padding: 0.1, duration: 300 });
          ConsoleMsg("info", "ファイル読み込み後にfitViewを実行しました");
        } catch (error) {
          console.warn("fitView実行に失敗しました:", error);
        }
      }, 200);
    },
    onHistoryReset: historyHook.resetHistory,
    onHistoryInitialize: historyHook.initializeHistory,
    onCreateNewTab,
    hasUnsavedChanges: () => {
      // 未保存の変更があるか、履歴がある場合（新規ファイルでも編集している場合）は保存確認を表示
      return fileSaveHook.hasUnsavedChanges || historyHook.historyLength > 1;
    },
    onSaveFile: fileSaveHook.saveFlow,
    getCurrentFileName: () => fileSaveHook.displayFileName || "新規ファイル",
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
      // 履歴をリセット
      historyHook.resetHistory();
      historyHook.setLoadingFlag(true);

      setTimeout(() => {
        historyHook.setLoadingFlag(false);
        // 読み込み完了後、現在の状態を履歴の基準として初期化
        historyHook.initializeHistory(nodes, edges);
        ConsoleMsg("info", "ファイル読み込み完了：履歴を初期化しました");
        
        // ファイル読み込み時のfitViewを実行
        try {
          fitView({ padding: 0.1, duration: 300 });
          ConsoleMsg("info", "初期読み込み後にfitViewを実行しました");
        } catch (error) {
          console.warn("初期読み込み時のfitView実行に失敗しました:", error);
        }
      }, 200);

      setIsInitialized(true);
    }
  }, [initialMode, isInitialized, nodes, edges, fitView]);

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
  const onSelectionChange = useCallback((selection) => {
    // 選択変更では履歴に保存しない（パフォーマンス向上のため）
  }, []);

  // ノードドラッグ開始
  const onNodeDragStart = useCallback((event, node) => {}, []);

  // ノードドラッグ終了
  const onNodeDragStop = useCallback(
    (event, node) => {
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
  const copyPasteHookRef = useRef();

  // Refを更新
  historyHookRef.current = historyHook;
  fileSaveHookRef.current = fileSaveHook;
  fileLoadHookRef.current = fileLoadHook;
  copyPasteHookRef.current = copyPasteHook;

  useEffect(() => {
    const handleKeyDown = (event) => {
      // デバッグ用：キー情報をログ出力
      if (event.ctrlKey && (event.key === "r" || event.key === "R")) {
        // キー情報（デバッグ時のみ有効）
      }

      // Ctrl+Z（取り消し）
      if (event.ctrlKey && (event.key === "z" || event.key === "Z") && !event.shiftKey) {
        event.preventDefault();
        historyHookRef.current.undo();
      }

      // Ctrl+Y または Ctrl+Shift+Z（やり直し）- 一般的な2つのパターンに対応
      if (event.ctrlKey && (event.key === "y" || event.key === "Y" || ((event.key === "z" || event.key === "Z") && event.shiftKey))) {
        event.preventDefault();
        const keyCombo = event.shiftKey ? `Shift+${event.key}` : event.key;
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
        newFlowInNewTab();
      }

      // Ctrl+R（リセット）- ブラウザのリロードを防ぐ
      if (event.ctrlKey && (event.key === "r" || event.key === "R")) {
        event.preventDefault();
        event.stopPropagation(); // イベントの伝播も停止
        ConsoleMsg("info", `Ctrl+${event.key}: フローをリセットします`);
        
        // リセット処理を直接実行
        const resetNodes = initialMode === "empty" ? [] : initialNodes;
        const resetEdges = initialMode === "empty" ? [] : initialEdges;
        setNodes(resetNodes);
        setEdges(resetEdges);
        setNodeCounter(1);
        historyHookRef.current.resetHistory();
      }

      // Escape（選択解除）
      if (event.key === "Escape") {
        event.preventDefault();
        ConsoleMsg("info", "ESC キー: ノード選択を解除します");
        
        // React Flowのノード選択を解除
        if (copyPasteHookRef.current && copyPasteHookRef.current.clearSelection) {
          copyPasteHookRef.current.clearSelection();
        }
      }

      // F5（リロード）処理 - 設定に基づいて制御
      if (event.key === "F5") {
        const isDebugMode = DebugConfig.isDebugMode;
        const allowReload = DebugConfig.allowF5Reload;

        if (!allowReload) {
          event.preventDefault();
          event.stopPropagation();
          ConsoleMsg("info", "F5 リロードを防止（本番モード）");
        } else {
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
    if (onUpdateTabRef.current && tabIdRef.current) {
      const debounceTimer = setTimeout(() => {
        // 履歴の変更を未保存状態として扱う
        const hasHistoryChanges = historyHook.currentHistoryIndex > 0 || historyHook.historyLength > 0;
        const hasUnsavedChanges = fileSaveHook.hasUnsavedChanges || hasHistoryChanges;

        onUpdateTabRef.current(tabIdRef.current, {
          hasUnsavedChanges,
          title: fileSaveHook.fileName,
        });
      }, 100);

      return () => clearTimeout(debounceTimer);
    }
  }, [fileSaveHook.hasUnsavedChanges, fileSaveHook.fileName, historyHook.currentHistoryIndex, historyHook.historyLength]);

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
    newFlow: newFlowInNewTab,
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
    fitView,

    // コピー・ペースト機能
    copyPaste: copyPasteHook,

    // ダイアログ制御
    saveConfirmDialog: fileLoadHook.saveConfirmDialog,
  };
};
