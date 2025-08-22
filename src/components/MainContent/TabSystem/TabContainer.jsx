import React from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { useTabManager } from "./hooks/useTabManager";
import TabHeader from "./TabHeader";
import TabContent from "./TabContent";
import Welcome from "../Welcome/Welcome";
import { NodeDiagramIcon } from "../Icons";
import ConsoleMsg from "../../../utils/ConsoleMsg";

/**
 * タブシステムのメインコンテナコンポーネント
 */
function TabContainer({ initialTabs }) {
  const { selectedTab, setSelectedTab, openTabs, addTab, closeTab, getActiveTab } = useTabManager(initialTabs);

  // ウェルカム画面のアクションハンドラー
  const handleCreateNewFlow = () => {
    addTab({
      id: `flow-editor-${Date.now()}`,
      title: "未保存のフロー",
      icon: "⧈", // ノードダイアグラムを表現する記号
      component: "FlowEditor",
      closable: true,
      props: {
        initialMode: "empty", // 空のフローで開始
      },
    });
  };

  const handleOpenProject = async () => {
    try {
      // ファイル選択ダイアログを表示
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "D4 Flow Files",
            extensions: ["d4flow"],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
      });

      if (selected) {
        // ファイルを読み込み
        const fileContent = await readTextFile(selected);
        const flowData = JSON.parse(fileContent);

        // ファイル名を取得
        const fileName = selected.split("\\").pop().split("/").pop().replace(".d4flow", "");

        // 新しいタブを追加
        addTab({
          id: `flow-editor-${Date.now()}`,
          title: fileName,
          icon: "📄",
          component: "FlowEditor",
          closable: true,
          props: {
            initialMode: "loaded",
            loadedData: flowData,
            filePath: selected,
            fileName: fileName,
          },
        });

        ConsoleMsg("success", `ファイルを開きました: ${fileName}`);
      }
    } catch (error) {
      ConsoleMsg("error", `ファイルの読み込みに失敗しました: ${error.message}`);
    }
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
