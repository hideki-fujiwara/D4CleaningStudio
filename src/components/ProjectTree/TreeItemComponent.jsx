import React, { memo } from "react";
import { TreeItem, TreeItemContent, Button, Collection } from "react-aria-components";
import { getFileIcon } from "./icons";
import { TREE_ITEM_STYLES, CHEVRON_STYLES } from "./constants";
import ToolButton from "./ToolButton";
import ConsoleMsg from "../../utils/ConsoleMsg";

const TreeItemComponent = memo(function TreeItemComponent({ item, renderItem, toolbarHandlers, onFolderContextMenu }) {
  const isDir = item.isDirectory === true;
  const isPlaceholder = item.isPlaceholder === true;

  const effectiveChildren =
    isDir && !isPlaceholder && Array.isArray(item.children) && item.children.length === 0
      ? [
          {
            id: item.id + "__empty",
            name: "（空）",
            isDirectory: false,
            isFile: true,
            isPlaceholder: true,
          },
        ]
      : item.children || [];

  // 行用コンテキストメニュー (フォルダのみ発火)
  const handleRowContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPlaceholder) return;
    if (isDir) {
      ConsoleMsg?.("debug", "row contextmenu (dir)", { id: item.id, name: item.name });
      onFolderContextMenu?.(e, item);
    } else {
      ConsoleMsg?.("debug", "row contextmenu (file suppressed)", { id: item.id });
    }
  };

  return (
    <TreeItem
      key={item.id}
      id={item.id}
      textValue={item.name}
      hasChildNodes={isDir}
      isDisabled={isPlaceholder}
      className={`${TREE_ITEM_STYLES.selected} ${TREE_ITEM_STYLES.base} ${TREE_ITEM_STYLES.focus} ${TREE_ITEM_STYLES.hover} ${isPlaceholder ? "pointer-events-none opacity-60 italic" : ""}`}
    >
      <TreeItemContent>
        {({ isExpanded }) => {
          if (isPlaceholder) {
            return (
              <div
                data-node-row
                data-node-id={item.id}
                data-node-type="placeholder"
                className="flex items-center py-0.5 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)] text-xs whitespace-nowrap"
                onContextMenu={handleRowContextMenu}
              >
                <div className="w-4 h-4 shrink-0" />
                <span>（空）</span>
              </div>
            );
          }

          const showChevron = isDir;

          return (
            <div data-node-row data-node-id={item.id} data-node-type={isDir ? "dir" : "file"} className="flex items-center justify-between py-0.5" onContextMenu={handleRowContextMenu}>
              <div className="flex items-center space-x-1 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
                {showChevron ? (
                  <Button slot="chevron" className={`${CHEVRON_STYLES.base} ${CHEVRON_STYLES.button} ${isExpanded ? "rotate-90" : ""}`}>
                    <div className="i-lucide-chevron-right w-4 h-4" />
                  </Button>
                ) : (
                  <div className="w-6 h-6 shrink-0" />
                )}
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`w-4 h-4 ${isDir ? (isExpanded ? "i-lucide-folder-open" : "i-lucide-folder") : getFileIcon(item.name)}`} />
                  <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={item.name}>
                    {item.name}
                  </div>
                </div>
              </div>
              {item.id === "root" && toolbarHandlers && (
                <div className="flex items-center mr-2">
                  <ToolButton onPress={toolbarHandlers.handleNewFile} icon="i-lucide-file-text" label="新ファイル" />
                  <ToolButton onPress={toolbarHandlers.handleNewFolder} icon="i-lucide-folder-plus" label="新フォルダ" />
                  <ToolButton onPress={toolbarHandlers.handleRefresh} icon="i-lucide-rotate-cw" label="更新" />
                  <ToolButton onPress={toolbarHandlers.handleCollapseAll} icon="i-lucide-minimize-2" label="折りたたみ" />
                </div>
              )}
            </div>
          );
        }}
      </TreeItemContent>

      <Collection items={effectiveChildren}>
        {(child) => <TreeItemComponent item={child} renderItem={renderItem} toolbarHandlers={toolbarHandlers} onFolderContextMenu={onFolderContextMenu} />}
      </Collection>
    </TreeItem>
  );
});

export default TreeItemComponent;
