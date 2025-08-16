// ========================================================================================
// インポート
// ========================================================================================
import React, { memo, useState, useRef, useCallback, useEffect } from "react";
import { Tree } from "react-aria-components";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { useProjectTree } from "./useProjectTree";
import { useTreeDrop } from "./useDragAndDrop";
import { DROP_ZONE_STYLES, CONTEXT_MENU_ACTIONS } from "./constants";
import TreeItemComponent from "./TreeItemComponent";
import FolderContextMenu from "./FolderContextMenu";

/**
 * プロジェクトエキスプローラのメインコンポーネント
 */
function ProjectTree({ currentSize }) {
  // カスタムフックからの状態とハンドラー
  const { expandedKeys, selectedKeys, filesystem, handleSelectionChange, handleExpandedChange, handleAction, handleRefresh, handleCollapseAll, setExpandedKeys } = useProjectTree();

  // コンテキストメニュー状態
  const [ctxMenu, setCtxMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  const containerRef = useRef(null);

  // ファイル移動処理
  const handleFileMove = useCallback(async (draggedItem) => {
    try {
      ConsoleMsg?.("info", "File move requested", draggedItem);
      // TODO: バックエンドAPIを呼び出してファイル移動を実行
      // await moveFileAPI(draggedItem.path, targetPath);
      // handleRefresh();
    } catch (error) {
      ConsoleMsg?.("error", "File move failed", error);
    }
  }, []);

  // ドロップ機能（refを含む）
  const { dropRef, dropProps, isDropTarget } = useTreeDrop(handleFileMove);

  // コンテキストメニュー管理
  const closeContextMenu = useCallback(() => {
    setCtxMenu((prev) => (prev.visible ? { ...prev, visible: false, node: null } : prev));
  }, []);

  const handleFolderContextMenu = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  }, []);

  // メニューアクション処理
  const handleMenuAction = useCallback(
    (type) => {
      const node = ctxMenu.node;
      if (!node) return;

      switch (type) {
        case CONTEXT_MENU_ACTIONS.NEW_FILE:
          ConsoleMsg?.("info", "New file action", { nodeId: node.id });
          // TODO: 新規ファイル作成
          break;
        case CONTEXT_MENU_ACTIONS.NEW_FOLDER:
          ConsoleMsg?.("info", "New folder action", { nodeId: node.id });
          // TODO: 新規フォルダ作成
          break;
        case CONTEXT_MENU_ACTIONS.REFRESH:
          handleRefresh();
          break;
        case CONTEXT_MENU_ACTIONS.COLLAPSE:
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (node.id !== "root") next.delete(node.id);
            return next;
          });
          break;
        case CONTEXT_MENU_ACTIONS.RENAME:
          ConsoleMsg?.("info", "Rename action", { nodeId: node.id });
          // TODO: リネーム処理
          break;
        case CONTEXT_MENU_ACTIONS.DELETE:
          ConsoleMsg?.("info", "Delete action", { nodeId: node.id });
          // TODO: 削除処理
          break;
        default:
          ConsoleMsg?.("warn", "Unknown menu action", { type });
          break;
      }
      closeContextMenu();
    },
    [ctxMenu.node, handleRefresh, setExpandedKeys, closeContextMenu]
  );

  // 外側クリック/ESCでメニューを閉じる
  useEffect(() => {
    if (!ctxMenu.visible) return;

    const handleClickOutside = (ev) => {
      if (!ev.target.closest?.("[data-role='folder-menu']")) {
        closeContextMenu();
      }
    };

    const handleKeydown = (ev) => {
      if (ev.key === "Escape") {
        closeContextMenu();
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [ctxMenu.visible, closeContextMenu]);

  // ツリーアイテムのレンダリング
  const renderItem = useCallback(
    (item) => (
      <TreeItemComponent
        key={item.id}
        item={item}
        renderItem={renderItem}
        toolbarHandlers={{
          handleNewFile: () => handleMenuAction(CONTEXT_MENU_ACTIONS.NEW_FILE),
          handleNewFolder: () => handleMenuAction(CONTEXT_MENU_ACTIONS.NEW_FOLDER),
          handleRefresh,
          handleCollapseAll,
        }}
        onFolderContextMenu={handleFolderContextMenu}
      />
    ),
    [handleFolderContextMenu, handleRefresh, handleCollapseAll, handleMenuAction]
  );

  return (
    <div
      ref={containerRef}
      className={`${DROP_ZONE_STYLES.base} ${isDropTarget ? DROP_ZONE_STYLES.active : ""}`}
      onContextMenuCapture={(e) => {
        if (e.defaultPrevented) return;
        if (!e.target.closest("[data-node-row]")) {
          e.preventDefault();
          closeContextMenu();
        }
      }}
    >
      {/* ヘッダー */}
      <header className="flex flex-col justify-center py-1 px-1">
        <h2 id="tree-heading" className="text-sm font-semibold py-1">
          プロジェクト エキスプローラ
        </h2>
      </header>

      {/* ツリー表示エリア（ドロップゾーン） */}
      <div ref={dropRef} {...dropProps} className={`${DROP_ZONE_STYLES.content} ${isDropTarget ? "bg-base-200" : ""}`}>
        <Tree
          aria-label="プロジェクトファイルツリー"
          aria-labelledby="tree-heading"
          selectionMode="single"
          selectionBehavior="replace"
          items={filesystem}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onSelectionChange={handleSelectionChange}
          onExpandedChange={handleExpandedChange}
          onAction={handleAction}
          className="w-full bg-base-100"
        >
          {renderItem}
        </Tree>
      </div>

      {/* コンテキストメニュー */}
      <FolderContextMenu visible={ctxMenu.visible} x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node} onAction={handleMenuAction} onClose={closeContextMenu} />
    </div>
  );
}

export default memo(ProjectTree);
