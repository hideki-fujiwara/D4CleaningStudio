import React from "react";
import { Tabs, TabPanel } from "react-aria-components";
import FlowEditor from "../FlowEditor/FlowEditor";

/**
 * タブコンテンツをレンダリングするコンポーネント
 */
function TabContent({ selectedTab, onSelectionChange, openTabs, onCreateNewTab, onUpdateTab, onRequestTabClose, onHistoryChange }) {
  /**
   * タブの内容をレンダリングする
   */
  const renderTabContent = (tab) => {
    switch (tab.component) {
      case "FlowEditor":
        return (
          <FlowEditor
            key={tab.id}
            {...(tab.props || {})}
            tabId={tab.id}
            onCreateNewTab={onCreateNewTab}
            onUpdateTab={onUpdateTab}
            onRequestTabClose={onRequestTabClose}
            onHistoryChange={onHistoryChange}
          />
        );

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
    <div className="flex-1 overflow-hidden relative">
      {/* すべてのタブのコンテンツを常に描画し、絶対配置で表示・非表示を制御 */}
      {openTabs.map((tab) => (
        <div key={tab.id} className={`absolute inset-0 w-full h-full ${selectedTab === tab.id ? "z-10" : "z-0 opacity-0 pointer-events-none"}`}>
          {renderTabContent(tab)}
        </div>
      ))}
    </div>
  );
}

export default TabContent;
