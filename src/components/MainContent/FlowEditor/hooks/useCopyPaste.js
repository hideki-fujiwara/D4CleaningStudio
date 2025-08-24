/**
 * ================================================================
 * FlowEditor コピー・ペースト・削除フック
 * ================================================================
 *
 * ノードのコピー（Ctrl+C）、ペースト（Ctrl+V）、削除（Delete）機能を管理するカスタムフック
 *
 * @author D4CleaningStudio
 * @version 1.1.0
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useOnSelectionChange, useReactFlow } from "@xyflow/react";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * コピー・ペースト・削除機能を管理するフック
 * @param {Function} saveToHistory - 履歴保存用コールバック関数
 * @param {Function} updateNodes - ノード設定関数
 * @param {Array} nodes - 現在のノード配列
 * @param {Array} edges - 現在のエッジ配列
 */
export const useCopyPaste = (saveToHistory = null, updateNodes = null, nodes = [], edges = []) => {
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // クリップボード（コピーされたノード）
  const [clipboard, setClipboard] = useState([]);

  // 選択されたノード
  const [selectedNodes, setSelectedNodes] = useState([]);

  // React Flow インスタンス
  const { getNodes, addNodes, screenToFlowPosition, getEdges, setNodes, setEdges } = useReactFlow();

  // マウス位置を追跡（ペースト位置の決定用）
  const mousePosition = useRef({ x: 400, y: 300 }); // デフォルト位置

  // ペースト回数の追跡（連続ペースト時の位置調整用）
  const pasteCount = useRef(0);
  const lastPasteTime = useRef(0);

  // ========================================================================================
  // 選択状態の監視
  // ========================================================================================

  /**
   * 選択変更の監視
   * 選択されたノードの状態を更新
   */
  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodes(nodes);
    ConsoleMsg(
      "info",
      `選択ノード数: ${nodes.length}`,
      nodes.map((n) => n.id)
    );
  }, []);

  useOnSelectionChange({ onChange: onSelectionChange });

  // ========================================================================================
  // ユーティリティ関数
  // ========================================================================================

  /**
   * 新しいノードIDを生成
   */
  const generateNewNodeId = useCallback(() => {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * ノードを複製（新しいIDと位置で）
   */
  const cloneNode = useCallback(
    (node, offsetX = 20, offsetY = 20) => {
      return {
        ...node,
        id: generateNewNodeId(),
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
        selected: false, // 複製されたノードは選択されていない状態
        data: {
          ...node.data,
          // データも複製（参照を避ける）
          label: node.data.label ? `${node.data.label} (コピー)` : "コピーノード",
        },
      };
    },
    [generateNewNodeId]
  );

  /**
   * マウス位置を更新
   */
  const updateMousePosition = useCallback((event) => {
    mousePosition.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  // ========================================================================================
  // コピー・ペースト関数
  // ========================================================================================

  /**
   * 選択されたノードをコピー
   */
  const copySelectedNodes = useCallback(() => {
    if (selectedNodes.length === 0) {
      ConsoleMsg("warning", "コピーするノードが選択されていません");
      return;
    }

    // 選択されたノード群の左上端を基準点として計算
    const minX = Math.min(...selectedNodes.map(node => node.position.x));
    const minY = Math.min(...selectedNodes.map(node => node.position.y));

    // 選択されたノードをクリップボードにコピー（基準点からの相対位置を保存）
    const copiedNodes = selectedNodes.map((node) => ({
      ...node,
      // 元の位置情報を保持
      originalPosition: { ...node.position },
      // 基準点からの相対位置を計算
      relativePosition: {
        x: node.position.x - minX,
        y: node.position.y - minY,
      }
    }));

    setClipboard(copiedNodes);
    
    // ペーストカウントをリセット（新しいコピー操作の開始）
    pasteCount.current = 0;
    lastPasteTime.current = 0;

    ConsoleMsg(
      "success",
      `${copiedNodes.length}個のノードをコピーしました（相対位置保持）`,
      copiedNodes.map((n) => n.id)
    );
  }, [selectedNodes]);

  /**
   * クリップボードからノードをペースト
   */
  const pasteNodes = useCallback(() => {
    if (clipboard.length === 0) {
      ConsoleMsg("warning", "ペーストするノードがクリップボードにありません");
      return;
    }

    // 現在の時間を取得
    const currentTime = Date.now();
    const timeSinceLastPaste = currentTime - lastPasteTime.current;

    // 連続ペースト判定（1秒以内の場合は連続ペーストとみなす）
    if (timeSinceLastPaste < 1000) {
      pasteCount.current += 1;
    } else {
      pasteCount.current = 1;
    }

    lastPasteTime.current = currentTime;

    // 現在のマウス位置をフロー座標に変換
    const flowPosition = screenToFlowPosition(mousePosition.current);
    
    // 連続ペースト時のオフセット計算（30px * ペースト回数）
    const pasteOffset = 30 * (pasteCount.current - 1);

    // 各ノードの相対位置を保持してペースト
    const pastedNodes = clipboard.map((node) => {
      // 保存された相対位置を使用（なければ0として扱う）
      const relativeX = node.relativePosition?.x || 0;
      const relativeY = node.relativePosition?.y || 0;
      
      // マウス位置を基準として、相対位置を維持したままペースト
      const newPosition = {
        x: flowPosition.x + relativeX + pasteOffset,
        y: flowPosition.y + relativeY + pasteOffset
      };
      
      return {
        ...node,
        id: generateNewNodeId(),
        position: newPosition,
        selected: true, // ペーストされたノードを選択状態にする
        data: {
          ...node.data,
          // データも複製（参照を避ける）
          label: node.data.label ? `${node.data.label} (コピー)` : "コピーノード",
        },
      };
    });

    // 既存のノードの選択を解除
    const currentNodes = nodes;
    const deselectedNodes = currentNodes.map(node => ({
      ...node,
      selected: false
    }));

    // 選択解除されたノードとペーストされたノードを結合
    const allNewNodes = [...deselectedNodes, ...pastedNodes];
    
    // ノードを更新
    if (updateNodes) {
      updateNodes(allNewNodes);
    }

    // 履歴に保存（ペースト後の状態）
    if (saveToHistory) {
      setTimeout(() => {
        saveToHistory(allNewNodes, edges);
      }, 100);
    }
    
    ConsoleMsg(
      "success",
      `${pastedNodes.length}個のノードをペーストしました (${pasteCount.current}回目、相対位置保持)`,
      pastedNodes.map((n) => n.id)
    );
  }, [clipboard, generateNewNodeId, screenToFlowPosition, saveToHistory, updateNodes, nodes, edges]);

  /**
   * 選択されたノードとエッジを削除
   */
  const deleteSelectedElements = useCallback(() => {
    if (selectedNodes.length === 0) {
      ConsoleMsg("warning", "削除するノードが選択されていません");
      return;
    }

    const selectedNodeIds = selectedNodes.map(node => node.id);
    const allNodes = getNodes();
    const allEdges = getEdges();

    // 選択されたノードを除外
    const remainingNodes = allNodes.filter(node => !selectedNodeIds.includes(node.id));
    
    // 選択されたノードに接続されているエッジを除外
    const remainingEdges = allEdges.filter(edge => 
      !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
    );

    // ノードとエッジを更新
    setNodes(remainingNodes);
    setEdges(remainingEdges);

    // 履歴に保存（削除後の状態）
    if (saveToHistory) {
      setTimeout(() => {
        saveToHistory(remainingNodes, remainingEdges);
      }, 100);
    }

    ConsoleMsg("warning", `${selectedNodes.length}個のノードと関連エッジを削除しました`, selectedNodeIds);
  }, [selectedNodes, getNodes, getEdges, setNodes, setEdges, saveToHistory]);

  // ========================================================================================
  // キーボードショートカット
  // ========================================================================================

  // キーボードイベントハンドラー
  useEffect(() => {
    const handleKeyDown = (event) => {
      // フォーカスされている要素がinput, textarea, select要素の場合はスキップ
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
      )) {
        return;
      }

      // Ctrl/Cmd + C (コピー)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        copySelectedNodes();
        return;
      }

      // Ctrl/Cmd + V (ペースト) - 押下回数分実行
      if ((event.ctrlKey || event.metaKey) && event.key === 'v' && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        pasteNodes();
        return;
      }

      // Delete/Backspace (削除)
      if ((event.key === 'Delete' || event.key === 'Backspace') && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        deleteSelectedElements();
        return;
      }
    };

    // keydownイベントリスナーを追加
    document.addEventListener('keydown', handleKeyDown);

    // クリーンアップ
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [copySelectedNodes, pasteNodes, deleteSelectedElements]);

  // ========================================================================================
  // マウス位置の監視
  // ========================================================================================

  // マウス移動イベントリスナーの設定
  useEffect(() => {
    const handleMouseMove = (event) => {
      updateMousePosition(event);
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [updateMousePosition]);

  // ========================================================================================
  // 戻り値
  // ========================================================================================

  return {
    // 状態
    clipboard,
    selectedNodes,
    hasClipboard: clipboard.length > 0,
    hasSelection: selectedNodes.length > 0,

    // 関数
    copySelectedNodes,
    pasteNodes,
    deleteSelectedElements,
    updateMousePosition,

    // デバッグ情報
    clipboardCount: clipboard.length,
    selectedCount: selectedNodes.length,
    pasteCount: pasteCount.current,
  };
};
