/**
 * ファイル保存確認ダイアログコンポーネント
 * React Ariaのドラッグ&ドロップとの互換性を考慮したカスタムダイアログ
 */
import React, { memo } from "react";
import { ModalOverlay, Modal, Dialog, Heading, Button } from "react-aria-components";

/**
 * 保存確認ダイアログコンポーネント
 *
 * @param {Object} props - コンポーネントのプロパティ
 * @param {boolean} props.isOpen - ダイアログの表示状態
 * @param {function} props.onOpenChange - ダイアログの開閉状態が変更された時のコールバック
 * @param {function} props.onSave - 保存ボタンが押された時のコールバック
 * @param {function} props.onDiscard - 破棄ボタンが押された時のコールバック
 * @param {function} props.onCancel - キャンセルボタンが押された時のコールバック
 * @param {string} props.fileName - 現在のファイル名
 */
const SaveConfirmDialog = memo(({ isOpen, onOpenChange, onSave, onDiscard, onCancel, fileName = "現在のファイル" }) => (
  <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
    <Modal className="bg-base-100 border border-base-200 rounded-lg shadow-xl max-w-md w-full mx-4">
      <Dialog className="p-6 space-y-4">
        {/* タイトル部分 */}
        <Heading className="text-lg font-semibold text-base-content flex items-center gap-2">
          <span className="text-warning">⚠️</span>
          未保存の変更があります
        </Heading>

        {/* メッセージ部分 */}
        <div className="text-base-content space-y-2">
          <p>
            <strong>{fileName}</strong> に保存されていない変更があります。
          </p>
          <p className="text-sm text-base-content/70">新しいファイルを開く前に、これらの変更をどうしますか？</p>
        </div>

        {/* ボタン部分 */}
        <div className="flex gap-2 justify-end">
          {/* キャンセルボタン */}
          <Button
            className="inline-flex items-center justify-center px-3 py-2 text-sm rounded hover:bg-base-200 text-base-content border border-base-300"
            onPress={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            キャンセル
          </Button>

          {/* 破棄ボタン */}
          <Button
            className="inline-flex items-center justify-center px-3 py-2 text-sm rounded bg-error text-error-content hover:brightness-95"
            onPress={() => {
              onDiscard?.();
              onOpenChange(false);
            }}
          >
            破棄して開く
          </Button>

          {/* 保存ボタン */}
          <Button
            className="inline-flex items-center justify-center px-3 py-2 text-sm rounded bg-primary text-primary-content hover:brightness-95"
            onPress={() => {
              onSave?.();
              onOpenChange(false);
            }}
          >
            保存して開く
          </Button>
        </div>
      </Dialog>
    </Modal>
  </ModalOverlay>
));

SaveConfirmDialog.displayName = "SaveConfirmDialog";

export default SaveConfirmDialog;
