// ========================================================================================
// インポート
// ========================================================================================
import React, { useEffect, useCallback, memo } from "react";
import { Tree } from "react-aria-components";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { useProjectTree } from "./useProjectTree";
import { useConfirmDialog } from "./useConfirmDialog";
import ToolButton from "./ToolButton";
import TreeItemComponent from "./TreeItemComponent";
import ConfirmDialog from "./ConfirmDialog";

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
  const {
    expandedKeys, // 展開されているノード
    selectedKeys, // 選択されているノード
    projectName, // プロジェクト名
    filesystem, // ファイルシステムのツリー
    handleSelectionChange, // 選択変更ハンドラー
    handleExpandedChange, // 展開状態変更ハンドラー
    handleAction, // アクション実行ハンドラー
    handleRefresh, // 更新ハンドラー
    handleCollapseAll, // 全て折りたたみハンドラー
    loadProjectName, // プロジェクト名読み込み
    loadFilesystemFromConfig, // 設定からファイルシステム読み込み
    setFilesystem, // ファイルシステム状態設定
  } = useProjectTree();

  // 確認ダイアログの状態とハンドラー
  const { confirmDialog, showConfirmDialog, closeDialog, handleCancel } = useConfirmDialog();

  // === 初期化処理 ===
  useEffect(() => {
    let cancelled = false;

    // 非同期初期化処理
    (async () => {
      if (cancelled) return;
      // プロジェクト名とファイルシステムを並行して読み込み
      await Promise.all([loadProjectName(), loadFilesystemFromConfig()]);
    })();

    // クリーンアップ：コンポーネントアンマウント時にキャンセル
    return () => {
      cancelled = true;
    };
  }, [loadProjectName, loadFilesystemFromConfig]);

  // === プロジェクト名変更時の同期処理 ===
  useEffect(() => {
    setFilesystem((prev) => {
      // 配列が空または無効な場合はそのまま返す
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      const root = prev[0];
      // ルート以外またはすでに同じ名前の場合は変更不要
      if (root?.id !== "root" || root?.name === projectName) return prev;

      // ルートの名前のみ更新した新しい配列を返す
      return [{ ...root, name: projectName }, ...prev.slice(1)];
    });
  }, [projectName, setFilesystem]);

  // === ツールバーアクション ===

  /**
   * 新しいファイル作成ボタンのハンドラー
   * 現在は PoC のためログ出力のみ
   */
  const handleNewFile = useCallback(() => {
    ConsoleMsg("info", "新しいファイル作成");
    // TODO: 実際のファイル作成処理を実装
  }, []);

  /**
   * 新しいフォルダ作成ボタンのハンドラー
   * 現在は PoC のためログ出力のみ
   */
  const handleNewFolder = useCallback(() => {
    ConsoleMsg("info", "新しいフォルダ作成");
    // TODO: 実際のフォルダ作成処理を実装
  }, []);

  // === レンダリング関数 ===

  /**
   * ツリーアイテムの再帰的レンダリング
   * TreeItemComponent を使用して各アイテムを描画
   */
  const renderItem = useCallback(
    function renderItem(item) {
      // ツールバーハンドラーをまとめたオブジェクト
      const toolbarHandlers = {
        handleNewFile,
        handleNewFolder,
        handleRefresh,
        handleCollapseAll,
      };

      return <TreeItemComponent item={item} renderItem={renderItem} toolbarHandlers={toolbarHandlers} />;
    },
    [handleNewFile, handleNewFolder, handleRefresh, handleCollapseAll]
  );

  // === メインレンダリング ===
  return (
    <div className="h-full flex flex-col bg-base-100 rounded">
      {/* ヘッダー部分（左に余白追加） */}
      <div className="flex flex-col justify-center py-1 rounded px-2">
        <h2 id="tree-heading" className="shrink-0 text-sm py-1 font-semibold text-base-content">
          プロジェクト エキスプローラ
        </h2>
      </div>

      {/* ツリー表示エリア（メイン部分） */}
      <div className="flex h-full flex-col overflow-y-auto">
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
          className="border-separate border-spacing-0 w-full bg-base-100 overflow-auto rounded"
        >
          {renderItem}
        </Tree>
      </div>

      {/* フッター部分 */}
      <div className="border-t border-base-200 p-2">
        <div className="text-xs text-base-content/70 flex items-center space-x-1">
          <div className="i-lucide-info w-3 h-3" />
          <span>{selectedKeys.size > 0 ? `選択中: ${Array.from(selectedKeys).sort()[0]}` : "ファイルを選択してください"}</span>
        </div>
      </div>
      {/* 確認ダイアログ */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleCancel();
          }
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

// React DevToolsでの表示名を設定
export default memo(ProjectTree);
