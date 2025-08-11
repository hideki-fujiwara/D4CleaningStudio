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
import React, { memo } from "react";
import { TreeItem, TreeItemContent, Button, Collection } from "react-aria-components";
import { getFileIcon } from "./icons";
import { TREE_ITEM_STYLES, CHEVRON_STYLES } from "./constants";
import ToolButton from "./ToolButton";
import ConsoleMsg from "../../utils/ConsoleMsg";

/**
 * ツリー項目コンポーネント
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {Object} props.item - 表示するノードデータ
 * @param {string} props.item.id - ノードの一意識別子
 * @param {string} props.item.name - 表示名
 * @param {boolean} props.item.isDirectory - フォルダかどうか
 * @param {boolean} props.item.isPlaceholder - プレースホルダ（空フォルダ表示）かどうか
 * @param {Array} props.item.children - 子ノード配列
 * @param {function} props.renderItem - 子アイテムのレンダリング関数（再帰用）
 * @param {Object} props.toolbarHandlers - ルートレベルツールバーのハンドラ群
 * @param {function} props.onFolderContextMenu - フォルダ右クリック時のコールバック
 * @returns {JSX.Element} ツリー項目のJSX要素
 *
 * @example
 * <TreeItemComponent
 *   item={{ id: "folder1", name: "src", isDirectory: true, children: [...] }}
 *   renderItem={renderItem}
 *   toolbarHandlers={{ handleNewFile, handleRefresh, ... }}
 *   onFolderContextMenu={handleContextMenu}
 * />
 */
const TreeItemComponent = memo(function TreeItemComponent({ item, renderItem, toolbarHandlers, onFolderContextMenu }) {
  // ノードタイプの判定
  const isDir = item.isDirectory === true;
  const isPlaceholder = item.isPlaceholder === true;

  /**
   * 実際に表示する子ノード配列の生成
   * 空フォルダの場合は「（ 空 ）」プレースホルダを1件挿入
   * @type {Array}
   */
  const effectiveChildren =
    isDir && !isPlaceholder && Array.isArray(item.children) && item.children.length === 0
      ? [
          {
            id: item.id + "__empty", // 親IDに基づく一意ID
            name: "（ 空 ）",
            isDirectory: false,
            isFile: true,
            isPlaceholder: true, // プレースホルダフラグ
          },
        ]
      : item.children || [];

  /**
   * 行の右クリックイベントハンドラ
   * フォルダの場合のみコンテキストメニューを表示
   *
   * @param {MouseEvent} e - 右クリックイベント
   */
  const handleRowContextMenu = (e) => {
    e.preventDefault(); // ブラウザ標準メニューを無効化
    e.stopPropagation(); // イベントバブリングを停止

    if (isPlaceholder) return; // プレースホルダは何もしない

    if (isDir) {
      // フォルダの場合: デバッグログ出力 + メニュー表示
      ConsoleMsg?.("debug", "row contextmenu (dir)", { id: item.id, name: item.name });
      onFolderContextMenu?.(e, item);
    } else {
      // ファイルの場合: ログのみ（メニューは表示しない）
      ConsoleMsg?.("debug", "row contextmenu (file suppressed)", { id: item.id });
    }
  };

  return (
    // react-aria-components のツリー項目 - アクセシビリティ完全対応
    <TreeItem
      key={item.id}
      id={item.id}
      textValue={item.name} // スクリーンリーダー用のテキスト
      hasChildNodes={isDir} // 子ノード有無をライブラリに通知
      isDisabled={isPlaceholder} // プレースホルダは選択不可
      className={`${TREE_ITEM_STYLES.selected} ${TREE_ITEM_STYLES.base} ${TREE_ITEM_STYLES.focus} ${TREE_ITEM_STYLES.hover} ${
        isPlaceholder ? "pointer-events-none opacity-60 italic" : "" // プレースホルダ専用スタイル
      }`}
    >
      {/* ツリー項目のコンテンツ部分 */}
      <TreeItemContent>
        {({ isExpanded }) => {
          // プレースホルダ（空フォルダ表示）の場合
          if (isPlaceholder) {
            return (
              <div
                data-node-row // CSS・イベント識別用属性
                data-node-id={item.id}
                data-node-type="placeholder"
                className="flex items-center py-0.5 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)] text-xs whitespace-nowrap"
                onContextMenu={handleRowContextMenu}
              >
                {/* アイコン部分（空のスペーサー） */}
                <div className="w-4 h-4 shrink-0" />
                <span>（ 空 ）</span>
              </div>
            );
          }

          // 通常のファイル・フォルダ表示
          const showChevron = isDir; // フォルダの場合のみ展開ボタンを表示

          return (
            <div data-node-row data-node-id={item.id} data-node-type={isDir ? "dir" : "file"} className="flex items-center justify-between py-0.5" onContextMenu={handleRowContextMenu}>
              {/* 左側: インデント + 展開ボタン + アイコン + 名前 */}
              <div className="flex items-center space-x-1 ps-[calc(calc(var(--tree-item-level)_-_1)_*_1rem)]">
                {showChevron ? (
                  <Button
                    slot="chevron"
                    className={`${CHEVRON_STYLES.base} ${CHEVRON_STYLES.button} ${
                      isExpanded ? "rotate-90" : "" // 展開時は90度回転
                    }`}
                  >
                    <div className="i-lucide-chevron-right w-4 h-4" />
                  </Button>
                ) : (
                  // ファイルの場合: 同じ幅のスペーサーで配置を揃える
                  <div className="w-6 h-6 shrink-0" />
                )}
                {/* アイコン + 名前部分 */}
                <div className="flex items-center space-x-2 min-w-0">
                  {/* ファイル/フォルダアイコン */}
                  <div
                    className={`w-4 h-4 ${
                      isDir
                        ? isExpanded
                          ? "i-lucide-folder-open"
                          : "i-lucide-folder" // フォルダ: 開閉状態で切替
                        : getFileIcon(item.name) // ファイル: 拡張子に応じたアイコン
                    }`}
                  />

                  {/* ファイル・フォルダ名（長い場合は省略表示） */}
                  <div
                    className="text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0"
                    title={item.name} // ホバー時に完全名を表示
                  >
                    {item.name}
                  </div>
                </div>
              </div>

              {/* 右側: ルートレベルツールバー（ルートノードの場合のみ） */}
              {item.id === "root" && toolbarHandlers && (
                <div className="flex items-center mr-2">
                  {/* 新規ファイル作成ボタン */}
                  <ToolButton onPress={toolbarHandlers.handleNewFile} icon="i-lucide-file-text" label="新ファイル" />
                  {/* 新規フォルダ作成ボタン */}
                  <ToolButton onPress={toolbarHandlers.handleNewFolder} icon="i-lucide-folder-plus" label="新フォルダ" />
                  {/* 更新ボタン */}
                  <ToolButton onPress={toolbarHandlers.handleRefresh} icon="i-lucide-rotate-cw" label="更新" />
                  {/* 全折りたたみボタン */}
                  <ToolButton onPress={toolbarHandlers.handleCollapseAll} icon="i-lucide-minimize-2" label="折りたたみ" />
                </div>
              )}
            </div>
          );
        }}
      </TreeItemContent>

      {/* 子ノードの再帰的レンダリング */}
      <Collection items={effectiveChildren}>
        {(child) => <TreeItemComponent item={child} renderItem={renderItem} toolbarHandlers={toolbarHandlers} onFolderContextMenu={onFolderContextMenu} />}
      </Collection>
    </TreeItem>
  );
});

// React DevToolsでの表示名を設定
TreeItemComponent.displayName = "TreeItemComponent";

export default TreeItemComponent;
