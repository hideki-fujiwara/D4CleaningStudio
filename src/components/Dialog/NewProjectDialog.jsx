import React, { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { mkdir, writeTextFile } from "@tauri-apps/plugin-fs";
import { homeDir, documentDir } from "@tauri-apps/api/path"; // ← これが正しい
import { setProjectConfig } from "../../utils/StoreManager";
import ConsoleMsg from "../../utils/ConsoleMsg";

// 定数
const MAX_FOLDER_NAME_LENGTH = 100; // フォルダー名の最大長（Windowsの制限）
const MAX_PATH_LENGTH = 260; // Windowsの最大パス長

const NewProjectDialog = ({ isOpen, onClose }) => {
  const [projectData, setProjectData] = useState({
    name: "",
    location: "",
    description: "",
  });
  const [nameError, setNameError] = useState(""); // エラーメッセージ用

  // コンポーネント初期化時にデフォルトの場所を設定
  useEffect(() => {
    const setDefaultLocation = async () => {
      try {
        let defaultPath;
        try {
          // ドキュメントフォルダを優先
          defaultPath = await documentDir();
          defaultPath = defaultPath.replace(/\\/g, "/").replace(/\/$/, "");
          ConsoleMsg("debug", `デフォルトパス (Documents): ${defaultPath}`);
        } catch {
          try {
            // ドキュメントフォルダが取得できない場合はホームディレクトリ
            defaultPath = await homeDir();
            defaultPath = defaultPath.replace(/\\/g, "/").replace(/\/$/, "");
            ConsoleMsg("debug", `デフォルトパス (Home): ${defaultPath}`);
          } catch {
            // 両方取得できない場合は空文字
            defaultPath = "";
            ConsoleMsg("warn", "デフォルトパスを取得できませんでした");
          }
        }

        if (defaultPath && !projectData.location) {
          setProjectData((prev) => ({
            ...prev,
            location: defaultPath,
          }));
        }
      } catch (error) {
        ConsoleMsg("error", `デフォルトパス設定エラー: ${error}`);
      }
    };

    if (isOpen) {
      setDefaultLocation();
    }
  }, [isOpen]); // ← ここを修正

  const handleInputChange = (field, value) => {
    setProjectData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // パスを正規化する関数
  const normalizePath = (path) => {
    if (!path) return "";

    let normalized = path.replace(/\\/g, "/");
    normalized = normalized.replace(/\/+/g, "/");
    normalized = normalized.replace(/\/$/, "");

    return normalized;
  };

  // 安全なパス結合関数
  const joinPaths = (...paths) => {
    const cleanPaths = paths.filter((path) => path && path.trim()).map((path) => path.trim().replace(/^\/+|\/+$/g, ""));

    return cleanPaths.join("/");
  };

  // パスの安全性をチェック
  const isPathSafe = (path) => {
    const normalizedPath = normalizePath(path);

    // 危険なパターンをチェック
    const dangerousPatterns = [
      /^[A-Z]:$/i, // ドライブルート (C:, D: など)
      /^[A-Z]:\/$/i, // ドライブルート with スラッシュ
      /^\/$/, // Unix ルート
      /Program Files/i, // Program Files
      /Windows/i, // Windows ディレクトリ
      /System32/i, // System32
    ];

    return !dangerousPatterns.some((pattern) => pattern.test(normalizedPath));
  };

  // フォルダー名のバリデーション
  const validateFolderName = (name) => {
    const errors = [];

    // 空文字チェック
    if (!name.trim()) {
      errors.push("プロジェクト名を入力してください");
      return errors;
    }

    // ASCII文字チェック
    if (!/^[\x00-\x7F]*$/.test(name)) {
      errors.push("プロジェクト名には半角英数字のみを使用してください（日本語不可）");
    }

    // 長さチェック
    if (name.length > MAX_FOLDER_NAME_LENGTH) {
      errors.push(`プロジェクト名は${MAX_FOLDER_NAME_LENGTH}文字以内で入力してください（現在: ${name.length}文字）`);
    }

    // 禁止文字チェック（Windows/Unix共通）
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(name)) {
      errors.push('プロジェクト名に使用できない文字が含まれています（< > : " | ? *）');
    }

    // 先頭末尾の空白・ピリオドチェック
    if (name.startsWith(" ") || name.endsWith(" ") || name.endsWith(".")) {
      errors.push("プロジェクト名の先頭末尾に空白やピリオドは使用できません");
    }

    // Windows予約名チェック
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    if (reservedNames.test(name)) {
      errors.push("Windowsの予約名は使用できません");
    }

    return errors;
  };

  // パス長チェック
  const validatePathLength = (location, name) => {
    if (!location || !name) return [];

    const fullPath = joinPaths(location, name);
    if (fullPath.length > MAX_PATH_LENGTH) {
      return [`フルパスが長すぎます（最大${MAX_PATH_LENGTH}文字、現在: ${fullPath.length}文字）`];
    }
    return [];
  };

  const handleSelectLocation = async () => {
    try {
      ConsoleMsg("debug", "フォルダ選択を開始");

      // デフォルトディレクトリを設定
      let defaultPath;
      try {
        defaultPath = await documentDir();
      } catch {
        try {
          defaultPath = await homeDir();
        } catch {
          defaultPath = undefined;
        }
      }

      const selected = await open({
        directory: true,
        multiple: false,
        title: "プロジェクト保存場所を選択",
        defaultPath: defaultPath,
      });

      if (selected) {
        const normalizedPath = normalizePath(selected);

        // パスの安全性をチェック
        if (!isPathSafe(normalizedPath)) {
          ConsoleMsg("warn", "選択されたパスはシステム上重要な場所です");
          ConsoleMsg("warn", "ドキュメントフォルダやユーザーフォルダ内を選択することを推奨します");
        }

        handleInputChange("location", normalizedPath);

        // パス長チェック（プロジェクト名が入力済みの場合）
        if (projectData.name) {
          const pathErrors = validatePathLength(normalizedPath, projectData.name);
          if (pathErrors.length > 0) {
            setNameError(pathErrors[0]);
          }
        }

        ConsoleMsg("info", `プロジェクト保存場所を選択: ${normalizedPath}`);
      }
    } catch (error) {
      ConsoleMsg("error", `フォルダ選択エラー: ${error?.message || error}`);
    }
  };

  const handleCreate = async () => {
    setNameError(""); // エラー初期化

    // バリデーション実行
    const nameErrors = validateFolderName(projectData.name);
    const pathErrors = validatePathLength(projectData.location, projectData.name);
    const allErrors = [...nameErrors, ...pathErrors];

    if (allErrors.length > 0) {
      setNameError(allErrors[0]); // 最初のエラーを表示
      ConsoleMsg("error", `バリデーションエラー: ${allErrors.join(", ")}`);
      return;
    }

    if (!projectData.location.trim()) {
      ConsoleMsg("warn", "プロジェクト保存場所を選択してください");
      return;
    }

    // パスの安全性をチェック（警告のみ、confirmはしない）
    if (!isPathSafe(projectData.location)) {
      ConsoleMsg("warn", "安全でないパスが検出されました。システムフォルダ以外の場所を推奨します。");
    }

    try {
      ConsoleMsg("info", "=== プロジェクト作成開始 ===");

      const baseLocation = normalizePath(projectData.location);
      const projectName = projectData.name.trim();
      const projectFullPath = joinPaths(baseLocation, projectName);

      ConsoleMsg("debug", `ベースロケーション: ${baseLocation}`);
      ConsoleMsg("debug", `プロジェクト名: ${projectName}`);
      ConsoleMsg("debug", `プロジェクトフルパス: ${projectFullPath} (${projectFullPath.length}文字)`);

      // Step 1: プロジェクトフォルダを作成
      ConsoleMsg("debug", "プロジェクトフォルダ作成中...");
      await mkdir(projectFullPath, { recursive: true });
      ConsoleMsg("info", `プロジェクトフォルダ作成完了: ${projectFullPath}`);

      // Step 2: プロジェクト設定ファイルを先に作成
      const projectFileConfig = {
        name: projectData.name,
        description: projectData.description,
        filepath: projectFullPath,
        createdAt: new Date().toISOString(),
        version: "1.0.0",
        type: "D4CleaningStudio",
        remarks: "",
        settings: {},
      };

      try {
        const projectPath = joinPaths(projectFullPath, "project.json");
        await writeTextFile(projectPath, JSON.stringify(projectFileConfig, null, 2));
        ConsoleMsg("info", "設定ファイル作成完了");
      } catch (fileError) {
        ConsoleMsg("error", `設定ファイル作成エラー: ${fileError}`);
        throw fileError;
      }

      // Step 3: README.mdファイルを作成
      try {
        const readmeContent = `# ${projectData.name}

${projectData.description || "D4CleaningStudio プロジェクト"}

## プロジェクト構成

- \`src/\` - ソースファイル
- \`DataSource/\` - データソース
- \`Output/\` - 出力ファイル
- \`TempFile/\` - 一時ファイル

## 作成日時
${new Date().toLocaleString("ja-JP")}
`;

        const readmePath = joinPaths(projectFullPath, "README.md");
        ConsoleMsg("debug", `README作成中: ${readmePath}`);
        await writeTextFile(readmePath, readmeContent);
        ConsoleMsg("info", "README.md作成完了");
      } catch (readmeError) {
        ConsoleMsg("warn", `README作成エラー: ${readmeError}`);
      }

      // Step 4: サブフォルダを最後に作成（エラーが発生しやすい）
      const folders = ["src", "DataSource", "Output", "TempFile"];
      let folderCreationSuccess = 0;

      for (const folder of folders) {
        try {
          const folderPath = joinPaths(projectFullPath, folder);
          ConsoleMsg("debug", `フォルダ作成試行: ${folderPath}`);
          await mkdir(folderPath, { recursive: true });
          ConsoleMsg("debug", `フォルダ作成成功: ${folder}`);
          folderCreationSuccess++;
        } catch (folderError) {
          ConsoleMsg("error", `フォルダ作成失敗 (${folder}): ${folderError}`);
          // 個別のフォルダ作成失敗は続行
        }
      }

      if (folderCreationSuccess > 0) {
        ConsoleMsg("info", `サブフォルダ作成完了 (${folderCreationSuccess}/${folders.length})`);
      } else {
        ConsoleMsg("warn", "サブフォルダの作成に失敗しましたが、プロジェクトは作成されました");
      }

      // Step 5: StoreManagerに保存
      try {
        await setProjectConfig(projectFileConfig);
        ConsoleMsg("success", "プロジェクト設定をstoreに保存完了");
      } catch (storeError) {
        ConsoleMsg("warn", `Store保存エラー: ${storeError}`);
      }

      ConsoleMsg("success", "=== プロジェクト作成完了 ===");
      ConsoleMsg("success", `プロジェクト "${projectData.name}" を作成しました`);
      ConsoleMsg("info", `プロジェクトパス: ${projectFullPath}`);

      onClose();
      setProjectData({ name: "", location: "", description: "" });

      // ここでウィンドウをリロードしてTreeを更新
      window.location.reload();
    } catch (error) {
      ConsoleMsg("error", "=== プロジェクト作成エラー ===");
      ConsoleMsg("error", `エラー: ${typeof error === "string" ? error : error?.message || "不明なエラー"}`);

      if (typeof error === "string" && error.includes("forbidden path")) {
        ConsoleMsg("error", "Tauriセキュリティ制限: パスへのアクセスが禁止されています");
        ConsoleMsg("info", "推奨解決方法:");
        ConsoleMsg("info", "• ドキュメントフォルダ内にプロジェクトを作成");
        ConsoleMsg("info", "• ユーザーフォルダ内のサブディレクトリを使用");
        ConsoleMsg("info", "• C:/Users/[ユーザー名]/Documents/ などを使用");
      }
    }
  };

  // プロジェクト名入力時に随時バリデーション
  const handleNameChange = (value) => {
    setProjectData((prev) => ({
      ...prev,
      name: value,
    }));

    // リアルタイムバリデーション
    const nameErrors = validateFolderName(value);
    const pathErrors = validatePathLength(projectData.location, value);
    const allErrors = [...nameErrors, ...pathErrors];

    if (allErrors.length > 0) {
      setNameError(allErrors[0]);
    } else {
      setNameError("");
    }
  };

  const handleCancel = () => {
    onClose();
    setProjectData({ name: "", location: "", description: "" });
    setNameError("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-base-100 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-base-content">新規プロジェクト作成</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              プロジェクト名 *<span className="text-xs text-warning ml-2">(半角英数字のみ、最大{MAX_FOLDER_NAME_LENGTH}文字)</span>
            </label>
            <input
              className="w-full rounded border border-base-300 px-3 py-2 text-base-content focus:border-primary focus:outline-none"
              type="text"
              placeholder="プロジェクト名を入力"
              value={projectData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={MAX_FOLDER_NAME_LENGTH} // HTML属性でも制限
            />
            <div className="flex justify-between items-center mt-1">
              {nameError && <p className="text-xs text-error">{nameError}</p>}
              <span className="text-xs text-gray-500 ml-auto">
                {projectData.name.length}/{MAX_FOLDER_NAME_LENGTH}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              保存場所 *<span className="text-xs text-gray-500 ml-2">(ドキュメントフォルダ推奨)</span>
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-base-300 px-3 py-2 text-base-content focus:border-primary focus:outline-none"
                type="text"
                placeholder="保存場所を選択"
                value={projectData.location}
                readOnly
              />
              <button className="rounded bg-primary px-4 py-2 text-primary-content hover:bg-primary-focus" onClick={handleSelectLocation}>
                参照
              </button>
            </div>
            {!isPathSafe(projectData.location) && projectData.location && (
              <p className="text-xs text-warning mt-1">
                ⚠️ C: D:等以外でかつシステムフォルダ以外の場所を推奨します。
                <br />
                ドキュメントフォルダやユーザーフォルダ内を選択することを推奨します。
              </p>
            )}
            {/* フルパス長の表示 */}
            {projectData.location && projectData.name && (
              <p className="text-xs text-gray-500 mt-1">
                フルパス長: {joinPaths(projectData.location, projectData.name).length}/{MAX_PATH_LENGTH}文字
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-base-content mb-2">説明 (オプション)</label>
            <textarea
              className="w-full rounded border border-base-300 px-3 py-2 text-base-content focus:border-primary focus:outline-none"
              rows="3"
              placeholder="プロジェクトの説明を入力"
              value={projectData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded bg-base-300 px-4 py-2 text-base-content hover:bg-base-content hover:text-base-100" onClick={handleCancel}>
            キャンセル
          </button>
          <button
            className="rounded bg-primary px-4 py-2 text-primary-content hover:bg-primary-focus"
            onClick={handleCreate}
            disabled={!!nameError || !projectData.name.trim() || !projectData.location.trim()}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectDialog;
