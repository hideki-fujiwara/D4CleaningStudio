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
import {
  Button,
  Group,
  Separator,
  ToggleButton,
  Toolbar as AriaToolbar,
  OverlayArrow,
  Tooltip,
  TooltipTrigger,
  Checkbox,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  Label,
} from "react-aria-components";
import {
  SaveIcon, // 保存
  SaveAsIcon, // 別名で保存
  OpenIcon, // ファイルを開く
  NewFileIcon, // 新規ファイル
  UndoIcon, // 元に戻す
  RedoIcon, // やり直し
  CopyIcon, // コピー
  PasteIcon, // ペースト
  DeleteIcon, // 削除
  PlayIcon, // 実行
  StepIcon, // ステップ実行
  GridIcon, // グリッド表示
  SnapIcon, // スナップ機能
  TextIcon, // テキストノード追加
  NodeIcon, // シンプルノード追加
  CsvIcon, // CSVノード追加
  ResetIcon, // 初期状態にリセット
  TrashIcon, // すべてクリア
} from "../Icons";

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
  base: "bg-base-content text-base-100 px-2 py-1 rounded text-sm shadow-lg z-[9999]",
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
      <OverlayArrow>
        <svg width={6} height={6} viewBox="0 0 6 6" className="fill-base-content">
          <path d="m0 0 3 3 3-3Z" />
        </svg>
      </OverlayArrow>
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
      <OverlayArrow>
        <svg width={6} height={6} viewBox="0 0 6 6" className="fill-base-content">
          <path d="m0 0 3 3 3-3Z" />
        </svg>
      </OverlayArrow>
    </Tooltip>
  </TooltipTrigger>
);

/**
 * ドラッグ可能なノードアイテムコンポーネント
 *
 * @param {Object} props - プロパティ
 * @param {string} props.nodeType - ノードタイプ
 * @param {string} props.tooltip - ツールチップテキスト
 * @param {React.ReactNode} props.children - アイコンコンテンツ
 */
const DraggableNodeItem = ({ nodeType, tooltip, children, className = BUTTON_STYLES.default }) => {
  return (
    <div
      className={`${className} cursor-grab active:cursor-grabbing`}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData("application/reactflow", nodeType);
        e.dataTransfer.setData("text/plain", nodeType);
        e.dataTransfer.effectAllowed = "copy";
      }}
    >
      {children}
    </div>
  );
};

// ================================================================
// ツールバーグループコンポーネント
// ================================================================

/**
 * ファイル操作グループ
 * 新規作成、新しいタブで作成、ファイルを開く、保存、別名で保存の機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {Function} props.saveFlow - 保存機能
 * @param {Function} props.saveAsFlow - 名前をつけて保存機能
 * @param {Function} props.newFlow - 新規ファイル作成機能（現在のタブ）
 * @param {Function} props.newFlowInNewTab - 新しいタブで新規ファイル作成機能
 * @param {Function} props.openFlow - ファイルを開く機能
 * @param {boolean} props.hasUnsavedChanges - 未保存の変更があるかどうか
 */
const FileOperationsGroup = ({ saveFlow, saveAsFlow, newFlow, openFlow, hasUnsavedChanges }) => (
  <Group className="flex items-center gap-1">
    <TooltipButton tooltip="新規タブで作成 (Ctrl+N)" onPress={newFlow}>
      <NewFileIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="ファイルを開く (Ctrl+O)" onPress={openFlow}>
      <OpenIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="保存 (Ctrl+S)" onPress={saveFlow} className={hasUnsavedChanges ? BUTTON_STYLES.warning : BUTTON_STYLES.default}>
      <SaveIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="別名で保存 (Ctrl+Shift+S)" onPress={saveAsFlow}>
      <SaveAsIcon className={`${BUTTON_STYLES.iconSize} text-[color:var(--color-warning)]`} />
    </TooltipButton>
  </Group>
);

/**
 * 編集操作グループ
 * 元に戻す、やり直し、コピー、ペースト、削除の機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {Object} props.copyPaste - コピー・ペースト・削除機能のオブジェクト
 * @param {Function} props.undo - Undo機能
 * @param {Function} props.redo - Redo機能
 * @param {boolean} props.canUndo - Undo可能かどうか
 * @param {boolean} props.canRedo - Redo可能かどうか
 */
const EditOperationsGroup = ({ copyPaste, undo, redo, canUndo, canRedo }) => (
  <Group className="flex items-center gap-1">
    <TooltipButton tooltip="元に戻す (Ctrl+Z)" isDisabled={!canUndo} onPress={undo}>
      <UndoIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="やり直し (Ctrl+R)" isDisabled={!canRedo} onPress={redo}>
      <RedoIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    {/* セパレーター */}
    <div className="w-px h-6 bg-base-300 mx-1" />

    <TooltipButton
      tooltip={`ノードをコピー (Ctrl+C)${copyPaste?.hasSelection ? ` - ${copyPaste.selectedCount}個選択中` : ""}`}
      isDisabled={!copyPaste?.hasSelection}
      onPress={copyPaste?.copySelectedNodes}
    >
      <CopyIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip={`ノードをペースト (Ctrl+V)${copyPaste?.hasClipboard ? ` - ${copyPaste.clipboardCount}個` : ""}`} isDisabled={!copyPaste?.hasClipboard} onPress={copyPaste?.pasteNodes}>
      <PasteIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton
      tooltip={`選択要素を削除 (Delete)${copyPaste?.hasSelection ? ` - ${copyPaste.selectedCount}個選択中` : ""}`}
      isDisabled={!copyPaste?.hasSelection}
      onPress={copyPaste?.deleteSelectedElements}
    >
      <DeleteIcon className={`${BUTTON_STYLES.iconSize} text-red-600 hover:text-red-700`} />
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
      <PlayIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton
      tooltip="ステップ実行 (F10)"
      isDisabled={true} // TODO: ステップ実行機能実装時にfalseに
    >
      <StepIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>
  </Group>
);

/**
 * 表示設定グループ
 * グリッド表示、スナップ機能、ズーム制御の切り替えを提供
 *
 * @param {Object} props - プロパティ
 * @param {boolean} props.isZoomDisabled - ズーム機能の無効状態
 * @param {function} props.onZoomDisableChange - ズーム無効状態変更ハンドラー
 * @param {number} props.zoom - 現在のズーム率
 * @param {function} props.onZoomChange - ズーム率変更ハンドラー
 */
const ViewSettingsGroup = ({ isZoomDisabled = false, onZoomDisableChange, zoom = 1, onZoomChange }) => (
  <Group className="flex items-center gap-1">
    <TooltipToggleButton tooltip="グリッド表示を切り替え" defaultPressed={true}>
      <GridIcon className={BUTTON_STYLES.iconSize} />
    </TooltipToggleButton>

    <TooltipToggleButton tooltip="スナップ機能を切り替え" defaultPressed={false}>
      <SnapIcon className={BUTTON_STYLES.iconSize} />
    </TooltipToggleButton>

    {/* セパレーター */}
    <div className="w-px h-4 bg-base-300 mx-1" />

    {/* ズーム制御チェックボックス */}
    <div className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-base-300 transition-colors cursor-pointer">
      <Checkbox isSelected={isZoomDisabled} onChange={onZoomDisableChange} className="flex items-center gap-0.5">
        <div className="w-4 h-4 border border-base-400 rounded bg-base-100 flex items-center justify-center data-[selected]:bg-primary data-[selected]:border-primary transition-colors">
          {isZoomDisabled && (
            <svg className="w-3 h-3 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span className="text-sm text-base-content">{isZoomDisabled ? "🔒" : "🔓"}</span>
      </Checkbox>
      <Slider value={zoom * 100} onChange={(value) => onZoomChange && onZoomChange(value / 100)} minValue={25} maxValue={300} step={5} isDisabled={isZoomDisabled} className="w-36 flex items-center">
        <div className="flex items-center w-full relative">
          <SliderTrack className="w-full h-2 bg-base-300 rounded-full relative overflow-visible cursor-pointer">
            <div className="h-full bg-primary rounded-full transition-all duration-200 ease-out" style={{ width: `${((zoom * 100 - 25) / (300 - 25)) * 100}%` }} />
          </SliderTrack>
          <SliderThumb
            className="w-5 h-5 bg-white border-2 border-primary rounded-full shadow-lg cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out absolute"
            style={{
              left: `calc(${((zoom * 100 - 25) / (300 - 25)) * 100}% - 10px)`,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
        </div>
        <Label className="text-sm text-base-content font-mono">{Math.round(zoom * 100)}%</Label>
      </Slider>
    </div>
  </Group>
);

/**
 * ノード追加グループ
 * 各種ノードの追加機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {function} props.onAddTextNode - テキストノード追加ハンドラー
 * @param {function} props.onAddSimpleNode - シンプルノード追加ハンドラー
 * @param {function} props.onAddCsvNode - CSVノード追加ハンドラー
 */
const NodeAdditionGroup = ({ onAddTextNode, onAddSimpleNode, onAddCsvNode }) => (
  <Group className="flex items-center gap-1">
    {/* クリック追加ボタン */}
    <TooltipButton tooltip="テキストノードを追加" onPress={onAddTextNode}>
      <TextIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="シンプルノードを追加" onPress={onAddSimpleNode}>
      <NodeIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton tooltip="CSVノードを追加" onPress={onAddCsvNode}>
      <CsvIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    {/* セパレーター */}
    <div className="w-px h-6 bg-base-300 mx-1" />

    {/* ドラッグ可能アイテム */}
    <DraggableNodeItem nodeType="customText" tooltip="テキストノードをドラッグ&ドロップ">
      <TextIcon className={BUTTON_STYLES.iconSize} />
    </DraggableNodeItem>

    <DraggableNodeItem nodeType="customSimple" tooltip="シンプルノードをドラッグ&ドロップ">
      <NodeIcon className={BUTTON_STYLES.iconSize} />
    </DraggableNodeItem>

    <DraggableNodeItem nodeType="inputFileCsv" tooltip="CSVノードをドラッグ&ドロップ">
      <CsvIcon className={BUTTON_STYLES.iconSize} />
    </DraggableNodeItem>
  </Group>
);

/**
 * フロー操作グループ
 * リセット、全削除の機能を提供
 *
 * @param {Object} props - プロパティ
 * @param {function} props.onReset - フローリセットハンドラー
 * @param {function} props.onClearAll - 全ノードクリアハンドラー
 */
const FlowOperationsGroup = ({ onReset, onClearAll }) => (
  <Group className="flex items-center gap-1">
    <TooltipButton
      tooltip="フローを初期状態にリセット"
      onPress={() => {
        onReset();
      }}
    >
      <ResetIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>

    <TooltipButton
      tooltip={
        <div className="text-center">
          <div className="text-red-300 font-semibold">⚠️ 注意</div>
          <div>すべてのノードをクリア</div>
          <div className="text-xs text-red-200">(復元できません)</div>
        </div>
      }
      onPress={onClearAll}
    >
      <TrashIcon className={BUTTON_STYLES.iconSize} />
    </TooltipButton>
  </Group>
);

/**
 * 統計情報表示
 * ノード数、エッジ数、ズーム率、コピー・ペースト・削除状態の統計を表示
 *
 * @param {Object} props - プロパティ
 * @param {number} props.nodeCount - ノード数
 * @param {number} props.edgeCount - エッジ数
 * @param {number} props.zoom - ズーム率
 * @param {Object} props.copyPaste - コピー・ペースト・削除状態
 * @param {number} props.historyLength - 履歴件数
 * @param {number} props.currentHistoryIndex - 現在の履歴インデックス
 */
const StatisticsDisplay = ({ nodeCount, edgeCount, zoom, copyPaste, historyLength, currentHistoryIndex }) => {
  return (
    <TooltipTrigger delay={TOOLTIP_CONFIG.delay} closeDelay={TOOLTIP_CONFIG.closeDelay}>
      <div className="text-sm text-base-content/70 px-3 py-2 bg-base-100 rounded border border-base-300 cursor-help flex items-center gap-3">
        <span className="font-mono">ノード: {nodeCount}</span>
        <span className="text-base-300">|</span>
        <span className="font-mono">エッジ: {edgeCount}</span>
        <span className="text-base-300">|</span>
        <span className="font-mono">倍率: {Math.round(zoom * 100)}%</span>
        <span className="text-base-300">|</span>
        <span className="font-mono">履歴: {historyLength > 0 ? `${currentHistoryIndex}/${historyLength}` : "0"}</span>
        {copyPaste && (
          <>
            <span className="text-base-300">|</span>
            <span className="font-mono">選択: {copyPaste.selectedCount}</span>
            {copyPaste.hasClipboard && (
              <>
                <span className="text-base-300">|</span>
                <span className="font-mono text-blue-600">📋 {copyPaste.clipboardCount}</span>
              </>
            )}
          </>
        )}
      </div>
      <Tooltip className={TOOLTIP_STYLES.base} offset={TOOLTIP_CONFIG.offset}>
        <div className="text-center">
          <div className="font-semibold mb-2">フロー統計情報</div>
          <div className="text-xs space-y-1">
            <div>📦 総ノード数: {nodeCount}</div>
            <div>🔗 総エッジ数: {edgeCount}</div>
            <div>🔍 表示倍率: {Math.round(zoom * 100)}%</div>
            {copyPaste && (
              <>
                <div className="border-t border-base-content/20 pt-1 mt-2">
                  <div>✅ 選択ノード: {copyPaste.selectedCount}</div>
                  <div>📋 クリップボード: {copyPaste.clipboardCount}</div>
                  {copyPaste.hasSelection && <div className="text-green-400">Ctrl+C でコピー可能</div>}
                  {copyPaste.hasClipboard && <div className="text-blue-400">Ctrl+V でペースト可能</div>}
                  {copyPaste.hasSelection && <div className="text-red-400">Delete で削除可能</div>}
                </div>
              </>
            )}
            <div className="border-t border-base-content/20 pt-1 mt-2">
              <div>ズーム: {zoom.toFixed(2)}x</div>
              <div>📚 履歴: {historyLength}件</div>
              {historyLength > 0 && (
                <div>
                  📍 現在位置: {currentHistoryIndex}/{historyLength}
                </div>
              )}
            </div>
          </div>
        </div>
        <OverlayArrow>
          <svg width={6} height={6} viewBox="0 0 6 6" className="fill-base-content">
            <path d="m0 0 3 3 3-3Z" />
          </svg>
        </OverlayArrow>
      </Tooltip>
    </TooltipTrigger>
  );
};

// ================================================================
// メインツールバーコンポーネント
// ================================================================

/**
 * FlowEditor用ツールバーコンポーネント
 *
 * @param {Object} props - プロパティ
 * @param {function} props.onAddTextNode - テキストノード追加ハンドラー
 * @param {function} props.onAddSimpleNode - シンプルノード追加ハンドラー
 * @param {function} props.onAddCsvNode - CSVノード追加ハンドラー
 * @param {function} props.onReset - フローリセットハンドラー
 * @param {function} props.onClearAll - 全ノードクリアハンドラー
 * @param {number} props.nodeCount - ノード数（統計情報用）
 * @param {number} props.edgeCount - エッジ数（統計情報用）
 * @param {number} props.zoom - ズーム率（統計情報用）
 * @param {boolean} props.isZoomDisabled - ズーム機能の無効状態
 * @param {function} props.onZoomDisableChange - ズーム無効状態変更ハンドラー
 * @param {function} props.onZoomChange - ズーム率変更ハンドラー
 * @param {Object} props.copyPaste - コピー・ペースト・削除機能のオブジェクト
 * @param {function} props.undo - Undo機能
 * @param {function} props.redo - Redo機能
 * @param {boolean} props.canUndo - Undo可能かどうか
 * @param {boolean} props.canRedo - Redo可能かどうか
 * @param {function} props.saveFlow - 保存機能
 * @param {function} props.saveAsFlow - 名前をつけて保存機能
 * @param {function} props.newFlow - 新規ファイル作成機能
 * @param {function} props.newFlowInNewTab - 新しいタブで新規ファイル作成機能
 * @param {function} props.openFlow - ファイルを開く機能
 * @param {boolean} props.hasUnsavedChanges - 未保存の変更があるかどうか
 */
const FlowEditorToolbar = ({
  onAddTextNode,
  onAddSimpleNode,
  onAddCsvNode,
  onReset,
  onClearAll,
  nodeCount = 0,
  edgeCount = 0,
  zoom = 1,
  isZoomDisabled = false,
  onZoomDisableChange,
  onZoomChange,
  copyPaste,
  // 履歴管理
  undo,
  redo,
  canUndo = false,
  canRedo = false,
  historyLength = 0,
  currentHistoryIndex = -1,
  // ファイル保存
  saveFlow,
  saveAsFlow,
  newFlow,
  openFlow,
  hasUnsavedChanges = false,
}) => {
  return (
    <div className="bg-base-200">
      <AriaToolbar className="flex items-center px-1 py-1 gap-0">
        {/* ファイル操作グループ */}
        <FileOperationsGroup saveFlow={saveFlow} saveAsFlow={saveAsFlow} newFlow={newFlow} openFlow={openFlow} hasUnsavedChanges={hasUnsavedChanges} />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 編集操作グループ */}
        <EditOperationsGroup copyPaste={copyPaste} undo={undo} redo={redo} canUndo={canUndo} canRedo={canRedo} />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 実行グループ */}
        <ExecutionGroup />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* 表示設定グループ */}
        <ViewSettingsGroup isZoomDisabled={isZoomDisabled} onZoomDisableChange={onZoomDisableChange} zoom={zoom} onZoomChange={onZoomChange} />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* ノード追加グループ */}
        <NodeAdditionGroup onAddTextNode={onAddTextNode} onAddSimpleNode={onAddSimpleNode} onAddCsvNode={onAddCsvNode} />

        <Separator className={`w-px ${BUTTON_STYLES.separatorHeight} bg-base-300 mx-2`} />

        {/* フロー操作グループ */}
        <FlowOperationsGroup onReset={onReset} onClearAll={onClearAll} />

        {/* 右端のスペーサー */}
        <div className="flex-1" />

        {/* 統計情報 */}
        <StatisticsDisplay nodeCount={nodeCount} edgeCount={edgeCount} zoom={zoom} copyPaste={copyPaste} historyLength={historyLength} currentHistoryIndex={currentHistoryIndex} />
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
