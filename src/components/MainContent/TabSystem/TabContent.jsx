import React from "react";
import { Tabs, TabPanel } from "react-aria-components";
import FlowEditor from "../../FlowEditor/FlowEditor";

/**
 * タブコンテンツをレンダリングするコンポーネント
 */
function TabContent({ selectedTab, onSelectionChange, openTabs }) {
  /**
   * タブの内容をレンダリングする
   */
  const renderTabContent = (tab) => {
    switch (tab.component) {
      case "FlowEditor":
        return <FlowEditor />;

      case "DataViewer":
        return (
          <div className="h-full p-4 bg-base-100">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-base-content">データビューア</h3>
              <div className="flex-1 bg-base-200 rounded-lg p-4 overflow-auto">
                <div className="space-y-4">
                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-2">データテーブル</h4>
                    <p className="text-sm text-base-content/70">ここにデータテーブルコンポーネントが配置されます</p>
                  </div>
                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-2">フィルター機能</h4>
                    <p className="text-sm text-base-content/70">データのフィルタリング機能がここに配置されます</p>
                  </div>
                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-2">統計情報</h4>
                    <p className="text-sm text-base-content/70">データの統計情報がここに表示されます</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Settings":
        return (
          <div className="h-full p-4 bg-base-100">
            <div className="h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4 text-base-content">設定</h3>
              <div className="flex-1 bg-base-200 rounded-lg p-4 overflow-auto">
                <div className="space-y-6">
                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-3">一般設定</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="checkbox checkbox-sm" />
                        <span className="text-sm">自動保存を有効にする</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="checkbox checkbox-sm" />
                        <span className="text-sm">ダークモードを使用する</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-3">エディタ設定</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="checkbox checkbox-sm" />
                        <span className="text-sm">グリッドを表示する</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="checkbox checkbox-sm" />
                        <span className="text-sm">スナップ機能を有効にする</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-base-100 p-4 rounded shadow">
                    <h4 className="font-medium mb-3">表示設定</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">ズームレベル</label>
                        <input type="range" min="50" max="200" defaultValue="100" className="range range-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full p-4 bg-base-100">
            <div className="h-full flex flex-col items-center justify-center">
              <h3 className="text-lg font-semibold mb-4 text-base-content">{tab.title}</h3>
              <p className="text-base-content/70">コンテンツが定義されていません</p>
              <div className="mt-4 text-sm text-base-content/50">コンポーネント: {tab.component}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      <Tabs selectedKey={selectedTab} onSelectionChange={onSelectionChange} className="h-full">
        {openTabs.map((tab) => (
          <TabPanel key={tab.id} id={tab.id} className="h-full overflow-hidden">
            {renderTabContent(tab)}
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

export default TabContent;
