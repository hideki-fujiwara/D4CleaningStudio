// filepath: d:\Project\tauri\D4CleaningStudio\src\components\ProjectTree\FolderContextMenu.jsx
import React, { useEffect, useRef } from "react";
import { FOLDER_CONTEXT_MENU_ITEMS } from "./constants";

export default function FolderContextMenu({ visible, x, y, node, onAction, onClose, items }) {
  const ref = useRef(null);

  // Escape / 外クリックは親側(ProjectTree)で既に処理している場合は不要
  // 単体でも動くようフォールバック的に実装
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const onDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  const menuItems = items && items.length ? items : FOLDER_CONTEXT_MENU_ITEMS;

  return (
    <div
      ref={ref}
      data-role="folder-menu"
      className="absolute z-50 min-w-[180px] rounded border border-base-300 bg-base-100 shadow-lg py-1 text-sm"
      style={{ top: y, left: x }}
      role="menu"
      aria-label="フォルダ操作メニュー"
    >
      <div className="px-3 py-1 text-xs text-base-content/60 border-b truncate" title={node?.name}>
        {node?.name || "(folder)"}
      </div>
      {menuItems.map((m, i) =>
        m === "divider" ? (
          <div key={`d-${i}`} className="h-px bg-base-300 my-1" />
        ) : (
          <button
            key={m.type}
            role="menuitem"
            onClick={() => {
              if (m.type === "__close") onClose();
              else onAction(m.type);
            }}
            className={`w-full text-left px-3 py-1 hover:bg-base-200 ${m.danger ? "text-error hover:bg-error/20" : ""}`}
          >
            {m.label}
          </button>
        )
      )}
    </div>
  );
}
