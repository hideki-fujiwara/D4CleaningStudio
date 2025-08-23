import React from "react";
import { Tabs, TabList, Tab } from "react-aria-components";

/**
 * タブヘッダーコンポーネント
 */
function TabHeader({ selectedTab, onSelectionChange, openTabs, onCloseTab, onAddTab }) {
  /**
   * 新しいデータビューアタブを追加
   */
  const handleAddDataViewer = () => {
    onAddTab({
      title: `データビューア ${openTabs.length}`,
      icon: "📊",
      component: "DataViewer",
    });
  };

  /**
   * 設定タブを追加
   */
  const handleAddSettings = () => {
    onAddTab({
      title: "設定",
      icon: "⚙️",
      component: "Settings",
    });
  };

  return (
    <div className="flex bg-base-200 border-b border-base-300 min-h-10">
      {/* タブリスト */}
      <Tabs selectedKey={selectedTab} onSelectionChange={onSelectionChange} className="flex-1 flex">
        <TabList className="flex">
          {openTabs.map((tab) => (
            <Tab
              key={tab.id}
              id={tab.id}
              className="group relative flex items-center px-4 py-2 text-sm font-medium border-r border-base-300 bg-base-200 hover:bg-base-300 selected:bg-base-100 selected:text-primary cursor-pointer min-w-0"
            >
              <span className="flex items-center space-x-2 min-w-0">
                <span className="text-base">{tab.icon}</span>
                <span className="flex items-center">
                  {tab.hasUnsavedChanges && <span className="text-error mr-1 font-bold">*</span>}
                  <span className="truncate">{tab.title}</span>
                </span>
              </span>

              {/* 閉じるボタン */}
              {tab.closable && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await onCloseTab(tab.id);
                  }}
                  className="ml-2 p-1 rounded hover:bg-base-300 text-base-content hover:text-error transition-colors"
                  aria-label={`${tab.title}を閉じる`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {/* 新しいタブ追加ボタン */}
      <button
        onClick={handleAddDataViewer}
        className="flex items-center justify-center px-3 py-2 text-base-content hover:bg-base-300 transition-colors border-r border-base-300"
        aria-label="新しいタブを追加"
        title="データビューアタブを追加"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* タブコントロールボタン群 */}
      <div className="flex">
        <button
          onClick={handleAddSettings}
          className="flex items-center justify-center px-3 py-2 text-base-content hover:bg-base-300 transition-colors"
          aria-label="設定タブを追加"
          title="設定タブを追加"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default TabHeader;
