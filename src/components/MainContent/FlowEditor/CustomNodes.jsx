import React, { memo, useState, useCallback } from "react";
import { Handle, Position, NodeResizer } from "reactflow";
import CustomSimpleNode from "./CustomSimpleNode";
import ShapeNode from "./ShapeNode";
import InputFile_csv from "./InputFile_csv";

/**
 * カスタムテキストノード
 * 画像のようなデザインのノードコンポーネント
 */
const CustomTextNode = memo(({ data, isConnectable, selected }) => {
  // ノードのサイズ状態
  const [nodeSize, setNodeSize] = useState({
    width: data.width || 320,
    height: data.height || 240,
  });

  // デフォルトのサイドバー項目
  const defaultLeftItems = [
    { id: 0, text: "入力1", type: "input", bgColor: "bg-base-300", textColor: "text-teal-800" },
    { id: 1, text: "入力2", type: "input", bgColor: "bg-base-300", textColor: "text-teal-800" },
  ];

  const defaultRightItems = [
    { id: 0, text: "出力1", type: "output", bgColor: "bg-base-300", textColor: "text-teal-800" },
    { id: 1, text: "出力2", type: "output", bgColor: "bg-base-300", textColor: "text-teal-800" },
  ];

  // デフォルトのスタイル設定
  const defaultStyle = {
    header: {
      text: "CSV Input",
      bgColor: "bg-base-300",
      textColor: "text-base-content",
    },
    container: {
      bgColor: "bg-base-100",
      borderColor: "border-base-300",
    },
    content: {
      bgColor: "bg-white",
      textColor: "text-gray-700",
      borderColor: "border-base-300",
    },
    resizer: {
      enabled: true, // リサイズ可能フラグ
      color: "#ef4444", // リサイザーの色
      handleSize: 8, // ハンドルサイズ
      lineWidth: 2, // 線の太さ
      lineStyle: "dashed", // 線の形状 ("solid", "dashed", "dotted")
    },
  };

  // データから設定を取得（デフォルト値あり）
  const leftItems = data.leftItems || defaultLeftItems;
  const rightItems = data.rightItems || defaultRightItems;
  const style = { ...defaultStyle, ...data.style };

  // ヘッダー設定
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

  // サイドバーの高さを計算（コンテンツエリアの高さに基づく）
  const contentHeight = nodeSize.height - 80; // ヘッダー(48px) + パディング(32px)を除く
  const itemHeight = Math.max(32, contentHeight / Math.max(leftItems.length, rightItems.length, 1));

  return (
    <div className="custom-node relative" style={{ width: nodeSize.width, height: nodeSize.height }}>
      {/* リサイザー（選択時かつリサイズ可能な場合のみ表示） */}
      {selected && resizerStyle.enabled && (
        <NodeResizer
          minWidth={280}
          minHeight={200}
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

      {/* ノード全体のコンテナ */}
      <div className={`w-full h-full border-2 ${containerStyle.borderColor} ${containerStyle.bgColor} rounded-sm shadow-lg overflow-hidden`} style={{ width: nodeSize.width, height: nodeSize.height }}>
        {/* ヘッダー部分 */}
        <div className={`${headerStyle.textColor} ${headerStyle.bgColor} px-4 py-2 font-semibold`}>
          {headerStyle.text || data.title || "テキスト"}
          {/* リサイズ無効の場合の表示 */}
          {!resizerStyle.enabled && <span className="text-xs opacity-60 ml-2">[固定サイズ]</span>}
        </div>

        {/* メインコンテンツエリア */}
        <div className={`${containerStyle.bgColor} p-4 flex`} style={{ height: contentHeight }}>
          {/* 左サイドバー */}
          <div className="w-20 flex flex-col space-y-1 relative overflow-hidden">
            {leftItems.map((item, i) => (
              <div key={item.id || i} className={`${item.bgColor} border ${item.borderColor} relative flex items-center justify-center`} style={{ height: `${itemHeight}px` }}>
                {/* 左サイドバーのテキスト */}
                <span className={`text-xs ${item.textColor} font-medium truncate px-1`}>{item.text}</span>

                {/* 左サイドバーの各箱にハンドルを追加 */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`left-${item.id || i}`}
                  isConnectable={isConnectable}
                  className={`w-3 h-3 ${item.handleColor || "bg-teal-600"} border absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 hover:bg-teal-700 transition-colors`}
                  style={{ zIndex: 10 }}
                />
                <Handle
                  type="source"
                  position={Position.Left}
                  id={`left-source-${item.id || i}`}
                  isConnectable={isConnectable}
                  className={`w-3 h-3 ${item.handleColor || "bg-teal-600"} border absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 hover:bg-teal-700 transition-colors`}
                  style={{ zIndex: 10 }}
                />
              </div>
            ))}
          </div>

          {/* 中央コンテンツエリア */}
          <div className={`flex-1 mx-4 border-2 ${contentStyle.borderColor} p-4 ${contentStyle.bgColor} overflow-auto`}>
            <div className={`${contentStyle.textColor} whitespace-pre-wrap`}>{data.content || "ここにテキストが入ります"}</div>
          </div>

          {/* 右サイドバー */}
          <div className="w-20 flex flex-col space-y-1 relative overflow-hidden">
            {rightItems.map((item, i) => (
              <div key={item.id || i} className={`${item.bgColor} border ${item.borderColor} relative flex items-center justify-center`} style={{ height: `${itemHeight}px` }}>
                {/* 右サイドバーのテキスト */}
                <span className={`text-xs ${item.textColor} font-medium truncate px-1`}>{item.text}</span>

                {/* 右サイドバーの各箱にハンドルを追加 */}
                <Handle
                  type="target"
                  position={Position.Right}
                  id={`right-${item.id || i}`}
                  isConnectable={isConnectable}
                  className={`w-3 h-3 ${item.handleColor || "bg-teal-600"} border border-white absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 hover:bg-teal-700 transition-colors`}
                  style={{ zIndex: 10 }}
                />
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`right-source-${item.id || i}`}
                  isConnectable={isConnectable}
                  className={`w-3 h-3 ${item.handleColor || "bg-teal-600"} border border-white absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 hover:bg-teal-700 transition-colors`}
                  style={{ zIndex: 10 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

CustomTextNode.displayName = "CustomTextNode";

// ノードタイプを定義
export const nodeTypes = {
  customText: CustomTextNode,
  customSimple: CustomSimpleNode,
  shape: ShapeNode,
  inputFileCsv: InputFile_csv,
};

export { CustomTextNode, CustomSimpleNode, ShapeNode, InputFile_csv };
