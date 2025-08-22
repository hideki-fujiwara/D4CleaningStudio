/**
 * プロジェクトツリーの個別項目を表示するコンポーネント
 *
 * 機能:
 *  - ファイル・フォルダの階層表示
 *  - フォルダの展開/折りたたみ
 *  - 右クリックコンテキストメニュー（フォルダのみ）
 *  - 空フォルダ時のプレースホルダ表示
 *  - ルートレベルでのツールバー表示
 *
 * 特徴:
 *  - react-aria-components による完全アクセシブル実装
 *  - 再帰的レンダリングで任意の深度に対応
 *  - Tailwind CSS による階層インデント表現
 */
import React, { memo, useMemo } from "react";
import { TreeItem, TreeItemContent, Button, Collection } from "react-aria-components";
import { getFileIcon, ChevronRightIcon, PlusIcon, FolderPlusIcon, RefreshIcon, CollapseIcon } from "../icons";
import { TREE_ITEM_STYLES, CHEVRON_STYLES, TOOLBAR_STYLES } from "../constants";
import { useTreeItemDrag } from "./useDragAndDrop";
import ToolButton from "./ToolButton";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * ツリーアイテムコンポーネント（リファクタリング版）
 */
const TreeItemComponent = memo(function TreeItemComponent({ item, renderItem, toolbarHandlers, onFolderContextMenu }) {
  const { id, name, isDirectory, isPlaceholder, children } = item;

  // ドラッグ機能
  const { dragProps, isDragging } = useTreeItemDrag(item);

  // 効果的な子要素（空フォルダの場合はプレースホルダを追加）
  const effectiveChildren =
    isDirectory && !isPlaceholder && Array.isArray(children) && children.length === 0
      ? [
          {
            id: `${id}__empty`,
            name: "（ 空 ）",
            isDirectory: false,
            isFile: true,
            isPlaceholder: true,
          },
        ]
      : children || [];

  // コンテキストメニューハンドラ
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaceholder) return;

    if (isDirectory) {
      ConsoleMsg?.("debug", "Context menu (folder)", { id, name });
      onFolderContextMenu?.(e, item);
    } else {
      ConsoleMsg?.("debug", "Context menu (file - suppressed)", { id });
    }
  };

  return (
    <TreeItem key={id} id={id} textValue={name} hasChildNodes={isDirectory} isDisabled={isPlaceholder} className={`${TREE_ITEM_STYLES.base} ${isPlaceholder ? TREE_ITEM_STYLES.placeholder : ""}`}>
      <TreeItemContent>
        {({ isExpanded }) => {
          if (isPlaceholder) {
            return (
              <div
                data-node-row
                data-node-id={id}
                data-node-type="placeholder"
                className={`${TREE_ITEM_STYLES.content} ${TREE_ITEM_STYLES.indent} ${TREE_ITEM_STYLES.placeholder} text-xs`}
                onContextMenu={handleContextMenu}
              >
                <div className="w-4 h-4 shrink-0" />
                <span>（ 空 ）</span>
              </div>
            );
          }

          return <TreeItemRow item={item} isExpanded={isExpanded} dragProps={dragProps} isDragging={isDragging} onContextMenu={handleContextMenu} toolbarHandlers={toolbarHandlers} />;
        }}
      </TreeItemContent>

      {/* 子要素の再帰レンダリング */}
      <Collection items={effectiveChildren}>
        {(child) => <TreeItemComponent item={child} renderItem={renderItem} toolbarHandlers={toolbarHandlers} onFolderContextMenu={onFolderContextMenu} />}
      </Collection>
    </TreeItem>
  );
});

/**
 * ツリーアイテムの内容部分
 */
const TreeItemRow = memo(function TreeItemRow({ item, isExpanded, dragProps, isDragging, onContextMenu, toolbarHandlers }) {
  const { id, name, isDirectory, isPlaceholder, path } = item;

  // ファイルの場合はHTML5ドラッグデータも設定
  const enhancedDragProps = useMemo(() => {
    if (isDirectory || isPlaceholder) {
      return dragProps;
    }

    return {
      ...dragProps,
      onDragStart: (e) => {
        dragProps.onDragStart?.(e);

        // HTML5 File APIのためのデータ設定
        if (path) {
          e.dataTransfer.setData("text/plain", path);
          e.dataTransfer.setData("application/x-file-path", path);
          e.dataTransfer.setData("application/x-file-name", name);
        }
      },
    };
  }, [dragProps, isDirectory, isPlaceholder, path, name]);

  return (
    <div
      {...enhancedDragProps}
      data-node-row
      data-node-id={id}
      data-node-type={isDirectory ? "dir" : "file"}
      className={`
        ${TREE_ITEM_STYLES.content} 
        ${TREE_ITEM_STYLES.contentHover} 
        ${isDragging ? TREE_ITEM_STYLES.contentDragging : ""}
      `}
      onContextMenu={onContextMenu}
    >
      {/* 左側: インデント + 展開ボタン + アイコン + 名前 */}
      <div className={`flex items-center space-x-1 ${TREE_ITEM_STYLES.indent}`}>
        {/* 展開ボタンまたはスペーサー */}
        {isDirectory ? (
          <Button
            slot="chevron"
            className={`
              ${CHEVRON_STYLES.base} 
              ${CHEVRON_STYLES.button} 
              ${isExpanded ? CHEVRON_STYLES.expanded : ""}
            `}
          >
            <ChevronRightIcon className={CHEVRON_STYLES.icon} />
          </Button>
        ) : (
          <div className="w-6 h-6 shrink-0" />
        )}

        {/* アイコン + 名前 */}
        <div className="flex items-center space-x-2 min-w-0">
          <div className={`w-4 h-4 ${isDirectory ? (isExpanded ? "i-vscode-icons-default-folder-opened" : "i-vscode-icons-default-folder") : getFileIcon(name)}`} />
          <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={item.path || name}>
            {name}
          </div>
        </div>
      </div>

      {/* ツールバー（ルートのみ） */}
      {id === "root" && toolbarHandlers && (
        <div className={TOOLBAR_STYLES.container}>
          <ToolButton onPress={toolbarHandlers.handleNewFile} IconComponent={PlusIcon} label="新ファイル" />
          <ToolButton onPress={toolbarHandlers.handleNewFolder} IconComponent={FolderPlusIcon} label="新フォルダ" />
          <ToolButton onPress={toolbarHandlers.handleRefresh} IconComponent={RefreshIcon} label="更新" />
          <ToolButton onPress={toolbarHandlers.handleCollapseAll} IconComponent={CollapseIcon} label="折りたたみ" />
        </div>
      )}
    </div>
  );
});

export default TreeItemComponent;
