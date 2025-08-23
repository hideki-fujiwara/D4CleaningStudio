/**
 * ================================================================
 * 履歴管理機能カスタムフック
 * ================================================================
 *
 * FlowEditorの履歴管理機能を分離したカスタムフック
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
 * @returns {Object} 履歴管理機能
 */
export const useHistory = ({ getNodes, getEdges, setNodes, setEdges, onHistoryChange }) => {
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
        // 最新の履歴と比較して変化がない場合は保存しない
        if (prev.length > 0) {
          const lastState = prev[prev.length - 1];

          // ノードとエッジの内容を比較（タイムスタンプを除く）
          const isNodesEqual = JSON.stringify(lastState.nodes) === JSON.stringify(newState.nodes);
          const isEdgesEqual = JSON.stringify(lastState.edges) === JSON.stringify(newState.edges);

          if (isNodesEqual && isEdgesEqual) {
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

        // 履歴変更を通知
        if (onHistoryChange) {
          onHistoryChange({
            historyLength: newHistory.length,
            currentHistoryIndex: newHistory.length,
            canUndo: newHistory.length > 0,
            canRedo: false,
          });
        }

        return newHistory;
      });
    },
    [currentHistoryIndex, maxHistorySize, onHistoryChange]
  );

  /**
   * 取り消し（Undo）
   */
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

      // 履歴変更を通知
      if (onHistoryChange) {
        onHistoryChange({
          historyLength: history.length,
          currentHistoryIndex: prevIndex,
          canUndo: prevIndex > 0,
          canRedo: prevIndex < history.length,
        });
      }

      ConsoleMsg("info", `操作を取り消しました (${prevIndex}/${history.length})`);
    } else {
      ConsoleMsg("warning", "これ以上取り消しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges, onHistoryChange]);

  /**
   * やり直し（Redo）
   */
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

      // 履歴変更を通知
      if (onHistoryChange) {
        onHistoryChange({
          historyLength: history.length,
          currentHistoryIndex: nextIndex,
          canUndo: nextIndex > 0,
          canRedo: nextIndex < history.length,
        });
      }

      ConsoleMsg("info", `操作をやり直しました (${nextIndex}/${history.length})`);
    } else {
      ConsoleMsg("warning", "これ以上やり直しできません");
    }
  }, [currentHistoryIndex, history, setNodes, setEdges, onHistoryChange]);

  /**
   * 履歴をリセット
   */
  const resetHistory = useCallback(() => {
    console.log("履歴リセット実行");
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

    ConsoleMsg("info", "履歴をリセットしました");
  }, [onHistoryChange]);

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

  return {
    // 履歴情報
    history,
    currentHistoryIndex,
    historyLength: history.length,

    // 履歴操作
    saveToHistory,
    undo,
    redo,
    resetHistory,

    // 状態判定
    canUndo: currentHistoryIndex > 0,
    canRedo: currentHistoryIndex < history.length,

    // フラグ管理
    setSavingFlag,
    setLoadingFlag,
  };
};
