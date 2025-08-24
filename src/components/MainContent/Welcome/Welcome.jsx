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
import { NodeDiagramIcon, OpenIcon, NewFileIcon } from "../Icons";

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
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-base-100 via-base-200/30 to-base-300/20 relative">
      {/* 背景装飾 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* スクロール可能なコンテンツコンテナ */}
      <div className="min-h-full flex items-center justify-center py-8 px-4 relative z-10">
        <div className="max-w-5xl w-full mx-auto text-center">
          {/* メインタイトル */}
          <div className="mb-8 sm:mb-12 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
            <div className="mb-4 sm:mb-6">
              <div className="inline-block p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/10">
                <div className="text-4xl sm:text-6xl">🧹</div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight px-4">
              D4 Cleaning Studio
            </h1>
            <div className="max-w-2xl mx-auto px-4">
              <p className="text-lg sm:text-xl text-base-content/80 mb-3 font-medium">データクリーニングのためのビジュアルフローエディタ</p>
              <p className="text-sm sm:text-base text-base-content/60 bg-base-200/50 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 inline-block border border-white/10">
                ドラッグ&amp;ドロップでデータ処理フローを構築できます
              </p>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 min-w-0 px-4 sm:px-0">
            {/* 新しいノード */}
            <div
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 min-w-0 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]"
              onClick={onCreateNewFlow}
            >
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-primary/20 backdrop-blur-sm">
                <div className="card-body p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors duration-300">
                        <NodeDiagramIcon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="card-title text-xl mb-3 group-hover:text-primary transition-colors duration-300">新しいノード</h3>
                    <p className="text-sm text-base-content/70 group-hover:text-base-content/90 transition-colors duration-300">新しいノードエディタを作成します</p>
                  </div>
                </div>
              </div>
            </div>

            {/* プロジェクトを開く */}
            <div
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 min-w-0 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.5s_forwards]"
              onClick={onOpenProject}
            >
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-secondary/20 backdrop-blur-sm">
                <div className="card-body p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/20 transition-colors duration-300">
                        <OpenIcon className="w-12 h-12 text-secondary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="card-title text-xl mb-3 group-hover:text-secondary transition-colors duration-300">D4フローファイルを開く</h3>
                    <p className="text-sm text-base-content/70 group-hover:text-base-content/90 transition-colors duration-300">既存のD4フローファイルを開きます</p>
                  </div>
                </div>
              </div>
            </div>

            {/* サンプルプロジェクト */}
            <div
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 min-w-0 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.7s_forwards]"
              onClick={onOpenSample}
            >
              <div className="card bg-gradient-to-br from-base-100 to-base-200 border border-accent/20 hover:border-accent/40 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-accent/20 backdrop-blur-sm">
                <div className="card-body p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                        <NewFileIcon className="w-12 h-12 text-accent group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                    <h3 className="card-title text-xl mb-3 group-hover:text-accent transition-colors duration-300">新規プロジェクトを開きます</h3>
                    <p className="text-sm text-base-content/70 group-hover:text-base-content/90 transition-colors duration-300">新規プロジェクトを作成します</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 最近のプロジェクト */}
          <div className="mb-8 sm:mb-12 opacity-0 animate-[fadeInUp_1s_ease-out_0.9s_forwards] px-4 sm:px-0">
            <div className="inline-flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 bg-gradient-to-br from-info/20 to-info/10 rounded-lg">
                <span className="text-xl sm:text-2xl">📋</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-base-content">現在のプロジェクト</h2>
            </div>

            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-xl backdrop-blur-sm relative overflow-hidden">
              {/* 装飾的な背景要素 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-info/10 rounded-full blur-2xl"></div>

              {/* プロジェクト情報の表示 */}
              <div className="space-y-6 relative z-10 text-left">
                {/* プロジェクト名 */}
                <div className="group">
                  <label className="text-xs font-semibold text-primary/80 uppercase tracking-wide">プロジェクト名</label>
                  <div className="text-lg text-base-content font-bold mt-1 group-hover:text-primary transition-colors duration-300">D4CleaningStudio</div>
                </div>

                {/* フォルダーパス */}
                <div className="group">
                  <label className="text-xs font-semibold text-secondary/80 uppercase tracking-wide">フォルダーパス</label>
                  <div className="text-xs text-base-content/90 font-mono bg-gradient-to-r from-base-300/50 to-base-300/30 rounded-lg px-4 py-3 mt-2 border border-white/10 group-hover:border-secondary/30 transition-all duration-300 backdrop-blur-sm overflow-x-auto min-w-0 whitespace-nowrap">
                    d:\Project\tauri\D4CleaningStudio
                  </div>
                </div>

                {/* 備考 */}
                <div className="group">
                  <label className="text-xs font-semibold text-accent/80 uppercase tracking-wide">備考</label>
                  <div className="text-sm text-base-content/90 mt-2 p-4 bg-gradient-to-r from-accent/5 to-transparent rounded-lg border-l-4 border-accent/30">
                    データクリーニング用のビジュアルフローエディタプロジェクト
                  </div>
                </div>

                {/* 最終更新日時 */}
                <div className="group">
                  <label className="text-xs font-semibold text-info/80 uppercase tracking-wide">最終更新</label>
                  <div className="text-xs text-base-content/70 mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span>2025年8月24日 午後</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ヘルプとリソース */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 px-4 sm:px-0">
            {/* ヘルプ */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-xl p-6 border border-white/20 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="text-xl font-bold text-base-content group-hover:text-primary transition-colors duration-300">ヘルプ</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group/item">
                  <div className="w-1 h-4 bg-primary/50 rounded-full group-hover/item:bg-primary transition-colors duration-200"></div>
                  <span className="text-sm text-base-content/80 group-hover/item:text-primary transition-colors duration-200">ユーザーガイド</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group/item">
                  <div className="w-1 h-4 bg-primary/50 rounded-full group-hover/item:bg-primary transition-colors duration-200"></div>
                  <span className="text-sm text-base-content/80 group-hover/item:text-primary transition-colors duration-200">API リファレンス</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group/item">
                  <div className="w-1 h-4 bg-primary/50 rounded-full group-hover/item:bg-primary transition-colors duration-200"></div>
                  <span className="text-sm text-base-content/80 group-hover/item:text-primary transition-colors duration-200">よくある質問</span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-all duration-200 group/item">
                  <div className="w-1 h-4 bg-primary/50 rounded-full group-hover/item:bg-primary transition-colors duration-200"></div>
                  <span className="text-sm text-base-content/80 group-hover/item:text-primary transition-colors duration-200">チュートリアル</span>
                </li>
              </ul>
            </div>

            {/* システム情報 */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-xl p-6 border border-white/20 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg group-hover:bg-secondary/20 transition-colors duration-300">
                  <span className="text-xl">⚙️</span>
                </div>
                <h3 className="text-xl font-bold text-base-content group-hover:text-secondary transition-colors duration-300">システム</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm text-base-content/80">
                    バージョン: <span className="font-semibold text-success">1.0.0</span>
                  </span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-info rounded-full"></div>
                  <span className="text-sm text-base-content/80">
                    ビルド: <span className="font-semibold text-info">2025.01.22</span>
                  </span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <span className="text-sm text-base-content/80">
                    React: <span className="font-semibold text-warning">18.x</span>
                  </span>
                </li>
                <li className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-2 h-2 bg-error rounded-full"></div>
                  <span className="text-sm text-base-content/80">
                    Tauri: <span className="font-semibold text-error">2.x</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-white/20 to-transparent relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">D4</span>
                </div>
                <span className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">D4CleaningStudio</span>
              </div>
              <p className="text-xs text-base-content/50 text-center max-w-md">© 2025 D4CleaningStudio. データクリーニングをもっと簡単に、もっと美しく。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
