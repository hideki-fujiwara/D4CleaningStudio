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
  // 子要素の存在確認（フォルダかファイルかの判定）
  const hasChildren = !!(item.children && item.children.length > 0);

  return (
    <TreeItem
      key={item.id}
      id={item.id}
      textValue={item.name} // スクリーンリーダー用のテキスト
      hasChildNodes={hasChildren} // aria-components に子の存在を通知
      className={`${TREE_ITEM_STYLES.selected} ${TREE_ITEM_STYLES.base} ${TREE_ITEM_STYLES.focus} ${TREE_ITEM_STYLES.hover}`}
    >
      <TreeItemContent>
        {({ hasChildItems, isExpanded }) => (
          <div className="flex items-center justify-between py-2">
            {/* 左側：アイテムの情報 */}
            <div className="flex items-center space-x-2 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
              {/* 展開/折りたたみボタン（フォルダの場合のみ表示） */}
              {hasChildItems ? (
                <Button slot="chevron" className={`${CHEVRON_STYLES.base} ${CHEVRON_STYLES.button} ${isExpanded ? "rotate-90" : ""}`}>
                  {/* シェブロンアイコン（展開時は90度回転） */}
                  <div className="i-lucide-chevron-right w-4 h-4" />
                </Button>
              ) : (
                // ファイルの場合は空のスペースで位置を揃える
                <div className="shrink-0 w-6 h-6" />
              )}

              {/* アイコンと名前の表示部分 */}
              <div className="flex items-center space-x-2">
                {/* ファイル/フォルダアイコン */}
                <div
                  className={`w-4 h-4 ${
                    hasChildItems
                      ? isExpanded
                        ? "i-lucide-folder-open"
                        : "i-lucide-folder" // フォルダアイコン
                      : getFileIcon(item.name) // ファイルタイプ別アイコン
                  }`}
                />

                {/* アイテム名の表示 */}
                {item.id === "root" && item.dirPath ? (
                  // ルートアイテムの場合：プロジェクト名とパスを1行で表示
                  <div className="text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-base-content/70 ml-2">[{item.dirPath}]</span>
                  </div>
                ) : (
                  // 通常アイテムの場合：名前のみ表示
                  <div className="text-sm">{item.name}</div>
                )}
              </div>
            </div>

            {/* 右側：ツールバー（ルートアイテムの場合のみ表示） */}
            {item.id === "root" && toolbarHandlers && (
              <div className="flex items-center mr-2">
                {/* 新しいファイル作成ボタン */}
                <ToolButton onPress={toolbarHandlers.handleNewFile} icon="i-lucide-file-text" label="新しいファイルを作成" color="text-blue-500" />
                {/* 新しいフォルダ作成ボタン */}
                <ToolButton onPress={toolbarHandlers.handleNewFolder} icon="i-lucide-folder-plus" label="新しいフォルダを作成" color="text-yellow-500" />
                {/* 更新ボタン */}
                <ToolButton onPress={toolbarHandlers.handleRefresh} icon="i-lucide-rotate-cw" label="プロジェクトツリーを更新" color="text-green-500" />
                {/* 全て折りたたみボタン */}
                <ToolButton onPress={toolbarHandlers.handleCollapseAll} icon="i-lucide-minimize-2" label="すべてのフォルダを折りたたみ" color="text-red-500" />
              </div>
            )}
          </div>
        )}
      </TreeItemContent>

      {/* 子要素の再帰的レンダリング */}
      <Collection items={item.children || []}>{renderItem}</Collection>
    </TreeItem>
  );
});

export default TreeItemComponent;
