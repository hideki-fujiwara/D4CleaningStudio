/**
 * ファイル拡張子とアイコンのマッピング
 * Lucide アイコンセットを使用してファイルタイプを視覚的に表現
 */
export const FILE_ICON_MAP = {
  // JavaScript/TypeScript関連
  js: "i-lucide-zap text-yellow-500", // JavaScript
  jsx: "i-lucide-atom text-blue-500", // React JSX
  ts: "i-lucide-code-2 text-blue-600", // TypeScript
  tsx: "i-lucide-layers text-blue-700", // TypeScript JSX

  // スタイルシート関連
  css: "i-lucide-paintbrush text-blue-400", // CSS
  scss: "i-lucide-palette text-pink-500", // Sass (SCSS)
  sass: "i-lucide-palette text-pink-500", // Sass
  less: "i-lucide-brush text-indigo-500", // Less

  // マークアップ言語関連
  html: "i-lucide-layout text-orange-500", // HTML
  htm: "i-lucide-layout text-orange-500", // HTML (古い拡張子)
  xml: "i-lucide-file-type text-orange-600", // XML
  svg: "i-lucide-shapes text-purple-500", // SVG

  // データファイル関連
  json: "i-lucide-braces text-green-500", // JSON
  yaml: "i-lucide-list text-red-500", // YAML
  yml: "i-lucide-list text-red-500", // YAML (短縮形)
  toml: "i-lucide-file-key text-orange-400", // TOML
  csv: "i-lucide-sheet text-green-600", // CSV

  // ドキュメント関連
  md: "i-lucide-book-open text-blue-600", // Markdown
  markdown: "i-lucide-book-open text-blue-600", // Markdown (フル拡張子)
  txt: "i-lucide-file-text text-gray-500", // テキストファイル
  pdf: "i-lucide-file-down text-red-600", // PDF

  // 画像ファイル関連
  png: "i-lucide-camera text-green-500", // PNG
  jpg: "i-lucide-camera text-green-500", // JPEG
  jpeg: "i-lucide-camera text-green-500", // JPEG (フル拡張子)
  gif: "i-lucide-film text-pink-400", // GIF
  webp: "i-lucide-image text-purple-400", // WebP
  ico: "i-lucide-star text-yellow-600", // アイコンファイル

  // 設定ファイル関連
  env: "i-lucide-key text-yellow-600", // 環境変数ファイル
  config: "i-lucide-cog text-gray-600", // 設定ファイル
  conf: "i-lucide-cog text-gray-600", // 設定ファイル (短縮形)

  // プログラミング言語関連
  py: "i-lucide-snake text-green-400", // Python
  java: "i-lucide-coffee text-brown-500", // Java
  php: "i-lucide-server text-purple-600", // PHP
  rb: "i-lucide-gem text-red-400", // Ruby
  go: "i-lucide-zap text-cyan-500", // Go
  rs: "i-lucide-shield-check text-orange-600", // Rust

  // その他のファイル
  log: "i-lucide-scroll-text text-gray-600", // ログファイル
  zip: "i-lucide-package text-yellow-700", // 圧縮ファイル
  exe: "i-lucide-play-circle text-red-500", // 実行ファイル
};

/**
 * ファイル名から適切なアイコンクラスを取得する
 *
 * @param {string} fileName - ファイル名
 * @returns {string} アイコンのCSSクラス名
 */
export const getFileIcon = (fileName) => {
  // ファイル名から拡張子を抽出（小文字に変換）
  const extension = fileName.split(".").pop()?.toLowerCase();

  // マッピングから対応するアイコンを取得、なければデフォルトアイコンを返す
  return FILE_ICON_MAP[extension] || "i-lucide-file text-gray-500";
};
