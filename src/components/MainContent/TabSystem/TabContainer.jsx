import React from "react";
import { useTabManager } from "./hooks/useTabManager";
import TabHeader from "./TabHeader";
import TabContent from "./TabContent";

/**
 * タブシステムのメインコンテナコンポーネント
 */
function TabContainer({ initialTabs }) {
  const { selectedTab, setSelectedTab, openTabs, addTab, closeTab, getActiveTab } = useTabManager(initialTabs);

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
