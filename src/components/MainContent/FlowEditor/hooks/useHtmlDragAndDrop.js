/**
 * HTML5 ドラッグ&ドロップフック
 * バックアップファイルから動作確認済みの実装を移植
 */
import { useCallback, useRef, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

export const useHtmlDragAndDrop = (addNode) => {
  const { screenToFlowPosition } = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  /**
   * ドラッグオーバー処理
   * ファイルがフロー上にドラッグされている間の視覚的フィードバック
   *
   * @param {DragEvent} event - ドラッグイベント
   */
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy"; // コピーカーソルを表示
    setIsDragOver(true); // ドラッグオーバー状態をON
  }, []);

  /**
   * ドラッグリーブ処理
   * ファイルがフロー領域から外れた際の処理
   *
   * @param {DragEvent} event - ドラッグイベント
   */
  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false); // ドラッグオーバー状態をOFF
  }, []);

  /**
   * ファイルドロップ処理
   * ファイルがフロー上にドロップされた際の処理
   * エクスプローラーからのファイルドロップとProjectTreeからのドロップに対応
   *
   * @param {DragEvent} event - ドロップイベント
   */
  const onDrop = useCallback(
    (event) => {
      console.log("🟢 HTML5 onDrop 呼び出されました", event);
      event.preventDefault();
      setIsDragOver(false);

      // ドロップされたデータを取得
      const files = Array.from(event.dataTransfer.files); // エクスプローラーからのファイル
      const filePath = event.dataTransfer.getData("application/x-file-path"); // ProjectTreeからのパス
      const fileName = event.dataTransfer.getData("application/x-file-name"); // ProjectTreeからのファイル名
      const nodeType = event.dataTransfer.getData("application/reactflow"); // ツールバーからのノードタイプ

      console.log("🟢 ドロップデータ:", { files: files.length, filePath, fileName, nodeType });

      // React Flowコンテナの参照チェック
      if (!reactFlowWrapper.current) return;

      // スクリーン座標（マウスカーソル位置）
      const screenPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      console.log("🟢 スクリーン座標:", screenPosition);

      // ツールバーからのノードドロップ処理
      if (nodeType) {
        console.log("🟢 ツールバーノード作成:", nodeType);

        // スクリーン座標をフロー座標に変換
        const flowPosition = screenToFlowPosition(screenPosition);
        console.log("🟢 フロー座標:", flowPosition);

        // addNode関数を使用してノードを追加
        const newNode = addNode(nodeType, flowPosition, {
          label: `${nodeType} node`,
        });

        ConsoleMsg("success", "ツールバーからノードを作成しました", {
          nodeType,
          dropPosition: flowPosition,
          clientPosition: screenPosition,
        });
        return;
      }

      // エクスプローラーからのファイルドロップ処理
      if (files.length > 0) {
        console.log("🟢 ファイルドロップ処理:", files.length);

        files.forEach((file, index) => {
          // ファイルタイプを決定
          const extension = file.name.split(".").pop()?.toLowerCase();
          const fileNodeType = extension === "csv" ? "inputFileCsv" : "customSimple";

          // スクリーン座標をフロー座標に変換
          const flowPosition = screenToFlowPosition({
            x: screenPosition.x,
            y: screenPosition.y + index * 100, // 複数ファイルは縦に並べる
          });

          // ファイルからノードデータを生成
          const nodeData = {
            fileName: file.name,
            filePath: file.name,
            color: extension === "csv" ? "#3b82f6" : "#6b7280",
            // CSV固有の設定
            ...(extension === "csv" && {
              encoding: "UTF-8",
              delimiter: ",",
              hasHeader: true,
            }),
          };

          // addNode関数を使用してノードを追加
          const newNode = addNode(fileNodeType, flowPosition, nodeData);

          ConsoleMsg("info", "ファイルからノードを作成しました", {
            fileName: file.name,
            nodeType: fileNodeType,
            dropPosition: flowPosition,
            clientPosition: screenPosition,
          });
        });
        return;
      }

      // ProjectTreeからのファイルドロップ処理
      if (filePath && fileName) {
        console.log("🟢 ProjectTreeファイル処理:", { filePath, fileName });

        // ファイル拡張子からノードタイプを決定
        const extension = fileName.split(".").pop()?.toLowerCase();
        const treeNodeType = extension === "csv" ? "inputFileCsv" : "customSimple";

        // スクリーン座標をフロー座標に変換
        const flowPosition = screenToFlowPosition(screenPosition);

        // ProjectTree用のノードデータを作成
        const nodeData = {
          fileName: fileName,
          filePath: filePath,
          color: extension === "csv" ? "#20b2aa" : "#6b7280",
          // CSV固有の設定
          ...(extension === "csv" && {
            encoding: "UTF-8",
            delimiter: ",",
            hasHeader: true,
          }),
        };

        // addNode関数を使用してノードを追加
        const newNode = addNode(treeNodeType, flowPosition, nodeData);

        ConsoleMsg("info", "ProjectTreeからノードを作成しました", {
          fileName,
          filePath,
          nodeType: treeNodeType,
          dropPosition: flowPosition,
          clientPosition: screenPosition,
        });
      }
    },
    [screenToFlowPosition, addNode]
  );

  return {
    reactFlowWrapper,
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
  };
};
