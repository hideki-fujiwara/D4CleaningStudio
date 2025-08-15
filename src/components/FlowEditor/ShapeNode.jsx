// filepath: d:\Project\tauri\D4CleaningStudio\src\components\FlowEditor\ShapeNode.jsx
import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import { RectangleIcon, CircleIcon, TriangleIcon, DiamondIcon, HexagonIcon, StarIcon, ArrowIcon, EllipseIcon, RoundedRectIcon, ParallelogramIcon } from "./ShapeIcons";

/**
 * 図形ノードコンポーネント
 */
const ShapeNode = memo(({ data, isConnectable, selected }) => {
  // ノードのサイズ状態
  const [nodeSize, setNodeSize] = useState({
    width: data.width || 200,
    height: data.height || 150,
  });

  // デフォルトスタイル
  const defaultStyle = {
    header: {
      bgColor: "bg-green-500",
      textColor: "text-white",
    },
    container: {
      bgColor: "bg-white",
      borderColor: "border-green-500",
    },
    content: {
      bgColor: "bg-green-50",
      textColor: "text-gray-800",
    },
    resizer: {
      enabled: true,
      color: "#10b981",
      handleSize: 8,
      lineWidth: 2,
      lineStyle: "dashed",
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

  // 図形タイプによる表示切り替え
  const renderIcon = () => {
    const shapeType = data.shapeType || "rectangle";
    const iconSize = 28;
    const iconColor = headerStyle.textColor === "text-white" ? "white" : "currentColor";

    switch (shapeType) {
      case "rectangle":
        return <RectangleIcon size={iconSize} color={iconColor} />;
      case "circle":
        return <CircleIcon size={iconSize} color={iconColor} />;
      case "triangle":
        return <TriangleIcon size={iconSize} color={iconColor} />;
      case "diamond":
        return <DiamondIcon size={iconSize} color={iconColor} />;
      case "hexagon":
        return <HexagonIcon size={iconSize} color={iconColor} />;
      case "star":
        return <StarIcon size={iconSize} color={iconColor} />;
      case "arrow":
        return <ArrowIcon size={iconSize} color={iconColor} />;
      case "ellipse":
        return <EllipseIcon size={iconSize} color={iconColor} />;
      case "rounded":
        return <RoundedRectIcon size={iconSize} color={iconColor} />;
      case "parallelogram":
        return <ParallelogramIcon size={iconSize} color={iconColor} />;
      default:
        return <RectangleIcon size={iconSize} color={iconColor} />;
    }
  };

  // 図形名の取得
  const getShapeName = () => {
    const shapeNames = {
      rectangle: "四角形",
      circle: "円形",
      triangle: "三角形",
      diamond: "ダイヤモンド",
      hexagon: "六角形",
      star: "星形",
      arrow: "矢印",
      ellipse: "楕円",
      rounded: "角丸四角形",
      parallelogram: "平行四辺形",
    };
    return shapeNames[data.shapeType] || "図形";
  };

  return (
    <div className="shape-node" style={{ width: nodeSize.width, height: nodeSize.height }}>
      {/* リサイザー */}
      {selected && resizerStyle.enabled && (
        <NodeResizer
          minWidth={150}
          minHeight={100}
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
        <div className={`${headerStyle.bgColor} ${headerStyle.textColor} px-3 py-2 text-sm font-semibold flex items-center gap-2`}>
          {/* 図形アイコン */}
          {renderIcon()}

          <div className="flex-1">
            <div className="text-sm">{data.label || getShapeName()}</div>
            {data.category && <div className="text-xs opacity-80">{data.category}</div>}
          </div>

          {/* リサイズ無効の場合の表示 */}
          {!resizerStyle.enabled && <span className="text-xs opacity-60 bg-white bg-opacity-20 px-1 py-0.5 rounded">[固定]</span>}
        </div>

        {/* コンテンツ部分 */}
        <div className={`p-3 ${contentStyle.bgColor} flex-1 overflow-auto`} style={{ height: nodeSize.height - 44 }}>
          <div className={`text-xs ${contentStyle.textColor} leading-relaxed`}>{data.description || `${getShapeName()}ノードです。`}</div>

          {/* プロパティ表示エリア */}
          {data.properties && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                {Object.entries(data.properties).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-0.5">
                    <span className="font-medium">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ハンドル */}
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className={`w-3 h-3 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border border-white`} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className={`w-3 h-3 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border border-white`} />
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} className={`w-3 h-3 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border border-white`} />
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} className={`w-3 h-3 ${headerStyle.bgColor} hover:opacity-80 transition-opacity border border-white`} />
    </div>
  );
});

ShapeNode.displayName = "ShapeNode";

export default ShapeNode;
