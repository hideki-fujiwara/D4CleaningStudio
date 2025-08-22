/**
 * ドラッグ&ドロップ機能のカスタムフック（修正版）
 */
import { useDrag, useDrop } from "react-aria";
import { useRef } from "react";
import { DRAG_DROP_TYPES, FILE_TYPES } from "../constants";
import ConsoleMsg from "../../../../utils/ConsoleMsg";

/**
 * ドラッグ機能のフック
 */
export function useTreeItemDrag(item) {
  const { dragProps, isDragging } = useDrag({
    getItems: () => {
      const dragData = {
        id: item.id,
        name: item.name,
        type: item.isDirectory ? FILE_TYPES.FOLDER : FILE_TYPES.FILE,
        path: item.path,
        isDirectory: item.isDirectory,
      };

      return [
        {
          [DRAG_DROP_TYPES.TEXT_PLAIN]: item.path || item.name,
          [DRAG_DROP_TYPES.FILE_TREE_ITEM]: JSON.stringify(dragData),
        },
      ];
    },
    onDragStart: () => {
      ConsoleMsg?.("debug", "Drag started", {
        id: item.id,
        name: item.name,
        type: item.isDirectory ? "folder" : "file",
      });
    },
    onDragEnd: (dropResult) => {
      ConsoleMsg?.("debug", "Drag ended", {
        id: item.id,
        dropResult,
      });
    },
  });

  return { dragProps, isDragging };
}

/**
 * ドロップ機能のフック
 */
export function useTreeDrop(onFileMove) {
  const dropRef = useRef(null);

  const { dropProps, isDropTarget } = useDrop({
    ref: dropRef,
    onDrop: async (e) => {
      try {
        ConsoleMsg?.("debug", "Drop event received", { itemCount: e.items.length });

        const items = e.items;
        const processedItems = [];

        for (const item of items) {
          if (item.kind === "text" && item.types.has(DRAG_DROP_TYPES.FILE_TREE_ITEM)) {
            try {
              const data = await item.getText(DRAG_DROP_TYPES.FILE_TREE_ITEM);
              const draggedItem = JSON.parse(data);

              if (draggedItem && draggedItem.id) {
                processedItems.push(draggedItem);
                ConsoleMsg?.("debug", "Processed drop item", draggedItem);
              }
            } catch (parseError) {
              ConsoleMsg?.("error", "Failed to parse dropped item", parseError);
            }
          }
        }

        // ファイル移動処理を実行
        for (const draggedItem of processedItems) {
          if (onFileMove) {
            await onFileMove(draggedItem);
          }
        }

        if (processedItems.length > 0) {
          ConsoleMsg?.("info", `Successfully processed ${processedItems.length} dropped item(s)`);
        }
      } catch (error) {
        ConsoleMsg?.("error", "Drop operation failed", error);
      }
    },
    onDropEnter: () => {
      ConsoleMsg?.("debug", "Drop enter");
    },
    onDropExit: () => {
      ConsoleMsg?.("debug", "Drop exit");
    },
  });

  return { dropRef, dropProps, isDropTarget };
}

/**
 * フォルダ固有のドロップ機能（将来の拡張用）
 */
export function useFolderDrop(folderId, onFileMove) {
  const dropRef = useRef(null);

  const { dropProps, isDropTarget } = useDrop({
    ref: dropRef,
    onDrop: async (e) => {
      try {
        const items = e.items;

        for (const item of items) {
          if (item.kind === "text" && item.types.has(DRAG_DROP_TYPES.FILE_TREE_ITEM)) {
            const data = await item.getText(DRAG_DROP_TYPES.FILE_TREE_ITEM);
            const draggedItem = JSON.parse(data);

            // 自分自身へのドロップは無視
            if (draggedItem.id === folderId) {
              ConsoleMsg?.("debug", "Ignoring self-drop", { folderId, draggedId: draggedItem.id });
              continue;
            }

            if (onFileMove) {
              await onFileMove(draggedItem, folderId);
            }
          }
        }
      } catch (error) {
        ConsoleMsg?.("error", "Folder drop operation failed", error);
      }
    },
  });

  return { dropRef, dropProps, isDropTarget };
}

// デフォルトエクスポートを追加（メインで使用される関数をまとめて）
const dragAndDropHooks = {
  useTreeItemDrag,
  useTreeDrop,
  useFolderDrop,
};

export default dragAndDropHooks;
