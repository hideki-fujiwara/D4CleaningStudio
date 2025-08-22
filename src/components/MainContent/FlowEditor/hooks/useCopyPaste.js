/**
 * ================================================================
 * FlowEditor コピー・ペーストフック
 * ================================================================
 *
 * ノードのコピー（Ctrl+C）とペースト（Ctrl+V）機能を管理するカスタムフック
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */
import { useCallback, useState, useRef, useEffect } from "react";
import { useKeyPress, useOnSelectionChange, useReactFlow } from "reactflow";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * コピー・ペースト機能を管理するフック
 */
export const useCopyPaste = () => {
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // クリップボード（コピーされたノード）
  const [clipboard, setClipboard] = useState([]);

  // 選択されたノード
  const [selectedNodes, setSelectedNodes] = useState([]);

  // React Flow インスタンス
  const { getNodes, addNodes, screenToFlowPosition } = useReactFlow();

  // マウス位置を追跡（ペースト位置の決定用）
  const mousePosition = useRef({ x: 400, y: 300 }); // デフォルト位置

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

    // 選択されたノードをクリップボードにコピー
    const copiedNodes = selectedNodes.map((node) => ({
      ...node,
      // 位置情報も保持
      originalPosition: { ...node.position },
    }));

    setClipboard(copiedNodes);
    ConsoleMsg(
      "success",
      `${copiedNodes.length}個のノードをコピーしました`,
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

    // 現在のマウス位置をフロー座標に変換
    const flowPosition = screenToFlowPosition(mousePosition.current);

    // クリップボードの最初のノードを基準点とする
    const referenceNode = clipboard[0];
    const referencePosition = referenceNode.originalPosition || referenceNode.position;

    // 各ノードの相対位置を計算してペースト
    const pastedNodes = clipboard.map((node) => {
      const relativeX = (node.originalPosition || node.position).x - referencePosition.x;
      const relativeY = (node.originalPosition || node.position).y - referencePosition.y;

      return cloneNode(node, flowPosition.x + relativeX - referencePosition.x, flowPosition.y + relativeY - referencePosition.y);
    });

    // 新しいノードを追加
    addNodes(pastedNodes);

    ConsoleMsg(
      "success",
      `${pastedNodes.length}個のノードをペーストしました`,
      pastedNodes.map((n) => n.id)
    );
  }, [clipboard, addNodes, cloneNode, screenToFlowPosition]);

  // ========================================================================================
  // キーボードショートカット
  // ========================================================================================

  // Ctrl+C (コピー)
  const isCopyPressed = useKeyPress(["Meta+c", "Control+c"]);

  // Ctrl+V (ペースト)
  const isPastePressed = useKeyPress(["Meta+v", "Control+v"]);

  // キーボードイベントの処理
  useEffect(() => {
    if (isCopyPressed) {
      copySelectedNodes();
    }
  }, [isCopyPressed, copySelectedNodes]);

  useEffect(() => {
    if (isPastePressed) {
      pasteNodes();
    }
  }, [isPastePressed, pasteNodes]);

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
    updateMousePosition,

    // デバッグ情報
    clipboardCount: clipboard.length,
    selectedCount: selectedNodes.length,
  };
};
