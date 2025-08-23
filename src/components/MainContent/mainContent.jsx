// ========================================================================================
// インポート
// ========================================================================================
import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ConsoleMsg from "../../utils/ConsoleMsg";
import { loadMainPanelLayout, saveMainPanelLayout } from "../../utils/StoreManager";
import ProjectTree from "./ProjectTree/ProjectTree";
import TabContainer from "./TabSystem/TabContainer";

/**
 * メインコンテンツコンポーネント
 *
 * アプリケーションのメイン作業領域を提供する。
 * 3列（左サイドバー、中央メイン、右サイドバー）のレイアウトで、
 * 中央は上下2段に分割されている。
 * 中央上パネルにタブ形式でFlowEditorを配置。
 */
function MainContent({ onHistoryChange }) {
  // ========================================================================================
  // 定数・デフォルト値
  // ========================================================================================

  /**
   * デフォルトのレイアウト比率
   */
  const defaultLayout = {
    horizontal: [10, 80, 10], // 水平方向の分割比率
    vertical: [70, 30], // 垂直方向の分割比率（中央パネル内）
  };

  /**
   * 初期タブ設定
   * 空の配列にしてウェルカム画面を表示
   */
  const initialTabs = [];

  // ========================================================================================
  // 状態管理
  // ========================================================================================

  const [horizontalLayout, setHorizontalLayout] = useState(defaultLayout.horizontal);
  const [verticalLayout, setVerticalLayout] = useState(defaultLayout.vertical);

  // ========================================================================================
  // パネル参照
  // ========================================================================================

  const leftPanelRef = useRef(null);
  const centerPanelRef = useRef(null);
  const centerUpPanelRef = useRef(null);
  const centerDownPanelRef = useRef(null);
  const rightPanelRef = useRef(null);

  // ========================================================================================
  // 初期化処理
  // ========================================================================================

  useEffect(() => {
    const initLayouts = async () => {
      try {
        const layout = await loadMainPanelLayout();
        setHorizontalLayout(layout.horizontal);
        setVerticalLayout(layout.vertical);
        ConsoleMsg("info", "メインパネルレイアウトをSTOREから読み込み:", layout);
      } catch (e) {
        ConsoleMsg("error", "レイアウト読み込み失敗:", e);
      }
    };

    initLayouts();
  }, []);

  // ========================================================================================
  // レイアウト保存処理
  // ========================================================================================

  useEffect(() => {
    layoutSetDefault();

    const timer = setTimeout(async () => {
      try {
        await saveMainPanelLayout(horizontalLayout, verticalLayout);
        ConsoleMsg("info", `メインパネルレイアウトをSTOREへ保存: H=[${horizontalLayout.join(", ")}] V=[${verticalLayout.join(", ")}]`);
      } catch (e) {
        ConsoleMsg("error", "レイアウト保存エラー:", e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [horizontalLayout, verticalLayout]);

  // ========================================================================================
  // ヘルパー関数
  // ========================================================================================

  const layoutSetDefault = () => {
    const leftPanel = leftPanelRef.current;
    if (leftPanel) {
      leftPanel.resize(horizontalLayout[0]);
    }

    const centerPanel = centerPanelRef.current;
    if (centerPanel) {
      centerPanel.resize(horizontalLayout[1]);
    }

    const rightPanel = rightPanelRef.current;
    if (rightPanel) {
      rightPanel.resize(horizontalLayout[2]);
    }

    const centerUpPanel = centerUpPanelRef.current;
    if (centerUpPanel) {
      centerUpPanel.resize(verticalLayout[0]);
    }

    const centerDownPanel = centerDownPanelRef.current;
    if (centerDownPanel) {
      centerDownPanel.resize(verticalLayout[1]);
    }
  };

  // ========================================================================================
  // レンダリング
  // ========================================================================================

  return (
    <div className="h-full w-full flex-col bg-base-100">
      <PanelGroup direction="horizontal" onLayout={(sizes) => setHorizontalLayout(sizes)} className="h-full">
        {/* 左パネル（サイドバー） */}
        <Panel ref={leftPanelRef} collapsible collapsedSize={3} minSize={10} className="overflow-auto">
          <ProjectTree currentSize={horizontalLayout[0]} />
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-200 hover:bg-accent-content active:w-1.5 active:bg-accent-content" />

        {/* 中央パネル */}
        <Panel ref={centerPanelRef} className="overflow-hidden">
          <PanelGroup direction="vertical" onLayout={(sizes) => setVerticalLayout(sizes)} className="h-full">
            {/* 中央上パネル（タブシステム） */}
            <Panel ref={centerUpPanelRef} className="overflow-hidden">
              <TabContainer initialTabs={initialTabs} onHistoryChange={onHistoryChange} />
            </Panel>

            <PanelResizeHandle className="h-1 bg-base-200 hover:bg-accent-content active:h-1.5 active:bg-accent-content" />

            {/* 中央下パネル（ログ表示エリア） */}
            <Panel ref={centerDownPanelRef} minSize={10} className="overflow-auto">
              <div className="h-full p-4">
                <h2 className="mb-2 text-lg font-semibold text-base-content">ログ</h2>
                <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
                  <div className="space-y-1 text-sm">
                    <div className="text-info">[INFO] FlowEditorを初期化しました</div>
                    <div className="text-success">[SUCCESS] React Flowコンポーネントを読み込みました</div>
                    <div className="text-info">[INFO] タブシステムを初期化しました</div>
                    <div className="text-warning">[WARNING] 一部の設定が見つかりません</div>
                    <div className="text-error">[ERROR] ファイルの読み込みに失敗しました</div>
                  </div>
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>

        <PanelResizeHandle className="w-1 bg-base-200 hover:bg-accent-content active:w-1.5 active:bg-accent-content" />

        {/* 右パネル（サイドバー） */}
        <Panel ref={rightPanelRef} collapsible collapsedSize={0} minSize={10} className="overflow-auto">
          <div className="h-full p-4 text-base-content">
            <h3 className="mb-4 text-lg font-semibold">パネル情報</h3>
            <div className="space-y-2 text-sm">
              <div>左パネル: {horizontalLayout[0].toFixed(2)}%</div>
              <div>中央パネル: {horizontalLayout[1].toFixed(2)}%</div>
              <div>右パネル: {horizontalLayout[2].toFixed(2)}%</div>
              <div>上部: {verticalLayout[0].toFixed(2)}%</div>
              <div>下部: {verticalLayout[1].toFixed(2)}%</div>
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default MainContent;
