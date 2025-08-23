# タブ切り替え時のデータ永続化問題の解決

## 問題の原因

1. **React Aria Components の動作**: `TabPanel`が選択されていないタブのコンテンツをアンマウントしていた
2. **Key の不適切な使用**: FlowEditor コンポーネントに適切な key が指定されていなかった
3. **コンポーネントの再作成**: タブ切り替え時に FlowEditor が新しいインスタンスとして再作成されていた

## 解決方法

### 1. FlowEditor に key プロパティを追加

```jsx
// 修正前
return <FlowEditor {...(tab.props || {})} tabId={tab.id} ... />;

// 修正後
return <FlowEditor key={tab.id} {...(tab.props || {})} tabId={tab.id} ... />;
```

### 2. React Aria Components の Tabs を独自実装に変更

```jsx
// 修正前: TabPanelを使用（自動的にアンマウント）
<Tabs selectedKey={selectedTab}>
  {openTabs.map((tab) => (
    <TabPanel key={tab.id}>{renderTabContent(tab)}</TabPanel>
  ))}
</Tabs>;

// 修正後: 表示・非表示制御（常にマウント）
{
  openTabs.map((tab) => (
    <div key={tab.id} className={`h-full ${selectedTab === tab.id ? "block" : "hidden"}`}>
      {renderTabContent(tab)}
    </div>
  ));
}
```

## 期待される効果

- タブ切り替え時に FlowEditor 内のノード、エッジ、履歴が保持される
- 各タブの編集状態が独立して維持される
- パフォーマンスへの影響は最小限（表示・非表示のみ）

## テスト方法

1. 新しいタブを作成
2. ノードを追加・編集
3. 別のタブに切り替え
4. 元のタブに戻る
5. 編集内容が保持されているかを確認
