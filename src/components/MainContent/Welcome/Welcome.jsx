/**
 * ================================================================
 * ウェルカムコンポーネント
 * ================================================================
 *
 * アプリケーションの初期表示またはタブが存在しない場合に表示される
 * ウェルカム画面を提供する
 *
 * @author D4CleaningStudio
 * @version 1.0.0
 */
import React from "react";
import { NodeDiagramIcon } from "../Icons";

/**
 * ウェルカムコンポーネント
 * アプリケーションの初期画面とクイックアクションを提供
 *
 * @param {Object} props - プロパティ
 * @param {function} props.onCreateNewFlow - 新しいフロー作成ハンドラー
 * @param {function} props.onOpenProject - プロジェクトを開くハンドラー
 * @param {function} props.onOpenSample - サンプルプロジェクトを開くハンドラー
 */
const Welcome = ({ onCreateNewFlow, onOpenProject, onOpenSample }) => {
  return (
    <div className="h-full w-full flex items-center justify-center bg-base-100">
      <div className="max-w-4xl mx-auto p-8 text-center">
        {/* メインタイトル */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">🧹 D4 Cleaning Studio へようこそ</h1>
          <p className="text-lg text-base-content/70 mb-2">データクリーニングのためのビジュアルフローエディタ</p>
          <p className="text-sm text-base-content/50">ドラッグ&amp;ドロップでデータ処理フローを構築できます</p>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 新しいノード */}
          <div className="card bg-base-200 border border-base-300 hover:border-primary transition-colors cursor-pointer" onClick={onCreateNewFlow}>
            <div className="card-body p-6">
              <div className="flex justify-center mb-3">
                <NodeDiagramIcon className="w-12 h-12" />
              </div>
              <h3 className="card-title text-lg mb-2">新しいノード</h3>
              <p className="text-sm text-base-content/70">新しいノードエディタを作成します</p>
            </div>
          </div>

          {/* プロジェクトを開く */}
          <div className="card bg-base-200 border border-base-300 hover:border-secondary transition-colors cursor-pointer" onClick={onOpenProject}>
            <div className="card-body p-6">
              <div className="text-3xl mb-3">📂</div>
              <h3 className="card-title text-lg mb-2">プロジェクトを開く</h3>
              <p className="text-sm text-base-content/70">既存のプロジェクトを開きます</p>
            </div>
          </div>

          {/* サンプルプロジェクト */}
          <div className="card bg-base-200 border border-base-300 hover:border-accent transition-colors cursor-pointer" onClick={onOpenSample}>
            <div className="card-body p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="card-title text-lg mb-2">サンプル</h3>
              <p className="text-sm text-base-content/70">サンプルプロジェクトで機能を試します</p>
            </div>
          </div>
        </div>

        {/* 最近のプロジェクト */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-base-content mb-4">📋 最近のプロジェクト</h2>
          <div className="bg-base-200 rounded-lg p-4 border border-base-300">
            <div className="text-sm text-base-content/50 italic">最近のプロジェクトはありません</div>
          </div>
        </div>

        {/* ヘルプとリソース */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ヘルプ */}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-base-content mb-3">📚 ヘルプ</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li className="hover:text-primary cursor-pointer">• ユーザーガイド</li>
              <li className="hover:text-primary cursor-pointer">• API リファレンス</li>
              <li className="hover:text-primary cursor-pointer">• よくある質問</li>
              <li className="hover:text-primary cursor-pointer">• チュートリアル</li>
            </ul>
          </div>

          {/* システム情報 */}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-base-content mb-3">⚙️ システム</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li>• バージョン: 1.0.0</li>
              <li>• ビルド: 2025.01.22</li>
              <li>• React: 18.x</li>
              <li>• Tauri: 2.x</li>
            </ul>
          </div>
        </div>

        {/* フッター */}
        <div className="mt-12 pt-6 border-t border-base-300">
          <p className="text-xs text-base-content/40">© 2025 D4CleaningStudio. データクリーニングをもっと簡単に。</p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
