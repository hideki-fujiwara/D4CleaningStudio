import React, { memo } from "react";
import { TreeItem, TreeItemContent, Button, Collection } from "react-aria-components";
import { getFileIcon } from "./icons";
import { TREE_ITEM_STYLES, CHEVRON_STYLES } from "./constants";
import ToolButton from "./ToolButton";

/**
 * ツリーアイテムの個別コンポーネント
 * ファイルやフォルダを表現する再帰的なコンポーネント
 *
 * @param {Object} item - ツリーアイテムのデータ
 * @param {function} renderItem - 子アイテムを描画するための再帰的レンダー関数
 * @param {Object} toolbarHandlers - ツールバーのハンドラー（ルートアイテムの場合のみ使用）
 */
const TreeItemComponent = memo(function TreeItemComponent({ item, renderItem, toolbarHandlers }) {
  const isDir = item.isDirectory === true;

  return (
    <TreeItem
      key={item.id}
      id={item.id}
      textValue={item.name}
      hasChildNodes={isDir} // ← ディレクトリは常に展開可能
      className={`${TREE_ITEM_STYLES.selected} ${TREE_ITEM_STYLES.base} ${TREE_ITEM_STYLES.focus} ${TREE_ITEM_STYLES.hover}`}
    >
      <TreeItemContent>
        {({ hasChildItems, isExpanded }) => {
          // フォルダーなら常にシェブロンを表示
          const showChevron = isDir;

          return (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-2 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
                {showChevron ? (
                  <Button slot="chevron" className={`${CHEVRON_STYLES.base} ${CHEVRON_STYLES.button} ${isExpanded ? "rotate-90" : ""}`}>
                    <div className="i-lucide-chevron-right w-4 h-4" />
                  </Button>
                ) : (
                  <div className="shrink-0 w-6 h-6" />
                )}

                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 ${isDir ? (isExpanded ? "i-lucide-folder-open" : "i-lucide-folder") : getFileIcon(item.name)}`} />
                  {item.id === "root" && item.dirPath ? (
                    <div className="text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-base-content/70 ml-2">[{item.dirPath}]</span>
                    </div>
                  ) : (
                    <div className="text-sm">{item.name}</div>
                  )}
                </div>
              </div>

              {item.id === "root" && toolbarHandlers && (
                <div className="flex items-center mr-2">
                  <ToolButton onPress={toolbarHandlers.handleNewFile} icon="i-lucide-file-text" label="新しいファイルを作成" color="text-blue-500" />
                  <ToolButton onPress={toolbarHandlers.handleNewFolder} icon="i-lucide-folder-plus" label="新しいフォルダを作成" color="text-yellow-500" />
                  <ToolButton onPress={toolbarHandlers.handleRefresh} icon="i-lucide-rotate-cw" label="プロジェクトツリーを更新" color="text-green-500" />
                  <ToolButton onPress={toolbarHandlers.handleCollapseAll} icon="i-lucide-minimize-2" label="すべてのフォルダを折りたたみ" color="text-red-500" />
                </div>
              )}
            </div>
          );
        }}
      </TreeItemContent>

      <Collection items={item.children || []}>{renderItem}</Collection>
    </TreeItem>
  );
});

export default TreeItemComponent;
