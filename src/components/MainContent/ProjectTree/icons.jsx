/**
 * アイコンコンポーネント定義
 */
import React from "react";

// ベースアイコンコンポーネント
const BaseIcon = ({ children, className = "w-4 h-4", ...props }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
    {children}
  </svg>
);

// ファイルアイコン
export const FileIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </BaseIcon>
);

// フォルダアイコン（閉じた状態）
export const FolderIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </BaseIcon>
);

// フォルダアイコン（開いた状態）
export const FolderOpenIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
  </BaseIcon>
);

// シェブロンアイコン
export const ChevronRightIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </BaseIcon>
);

// ツールバーアイコン群
export const PlusIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </BaseIcon>
);

export const FolderPlusIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
  </BaseIcon>
);

export const RefreshIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </BaseIcon>
);

export const CollapseIcon = ({ className, ...props }) => (
  <BaseIcon className={className} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </BaseIcon>
);

// ファイル拡張子に基づくアイコン選択
export const getFileIcon = (filename) => {
  const ext = filename.split(".").pop()?.toLowerCase();

  // 拡張子に応じてCSSクラスを返す（UnoCSS/Tailwind + アイコンライブラリ使用時）
  switch (ext) {
    case "js":
    case "jsx":
      return "i-vscode-icons-file-type-js-official";
    case "ts":
    case "tsx":
      return "i-vscode-icons-file-type-typescript-official";
    case "css":
      return "i-vscode-icons-file-type-css";
    case "html":
      return "i-vscode-icons-file-type-html";
    case "json":
      return "i-vscode-icons-file-type-json";
    case "md":
      return "i-vscode-icons-file-type-markdown";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
      return "i-vscode-icons-file-type-image";
    default:
      return "i-vscode-icons-default-file";
  }
};
