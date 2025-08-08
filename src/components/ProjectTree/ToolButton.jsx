import React, { memo } from "react";
import { Button, Tooltip, TooltipTrigger, OverlayArrow } from "react-aria-components";

/**
 * ツールバー用のアイコンボタンコンポーネント
 * ツールチップ付きの小さなアイコンボタンを提供
 *
 * @param {function} onPress - ボタンがクリックされた時のコールバック
 * @param {string} icon - アイコンのCSSクラス名 (Lucide Icons)
 * @param {string} label - ツールチップに表示するラベル（アクセシビリティにも使用）
 * @param {string} color - アイコンの色クラス（デフォルト: text-gray-500）
 */
const ToolButton = memo(({ onPress, icon, label, color = "text-gray-500" }) => (
  <TooltipTrigger>
    {/* メインボタン */}
    <Button
      className="inline-flex items-center justify-center p-2 h-8 w-8 rounded hover:bg-base-300"
      onPress={onPress}
      aria-label={label} // スクリーンリーダー対応
    >
      {/* アイコン部分 */}
      <div className={`${icon} ${color} w-4 h-4`} />
    </Button>

    {/* ツールチップ */}
    <Tooltip className="bg-base-300 text-base-content text-xs px-2 py-1 rounded shadow-lg border border-base-200 z-50">
      {/* ツールチップの矢印 */}
      <OverlayArrow>
        <svg width={8} height={8} viewBox="0 0 8 8" className="fill-base-300">
          <path d="m0 0 4 4 4-4" />
        </svg>
      </OverlayArrow>
      {label}
    </Tooltip>
  </TooltipTrigger>
));

// React DevToolsでの表示名を設定
ToolButton.displayName = "ToolButton";

export default ToolButton;
