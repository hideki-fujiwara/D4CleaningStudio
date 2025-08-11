// フォルダ右クリック時に表示するコンテキストメニュー
// - Portal(createPortal) を用いて body 直下に描画し、他要素の z-index / overflow 影響を受けないようにする
// - ビューポート端では簡易的に位置を補正
// - Esc / 外クリックで閉じる
// - props.items が無ければ定数 FOLDER_CONTEXT_MENU_ITEMS を使用
// - paste は canPaste=false の場合 disabled
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FOLDER_CONTEXT_MENU_ITEMS } from "./constants";

/**
 * FolderContextMenu
 * @param {boolean} visible   表示フラグ
 * @param {number}  x         画面左上基準 X 座標 (clientX)
 * @param {number}  y         画面左上基準 Y 座標 (clientY)
 * @param {Object}  node      対象ノード ({ id, name, path など })
 * @param {Function} onAction 項目クリック時 (type)=>void
 * @param {Function} onClose  メニュー閉じるハンドラ
 * @param {Array}   items     カスタム項目 (省略時 FOLDER_CONTEXT_MENU_ITEMS)
 * @param {boolean} canPaste  貼り付け許可 (clipboard に何かあるか)
 */
export default function FolderContextMenu({ visible, x, y, node, onAction, onClose, items, canPaste }) {
  const ref = useRef(null); // メニュー DOM 参照
  const portalRef = useRef(null); // Portal 先コンテナ (body 直下)

  // Portal マウント先生成（なければ body に追加）
  useEffect(() => {
    let el = document.getElementById("app-overlay-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "app-overlay-root";
      document.body.appendChild(el);
    }
    portalRef.current = el;
  }, []);

  // 可視時のみ: Esc で閉じる / 外側クリックで閉じる
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const onDown = (e) => {
      if (!ref.current) return;
      // メニュー外をクリックしたら閉じる
      if (!ref.current.contains(e.target)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [visible, onClose]);

  // Portal 先未準備 or 非表示なら何も描画しない
  if (!visible || !portalRef.current) return null;

  // 使用するメニュー項目
  const menuItems = items && items.length ? items : FOLDER_CONTEXT_MENU_ITEMS;

  // ---- 位置補正（簡易） ----
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const MENU_W = 220; // 想定幅
  const MENU_H_EST = 260; // 想定高さ(概算)
  let left = x;
  let top = y;
  if (left + MENU_W > vw) left = Math.max(4, vw - MENU_W - 4);
  if (top + MENU_H_EST > vh) top = Math.max(4, vh - MENU_H_EST - 4);

  // ---- メニュー本体 ----
  const content = (
    <div
      ref={ref}
      data-role="folder-menu"
      className="fixed z-[9999] min-w-[200px] rounded bg-base-100 shadow-xl py-1 text-sm select-none"
      style={{ top, left }}
      role="menu"
      aria-label="フォルダ操作メニュー"
    >
      {/* タイトル行: 対象フォルダ名 */}
      <div className="px-3 py-1 text-xs text-base-content truncate" title={node?.name}>
        {node?.name || "(folder)"}
      </div>
      <div className="h-px bg-base-300 my-1" />

      {/* 項目リスト */}
      {menuItems.map((m, i) =>
        m === "divider" ? (
          <div key={`d-${i}`} className="h-px bg-base-300 my-1" />
        ) : (
          <button
            key={m.type}
            role="menuitem"
            // 貼り付け禁止時は無効化
            disabled={m.type === "paste" && !canPaste}
            onClick={() => {
              if (m.type === "__close") onClose();
              else if (!(m.type === "paste" && !canPaste)) onAction(m.type);
            }}
            className={`w-full flex items-center justify-between px-3 py-1 text-base-content hover:bg-base-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              m.danger ? "text-error hover:bg-error/20" : ""
            }`}
          >
            <span className="flex-1 truncate text-left">{m.label}</span>
            <span className={`ml-4 shrink-0 text-xs font-mono tracking-tight text-base-content/60 ${m.shortcut ? "" : "opacity-0"}`}>{m.shortcut || "•"}</span>
          </button>
        )
      )}
    </div>
  );

  // Portal で body 直下へ
  return createPortal(content, portalRef.current);
}
