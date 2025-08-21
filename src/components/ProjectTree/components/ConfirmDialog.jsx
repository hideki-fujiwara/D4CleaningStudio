/**
 * 確認ダイアログコンポーネント
 *
 * 機能:
 * - ユーザーに確認を求める際に使用するモーダルダイアログ
 * - 削除操作などの重要なアクションの前に表示
 * - Escape キーや背景クリックで閉じることが可能
 * - react-aria-components を使用したアクセシブルな実装
 */
import React, { memo } from "react";
import { ModalOverlay, Modal, Dialog, Heading, Button } from "react-aria-components";

/**
 * 確認ダイアログコンポーネント
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isOpen - ダイアログの表示状態
 * @param {function} props.onOpenChange - ダイアログの開閉状態が変更された時のコールバック
 * @param {string} props.title - ダイアログのタイトル
 * @param {string} props.message - ダイアログに表示するメッセージ（改行 \n 対応）
 * @param {function} props.onConfirm - OKボタンが押された時のコールバック
 * @param {function} props.onCancel - キャンセルボタンが押された時のコールバック
 * @returns {JSX.Element} 確認ダイアログのJSX要素
 *
 * @example
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onOpenChange={setShowConfirm}
 *   title="削除確認"
 *   message="このファイルを削除しますか？\nこの操作は元に戻せません。"
 *   onConfirm={handleDelete}
 *   onCancel={handleCancel}
 * />
 */
const ConfirmDialog = memo(({ isOpen, onOpenChange, title, message, onConfirm, onCancel }) => (
  // モーダルオーバーレイ - 背景を暗くしてダイアログを浮かせる
  <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    {/* モーダル本体 - ダイアログの外枠とシャドウ */}
    <Modal className="bg-base-100 border border-base-200 rounded-lg shadow-xl max-w-md w-full mx-4">
      {/* ダイアログコンテンツ - 内部パディングと要素間隔 */}
      <Dialog className="p-6 space-y-4">
        {/* タイトル部分 - セマンティックな見出し要素 */}
        <Heading className="text-lg font-semibold text-base-content">{title}</Heading>

        {/* メッセージ部分 - whitespace-pre-lineで改行(\n)を有効化 */}
        <div className="text-base-content whitespace-pre-line">{message}</div>

        {/* ボタン部分 - 右寄せで配置 */}
        <div className="flex gap-3 justify-end">
          {/* キャンセルボタン - セカンダリ操作 */}
          <Button
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded hover:bg-base-200 text-base-content"
            onPress={() => {
              onCancel?.(); // キャンセルコールバックを実行（optional chaining で安全に呼び出し）
              onOpenChange(false); // ダイアログを閉じる
            }}
          >
            キャンセル
          </Button>

          {/* 確認ボタン - プライマリ操作（強調表示） */}
          <Button
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-primary text-primary-content hover:brightness-95"
            onPress={() => {
              onConfirm?.(); // 確認コールバックを実行（optional chaining で安全に呼び出し）
              onOpenChange(false); // ダイアログを閉じる
            }}
          >
            OK
          </Button>
        </div>
      </Dialog>
    </Modal>
  </ModalOverlay>
));

// React DevToolsでの表示名を設定（デバッグ時の識別用）
ConfirmDialog.displayName = "ConfirmDialog";

export default ConfirmDialog;
