/**
 * ================================================================
 * 履歴管理機能カスタムフック
 * ================================================================
 *  const undo = useCallback(() => {

    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;Editorの履歴管理機能を分離したカスタムフック
 * Undo/Redo機能と履歴スタック管理を提供
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */

import { useState, useCallback, useRef } from "react";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * 履歴管理機能カスタムフック
 *
 * @param {Object} params - パラメータ
 * @param {Function} params.getNodes - ノード取得関数
 * @param {Function} params.getEdges - エッジ取得関数
 * @param {Function} params.setNodes - ノード設定関数
 * @param {Function} params.setEdges - エッジ設定関数
 * @param {Function} params.onHistoryChange - 履歴変更通知コールバック
 * @param {string} params.tabId - タブID（デバッグ用）
 * @param {string} params.fileName - ファイル名（デバッグ用）
 * @returns {Object} 履歴管理機能
 */
export const useHistory = ({ getNodes, getEdges, setNodes, setEdges, onHistoryChange, tabId, fileName }) => {
  // ========================================================================================
  // 状態管理
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

  // ========================================================================================
  // 履歴操作
  // ========================================================================================

  /**
   * 履歴への状態保存
   */
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
        // 基準状態がある場合の判定を修正
        // 1. ファイル読み込み後: prev.length === 1 && currentHistoryIndex === 0
        // 2. 新規プロジェクト: prev.length === 0 && currentHistoryIndex === 0
        let baselineState = null;
        let actualHistory = prev;

        if ((prev.length === 1 && currentHistoryIndex === 0) || (prev.length === 0 && currentHistoryIndex === 0)) {
          if (prev.length === 1) {
            // ファイル読み込み後の基準状態
            baselineState = prev[0];
            actualHistory = [];
          }
          // 新規プロジェクトの場合は基準状態なし
        }

        // 最新の履歴と比較して変化がない場合は保存しない
        let lastState = null;
        if (actualHistory.length > 0) {
          lastState = actualHistory[actualHistory.length - 1];
        } else if (baselineState) {
          lastState = baselineState;
        }

        if (lastState) {
          // ノードとエッジの内容を比較（タイムスタンプを除く）
          const isNodesEqual = JSON.stringify(lastState.nodes) === JSON.stringify(newState.nodes);
          const isEdgesEqual = JSON.stringify(lastState.edges) === JSON.stringify(newState.edges);

          if (isNodesEqual && isEdgesEqual) {
            return prev; // 変化がない場合は履歴を追加しない
          }
        }

        // 新しい履歴配列を構築
        let newHistory;
        if (baselineState) {
          // 基準状態 + 実際の履歴 + 新しい状態
          newHistory = [baselineState, ...actualHistory, newState];
        } else {
          // 現在のインデックス以降の履歴を削除（新しい操作が行われた場合）
          newHistory = actualHistory.slice(0, currentHistoryIndex);
          newHistory.push(newState);
        }

        // 履歴サイズ制限（基準状態は除いて計算）
        const actualHistoryLength = baselineState ? newHistory.length - 1 : newHistory.length;
        if (actualHistoryLength > maxHistorySize) {
          if (baselineState) {
            // 基準状態を保持して古い履歴を削除
            newHistory = [baselineState, ...newHistory.slice(2)];
          } else {
            newHistory.shift();
          }
          setCurrentHistoryIndex((prev) => Math.max(1, prev - 1));
        } else {
          // 基準状態がある場合とない場合でcurrentHistoryIndexを適切に設定
          if (baselineState) {
            // 基準状態がある場合: 実際の履歴件数 + 1（基準状態分）
            setCurrentHistoryIndex(actualHistoryLength + 1);
          } else {
            // 基準状態がない場合: 通常通り
            setCurrentHistoryIndex(newHistory.length);
          }
        }

        const displayHistoryLength = baselineState ? actualHistoryLength : newHistory.length;

        // タブ情報を含む履歴保存メッセージ
        const tabInfo = tabId ? `[Tab: ${fileName || tabId}] ` : '';
        ConsoleMsg("info", `${tabInfo}履歴を保存しました (${displayHistoryLength}/${maxHistorySize})`);

        // 履歴変更を通知
        if (onHistoryChange) {
          const notificationData = {
            historyLength: displayHistoryLength,
            currentHistoryIndex: displayHistoryLength, // 表示用は実際の操作履歴件数
            canUndo: displayHistoryLength > 0,
            canRedo: false,
          };
          
          onHistoryChange(notificationData);
        }        return newHistory;
      });
    },
    [currentHistoryIndex, maxHistorySize, onHistoryChange]
  );

  /**
   * 取り消し（Undo）
   *
   * 履歴配列の構造:
   * - 基準状態がある場合: [基準状態, 操作1, 操作2, ...]
   * - 基準状態がない場合: [操作1, 操作2, ...]
   *
   * currentHistoryIndex:
   * - 0: 基準状態（表示上は履歴件数0、履歴位置0）
   * - 1: 最初の操作（表示上は履歴件数1、履歴位置1）
   * - 2: 2番目の操作（表示上は履歴件数2、履歴位置2）
   */
  const undo = useCallback(() => {
    console.log("🔄 UNDO開始:", {
      currentHistoryIndex,
      historyLength: history.length,
      history: history.map((h, i) => ({ index: i, nodesCount: h.nodes.length, edgesCount: h.edges.length })),
    });

    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1;

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      // 基準状態の定義
      const baselineState = history.length > 0 ? history[0] : null;

      if (prevIndex === 0) {
        // 基準状態に戻る（履歴配列の最初の要素）
        if (history.length > 0) {
          const baselineStateData = history[0];

          setNodes(baselineStateData.nodes);
          setEdges(baselineStateData.edges);
          setCurrentHistoryIndex(0);

          // 履歴変更を通知（履歴件数0として表示）
          if (onHistoryChange) {
            onHistoryChange({
              historyLength: 0,
              currentHistoryIndex: 0,
              canUndo: false,
              canRedo: history.length > 1,
            });
          }

          ConsoleMsg("info", "基準状態に戻りました（履歴件数: 0、履歴位置: 0）");
        }
      } else {
        // 通常の履歴復元
        // 基準状態がある場合は適切なインデックスでアクセス
        const hasBaseline = history.length > 1 && currentHistoryIndex > 1;
        let prevState;

        if (hasBaseline) {
          // 基準状態がある場合: prevIndex=1なら基準状態、prevIndex>1なら実際の履歴
          if (prevIndex === 1) {
            prevState = history[0]; // 基準状態
          } else {
            prevState = history[prevIndex - 1];
          }
        } else {
          // 基準状態がない場合: 通常の履歴アクセス
          prevState = history[prevIndex - 1];
        }

        setNodes(prevState.nodes);
        setEdges(prevState.edges);
        setCurrentHistoryIndex(prevIndex);

        // 表示用履歴件数調整
        let displayHistoryLength, displayCurrentIndex;

        if (prevIndex === 0) {
          // 基準状態に戻った場合は履歴長を0とする
          displayHistoryLength = 0;
          displayCurrentIndex = 0;
        } else {
          const hasBaseline = baselineState !== null;
          displayHistoryLength = hasBaseline ? history.length - 1 : history.length;
          displayCurrentIndex = hasBaseline ? prevIndex - 1 : prevIndex;
        }

        // 履歴変更を通知
        if (onHistoryChange) {
          onHistoryChange({
            historyLength: displayHistoryLength,
            currentHistoryIndex: displayCurrentIndex,
            canUndo: prevIndex > 0,
            canRedo: prevIndex < history.length,
          });
        }

        const tabInfo = tabId ? `[Tab: ${fileName || tabId}] ` : '';
        ConsoleMsg("info", `${tabInfo}操作を取り消しました (位置: ${displayCurrentIndex}/${displayHistoryLength})`);
      }

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);
    } else {
      ConsoleMsg("warning", "これ以上取り消しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges, onHistoryChange]);

  /**
   * やり直し（Redo）
   *
   * 履歴配列の構造:
   * - 基準状態がある場合: [基準状態, 操作1, 操作2, ...]
   * - 基準状態がない場合: [操作1, 操作2, ...]
   *
   * currentHistoryIndex:
   * - 0: 基準状態（表示上は履歴件数0）
   * - 1: 最初の操作（表示上は履歴件数1）
   * - 2: 2番目の操作（表示上は履歴件数2）
   */
  const redo = useCallback(() => {
    if (currentHistoryIndex < history.length) {
      const nextIndex = currentHistoryIndex + 1;

      // 履歴復元中フラグを立てる
      isRestoringHistory.current = true;

      // 基準状態の定義
      const baselineState = history.length > 0 ? history[0] : null;

      // 基準状態がある場合の特別処理
      const hasBaseline = history.length > 1 && currentHistoryIndex === 0;

      let nextState;
      if (hasBaseline && nextIndex === 1) {
        // 基準状態(index=0)から最初の操作履歴(index=1)への復帰
        nextState = history[1]; // 2番目の要素が最初の操作履歴
      } else {
        // 通常の履歴復元
        nextState = history[nextIndex - 1];
      }

      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentHistoryIndex(nextIndex);

      // フラグを戻す
      setTimeout(() => {
        isRestoringHistory.current = false;
      }, 100);

      // 表示用履歴件数調整
      let displayHistoryLength, displayCurrentIndex;

      if (nextIndex === 0) {
        // 基準状態の場合は履歴長を0とする
        displayHistoryLength = 0;
        displayCurrentIndex = 0;
      } else {
        const hasBaseline = baselineState !== null;
        displayHistoryLength = hasBaseline ? history.length - 1 : history.length;
        displayCurrentIndex = hasBaseline ? nextIndex - 1 : nextIndex;
      }

      // 履歴変更を通知
      if (onHistoryChange) {
        onHistoryChange({
          historyLength: displayHistoryLength,
          currentHistoryIndex: displayCurrentIndex,
          canUndo: nextIndex > 0,
          canRedo: nextIndex < history.length,
        });
      }

      const tabInfo = tabId ? `[Tab: ${fileName || tabId}] ` : '';
      ConsoleMsg("info", `${tabInfo}操作をやり直しました (位置: ${displayCurrentIndex}/${displayHistoryLength})`);
    } else {
      ConsoleMsg("warning", "これ以上やり直しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges, onHistoryChange]);

  /**
   * 履歴をリセット
   */
  const resetHistory = useCallback(() => {
    setHistory([]);
    setCurrentHistoryIndex(0);

    // 履歴変更を通知
    if (onHistoryChange) {
      onHistoryChange({
        historyLength: 0,
        currentHistoryIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    }

    const tabInfo = tabId ? `[Tab: ${fileName || tabId}] ` : '';
    ConsoleMsg("info", `${tabInfo}履歴をリセットしました`);
  }, [onHistoryChange]);

  /**
   * 履歴を初期化（初期状態を履歴番号0として設定）
   * ファイル読み込み後などで使用
   */
  const initializeHistory = useCallback(
    (nodes, edges) => {
      const initialState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        timestamp: Date.now(),
      };

      // 基準状態として保存するが、履歴件数は0のまま
      setHistory([initialState]);
      setCurrentHistoryIndex(0); // 履歴件数0を示す

      // 履歴変更を通知
      if (onHistoryChange) {
        onHistoryChange({
          historyLength: 0, // 見た目の履歴件数は0
          currentHistoryIndex: 0,
          canUndo: false, // 基準状態なのでUndoできない
          canRedo: false,
        });
      }

      const tabInfo = tabId ? `[Tab: ${fileName || tabId}] ` : '';
      ConsoleMsg("info", `${tabInfo}履歴を初期化しました（基準状態設定、履歴件数: 0）`);
    },
    [onHistoryChange]
  );

  /**
   * フラグ設定
   */
  const setSavingFlag = useCallback((isSavingValue) => {
    isSaving.current = isSavingValue;
  }, []);

  const setLoadingFlag = useCallback((isLoadingValue) => {
    isLoading.current = isLoadingValue;
  }, []);

  // ========================================================================================
  // 返り値
  // ========================================================================================

  // 表示用履歴長の計算
  const displayHistoryLength = () => {
    if (history.length === 1 && currentHistoryIndex === 0) {
      // 基準状態のみの場合は履歴件数0
      return 0;
    } else if (history.length > 0 && currentHistoryIndex > 0) {
      // 基準状態がある場合は-1して表示
      return history.length - 1;
    } else {
      // 通常の履歴
      return history.length;
    }
  };

  return {
    // 履歴情報
    history,
    currentHistoryIndex,
    historyLength: displayHistoryLength(),

    // 履歴操作
    saveToHistory,
    undo,
    redo,
    resetHistory,
    initializeHistory,

    // 状態判定
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length,

    // フラグ管理
    setSavingFlag,
    setLoadingFlag,
  };
};
