/**
 * ================================================================
 * FlowEditor用ツールバーコンポーネント
 * ================================================================
 *
 * FlowEditorで使用するツールバーの独立コンポーネント
 * ファイル操作、編集操作、実行、表示設定、ノード追加、フロー操作の
 * 各機能グループを含む
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */
import React from "react";
import { Button, Group, Separator, ToggleButton, Toolbar as AriaToolbar, OverlayArrow, Tooltip, TooltipTrigger } from "react-aria-components";
import {
  SaveIcon, // 保存
  SaveAsIcon, // 別名で保存
  UndoIcon, // 元に戻す
  RedoIcon, // やり直し
  PlayIcon, // 実行
  StepIcon, // ステップ実行
  GridIcon, // グリッド表示
  SnapIcon, // スナップ機能
  TextIcon, // テキストノード追加
  NodeIcon, // シンプルノード追加
  CsvIcon, // CSVノード追加
  ResetIcon, // 初期状態にリセット
  TrashIcon, // すべてクリア
} from "./icons";

// ================================================================
// ツールチップ設定定数
// ================================================================

/**
 * ツールチップの表示タイミング設定
 */
const TOOLTIP_CONFIG = {
  delay: 200, // ホバー開始からツールチップ表示までの時間（ミリ秒）
  closeDelay: 50, // ホバー終了からツールチップ非表示までの時間（ミリ秒）
  offset: 8, // ツールチップとトリガーの距離（ピクセル）
};

/**
 * ツールチップのスタイル設定
 */
const TOOLTIP_STYLES = {
  base: "bg-base-content text-base-100 px-2 py-1 rounded text-sm shadow-lg z-50",
  arrow: "fill-base-content",
  defaultSize: 6, // デフォルトの矢印サイズ
};

/**
 * ボタンのスタイル設定
 */
const BUTTON_STYLES = {
  default: "bg-base-300 hover:bg-base-400 rounded transition-colors disabled:opacity-50",
  toggle: "bg-base-300 hover:bg-base-400 rounded transition-colors data-[pressed]:bg-primary data-[pressed]:text-primary-content",
  iconSize: "w-6 h-6", // デフォルトのアイコンサイズ
  separatorHeight: "h-6", // セパレーターの高さ（アイコンサイズに合わせる）
};

// ================================================================
// ツールチップ用の矢印コンポーネント
// ================================================================

/**
 * ツールチップ用の矢印アイコン
 * react-aria-componentsのOverlayArrowで使用
 */
const TooltipArrow = () => (
  <OverlayArrow>
    <svg width={TOOLTIP_STYLES.defaultSize} height={TOOLTIP_STYLES.defaultSize} viewBox={`0 0 ${TOOLTIP_STYLES.defaultSize} ${TOOLTIP_STYLES.defaultSize}`} className={TOOLTIP_STYLES.arrow}>
      <path d={`m0 0 ${TOOLTIP_STYLES.defaultSize / 2} ${TOOLTIP_STYLES.defaultSize / 2} ${TOOLTIP_STYLES.defaultSize / 2}-${TOOLTIP_STYLES.defaultSize / 2}Z`} />
    </svg>
  </OverlayArrow>
);

// ================================================================
// ツールチップ付きボタンコンポーネント
// ================================================================

/**
 * ツールチップ付きボタンの共通コンポーネント
 *
 * @param {Object} props - ボタンのプロパティ
 * @param {React.ReactNode} props.children - ボタン内のコンテンツ（通常はアイコン）
 * @param {string|React.ReactNode} props.tooltip - ツールチップのテキストまたはJSX
 * @param {function} props.onPress - ボタンクリック時のハンドラー
 * @param {boolean} props.isDisabled - ボタンの無効状態
 * @param {string} props.className - 追加のCSSクラス
 */
const TooltipButton = ({ children, tooltip, onPress, isDisabled = false, className = BUTTON_STYLES.default, ...props }) => (
  <TooltipTrigger delay={TOOLTIP_CONFIG.delay} closeDelay={TOOLTIP_CONFIG.closeDelay}>
    <Button className={className} onPress={onPress} isDisabled={isDisabled} {...props}>
      {children}
    </Button>
    <Tooltip className={TOOLTIP_STYLES.base} offset={TOOLTIP_CONFIG.offset}>
      {tooltip}
      <TooltipArrow />
    </Tooltip>
  </TooltipTrigger>
);

/**
 * ツールチップ付きトグルボタンの共通コンポーネント
 *
 * @param {Object} props - トグルボタンのプロパティ
 * @param {React.ReactNode} props.children - ボタン内のコンテンツ（通常はアイコン）
 * @param {string|React.ReactNode} props.tooltip - ツールチップのテキストまたはJSX
 * @param {boolean} props.defaultPressed - デフォルトの押下状態
 * @param {string} props.className - 追加のCSSクラス
 */
const TooltipToggleButton = ({ children, tooltip, defaultPressed = false, className = BUTTON_STYLES.toggle, ...props }) => (
  <TooltipTrigger delay={TOOLTIP_CONFIG.delay} closeDelay={TOOLTIP_CONFIG.closeDelay}>
    <ToggleButton className={className} defaultPressed={defaultPressed} {...props}>
      {children}
    </ToggleButton>
    <Tooltip className={TOOLTIP_STYLES.base} offset={TOOLTIP_CONFIG.offset}>
      {tooltip}
      <TooltipArrow />
    </Tooltip>
  </TooltipTrigger>
);

// ================================================================
// ツールバーグループコンポーネント
// ================================================================

/**
 * ファイル操作グループ
 * 保存、別名で保存の機能を提供
 */
const FileOperationsGroup = () => (
  <Group className="flex items-center gap-1">
    <TooltipButton
      tooltip="保存 (Ctrl+S)"
      isDisabled={false} // TODO: 保存機能実装時の制御
    >
      <SaveIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>

    <TooltipButton
      tooltip="別名で保存 (Ctrl+Shift+S)"
      isDisabled={false} // TODO: 別名保存機能実装時の制御
    >
      <SaveAsIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>
  </Group>
);

/**
 * 編集操作グループ
 * 元に戻す、やり直しの機能を提供
 */
const EditOperationsGroup = () => (
  <Group className="flex items-center gap-1">
    <TooltipButton
      tooltip="元に戻す (Ctrl+Z)"
      isDisabled={true} // TODO: Undo機能実装時にfalseに
    >
      <UndoIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>

    <TooltipButton
      tooltip="やり直し (Ctrl+Y)"
      isDisabled={true} // TODO: Redo機能実装時にfalseに
    >
      <RedoIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>
  </Group>
);

/**
 * 実行操作グループ
 * フロー実行、ステップ実行の機能を提供
 */
const ExecutionGroup = () => (
  <Group className="flex items-center gap-1">
    <TooltipButton
      tooltip="フローを実行 (F5)"
      isDisabled={true} // TODO: フロー実行機能実装時にfalseに
    >
      <PlayIcon className={BUTTON_STYLES.iconSize} color="#22c55e" />
    </TooltipButton>

    <TooltipButton
      tooltip="ステップ実行 (F10)"
      isDisabled={true} // TODO: ステップ実行機能実装時にfalseに
    >
      <StepIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>
  </Group>
);

/**
 * 表示設定グループ
 * グリッド表示、スナップ機能の切り替えを提供
 */
const ViewSettingsGroup = () => (
  <Group className="flex items-center gap-1">
    <TooltipToggleButton tooltip="グリッド表示を切り替え" defaultPressed={true}>
      <GridIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipToggleButton>

    <TooltipToggleButton tooltip="スナップ機能を切り替え" defaultPressed={false}>
      <SnapIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipToggleButton>
  </Group>
);

/**
 * ノード追加グループ
 * 各種ノードの追加機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {function} props.addTextNode - テキストノード追加ハンドラー
 * @param {function} props.addSimpleNode - シンプルノード追加ハンドラー
 * @param {function} props.addCsvNode - CSVノード追加ハンドラー
 */
const NodeAdditionGroup = ({ addTextNode, addSimpleNode, addCsvNode }) => (
  <Group className="flex items-center gap-1">
    <TooltipButton tooltip="テキストノードを追加" onPress={addTextNode}>
      <TextIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>

    <TooltipButton tooltip="シンプルノードを追加" onPress={addSimpleNode}>
      <NodeIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>

    <TooltipButton tooltip="CSVノードを追加" onPress={addCsvNode}>
      <CsvIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>
  </Group>
);

/**
 * フロー操作グループ
 * リセット、全削除の機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {function} props.resetFlow - フローリセットハンドラー
 * @param {function} props.clearNodes - 全ノードクリアハンドラー
 */
const FlowOperationsGroup = ({ resetFlow, clearNodes }) => (
  <Group className="flex items-center gap-1">
    <TooltipButton tooltip="フローを初期状態にリセット" onPress={resetFlow}>
      <ResetIcon className={BUTTON_STYLES.iconSize} color="currentColor" />
    </TooltipButton>

    <TooltipButton
      tooltip={
        <div className="text-center">
          <div className="text-red-300 font-semibold">⚠️ 注意</div>
          <div>すべてのノードをクリア</div>
          <div className="text-xs text-red-200">(復元できません)</div>
        </div>
      }
      onPress={clearNodes}
    >
      <TrashIcon className={BUTTON_STYLES.iconSize} color="#ef4444" />
    </TooltipButton>
  </Group>
);

/**
 * 統計情報表示
 * ノード数、エッジ数、各種ノードタイプの統計を表示
 *
 * @param {Object} props - プロパティ
 * @param {Array} props.nodes - ノードの配列
 * @param {Array} props.edges - エッジの配列
 */
const StatisticsDisplay = ({ nodes, edges }) => (
  <TooltipTrigger delay={TOOLTIP_CONFIG.delay} closeDelay={TOOLTIP_CONFIG.closeDelay}>
    <div className="text-sm text-base-content/70 px-2 py-2 bg-base-100 rounded border border-base-300 cursor-help">
      <span className="font-mono">ノード: {nodes.length}</span>
      <span className="mx-2">|</span>
      <span className="font-mono">エッジ: {edges.length}</span>
    </div>
    <Tooltip className={TOOLTIP_STYLES.base} offset={TOOLTIP_CONFIG.offset}>
      <div className="text-center">
        <div className="font-semibold mb-1">フロー統計情報</div>
        <div className="text-xs space-y-1">
          <div>📝 テキスト: {nodes.filter((n) => n.type === "customText").length}</div>
          <div>⬜ シンプル: {nodes.filter((n) => n.type === "customSimple").length}</div>
          <div>📊 CSV: {nodes.filter((n) => n.type === "inputFileCsv").length}</div>
        </div>
      </div>
      <TooltipArrow />
    </Tooltip>
  </TooltipTrigger>
);

// ================================================================
// メインツールバーコンポーネント
// ================================================================

/**
 * FlowEditor用ツールバーコンポーネント
 *
 * @param {Object} props - プロパティ
 * @param {function} props.addTextNode - テキストノード追加ハンドラー
 * @param {function} props.addSimpleNode - シンプルノード追加ハンドラー
 * @param {function} props.addCsvNode - CSVノード追加ハンドラー
 * @param {function} props.resetFlow - フローリセットハンドラー
 * @param {function} props.clearNodes - 全ノードクリアハンドラー
 * @param {Array} props.nodes - ノードの配列（統計情報用）
 * @param {Array} props.edges - エッジの配列（統計情報用）
 */
const FlowEditorToolbar = ({ addTextNode, addSimpleNode, addCsvNode, resetFlow, clearNodes, nodes = [], edges = [] }) => {
  return (
    <div className="bg-base-200">
      <AriaToolbar className="flex items-center px-1 py-1 gap-0">
        {/* ファイル操作グループ */}
        <FileOperationsGroup />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 編集操作グループ */}
        <EditOperationsGroup />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 実行グループ */}
        <ExecutionGroup />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 表示設定グループ */}
        <ViewSettingsGroup />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* ノード追加グループ */}
        <NodeAdditionGroup addTextNode={addTextNode} addSimpleNode={addSimpleNode} addCsvNode={addCsvNode} />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* フロー操作グループ */}
        <FlowOperationsGroup resetFlow={resetFlow} clearNodes={clearNodes} />

        {/* 右端のスペーサー */}
        <div className="flex-1" />

        {/* 統計情報 */}
        {/* <StatisticsDisplay nodes={nodes} edges={edges} /> */}
      </AriaToolbar>
    </div>
  );
};

// ================================================================
// エクスポート
// ================================================================

export default FlowEditorToolbar;

/**
 * 設定定数のエクスポート（必要に応じて外部から変更可能）
 */
export { TOOLTIP_CONFIG, TOOLTIP_STYLES, BUTTON_STYLES };

/**
 * 個別コンポーネントのエクスポート（必要に応じて）
 */
export { FileOperationsGroup, EditOperationsGroup, ExecutionGroup, ViewSettingsGroup, NodeAdditionGroup, FlowOperationsGroup, StatisticsDisplay, TooltipButton, TooltipToggleButton };
