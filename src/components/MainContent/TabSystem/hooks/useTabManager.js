import { useState } from "react";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * タブ管理のカスタムフック
 */
export function useTabManager(initialTabs = []) {
  const [selectedTab, setSelectedTab] = useState(initialTabs[0]?.id || null);
  const [openTabs, setOpenTabs] = useState(initialTabs);

  /**
   * 新しいタブを追加する
   */
  const addTab = (tabConfig) => {
    const newTab = {
      ...tabConfig,
      // idが既に提供されている場合はそれを使用、そうでなければ生成
      id: tabConfig.id || `tab-${Date.now()}`,
      closable: true,
    };

    console.log("useTabManager addTab - Original config:", tabConfig);
    console.log("useTabManager addTab - Final newTab:", newTab);

    setOpenTabs((prev) => [...prev, newTab]);
    setSelectedTab(newTab.id);

    ConsoleMsg("info", "新しいタブを追加しました:", newTab);
    return newTab;
  };

  /**
   * タブを閉じる（確認付き）
   */
  const closeTab = async (tabId, requestTabClose = null) => {
    const tab = openTabs.find((t) => t.id === tabId);
    if (!tab || !tab.closable) return;

    // FlowEditorの場合は保存確認を行う
    if (tab.component === "FlowEditor" && requestTabClose) {
      const canClose = await requestTabClose();
      if (!canClose) return; // ユーザーがキャンセルした場合
    }

    setOpenTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);

      // 閉じるタブがアクティブタブの場合、別のタブをアクティブにする
      if (selectedTab === tabId && newTabs.length > 0) {
        setSelectedTab(newTabs[0].id);
      }

      return newTabs;
    });

    ConsoleMsg("info", "タブを閉じました:", tab);
  };

  /**
   * タブの順序を変更する
   */
  const reorderTabs = (sourceIndex, destinationIndex) => {
    if (sourceIndex === destinationIndex) return;

    setOpenTabs((prev) => {
      const newTabs = [...prev];
      const [removed] = newTabs.splice(sourceIndex, 1);
      newTabs.splice(destinationIndex, 0, removed);
      return newTabs;
    });

    ConsoleMsg("info", "タブの順序を変更しました", { sourceIndex, destinationIndex });
  };

  /**
   * 全ての閉じられるタブを閉じる
   */
  const closeAllClosableTabs = () => {
    setOpenTabs((prev) => {
      const newTabs = prev.filter((tab) => !tab.closable);
      if (newTabs.length > 0 && !newTabs.find((t) => t.id === selectedTab)) {
        setSelectedTab(newTabs[0].id);
      }
      return newTabs;
    });

    ConsoleMsg("info", "閉じられるタブを全て閉じました");
  };

  /**
   * タブが存在するかチェック
   */
  const hasTab = (tabId) => {
    return openTabs.some((tab) => tab.id === tabId);
  };

  /**
   * アクティブなタブ情報を取得
   */
  const getActiveTab = () => {
    return openTabs.find((tab) => tab.id === selectedTab) || null;
  };

  /**
   * タブの情報を更新する
   */
  const updateTab = (tabId, updates) => {
    setOpenTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, ...updates } : tab)));
    // ログレベルを下げる
    if (updates.hasUnsavedChanges !== undefined) {
      console.log(`タブの未保存状態更新: ${tabId} -> ${updates.hasUnsavedChanges}`);
    } else {
      ConsoleMsg("info", `タブを更新しました: ${tabId}`, updates);
    }
  };

  return {
    selectedTab,
    setSelectedTab,
    openTabs,
    addTab,
    closeTab,
    reorderTabs,
    closeAllClosableTabs,
    hasTab,
    getActiveTab,
    updateTab,
  };
}
