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
import { useFileSave } from "./useFileSave";
import { useHistory } from "./useHistory";

/**
 * FlowEditorのメインロジックを管理するフック
 * @param {string} initialMode - 初期モード（"default" | "empty" | "loaded"）
 * @param {Object} loadedData - ロードされたフローデータ（initialMode === "loaded"の場合）
 * @param {string} filePath - ファイルパス（既存ファイルの場合）
 * @param {string} fileName - ファイル名
 * @param {Function} onCreateNewTab - 新しいタブを作成する関数
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
  // 状態管理
  // ========================================================================================

  // React Flow状態管理（ノードとエッジ）
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // React Flowのユーティリティ関数（座標変換用）
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  // ドラッグ&ドロップ状態
  const [isDragOver, setIsDragOver] = useState(false);

  // React Flowコンテナへの参照
  const reactFlowWrapper = useRef(null);

  // ========================================================================================
  // ファイル保存管理
  // ========================================================================================

  // 現在のファイルパス（null = 新規ファイル）
  const [currentFilePath, setCurrentFilePath] = useState(filePath);

  // 保存状態（操作ログベース）
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ファイル名（表示用）
  const [displayFileName, setDisplayFileName] = useState(fileName);

  // 最後に保存された状態（変更検知用）
  const [lastSavedState, setLastSavedState] = useState(null);

  // 保存確認ダイアログ用の状態
  const pendingCloseCallback = useRef(null);

  // ノードカウンター（新しいノードのID生成用）
  // ロードされたデータがある場合は、最大IDを取得
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
          return match ? parseInt(match[0]) : 0;
        })
      );
      return maxId + 1;
    }
    return 6; // デフォルト値
  };

  const [nodeCounter, setNodeCounter] = useState(getInitialNodeCounter());

  // ファイル読み込み完了後に履歴をクリア
  useEffect(() => {
    if (initialMode === "loaded") {
      console.log("ファイル読み込みモード - 履歴リセット開始");
      // ファイル読み込み中フラグを設定
      isLoading.current = true;
      
      // ファイル読み込み時は履歴をクリアして新しいスタートにする
      setTimeout(() => {
        console.log("履歴リセット実行 - ファイル読み込み時");
        setHistory([]);
        setCurrentHistoryIndex(0);
        setHasUnsavedChanges(false);
        console.log("履歴リセット完了: 履歴=[], インデックス=0");
        
        // 少し待ってから読み込み中フラグを解除
        setTimeout(() => {
          isLoading.current = false;
          ConsoleMsg("info", "ファイル読み込み完了：履歴をリセットしました");
        }, 100);
      }, 0);
    }
  }, [initialMode]);

  // ========================================================================================
  // 新しいフック統合
  // ========================================================================================

  // 履歴管理フック
  const historyHook = useHistory({
    getNodes: () => nodes,
    getEdges: () => edges,
    setNodes,
    setEdges,
    onHistoryChange: (historyInfo) => {
      // 履歴変更をFlowEditorInnerに通知
      console.log("履歴情報変更:", historyInfo);
    }
  });

  // ファイル保存フック
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
    onHistoryReset: historyHook.resetHistory
  });

  // ========================================================================================
  // 履歴管理（Undo/Redo）- 旧コード（削除予定）
  // ========================================================================================

  // 履歴スタック
  const [history, setHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const maxHistorySize = 250; // 最大履歴数

  // 履歴操作中フラグ（履歴復元時に新しい履歴を作成しないため）
  const isRestoringHistory = useRef(false);

  // 保存処理中フラグ（保存時に履歴を作成しないため）
  const isSaving = useRef(false);

  // ファイル読み込み中フラグ（読み込み時に履歴を作成しないため）
  const isLoading = useRef(false);

  // 履歴への状態保存
  const saveToHistory = useCallback(
    (nodes, edges) => {
      // 履歴復元中、保存中、またはファイル読み込み中は新しい履歴を作成しない
      if (isRestoringHistory.current || isSaving.current || isLoading.current) {
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
        const newHistory = prev.slice(0, currentHistoryIndex);
        newHistory.push(newState);

        // 履歴サイズ制限
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          setCurrentHistoryIndex((prev) => Math.max(1, prev - 1));
        } else {
          setCurrentHistoryIndex(newHistory.length);
        }

        ConsoleMsg("info", `履歴を保存しました (${newHistory.length}/${maxHistorySize})`);
        
        // 操作が記録されたので未保存状態に設定（履歴が1つだけの場合は未保存状態にしない）
        if (newHistory.length > 1) {
          setHasUnsavedChanges(true);
        }
        
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
      // 履歴復元中またはファイル読み込み中は履歴保存をスキップ
      if (isRestoringHistory.current || isLoading.current) {
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
          // 履歴復元中またはファイル読み込み中でないことを再確認
          if (isRestoringHistory.current || isLoading.current) {
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
          // 履歴復元中またはファイル読み込み中でないことを再確認
          if (isRestoringHistory.current || isLoading.current) {
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

      // 履歴復元中またはファイル読み込み中は履歴保存をスキップ
      if (isRestoringHistory.current || isLoading.current) {
        return;
      }

      // エッジの削除など重要な変更は即座に履歴保存
      const hasImportantChange = changes.some((change) => change.type === "remove" || change.type === "add");

      if (hasImportantChange) {
        setTimeout(() => {
          // 履歴復元中またはファイル読み込み中でないことを再確認
          if (isRestoringHistory.current || isLoading.current) {
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
      const prevState = prevIndex > 0 ? history[prevIndex - 1] : null; // 1ベースなので-1してアクセス

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      if (prevIndex === 0) {
        // 初期状態に戻る
        setNodes([]);
        setEdges([]);
      } else {
        // 前の履歴状態に戻る
        setNodes(prevState.nodes);
        setEdges(prevState.edges);
      }
      
      setCurrentHistoryIndex(prevIndex);

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);

      ConsoleMsg("info", `操作を取り消しました (${prevIndex}/${history.length})`);
    } else {
      ConsoleMsg("warning", "これ以上取り消しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges]);

  // やり直し（Redo）
  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length) {
      const nextIndex = currentHistoryIndex + 1;
      const nextState = history[nextIndex - 1]; // 1ベースなので-1してアクセス

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(nextIndex);

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);

      ConsoleMsg("info", `操作をやり直しました (${nextIndex}/${history.length})`);
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
  // ファイル保存機能
  // ========================================================================================

  /**
   * フローデータを保存用のJSONに変換
   */
  const exportFlowData = useCallback(() => {
    const currentNodes = getNodes();
    const currentEdges = getEdges();

    return {
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      nodes: currentNodes,
      edges: currentEdges,
      nodeCounter: nodeCounter,
      metadata: {
        fileName: fileName,
        totalNodes: currentNodes.length,
        totalEdges: currentEdges.length,
      },
    };
  }, [getNodes, getEdges, nodeCounter, fileName]);

  /**
   * 操作ログベースで未保存の変更があるかチェック
   */
  const hasChangesFromLastSave = useCallback(() => {
    return hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  // hasUnsavedChangesが変化した時にタブの状態を更新
  const prevHasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    // 前回の値と比較して実際に変化した場合のみ更新
    if (onUpdateTab && tabId && prevHasUnsavedChangesRef.current !== hasUnsavedChanges) {
      console.log(`タブの未保存状態を更新: ${tabId} -> ${hasUnsavedChanges}`);
      onUpdateTab(tabId, { hasUnsavedChanges });
      prevHasUnsavedChangesRef.current = hasUnsavedChanges;
    }
  }, [hasUnsavedChanges, onUpdateTab, tabId]);

  /**
   * デフォルトの保存先パスを取得
   */
  const getDefaultSavePath = useCallback(async (fileName) => {
    try {
      // プロジェクトのsrcディレクトリパスを構築
      const defaultFileName = fileName.replace("未保存の", "新しい");
      return `src/${defaultFileName}.d4flow`;
    } catch (error) {
      // フォールバック：相対パスでsrcディレクトリを指定
      const defaultFileName = fileName.replace("未保存の", "新しい");
      return `src/${defaultFileName}.d4flow`;
    }
  }, []);

  /**
   * タブクローズ確認ダイアログ表示
   */
  const requestTabClose = useCallback(async () => {
    if (!hasChangesFromLastSave()) {
      // 変更がない場合はそのままクローズ
      if (pendingCloseCallback.current) {
        pendingCloseCallback.current(true);
        pendingCloseCallback.current = null;
      }
      return true;
    }

    // 変更がある場合は確認ダイアログを表示
    const result = confirm(
      `"${displayFileName}" に未保存の変更があります。\n\n` +
      `保存しますか？\n\n` +
      `「OK」: 保存してタブを閉じる\n` +
      `「キャンセル」: 保存せずにタブを閉じる\n` +
      `「×」: タブを閉じない`
    );

    if (result === true) {
      // 保存してからクローズ
      try {
        // 保存処理中フラグを設定
        isSaving.current = true;

        const flowData = exportFlowData();
        const jsonString = JSON.stringify(flowData, null, 2);

        if (currentFilePath) {
          // 既存ファイルに上書き保存
          await writeTextFile(currentFilePath, jsonString);
          ConsoleMsg("success", `ファイルを保存しました: ${currentFilePath}`);
        } else {
          // 新規ファイルの場合は「名前をつけて保存」
          const defaultPath = await getDefaultSavePath(displayFileName);
          const filePath = await save({
            filters: [
              {
                name: "D4Flow",
                extensions: ["d4flow"],
              },
              {
                name: "JSON",
                extensions: ["json"],
              },
            ],
            defaultPath: defaultPath,
          });

          if (filePath) {
            await writeTextFile(filePath, jsonString);
            setCurrentFilePath(filePath);
            const fileName = filePath.split("\\").pop().split("/").pop();
            setDisplayFileName(fileName.replace(".d4flow", ""));
            ConsoleMsg("success", `ファイルを保存しました: ${filePath}`);
          } else {
            ConsoleMsg("info", "保存がキャンセルされました");
            return false;
          }
        }

        setHasUnsavedChanges(false);

        // 最後の保存状態を更新
        setLastSavedState({
          nodes: JSON.stringify(getNodes()),
          edges: JSON.stringify(getEdges()),
          nodeCounter: nodeCounter
        });

        // 履歴をクリア
        setHistory([]);
        setCurrentHistoryIndex(0);
        ConsoleMsg("info", "履歴をクリアしました");

        // 保存処理中フラグを解除
        isSaving.current = false;

        if (pendingCloseCallback.current) {
          pendingCloseCallback.current(true);
          pendingCloseCallback.current = null;
        }
        return true;
      } catch (error) {
        ConsoleMsg("error", "保存に失敗しました");
        isSaving.current = false;
        return false;
      }
    } else if (result === false) {
      // 保存せずにクローズ
      if (pendingCloseCallback.current) {
        pendingCloseCallback.current(true);
        pendingCloseCallback.current = null;
      }
      return true;
    } else {
      // キャンセル
      if (pendingCloseCallback.current) {
        pendingCloseCallback.current(false);
        pendingCloseCallback.current = null;
      }
      return false;
    }
  }, [hasChangesFromLastSave, displayFileName, getDefaultSavePath, exportFlowData, currentFilePath, getNodes, getEdges, nodeCounter]);

  /**
   * 保存機能（Ctrl+S）
   * 既存ファイルがある場合は上書き、新規の場合は名前をつけて保存
   */
  const saveFlow = useCallback(async () => {
    try {
      // 保存処理中フラグを設定
      isSaving.current = true;

      const flowData = exportFlowData();
      const jsonString = JSON.stringify(flowData, null, 2);

      if (currentFilePath) {
        // 既存ファイルに上書き保存
        await writeTextFile(currentFilePath, jsonString);
        setHasUnsavedChanges(false);

        // 保存成功時に履歴をリセット
        setHistory([]);
        setCurrentHistoryIndex(0);

        // 最後の保存状態を更新
        setLastSavedState({
          nodes: JSON.stringify(getNodes()),
          edges: JSON.stringify(getEdges()),
          nodeCounter: nodeCounter
        });

        ConsoleMsg("success", `ファイルを保存しました: ${fileName}`);
      } else {
        // 新規ファイルなので名前をつけて保存のダイアログを表示
        const defaultPath = await getDefaultSavePath(fileName);
        const filePath = await save({
          filters: [
            {
              name: "D4 Flow Files",
              extensions: ["d4flow"],
            },
            {
              name: "JSON Files",
              extensions: ["json"],
            },
          ],
          defaultPath: defaultPath,
        });

        if (filePath) {
          // ファイルに保存
          await writeTextFile(filePath, jsonString);

          // ファイル名を抽出（パスから拡張子を除いたファイル名）
          const fileNameOnly = filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");

          // 状態を更新
          setCurrentFilePath(filePath);
          setDisplayFileName(fileNameOnly);
          setHasUnsavedChanges(false);

          // タブ名も更新
          if (onUpdateTab && tabId) {
            onUpdateTab(tabId, { 
              title: fileNameOnly,
              hasUnsavedChanges: false 
            });
          }

          // 保存成功時に履歴をリセット
          setHistory([]);
          setCurrentHistoryIndex(0);

          // 最後の保存状態を更新
          setLastSavedState({
            nodes: JSON.stringify(getNodes()),
            edges: JSON.stringify(getEdges()),
            nodeCounter: nodeCounter
          });

          ConsoleMsg("success", `ファイルを保存しました: ${fileNameOnly}`);
        }
      }
    } catch (error) {
      ConsoleMsg("error", `保存中にエラーが発生しました: ${error.message}`);
      console.error("保存エラー:", error);
    } finally {
      // 保存処理完了後にフラグをリセット
      isSaving.current = false;
    }
  }, [currentFilePath, fileName, exportFlowData, getDefaultSavePath, setHistory, setCurrentHistoryIndex]);

  /**
   * 名前をつけて保存機能（Ctrl+Shift+S）
   */
  const saveAsFlow = useCallback(async () => {
    try {
      // 保存処理中フラグを設定
      isSaving.current = true;

      const flowData = exportFlowData();
      const jsonString = JSON.stringify(flowData, null, 2);

      // Tauriのファイル保存ダイアログを表示
      const defaultPath = await getDefaultSavePath(fileName);
      const filePath = await save({
        filters: [
          {
            name: "D4 Flow Files",
            extensions: ["d4flow"],
          },
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        defaultPath: defaultPath,
      });

      if (filePath) {
        // ファイルに保存
        await writeTextFile(filePath, jsonString);

        // ファイル名を抽出（パスから拡張子を除いたファイル名）
        const fileNameOnly = filePath
          .split(/[\\/]/)
          .pop()
          .replace(/\.[^/.]+$/, "");

        // 状態を更新
        setCurrentFilePath(filePath);
        setDisplayFileName(fileNameOnly);
        setHasUnsavedChanges(false);

        // 保存成功時に履歴をリセット
        setHistory([]);
        setCurrentHistoryIndex(0);

        // 最後の保存状態を更新
        setLastSavedState({
          nodes: JSON.stringify(getNodes()),
          edges: JSON.stringify(getEdges()),
          nodeCounter: nodeCounter
        });

        // 新しいタブを作成してそちらに遷移
        if (onCreateNewTab) {
          onCreateNewTab({
            title: fileNameOnly,
            icon: "📄",
            component: "FlowEditor",
            closable: true,
            hasUnsavedChanges: false,
            props: {
              initialMode: "loaded",
              loadedData: flowData,
              filePath: filePath,
              fileName: fileNameOnly
            },
          });
        }

        ConsoleMsg("success", `ファイルを保存しました: ${fileNameOnly}`);
      }
    } catch (error) {
      ConsoleMsg("error", `保存中にエラーが発生しました: ${error.message}`);
      console.error("名前をつけて保存エラー:", error);
    } finally {
      // 保存処理完了後にフラグをリセット
      isSaving.current = false;
    }
  }, [exportFlowData, fileName, getDefaultSavePath, setHistory, setCurrentHistoryIndex, onCreateNewTab]);

  /**
   * ファイルを開く機能（Ctrl+O）
   */
  const openFlow = useCallback(async () => {
    try {
      if (hasUnsavedChanges) {
        const result = confirm("未保存の変更があります。ファイルを開きますか？変更は失われます。");
        if (!result) return;
      }

      // Tauriのファイル選択ダイアログを表示
      const filePath = await open({
        filters: [
          {
            name: "D4 Flow Files",
            extensions: ["d4flow"],
          },
          {
            name: "JSON Files",
            extensions: ["json"],
          },
        ],
        multiple: false,
      });

      if (filePath) {
        // ファイルを読み込み
        const fileContent = await readTextFile(filePath);
        const flowData = JSON.parse(fileContent);

        // データの妥当性をチェック
        if (flowData.nodes && flowData.edges) {
          // フローデータを復元
          setNodes(flowData.nodes || []);
          setEdges(flowData.edges || []);
          setNodeCounter(flowData.nodeCounter || 1);

          // ファイル名を抽出
          const fileNameOnly = filePath
            .split(/[\\/]/)
            .pop()
            .replace(/\.[^/.]+$/, "");

          // ファイル状態を更新
          setCurrentFilePath(filePath);
          setDisplayFileName(fileNameOnly);
          setHasUnsavedChanges(false);

          // 履歴をリセット
          setHistory([]);
          setCurrentHistoryIndex(0);

          ConsoleMsg("success", `ファイルを開きました: ${fileNameOnly}`);
        } else {
          ConsoleMsg("error", "無効なファイル形式です");
        }
      }
    } catch (error) {
      ConsoleMsg("error", `ファイルを開く際にエラーが発生しました: ${error.message}`);
      console.error("ファイルオープンエラー:", error);
    }
  }, [hasUnsavedChanges, setNodes, setEdges, setNodeCounter]);

  /**
   * 新規ファイル作成
   */
  const newFlow = useCallback(() => {
    // 新しいタブを作成
    if (onCreateNewTab) {
      onCreateNewTab({
        title: "NewFile",
        icon: "⧈",
        component: "FlowEditor",
        closable: true,
        hasUnsavedChanges: false,
        props: {
          initialMode: "empty",
          fileName: "NewFile"
        }
      });
      ConsoleMsg("info", "新しいタブで新規フローを作成しました");
    } else {
      // フォールバック：現在のタブでリセット
      setNodes([]);
      setEdges([]);
      setNodeCounter(1);

      // ファイル状態をリセット
      setCurrentFilePath(null);
      setDisplayFileName("NewFile");
      setHasUnsavedChanges(false);

      // 履歴もリセット
      setHistory([]);
      setCurrentHistoryIndex(0);

      ConsoleMsg("info", "新規フローを作成しました");
    }
  }, [onCreateNewTab, setNodes, setEdges, setNodeCounter]);

  // ファイル操作のキーボードショートカット設定
  useEffect(() => {
    const handleFileKeyDown = (event) => {
      // Ctrl+S（保存）
      if (event.ctrlKey && event.key === "s" && !event.shiftKey) {
        event.preventDefault();
        saveFlow();
      }
      // Ctrl+Shift+S（名前をつけて保存）
      else if (event.ctrlKey && event.shiftKey && event.key === "S") {
        event.preventDefault();
        saveAsFlow();
      }
      // Ctrl+N（新規ファイル）
      else if (event.ctrlKey && event.key === "n") {
        event.preventDefault();
        newFlow();
      }
      // Ctrl+O（ファイルを開く）
      else if (event.ctrlKey && event.key === "o") {
        event.preventDefault();
        openFlow();
      }
    };

    document.addEventListener("keydown", handleFileKeyDown);
    return () => document.removeEventListener("keydown", handleFileKeyDown);
  }, [saveFlow, saveAsFlow, newFlow, openFlow]);

  // 変更状態の追跡
  useEffect(() => {
    // 履歴が変更されたら未保存状態にする
    if (history.length > 0 && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    }
  }, [history.length, hasUnsavedChanges]);

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
    canRedo: currentHistoryIndex < history.length,
    historyLength: history.length,
    currentHistoryIndex,

    // ファイル保存
    saveFlow,
    saveAsFlow,
    openFlow,
    newFlow,
    exportFlowData,
    currentFilePath,
    fileName: displayFileName,
    hasUnsavedChanges,
    hasChangesFromLastSave,
    requestTabClose,

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
