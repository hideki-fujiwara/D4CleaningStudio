import React, { useCallback, useState, useRef } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, ConnectionLineType, Panel, useReactFlow, ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import ConsoleMsg from "../../../utils/ConsoleMsg";
import { nodeTypes } from "./CustomNodes";
import FlowEditorToolbar from "./FlowEditorToolbar";

// ========================================================================================
// 初期データ定義
// ========================================================================================

/**
 * 初期ノードデータ（カスタムスタイル付き）
 * アプリケーション起動時に表示されるデフォルトのノード群
 */
const initialNodes = [
  // データプロセッサノード（複雑なカスタムテキストノード）
  {
    id: "1",
    type: "customText",
    data: {
      title: "データプロセッサ",
      content: "入力データを処理して\n結果を出力します",
      style: {
        header: {
          text: "データプロセッサ",
          bgColor: "bg-purple-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-white",
          borderColor: "border-purple-500",
        },
        content: {
          bgColor: "bg-purple-50",
          textColor: "text-purple-900",
          borderColor: "border-purple-300",
        },
      },
      // 左側の入力ハンドル群
      leftItems: [
        { id: 0, text: "Raw Data", type: "input", bgColor: "bg-blue-200", textColor: "text-blue-800", handleColor: "bg-blue-600" },
        { id: 1, text: "Config", type: "input", bgColor: "bg-green-200", textColor: "text-green-800", handleColor: "bg-green-600" },
        { id: 2, text: "Rules", type: "input", bgColor: "bg-yellow-200", textColor: "text-yellow-800", handleColor: "bg-yellow-600" },
      ],
      // 右側の出力ハンドル群
      rightItems: [
        { id: 0, text: "Clean Data", type: "output", bgColor: "bg-emerald-200", textColor: "text-emerald-800", handleColor: "bg-emerald-600" },
        { id: 1, text: "Error Log", type: "output", bgColor: "bg-red-200", textColor: "text-red-800", handleColor: "bg-red-600" },
        { id: 2, text: "Stats", type: "output", bgColor: "bg-orange-200", textColor: "text-orange-800", handleColor: "bg-orange-600" },
      ],
    },
    position: { x: 250, y: 25 },
  },

  // バリデーターノード（シンプルカスタムノード）
  {
    id: "2",
    type: "customSimple",
    data: {
      label: "バリデーター",
      description: "データの妥当性をチェック",
      style: {
        header: {
          bgColor: "bg-red-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
        },
        content: {
          bgColor: "bg-red-50",
          textColor: "text-red-700",
        },
      },
    },
    position: { x: 600, y: 300 },
  },

  // データ出力ノード（シンプルカスタムノード）
  {
    id: "3",
    type: "customSimple",
    data: {
      label: "データ出力",
      description: "処理結果を出力",
      style: {
        header: {
          bgColor: "bg-green-500",
          textColor: "text-white",
        },
        container: {
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
        },
        content: {
          bgColor: "bg-green-50",
          textColor: "text-green-700",
        },
      },
    },
    position: { x: 100, y: 500 },
  },

  // 標準の入力ノード
  {
    id: "4",
    type: "input",
    data: { label: "開始" },
    position: { x: 50, y: 500 },
  },

  // 標準の出力ノード
  {
    id: "5",
    type: "output",
    data: { label: "完了" },
    position: { x: 650, y: 500 },
  },

  // ストレージノード（詳細情報付きのシンプルカスタムノード）
  {
    id: "storage1",
    type: "customSimple",
    data: {
      label: "プライマリストレージ",
      subtitle: "メインデータベース",
      description: "顧客データとトランザクション情報を格納するメインストレージシステム。高速アクセスとデータ整合性を保証します。",
      iconType: "hard", // ハードディスクアイコンを表示
      specs: {
        容量: "2TB SSD",
        インターフェース: "NVMe",
        速度: "3,500 MB/s",
        用途: "データベース",
      },
      style: {
        header: {
          bgColor: "bg-emerald-500",
          textColor: "text-white",
        },
        content: {
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-900",
        },
      },
    },
    position: { x: 100, y: 100 },
  },

  // CSVファイル入力ノード（ティール色）
  {
    id: "csv1",
    type: "inputFileCsv",
    data: {
      color: "#20b2aa", // ティール色
      fileName: "customers.csv",
    },
    position: { x: 100, y: 200 },
  },

  // 設定ファイルCSV（青色版）
  {
    id: "csv2",
    type: "inputFileCsv",
    data: {
      color: "#3b82f6", // 青色
      fileName: "config.csv",
    },
    position: { x: 100, y: 400 },
  },
];

/**
 * 初期エッジデータ
 * ノード間の接続関係を定義
 */
const initialEdges = [
  // データプロセッサ → バリデーター（アニメーション付き）
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    type: "smoothstep",
  },
  // データプロセッサ → データ出力（アニメーション付き）
  {
    id: "e1-3",
    source: "1",
    target: "3",
    animated: true,
    type: "smoothstep",
  },
  // バリデーター → 開始
  {
    id: "e2-4",
    source: "2",
    target: "4",
    type: "smoothstep",
  },
  // データ出力 → 完了
  {
    id: "e3-5",
    source: "3",
    target: "5",
    type: "smoothstep",
  },
];

// ========================================================================================
// メインコンポーネント
// ========================================================================================

/**
 * FlowEditor の内部コンポーネント（useReactFlowを使用する部分）
 *
 * ReactFlowProvider内で実行されるため、useReactFlowフックが使用可能。
 * ノードやエッジの状態管理、ドラッグ&ドロップ処理、各種イベントハンドリングを担当。
 *
 * @param {Object} props - プロパティ
 * @param {string} props.initialMode - 初期モード（"default" | "empty"）
 */
function FlowEditorInner({ initialMode = "default" }) {
  // デバッグ用
  console.log("FlowEditorInner initialMode:", initialMode);
  
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  // 初期ノードとエッジを決定
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

  // React Flow状態管理（ノードとエッジ）
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // React Flowのユーティリティ関数（座標変換用）
  const { screenToFlowPosition } = useReactFlow();

  // ノードカウンター（新しいノードのID生成用）
  const [nodeCounter, setNodeCounter] = useState(6);

  // ドラッグ&ドロップ状態
  const [isDragOver, setIsDragOver] = useState(false);

  // React Flowコンテナへの参照
  const reactFlowWrapper = useRef(null);

  // ========================================================================================
  // エッジ接続処理
  // ========================================================================================

  /**
   * エッジ接続時のコールバック
   * ユーザーがノード間を接続した際に呼び出される
   *
   * @param {Object} params - 接続パラメータ（source, target, sourceHandle, targetHandleなど）
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
      setEdges((eds) => addEdge(newEdge, eds));

      // ログ出力
      ConsoleMsg("info", "新しいエッジを追加しました", newEdge);
    },
    [setEdges]
  );

  // ========================================================================================
  // ノードサイズ管理
  // ========================================================================================

  /**
   * ノードのサイズを取得（ノードタイプに基づく推定値）
   * ドロップ時の中心座標調整に使用
   *
   * @param {string} nodeType - ノードのタイプ
   * @returns {Object} サイズオブジェクト（width, height）
   */
  const getNodeSize = useCallback((nodeType) => {
    switch (nodeType) {
      // ファイル関連ノード（横長の標準サイズ）
      case "inputFileCsv":
      case "inputFileJson":
      case "inputFileXml":
      case "inputFileText":
      case "inputFile":
        return { width: 200, height: 80 };

      // テキストノード（大きめサイズ）
      case "customText":
        return { width: 250, height: 200 };

      // シンプルカスタムノード（中程度サイズ）
      case "customSimple":
        return { width: 220, height: 150 };

      // その他のノード（デフォルトサイズ）
      default:
        return { width: 200, height: 100 };
    }
  }, []);

  /**
   * ドロップ位置を中心座標として調整
   * マウスカーソル位置をノードの中心に配置するため、オフセットを計算
   *
   * @param {Object} position - 元の位置座標（{x, y}）
   * @param {string} nodeType - ノードタイプ
   * @returns {Object} 調整後の位置座標（{x, y}）
   */
  const adjustPositionToCenter = useCallback(
    (position, nodeType) => {
      const nodeSize = getNodeSize(nodeType);
      return {
        x: position.x - nodeSize.width / 2, // 幅の半分左にずらす
        y: position.y - nodeSize.height / 2, // 高さの半分上にずらす
      };
    },
    [getNodeSize]
  );

  // ========================================================================================
  // ノード追加機能
  // ========================================================================================

  /**
   * 新しいノードを追加する（中心座標調整版）
   * ランダムな位置に指定されたタイプのノードを作成
   *
   * @param {string} nodeType - 作成するノードのタイプ（デフォルト: "customSimple"）
   */
  const addNode = useCallback(
    (nodeType = "customSimple") => {
      // ランダムな位置を生成（重複を避けるため範囲を指定）
      const randomPosition = {
        x: Math.random() * 400 + 200, // 200-600の範囲
        y: Math.random() * 300 + 100, // 100-400の範囲
      };

      // 中心座標として調整
      const position = adjustPositionToCenter(randomPosition, nodeType);

      // ノードタイプに応じてデータを生成
      const newNode = {
        id: `${nodeCounter}`, // シンプルなID
        type: nodeType,
        data:
          nodeType === "customText"
            ? {
                // テキストノード用のデータ
                title: `テキスト ${nodeCounter}`,
                content: "新しいテキストノード",
              }
            : {
                // その他のノード用のデータ
                label: `ノード ${nodeCounter}`,
                description: "新しいノード",
              },
        position,
      };

      // ノード状態を更新
      setNodes((nds) => nds.concat(newNode));
      setNodeCounter((prev) => prev + 1);

      // ログ出力
      ConsoleMsg("info", "新しいノードを追加しました", newNode);
    },
    [nodeCounter, setNodes, adjustPositionToCenter]
  );

  /**
   * CSVファイルノードを手動追加（中心座標調整版）
   * 特定の設定でCSVノードを作成
   */
  const addCsvNode = useCallback(() => {
    // ランダムな位置を生成
    const randomPosition = {
      x: Math.random() * 400 + 200,
      y: Math.random() * 300 + 100,
    };

    // 中心座標として調整
    const position = adjustPositionToCenter(randomPosition, "inputFileCsv");

    // CSVノード用のデータを作成
    const newNode = {
      id: `csv-${nodeCounter}`,
      type: "inputFileCsv",
      data: {
        fileName: `sample-${nodeCounter}.csv`,
        color: "#20b2aa", // ティール色
        encoding: "UTF-8",
        delimiter: ",",
        hasHeader: true,
      },
      position,
    };

    // ノード状態を更新
    setNodes((nds) => [...nds, newNode]);
    setNodeCounter((prev) => prev + 1);

    // ログ出力
    ConsoleMsg("info", "CSVノードを追加しました", newNode);
  }, [nodeCounter, setNodes, adjustPositionToCenter]);

  /**
   * テキストノードを追加
   * addNode関数のラッパー
   */
  const addTextNode = useCallback(() => {
    addNode("customText");
  }, [addNode]);

  /**
   * シンプルノードを追加
   * addNode関数のラッパー
   */
  const addSimpleNode = useCallback(() => {
    addNode("customSimple");
  }, [addNode]);

  // ========================================================================================
  // フロー操作機能
  // ========================================================================================

  /**
   * すべてのノードをクリア
   * フローを完全に空の状態にリセット
   */
  const clearNodes = useCallback(() => {
    setNodes([]); // ノードを空配列に
    setEdges([]); // エッジを空配列に
    setNodeCounter(1); // カウンターをリセット

    ConsoleMsg("info", "すべてのノードをクリアしました");
  }, [setNodes, setEdges]);

  /**
   * 初期状態にリセット
   * アプリケーション起動時の状態に戻す
   */
  const resetFlow = useCallback(() => {
    setNodes(initialNodes); // 初期ノードを復元
    setEdges(initialEdges); // 初期エッジを復元
    setNodeCounter(6); // カウンターを初期値に

    ConsoleMsg("info", "フローを初期状態にリセットしました");
  }, [setNodes, setEdges]);

  // ========================================================================================
  // ノード・エッジ選択処理
  // ========================================================================================

  /**
   * ノード選択時のコールバック
   * ユーザーがノードをクリックした際に呼び出される
   *
   * @param {Event} event - クリックイベント
   * @param {Object} node - 選択されたノードオブジェクト
   */
  const onNodeClick = useCallback((event, node) => {
    ConsoleMsg("info", "ノードが選択されました", node);
    // TODO: ノード詳細パネルの表示、プロパティ編集など
  }, []);

  /**
   * エッジ選択時のコールバック
   * ユーザーがエッジをクリックした際に呼び出される
   *
   * @param {Event} event - クリックイベント
   * @param {Object} edge - 選択されたエッジオブジェクト
   */
  const onEdgeClick = useCallback((event, edge) => {
    ConsoleMsg("info", "エッジが選択されました", edge);
    // TODO: エッジプロパティの編集など
  }, []);

  // ========================================================================================
  // ファイルドロップ処理
  // ========================================================================================

  /**
   * ファイルタイプに基づいてノードタイプを決定
   * ファイル拡張子からReact Flowノードのタイプを推定
   *
   * @param {File} file - ドロップされたファイルオブジェクト
   * @returns {string} ノードタイプ
   */
  const getNodeTypeFromFile = useCallback((file) => {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();

    switch (extension) {
      case "csv":
        return "inputFileCsv";
      case "json":
        return "inputFileJson";
      case "xml":
        return "inputFileXml";
      case "txt":
        return "inputFileText";
      default:
        return "inputFile"; // 汎用ファイルノード
    }
  }, []);

  /**
   * ファイルに基づいてノードデータを生成
   * ファイルの情報からノードの表示データを作成
   *
   * @param {File} file - ファイルオブジェクト
   * @returns {Object} ノードデータ
   */
  const createNodeDataFromFile = useCallback((file) => {
    const fileName = file.name;
    const extension = fileName.split(".").pop()?.toLowerCase();

    // 基本データ（全ファイル共通）
    const baseData = {
      fileName: fileName,
      fileSize: file.size,
      lastModified: file.lastModified,
    };

    // ファイルタイプ別の追加データ
    switch (extension) {
      case "csv":
        return {
          ...baseData,
          color: "#20b2aa", // ティール色
          encoding: "UTF-8",
          delimiter: ",",
          hasHeader: true,
        };
      case "json":
        return {
          ...baseData,
          color: "#f59e0b", // オレンジ色
          format: "JSON",
        };
      case "xml":
        return {
          ...baseData,
          color: "#8b5cf6", // 紫色
          format: "XML",
        };
      default:
        return {
          ...baseData,
          color: "#6b7280", // グレー色
        };
    }
  }, []);

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
      event.preventDefault();
      setIsDragOver(false);

      // ドロップされたデータを取得
      const files = Array.from(event.dataTransfer.files); // エクスプローラーからのファイル
      const filePath = event.dataTransfer.getData("application/x-file-path"); // ProjectTreeからのパス
      const fileName = event.dataTransfer.getData("application/x-file-name"); // ProjectTreeからのファイル名

      // React Flowコンテナの参照チェック
      if (!reactFlowWrapper.current) return;

      // スクリーン座標（マウスカーソル位置）
      const screenPosition = {
        x: event.clientX,
        y: event.clientY,
      };

      // エクスプローラーからのファイルドロップ処理
      if (files.length > 0) {
        files.forEach((file, index) => {
          // ファイルタイプを決定
          const nodeType = getNodeTypeFromFile(file);

          // スクリーン座標をフロー座標に変換
          const flowPosition = screenToFlowPosition({
            x: screenPosition.x,
            y: screenPosition.y + index * 100, // 複数ファイルは縦に並べる
          });

          // 中心座標として調整
          const position = adjustPositionToCenter(flowPosition, nodeType);

          // ファイルからノードデータを生成
          const nodeData = createNodeDataFromFile(file);

          // 新しいノードを作成
          const newNode = {
            id: `file-${nodeCounter + index}-${Date.now()}`, // ユニークなID
            type: nodeType,
            data: nodeData,
            position,
          };

          // ノード状態を更新
          setNodes((nds) => [...nds, newNode]);

          // 詳細ログ出力
          ConsoleMsg("info", "ファイルからノードを作成しました", {
            fileName: file.name,
            nodeType,
            dropPosition: flowPosition,
            adjustedPosition: position,
            clientPosition: screenPosition,
          });
        });

        // カウンターを更新
        setNodeCounter((prev) => prev + files.length);
      }
      // ProjectTreeからのファイルドロップ処理
      else if (filePath && fileName) {
        // ファイル拡張子からノードタイプを決定
        const extension = fileName.split(".").pop()?.toLowerCase();
        const nodeType = extension === "csv" ? "inputFileCsv" : "inputFile";

        // スクリーン座標をフロー座標に変換
        const flowPosition = screenToFlowPosition(screenPosition);

        // 中心座標として調整
        const position = adjustPositionToCenter(flowPosition, nodeType);

        // ProjectTree用のノードデータを作成
        const newNode = {
          id: `tree-file-${nodeCounter}-${Date.now()}`, // ユニークなID
          type: nodeType,
          data: {
            fileName: fileName,
            filePath: filePath,
            color: extension === "csv" ? "#20b2aa" : "#6b7280",
            // CSV固有の設定
            ...(extension === "csv" && {
              encoding: "UTF-8",
              delimiter: ",",
              hasHeader: true,
            }),
          },
          position,
        };

        // ノード状態を更新
        setNodes((nds) => [...nds, newNode]);
        setNodeCounter((prev) => prev + 1);

        // 詳細ログ出力
        ConsoleMsg("info", "ProjectTreeからノードを作成しました", {
          fileName,
          filePath,
          nodeType,
          dropPosition: flowPosition,
          adjustedPosition: position,
          clientPosition: screenPosition,
        });
      }
    },
    [nodeCounter, setNodes, screenToFlowPosition, getNodeTypeFromFile, createNodeDataFromFile, adjustPositionToCenter]
  );

  // ========================================================================================
  // レンダリング
  // ========================================================================================

  return (
    <div className="h-full w-full flex flex-col" ref={reactFlowWrapper}>
      {/* ======================================================================================== */}
      {/* ツールバー（分離されたコンポーネント） */}
      {/* ======================================================================================== */}
      <FlowEditorToolbar addTextNode={addTextNode} addSimpleNode={addSimpleNode} addCsvNode={addCsvNode} resetFlow={resetFlow} clearNodes={clearNodes} nodes={nodes} edges={edges} />

      {/* ======================================================================================== */}
      {/* React Flow メインエリア */}
      {/* ======================================================================================== */}
      <div className="flex-1">
        <ReactFlow
          // 基本状態
          nodes={nodes}
          edges={edges}
          // イベントハンドラー
          onNodesChange={onNodesChange} // ノード変更（移動、削除など）
          onEdgesChange={onEdgesChange} // エッジ変更（削除など）
          onConnect={onConnect} // ノード間接続
          onNodeClick={onNodeClick} // ノードクリック
          onEdgeClick={onEdgeClick} // エッジクリック
          // ドラッグ&ドロップ
          onDrop={onDrop} // ファイルドロップ
          onDragOver={onDragOver} // ドラッグオーバー
          onDragLeave={onDragLeave} // ドラッグリーブ
          // カスタム設定
          nodeTypes={nodeTypes} // カスタムノードタイプ
          connectionLineType={ConnectionLineType.SmoothStep} // 接続線のスタイル
          // 表示設定
          fitView // 初期表示でフロー全体を表示
          fitViewOptions={{
            padding: 0.2, // 余白を20%設定
          }}
          // スタイリング
          className="bg-base-100"
          proOptions={{
            hideAttribution: true, // React Flowのクレジット表示を隠す
          }}
        >
          {/* ======================================================================================== */}
          {/* 情報パネル（右上） - 詳細版 */}
          {/* ======================================================================================== */}
          <Panel position="top-right" className="text-sm">
            <div className="rounded bg-base-200/90 backdrop-blur-sm p-3 text-base-content shadow-lg">
              <h4 className="font-semibold mb-2 text-base">フロー詳細</h4>

              {/* 基本統計 */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>ノード:</span>
                  <span className="font-mono">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>エッジ:</span>
                  <span className="font-mono">{edges.length}</span>
                </div>
              </div>

              <div className="border-t border-base-300 pt-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>📝 テキスト:</span>
                    <span className="font-mono">{nodes.filter((n) => n.type === "customText").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⬜ シンプル:</span>
                    <span className="font-mono">{nodes.filter((n) => n.type === "customSimple").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 CSV:</span>
                    <span className="font-mono">{nodes.filter((n) => n.type === "inputFileCsv").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>📄 ファイル:</span>
                    <span className="font-mono">{nodes.filter((n) => n.type?.startsWith("inputFile")).length}</span>
                  </div>
                </div>
              </div>

              {/* ヘルプメッセージ */}
              <div className="mt-3 pt-2 border-t border-base-300">
                <div className="text-xs text-base-content/70">💡 ファイルをD&Dで追加</div>
              </div>
            </div>
          </Panel>

          {/* ======================================================================================== */}
          {/* ミニマップ */}
          {/* ======================================================================================== */}
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case "customText":
                  return "#14b8a6"; // ティール
                case "customSimple":
                  return "#3b82f6"; // 青
                case "inputFileCsv":
                  return "#20b2aa"; // ティール（濃い）
                case "input":
                  return "#22c55e"; // 緑
                case "output":
                  return "#ef4444"; // 赤
                default:
                  return "#6b7280"; // グレー
              }
            }}
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-base-300/50 backdrop-blur-sm"
          />

          {/* ======================================================================================== */}
          {/* コントロール */}
          {/* ======================================================================================== */}
          <Controls className="bg-base-200/90 backdrop-blur-sm text-base-content" showZoom={true} showFitView={true} showInteractive={true} />

          {/* ======================================================================================== */}
          {/* 背景 */}
          {/* ======================================================================================== */}
          <Background variant="dots" gap={20} size={1} color="#94a3b8" className="bg-base-100" />
        </ReactFlow>
      </div>
    </div>
  );
}

// ========================================================================================
// メインエクスポートコンポーネント
// ========================================================================================

/**
 * FlowEditor メインコンポーネント（ReactFlowProviderでラップ）
 *
 * ReactFlowProviderは、React Flowの機能（useReactFlowなど）を
 * 子コンポーネントで使用可能にするためのコンテキストプロバイダー。
 * FlowEditorInnerコンポーネントでuseReactFlowを使用するため、
 * このラッパーが必要。
 *
 * @param {Object} props - プロパティ
 * @param {string} props.initialMode - 初期モード（"default" | "empty"）
 */
function FlowEditor({ initialMode = "default" }) {
  return (
    <ReactFlowProvider>
      <FlowEditorInner initialMode={initialMode} />
    </ReactFlowProvider>
  );
}

// ========================================================================================
// エクスポート
// ========================================================================================

export default FlowEditor;
