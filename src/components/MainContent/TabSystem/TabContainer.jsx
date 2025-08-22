import React from "react";
import { useTabManager } from "./hooks/useTabManager";
import TabHeader from "./TabHeader";
import TabContent from "./TabContent";
import Welcome from "../Welcome/Welcome";
import { NodeDiagramIcon } from "../Icons";

/**
 * タブシステムのメインコンテナコンポーネント
 */
function TabContainer({ initialTabs }) {
  const { selectedTab, setSelectedTab, openTabs, addTab, closeTab, getActiveTab } = useTabManager(initialTabs);

  // ウェルカム画面のアクションハンドラー
  const handleCreateNewFlow = () => {
    addTab({
      id: `flow-editor-${Date.now()}`,
      title: "新しいノード",
      icon: "⧈", // ノードダイアグラムを表現する記号
      component: "FlowEditor",
      closable: true,
      props: {
        initialMode: "empty", // 空のフローで開始
      },
    });
  };

  const handleOpenProject = () => {
    // TODO: ファイル選択ダイアログを実装
    console.log("プロジェクトを開く機能は未実装");
  };

  const handleOpenSample = () => {
    addTab({
      id: `sample-flow-${Date.now()}`,
      title: "サンプルフロー",
      icon: "🎯",
      component: "FlowEditor",
      closable: true,
    });
  };

  // タブが存在しない場合はウェルカム画面を表示
  if (!openTabs || openTabs.length === 0) {
    return <Welcome onCreateNewFlow={handleCreateNewFlow} onOpenProject={handleOpenProject} onOpenSample={handleOpenSample} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* タブヘッダー */}
      <TabHeader selectedTab={selectedTab} onSelectionChange={setSelectedTab} openTabs={openTabs} onCloseTab={closeTab} onAddTab={addTab} />

      {/* タブコンテンツ */}
      <TabContent selectedTab={selectedTab} onSelectionChange={setSelectedTab} openTabs={openTabs} />
    </div>
  );
}

export default TabContainer;
