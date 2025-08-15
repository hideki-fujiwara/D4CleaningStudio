import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";

/**
 * データベースシリンダーアイコン（画像のようなスタイル）
 */
const DatabaseCylinderIcon = ({ size = 150, color = "#ffffff", stroke = "#ffffff", className = "" }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 100 76" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* シリンダーの上面（楕円） */}
    <ellipse cx="50" cy="12" rx="35" ry="10" fill={color} stroke="none" />
    {/* シリンダーの底面 */}
    <ellipse cx="50" cy="67" rx="35" ry="10" fill={color} stroke="none" strokeWidth="1.5" />
    <ellipse cx="50" cy="67" rx="35" ry="10" fill="none" stroke={stroke} strokeWidth="1.5" opacity="1" />
    {/* シリンダーの面 */}
    <rect x="15" y="12" width="70" height="55" fill={color} stroke="none" />
    {/* シリンダーの左側面(線) */}
    <rect x="14" y="12" width="1.5" height="55" fill={stroke} />
    {/* シリンダーの右側面（線） */}
    <rect x="84" y="12" width="1.5" height="55" fill={stroke} />
    {/* シリンダーの（ハイライト） */}
    <ellipse cx="50" cy="12" rx="35" ry="10" fill="none" stroke={stroke} strokeWidth="1.5" opacity="1" />
    {/* ファイル名ラベル（シリンダー内部） */}
    <text x="50" y="42" textAnchor="middle" fontSize="8" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">
      ファイル名
    </text>
  </svg>
);

/**
 * CSV入力ファイルノードコンポーネント（シンプル版）
 */
const InputFile_csv = memo(({ data, isConnectable, selected }) => {
  // ノードのサイズ状態
  const [nodeSize, setNodeSize] = useState({
    width: data.width || 180,
    height: data.height || 150, // 4:3の比率を維持
  });

  // デフォルトスタイル
  const defaultStyle = {
    resizer: {
      enabled: true,
      color: "#14b8a6",
      handleSize: 6,
      lineWidth: 1,
      lineStyle: "solid",
    },
  };

  const style = { ...defaultStyle, ...data.style };
  const resizerStyle = { ...defaultStyle.resizer, ...style.resizer };

  // リサイズハンドラー
  const onResize = useCallback(
    (event, params) => {
      // 4:3の比率を維持
      const aspectRatio = 4 / 3;
      let newWidth = params.width;
      let newHeight = params.height;

      if (newWidth / newHeight > aspectRatio) {
        newWidth = newHeight * aspectRatio;
      } else {
        newHeight = newWidth / aspectRatio;
      }

      setNodeSize({
        width: newWidth,
        height: newHeight,
      });
    },
    [setNodeSize]
  );

  return (
    <div className="input-file-csv-node relative" style={{ width: nodeSize.width, height: nodeSize.height }}>
      {/* リサイザー */}
      {selected && resizerStyle.enabled && (
        <NodeResizer
          minWidth={120}
          minHeight={96}
          onResize={onResize}
          color={resizerStyle.color}
          handleStyle={{
            backgroundColor: resizerStyle.color,
            border: "2px solid white",
            borderRadius: "1px",
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

      {/* メインコンテンツ - データベースシリンダーのみ */}
      <div className="w-full h-full flex items-center justify-start pl-2">
        <DatabaseCylinderIcon size={nodeSize.width} color={data.color || ""} />
      </div>

      {/* 右中央の出力ハンドル（データ出力用） - 隙間を最小化 */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-teal-600 hover:bg-teal-700 transition-colors border-2 border-white rounded-full"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          right: "-1px", // 隙間を大幅に削減
        }}
      />

      {/* オプション: 左側の入力ハンドル */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-gray-500 hover:bg-gray-600 transition-colors border border-white rounded-full"
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: "-1px", // 隙間を削減
        }}
      />
    </div>
  );
});

InputFile_csv.displayName = "InputFile_csv";

export default InputFile_csv;
