import React, { memo } from "react";
import { ModalOverlay, Modal, Dialog, Heading, Button } from "react-aria-components";

/**
 * 確認ダイアログコンポーネント
 * ユーザーに確認を求める際に使用するモーダルダイアログ
 *
 * @param {boolean} isOpen - ダイアログの表示状態
 * @param {function} onOpenChange - ダイアログの開閉状態が変更された時のコールバック
 * @param {string} title - ダイアログのタイトル
 * @param {string} message - ダイアログに表示するメッセージ（改行対応）
 * @param {function} onConfirm - OKボタンが押された時のコールバック
 * @param {function} onCancel - キャンセルボタンが押された時のコールバック
 */
const ConfirmDialog = memo(({ isOpen, onOpenChange, title, message, onConfirm, onCancel }) => (
  // モーダルオーバーレイ - 背景を暗くしてダイアログを浮かせる
  <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    {/* モーダル本体 - ダイアログの外枠 */}
    <Modal className="bg-base-100 border border-base-200 rounded-lg shadow-xl max-w-md w-full mx-4">
      {/* ダイアログコンテンツ */}
      <Dialog className="p-6 space-y-4">
        {/* タイトル部分 */}
        <Heading className="text-lg font-semibold text-base-content">{title}</Heading>

        {/* メッセージ部分 - whitespace-pre-lineで改行を有効化 */}
        <div className="text-base-content whitespace-pre-line">{message}</div>

        {/* ボタン部分 */}
        <div className="flex gap-3 justify-end">
          {/* キャンセルボタン */}
          <Button
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded hover:bg-base-200 text-base-content"
            onPress={() => {
              onCancel?.(); // キャンセルコールバックを実行
              onOpenChange(false); // ダイアログを閉じる
            }}
          >
            キャンセル
          </Button>

          {/* 確認ボタン */}
          <Button
            className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded bg-primary text-primary-content hover:brightness-95"
            onPress={() => {
              onConfirm?.(); // 確認コールバックを実行
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

// React DevToolsでの表示名を設定
ConfirmDialog.displayName = "ConfirmDialog";

export default ConfirmDialog;
