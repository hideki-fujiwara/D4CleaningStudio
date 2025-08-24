import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";

/**
 * ディスクSVGアイコンコンポーネント
 */
const DiskIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 外側の円（ディスク本体） */}
    <circle cx="12" cy="12" r="10" fill={color} stroke="currentColor" strokeWidth="1" />

    {/* 内側の円（ディスクの穴） */}
    <circle cx="12" cy="12" r="3" fill="white" stroke="currentColor" strokeWidth="1" />

    {/* ディスクのラベル部分（オプション） */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);

/**
 * フロッピーディスクSVGアイコン（レトロ風）
 */
const FloppyDiskIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* ディスクケース */}
    <rect x="3" y="3" width="18" height="18" rx="2" fill={color} stroke="currentColor" strokeWidth="1" />

    {/* ラベル部分 */}
    <rect x="5" y="5" width="14" height="4" fill="white" stroke="currentColor" strokeWidth="0.5" />

    {/* 書き込み保護穴 */}
    <rect x="16" y="6" width="2" height="2" fill="currentColor" />

    {/* 磁気ディスク部分 */}
    <circle cx="12" cy="15" r="4" fill="white" stroke="currentColor" strokeWidth="1" />

    {/* 中央の穴 */}
    <circle cx="12" cy="15" r="1" fill="currentColor" />
  </svg>
);

/**
 * ハードディスクSVGアイコン（モダン風）
 */
const HardDiskIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* ハードディスクケース */}
    <rect x="2" y="6" width="20" height="12" rx="2" fill={color} stroke="currentColor" strokeWidth="1" />

    {/* ディスクプラッタ */}
    <ellipse cx="12" cy="12" rx="8" ry="4" fill="white" stroke="currentColor" strokeWidth="1" />

    {/* 中央軸 */}
    <circle cx="12" cy="12" r="1" fill="currentColor" />

    {/* 読み取りヘッド */}
    <rect x="18" y="10" width="3" height="4" rx="1" fill="currentColor" />

    {/* LED表示 */}
    <circle cx="20" cy="8" r="1" fill="#ef4444" />
  </svg>
);

/**
 * CD/DVDディスクSVGアイコン
 */
const CDDiskIcon = ({ size = 32, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* 外側の円 */}
    <circle cx="12" cy="12" r="10" fill={color} stroke="currentColor" strokeWidth="1" />

    {/* 反射効果のためのグラデーション円 */}
    <circle cx="12" cy="12" r="8" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

    <circle cx="12" cy="12" r="6" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

    {/* 中央の穴 */}
    <circle cx="12" cy="12" r="2" fill="white" stroke="currentColor" strokeWidth="1" />

    {/* ディスクのラベル */}
    <text x="12" y="8" textAnchor="middle" fontSize="6" fill="white" fontFamily="Arial, sans-serif">
      DVD
    </text>
  </svg>
);

/**
 * カスタムシンプルノード（リサイズ対応）
 */
const CustomSimpleNode = memo(({ data, isConnectable, selected }) => {
  // ノードのサイズ状態（大きいサイズに変更）
  const [nodeSize, setNodeSize] = useState({
    width: data.width || 240,
    height: data.height || 180,
  });

  // デフォルトスタイル
  const defaultStyle = {
    header: {
      bgColor: "bg-blue-500",
      textColor: "text-white",
    },
    container: {
      bgColor: "bg-white",
      borderColor: "border-blue-500",
    },
    content: {
      bgColor: "bg-blue-50",
      textColor: "text-gray-800",
    },
    resizer: {
      enabled: true, // リサイズ可能フラグ
      color: "#3b82f6", // 青色
      handleSize: 8, // ハンドルサイズを大きく
      lineWidth: 2, // 線を太く
      lineStyle: "dashed", // 点線
    },
  };

  const style = { ...defaultStyle, ...data.style };
  const headerStyle = { ...defaultStyle.header, ...style.header };
  const containerStyle = { ...defaultStyle.container, ...style.container };
  const contentStyle = { ...defaultStyle.content, ...style.content };
  const resizerStyle = { ...defaultStyle.resizer, ...style.resizer };

  // リサイズハンドラー
  const onResize = useCallback(
    (event, params) => {
      setNodeSize({
        width: params.width,
        height: params.height,
      });
    },
    [setNodeSize]
  );

  // アイコンタイプによる表示切り替え
  const renderIcon = () => {
    const iconType = data.iconType || "floppy";
    const iconSize = 32; // アイコンサイズを大きく
    const iconColor = headerStyle.textColor === "text-white" ? "white" : "currentColor";

    switch (iconType) {
      case "floppy":
        return <FloppyDiskIcon size={iconSize} color={iconColor} />;
      case "hard":
        return <HardDiskIcon size={iconSize} color={iconColor} />;
      case "cd":
        return <CDDiskIcon size={iconSize} color={iconColor} />;
      default:
        return <DiskIcon size={iconSize} color={iconColor} />;
    }
  };

  return (
    <div className="custom-simple-node" style={{ width: nodeSize.width, height: nodeSize.height }}>
      {/* リサイザー（選択時かつリサイズ可能な場合のみ表示） */}
      {selected && resizerStyle.enabled && (
        <NodeResizer
          minWidth={180}
          minHeight={120}
          onResize={onResize}
          color={resizerStyle.color}
          handleStyle={{
            backgroundColor: resizerStyle.color,
            border: "2px solid white",
            borderRadius: "4px",
            width: `${resizerStyle.handleSize}px`,
            height: `${resizerStyle.handleSize}px`,
          }}
          lineStyle={{
            borderColor: resizerStyle.color,
            borderWidth: `${resizerStyle.lineWidth}px`,
            borderStyle: resizerStyle.lineStyle,
          }}
        />
      )}

      <div className={`w-full h-full ${containerStyle.bgColor} border-2 ${containerStyle.borderColor} rounded-lg shadow-lg overflow-hidden`} style={{ width: nodeSize.width, height: nodeSize.height }}>
        {/* ヘッダー部分 */}
        <div className={`${headerStyle.bgColor} ${headerStyle.textColor} px-4 py-3 text-base font-semibold flex items-center gap-3`}>
          {/* ディスクアイコン */}
          {renderIcon()}

          <div className="flex-1">
            <div className="text-base">{data.label || "ストレージノード"}</div>
            {data.subtitle && <div className="text-xs opacity-80">{data.subtitle}</div>}
          </div>

          {/* リサイズ無効の場合の表示 */}
          {!resizerStyle.enabled && <span className="text-xs opacity-60 bg-white bg-opacity-20 px-2 py-1 rounded">[固定]</span>}
        </div>

        {/* コンテンツ部分 */}
        <div className={`p-4 ${contentStyle.bgColor} flex-1 overflow-auto`} style={{ height: nodeSize.height - 64 }}>
          <div className={`text-sm ${contentStyle.textColor} leading-relaxed`}>{data.description || "ストレージデバイスの説明がここに表示されます。"}</div>

          {/* 追加情報表示エリア */}
          {data.specs && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                {Object.entries(data.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1">
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ハンドルも大きく */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className={`w-4 h-4 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border-2 border-white`} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className={`w-4 h-4 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border-2 border-white`} />
    </div>
  );
});

CustomSimpleNode.displayName = "CustomSimpleNode";

// アイコンも個別にエクスポート
export { DiskIcon, FloppyDiskIcon, HardDiskIcon, CDDiskIcon };
export default CustomSimpleNode;
