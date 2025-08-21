import { useState, useCallback } from "react";

/**
 * 確認ダイアログの状態管理を行うカスタムフック
 * Promise ベースの確認ダイアログを提供
 *
 * @returns {Object} ダイアログの状態とハンドラー関数
 */
export const useConfirmDialog = () => {
  // ダイアログの状態を管理
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false, // ダイアログの表示状態
    title: "", // ダイアログのタイトル
    message: "", // ダイアログのメッセージ
    onConfirm: null, // 確認時のコールバック
  });

  /**
   * 確認ダイアログを表示する
   * Promise を返すため async/await で結果を取得可能
   *
   * @param {string} title - ダイアログのタイトル
   * @param {string} message - ダイアログのメッセージ
   * @returns {Promise<boolean>} ユーザーの選択結果（true: OK, false: キャンセル）
   */
  const showConfirmDialog = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        onConfirm: () => resolve(true), // OKボタンで true を返す
        onCancel: () => resolve(false), // キャンセルで false を返す
      });
    });
  }, []);

  /**
   * ダイアログを閉じる
   */
  const closeDialog = useCallback(() => {
    setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null });
  }, []);

  /**
   * キャンセル時の処理
   * onCancel コールバックを実行してからダイアログを閉じる
   */
  const handleCancel = useCallback(() => {
    confirmDialog.onCancel?.(); // キャンセルコールバックがあれば実行
    closeDialog();
  }, [confirmDialog.onCancel, closeDialog]);

  return {
    confirmDialog, // ダイアログの現在の状態
    showConfirmDialog, // ダイアログを表示する関数
    closeDialog, // ダイアログを閉じる関数
    handleCancel, // キャンセル処理の関数
  };
};
