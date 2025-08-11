// ========================================================================================
// インポート
// ========================================================================================
import React, { memo, useState, useRef, useCallback, useEffect } from "react";
import { Tree } from "react-aria-components";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { useProjectTree } from "./useProjectTree";
import TreeItemComponent from "./TreeItemComponent";
import FolderContextMenu from "./FolderContextMenu";

// ========================================================================================
// メインコンポーネント
// ========================================================================================

/**
 * プロジェクトエキスプローラのメインコンポーネント
 * ファイルツリーの表示、ツールバー、各種操作を提供
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {number} props.currentSize - 現在のサイズ（パーセンテージ）
 * @returns {JSX.Element} プロジェクトエキスプローラのJSX要素
 */
function ProjectTree({ currentSize }) {
  // === カスタムフックからの状態とハンドラーを取得 ===
  const { expandedKeys, selectedKeys, filesystem, handleSelectionChange, handleExpandedChange, handleAction, handleRefresh, handleCollapseAll, setExpandedKeys } = useProjectTree();

  // =========================
  // コンテキストメニュー状態
  // =========================
  const [ctxMenu, setCtxMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null, // { id, name, path, ... }
  });

  const containerRef = useRef(null);

  const closeContextMenu = useCallback(() => {
    setCtxMenu((m) => (m.visible ? { ...m, visible: false, node: null } : m));
  }, []);

  // 右クリック呼び出し
  const handleFolderContextMenu = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    // Portal で fixed を使うのでスクリーン座標を直接使う
    setCtxMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node,
    });
  }, []);

  // 外側クリック / ESC で閉じる
  useEffect(() => {
    if (!ctxMenu.visible) return;
    const onDown = (ev) => {
      // メニュー内クリックはそのまま
      if (ev.target.closest?.("[data-role='folder-menu']")) return;
      closeContextMenu();
    };
    const onKey = (ev) => ev.key === "Escape" && closeContextMenu();
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [ctxMenu.visible, closeContextMenu]);

  // メニューアクション（必要に応じて実装）
  const menuAction = useCallback(
    (type) => {
      const node = ctxMenu.node;
      if (!node) return;
      switch (type) {
        case "new-file":
          // TODO
          break;
        case "new-folder":
          // TODO
          break;
        case "refresh":
          handleRefresh();
          break;
        case "collapse":
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            if (node.id !== "root") next.delete(node.id);
            return next;
          });
          break;
        case "rename":
          // TODO
          break;
        case "delete":
          // TODO
          break;
        default:
          break;
      }
      closeContextMenu();
    },
    [ctxMenu.node, handleRefresh, setExpandedKeys, closeContextMenu]
  );

  // === レンダリング関数 ===

  /**
   * ツリーアイテムの再帰的レンダリング
   * TreeItemComponent を使用して各アイテムを描画
   */
  const renderItem = useCallback(
    (item) => (
      <TreeItemComponent
        item={item}
        renderItem={renderItem}
        toolbarHandlers={{
          handleNewFile: () => menuAction("new-file"),
          handleNewFolder: () => menuAction("new-folder"),
          handleRefresh,
          handleCollapseAll,
        }}
        onFolderContextMenu={handleFolderContextMenu}
      />
    ),
    [handleFolderContextMenu, handleRefresh, handleCollapseAll, menuAction]
  );

  // === メインレンダリング ===
  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-base-100 relative"
      onContextMenuCapture={(e) => {
        // 既に子で stopPropagation 済みならここに来ない
        if (e.defaultPrevented) return;
        // フォルダ行以外の余白右クリック: メニュー閉じるのみ
        if (!e.target.closest("[data-node-row]")) {
          e.preventDefault();
          closeContextMenu();
        }
      }}
    >
      {/* ヘッダー部分（左に余白追加） */}
      <div className="flex flex-col justify-center py-1 px-1">
        <h2 id="tree-heading" className="text-sm font-semibold py-1">
          プロジェクト エキスプローラ
        </h2>
      </div>

      {/* ツリー表示エリア（メイン部分） */}
      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
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

      {/* === コンテキストメニュー（分離コンポーネント） === */}
      <FolderContextMenu visible={ctxMenu.visible} x={ctxMenu.x} y={ctxMenu.y} node={ctxMenu.node} onAction={menuAction} onClose={closeContextMenu} />
    </div>
  );
}

// React DevToolsでの表示名を設定
export default memo(ProjectTree);
