// ========================================================================================
// インポート
// ========================================================================================
import React, { memo, useState, useRef, useCallback, useEffect } from "react";
import { Tree } from "react-aria-components";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { useProjectTree } from "./useProjectTree";
import TreeItemComponent from "./TreeItemComponent";

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

    // コンテナ基準の座標計算
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : e.clientX;
    const y = rect ? e.clientY - rect.top : e.clientY;

    ConsoleMsg("debug", "open menu", { id: node.id, name: node.name, x, y });
    setCtxMenu({
      visible: true,
      x,
      y,
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
      <div className="flex flex-col justify-center py-1 px-2 border-b">
        <h2 id="tree-heading" className="text-sm font-semibold py-1">
          プロジェクト エキスプローラ
        </h2>
      </div>

      {/* ツリー表示エリア（メイン部分） */}
      <div className="flex flex-col overflow-y-auto">
        <Tree
          aria-label="プロジェクトファイルツリー"
          aria-labelledby="tree-heading" // ヘッダーとの関連付け
          selectionMode="single" // 単一選択モード
          selectionBehavior="replace" // 選択時は置換
          items={filesystem} // ツリーのデータ
          selectedKeys={selectedKeys} // 選択状態
          expandedKeys={expandedKeys} // 展開状態
          onSelectionChange={handleSelectionChange} // 選択変更時
          onExpandedChange={handleExpandedChange} // 展開変更時
          onAction={handleAction} // アクション実行時
          className="w-full bg-base-100"
        >
          {renderItem}
        </Tree>
      </div>

      {/* === コンテキストメニュー === */}
      {ctxMenu.visible && (
        <div data-role="folder-menu" className="absolute z-50 min-w-[180px] rounded border border-base-300 bg-base-100 shadow-lg py-1 text-sm" style={{ top: ctxMenu.y, left: ctxMenu.x }}>
          <div className="px-3 py-1 text-xs text-base-content/60 border-b">{ctxMenu.node?.name}</div>
          <button onClick={() => menuAction("new-file")} className="w-full text-left px-3 py-1 hover:bg-base-200">
            新しいファイル
          </button>
          <button onClick={() => menuAction("new-folder")} className="w-full text-left px-3 py-1 hover:bg-base-200">
            新しいフォルダ
          </button>
          <button onClick={() => menuAction("refresh")} className="w-full text-left px-3 py-1 hover:bg-base-200">
            更新
          </button>
          <button onClick={() => menuAction("collapse")} className="w-full text-left px-3 py-1 hover:bg-base-200">
            折りたたむ
          </button>
          <div className="h-px bg-base-300 my-1" />
          <button onClick={() => menuAction("rename")} className="w-full text-left px-3 py-1 hover:bg-base-200">
            名前変更
          </button>
          <button onClick={() => menuAction("delete")} className="w-full text-left px-3 py-1 hover:bg-error/20 text-error">
            削除
          </button>
          <div className="h-px bg-base-300 my-1" />
          <button onClick={closeContextMenu} className="w-full text-left px-3 py-1 hover:bg-base-200">
            閉じる(Esc)
          </button>
        </div>
      )}
    </div>
  );
}

// React DevToolsでの表示名を設定
export default memo(ProjectTree);
