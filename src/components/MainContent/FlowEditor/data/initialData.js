/**
 * ================================================================
 * FlowEditor 初期データ定義
 * ================================================================
 *
 * FlowEditorで使用するデフォルトのノードとエッジのデータを定義
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */

/**
 * 初期ノードデータ（カスタムスタイル付き）
 * アプリケーション起動時に表示されるデフォルトのノード群
 */
export const initialNodes = [
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
export const initialEdges = [
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
