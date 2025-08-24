import React, { memo, useState, useCallback, useEffect } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";

/**
 * データベースシリンダーアイコン（SVG）
 */
const DatabaseCylinderIcon = ({ size = 105, color = "#ffffff", stroke = "#ffffff", filename = "FILE名", className = "" }) => (
  <svg width="100%" height="100%" viewBox="0 0 76 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} preserveAspectRatio="xMidYMid meet">
    {/* シリンダーの上面（楕円） */}
    <ellipse cx="38" cy="12" rx="35" ry="10" fill={color} stroke="none" />
    {/* シリンダーの底面 */}
    <ellipse cx="38" cy="67" rx="35" ry="10" fill={color} stroke="none" strokeWidth="1.5" />
    <ellipse cx="38" cy="67" rx="35" ry="10" fill="none" stroke={stroke} strokeWidth="1.5" opacity="1" />
    {/* シリンダーの面 */}
    <rect x="2" y="12" width="72" height="55" fill={color} stroke="none" />
    {/* シリンダーの左側面(線) */}
    <rect x="2" y="12" width="1" height="55" fill={stroke} />
    {/* シリンダーの右側面（線） */}
    <rect x="73" y="12" width="1" height="55" fill={stroke} />
    {/* シリンダーの（ハイライト） */}
    <ellipse cx="38" cy="12" rx="35" ry="10" fill="none" stroke={stroke} strokeWidth="1.5" opacity="1" />
    {/* ファイル名ラベル（シリンダー内部） */}
    <text x="38" y="42" textAnchor="middle" fontSize="8" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold">
      {/* ファイル名がここに表示される */}
      {filename}
    </text>
  </svg>
);

/**
 * CSV入力ファイルノードコンポーネント（シンプル版）
 */
const InputFile_csv = memo(({ data, isConnectable, selected }) => {
  // 比率計算関数
  const calculateSize = useCallback((width, height) => {
    const aspectRatio = 76 / 80; // シリンダーの実際の比率
    let newWidth = width;
    let newHeight = height;

    // 初期値も比率に合わせて調整
    if (newWidth / newHeight > aspectRatio) {
      newWidth = newHeight * aspectRatio;
    } else {
      newHeight = newWidth / aspectRatio;
    }

    return {
      width: Math.max(Math.round(newWidth), 100), // 最小幅100px
      height: Math.max(Math.round(newHeight), 105), // 最小高さ105px
    };
  }, []);

  // 初期サイズも比率計算を通す
  const initialSize = calculateSize(data.width || 100, data.height || 105);

  // ノードのサイズ状態（シリンダーの形状に合わせて調整）
  const [nodeSize, setNodeSize] = useState(initialSize);

  // デフォルトスタイル
  const defaultStyle = {
    resizer: {
      enabled: true,
      color: "#14b8a6",
      handleSize: 6,
      lineWidth: 1.5,
      lineStyle: "dashed",
    },
  };

  const style = { ...defaultStyle, ...data.style };
  const resizerStyle = { ...defaultStyle.resizer, ...style.resizer };

  // リサイズハンドラー（シリンダーの比率76:80に合わせる）
  const onResize = useCallback(
    (event, params) => {
      const aspectRatio = 76 / 80; // シリンダーの実際の比率
      let newWidth = params.width;
      let newHeight = params.height;

      // リサイズの主導権を判定
      const widthDriven = Math.abs(params.width - nodeSize.width) > Math.abs(params.height - nodeSize.height);

      if (widthDriven) {
        // 幅主導の場合
        newHeight = newWidth / aspectRatio;
      } else {
        // 高さ主導の場合
        newWidth = newHeight * aspectRatio;
      }

      setNodeSize({
        width: Math.max(Math.round(newWidth), 100), // 最小幅100px
        height: Math.max(Math.round(newHeight), 105), // 最小高さ105px
      });
    },
    [setNodeSize, nodeSize.width, nodeSize.height]
  );

  // data.widthやdata.heightが変更された時も比率計算を適用
  useEffect(() => {
    if (data.width || data.height) {
      const newSize = calculateSize(data.width || nodeSize.width, data.height || nodeSize.height);
      setNodeSize(newSize);
    }
  }, [data.width, data.height, calculateSize]);

  return (
    <div className="relative" style={{ width: nodeSize.width, height: nodeSize.height }}>
      {/* リサイザー */}
      {selected && resizerStyle.enabled && (
        <NodeResizer
          minWidth={100}
          minHeight={105}
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
      <div className="w-full h-full flex items-center justify-center p-2">
        <div
          style={{
            width: nodeSize.width - 16,
            height: nodeSize.height - 16,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <DatabaseCylinderIcon color={data.color || "#14b8a6"} stroke={data.stroke || "#ffffff"} filename={data.filename || "FILE名"} />
        </div>
      </div>

      {/* 右中央の出力ハンドル（データ出力用） */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          right: "1%",
          width: "12px",
          height: "12px",
          backgroundColor: "#ffffff",
          border: "2px solid white",
          borderRadius: "2px", // 四角形（少し角丸）
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />

      {/* オプション: 左側の入力ハンドル */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        style={{
          top: "50%",
          transform: "translateY(-50%)",
          left: "1%",
          width: "12px",
          height: "12px",
          backgroundColor: "#ffffff",
          border: "2px solid white",
          borderRadius: "2px", // 四角形（少し角丸）
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
});

InputFile_csv.displayName = "InputFile_csv";

export default InputFile_csv;
