# useFileLoad フック - 使用例

useFlowEditor からファイル読み込み機能を分離した新しいカスタムフック。

## 主な機能

### 1. `openFlow()` - 既存タブでファイルを開く

```javascript
const { openFlow } = useFileLoad({
  setNodes,
  setEdges,
  setNodeCounter,
  onFileLoaded: (fileInfo) => {
    console.log("ファイル読み込み完了:", fileInfo);
  },
  onHistoryReset: () => {},
  hasUnsavedChanges: () => false,
});

// Ctrl+O または関数呼び出しでファイルを開く
await openFlow();
```

### 2. `openFlowInNewTab()` - 新しいタブでファイルを開く

```javascript
const { openFlowInNewTab } = useFileLoad({
  onCreateNewTab: (tabConfig) => {
    // 新しいタブを作成
  },
});

// 新しいタブでファイルを開く
await openFlowInNewTab();
```

### 3. `loadFlowData()` - プログラムからデータを読み込む

```javascript
const { loadFlowData } = useFileLoad({
  setNodes,
  setEdges,
  setNodeCounter,
});

// フローデータを直接読み込む
const result = loadFlowData(flowData, "テストファイル");
if (result.success) {
  console.log("読み込み成功");
}
```

## 変更点

### useFlowEditor

- `openFlow`機能を`useFileLoad`フックに移行
- 新機能として`openFlowInNewTab`と`loadFlowData`を追加
- キーボードショートカット（Ctrl+O）は引き続き動作

### useFileSave

- ファイル読み込み機能を完全に削除
- 保存機能に専念（`saveFlow`, `saveAsFlow`, `newFlow`）
- ファイル状態管理機能を追加（外部からの状態更新用）

### useFileLoad（新規）

- ファイル読み込み専用のカスタムフック
- 複数の読み込みモードをサポート
- エラーハンドリングとコールバック機能

## 利点

1. **単一責任の原則**: 各フックが明確な責任を持つ
2. **再利用性**: useFileLoad は他のコンポーネントでも使用可能
3. **テストしやすさ**: 機能が分離されているため単体テストが容易
4. **拡張性**: 新しい読み込み機能を簡単に追加可能
