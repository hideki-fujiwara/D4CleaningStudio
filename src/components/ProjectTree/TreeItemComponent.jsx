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
  const isPlaceholder = item.isPlaceholder === true; // NO FILE 用プレースホルダ判定

  // 子が空ディレクトリの場合は擬似子ノードとして "NO FILE" を 1 件だけ差し込む
  const effectiveChildren =
    isDir && Array.isArray(item.children) && item.children.length === 0
      ? [
          {
            id: item.id + "__empty",
            name: "empty",
            isDirectory: false,
            isFile: true,
            isPlaceholder: true,
            children: undefined,
          },
        ]
      : item.children || [];

  return (
    <TreeItem
      key={item.id}
      id={item.id}
      textValue={item.name}
      hasChildNodes={isDir} // ディレクトリは空でも展開可能
      isDisabled={isPlaceholder} // NO FILE 行は選択不可
      className={`${TREE_ITEM_STYLES.selected} ${TREE_ITEM_STYLES.base} ${TREE_ITEM_STYLES.focus} ${TREE_ITEM_STYLES.hover} ${isPlaceholder ? "pointer-events-none opacity-60 italic" : ""}`}
    >
      <TreeItemContent>
        {({ isExpanded }) => {
          // プレースホルダ行はシェブロンやツールバー不要
          if (isPlaceholder) {
            return (
              <div className="flex items-center justify-between py-0.5 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
                <div className="flex items-center text-xs whitespace-nowrap">
                  <div className="w-4 h-4 shrink-0" />
                  <span>( empty )</span>
                </div>
              </div>
            );
          }

          const showChevron = isDir;
          return (
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-1 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
                {showChevron ? (
                  <Button slot="chevron" className={`${CHEVRON_STYLES.base} ${CHEVRON_STYLES.button} tree-chevron-btn ${isExpanded ? "rotate-90" : ""}`}>
                    <div className="i-lucide-chevron-right w-3 h-3" />
                  </Button>
                ) : (
                  <div className="shrink-0 w-6 h-6" />
                )}

                <div className="flex items-center space-x-2">
                  {/* アイコン（固定幅） */}
                  <div className={`w-3 h-3 ${isDir ? (isExpanded ? "i-lucide-folder-open" : "i-lucide-folder") : getFileIcon(item.name)}`} />
                  {/* テキスト部は折り返さず省略表示可能にするため min-w-0 + overflow制御 */}
                  {item.id === "root" && item.dirPath ? (
                    <div className="text-sm flex items-center min-w-0">
                      <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-base-content/70 ml-2 whitespace-nowrap overflow-hidden text-ellipsis" title={item.dirPath}>
                        [{item.dirPath}]
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0" title={item.name}>
                      {item.name}
                    </div>
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

      {/* 空ディレクトリなら effectiveChildren に NO FILE プレースホルダが 1 件入る */}
      <Collection items={effectiveChildren}>{renderItem}</Collection>
    </TreeItem>
  );
});

export default TreeItemComponent;
