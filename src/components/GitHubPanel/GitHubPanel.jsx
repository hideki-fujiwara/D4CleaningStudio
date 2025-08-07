// ========================================================================================
// インポート
// ========================================================================================
import React, { useState, useEffect } from "react";
import { getAuthState, setAccessToken, fetchUserInfo, fetchUserRepos, logout, initializeGitHub, validateToken } from "../../utils/GitHubManager";
import ConsoleMsg from "../../utils/ConsoleMsg";

/**
 * GitHub連携コンポーネント
 *
 * GitHubアカウントとの連携機能を提供する。
 * 認証、リポジトリ一覧表示、ブランチ管理などの機能を含む。
 */
function GitHubPanel() {
  // ========================================================================================
  // 状態管理
  // ========================================================================================

  const [authState, setAuthState] = useState(getAuthState());
  const [tokenInput, setTokenInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [showTokenInput, setShowTokenInput] = useState(false);

  // ========================================================================================
  // 初期化処理
  // ========================================================================================

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const isAuthenticated = await initializeGitHub();
        if (isAuthenticated) {
          const updatedState = getAuthState();
          setAuthState(updatedState);
          await loadRepos();
        }
      } catch (error) {
        ConsoleMsg("error", "GitHub初期化エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  // ========================================================================================
  // GitHub操作関数
  // ========================================================================================

  /**
   * アクセストークンでログイン
   */
  const handleLogin = async () => {
    if (!tokenInput.trim()) {
      alert("アクセストークンを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      setAccessToken(tokenInput.trim());
      await fetchUserInfo();
      const updatedState = getAuthState();
      setAuthState(updatedState);
      setTokenInput("");
      setShowTokenInput(false);
      await loadRepos();
      ConsoleMsg("info", "GitHub認証成功");
    } catch (error) {
      ConsoleMsg("error", "GitHub認証失敗:", error);
      alert("認証に失敗しました。トークンを確認してください。");
      logout();
      setAuthState(getAuthState());
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    logout();
    setAuthState(getAuthState());
    setRepos([]);
    setTokenInput("");
    setShowTokenInput(false);
    ConsoleMsg("info", "GitHubからログアウト");
  };

  /**
   * リポジトリ一覧を読み込み
   */
  const loadRepos = async () => {
    if (!authState.isAuthenticated) return;

    setIsLoading(true);
    try {
      const userRepos = await fetchUserRepos();
      setRepos(userRepos);
    } catch (error) {
      ConsoleMsg("error", "リポジトリ読み込みエラー:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * リポジトリをブラウザで開く
   */
  const openRepo = (repo) => {
    window.open(repo.html_url, "_blank");
  };

  /**
   * リポジトリをクローン（URLをクリップボードにコピー）
   */
  const copyCloneUrl = (repo) => {
    navigator.clipboard.writeText(repo.clone_url);
    ConsoleMsg("info", `クローンURLをコピー: ${repo.name}`);
  };

  // ========================================================================================
  // レンダリング関数
  // ========================================================================================

  /**
   * 未認証状態のレンダリング
   */
  const renderUnauthenticated = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="mb-4">
          <svg className="mx-auto h-12 w-12 text-base-content/50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-base-content">GitHub連携</h3>
        <p className="mt-2 text-sm text-base-content/70">GitHubアカウントに接続してリポジトリを管理</p>
      </div>

      {!showTokenInput ? (
        <button onClick={() => setShowTokenInput(true)} className="w-full rounded bg-primary px-4 py-2 text-primary-content hover:bg-primary/80">
          GitHub に接続
        </button>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-base-content">Personal Access Token</label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="mt-1 w-full rounded border border-base-300 bg-base-100 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-base-content/60">
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                トークンを作成
              </a>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogin} disabled={isLoading} className="flex-1 rounded bg-success px-3 py-2 text-sm text-success-content hover:bg-success/80 disabled:opacity-50">
              {isLoading ? "認証中..." : "接続"}
            </button>
            <button
              onClick={() => {
                setShowTokenInput(false);
                setTokenInput("");
              }}
              className="rounded bg-base-200 px-3 py-2 text-sm text-base-content hover:bg-base-300"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );

  /**
   * 認証済み状態のレンダリング
   */
  const renderAuthenticated = () => (
    <div className="space-y-4">
      {/* ユーザー情報 */}
      <div className="rounded bg-base-200 p-3">
        <div className="flex items-center gap-3">
          <img src={authState.user?.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full" />
          <div>
            <p className="text-sm font-medium text-base-content">{authState.user?.name || authState.user?.login}</p>
            <p className="text-xs text-base-content/70">@{authState.user?.login}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="mt-2 text-xs text-error hover:underline">
          ログアウト
        </button>
      </div>

      {/* リポジトリ一覧 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-base-content">リポジトリ</h4>
          <button onClick={loadRepos} disabled={isLoading} className="text-xs text-primary hover:underline disabled:opacity-50">
            更新
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <span className="text-sm text-base-content/70">読み込み中...</span>
          </div>
        ) : (
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {repos.map((repo) => (
              <div key={repo.id} className="group rounded border border-base-300 p-2 hover:bg-base-200">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-base-content">{repo.name}</p>
                    {repo.description && <p className="text-xs text-base-content/70 line-clamp-2">{repo.description}</p>}
                    <div className="mt-1 flex items-center gap-2 text-xs text-base-content/60">
                      {repo.language && <span className="rounded bg-base-300 px-1">{repo.language}</span>}
                      {repo.private && <span className="text-warning">🔒</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openRepo(repo)} className="rounded p-1 text-primary hover:bg-primary/10" title="GitHubで開く">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button onClick={() => copyCloneUrl(repo)} className="rounded p-1 text-accent hover:bg-accent/10" title="クローンURLをコピー">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M13.887 3.182c.396-.037.79.081 1.083.374l2.474 2.474c.293.293.411.687.374 1.083L17.5 15.5A2.5 2.5 0 0115 18H5a2.5 2.5 0 01-2.5-2.5v-10A2.5 2.5 0 015 3h8.387zM5 4.5A1 1 0 004 5.5v10A1 1 0 005 16.5h10a1 1 0 001-1V7.621L13.379 5H5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ========================================================================================
  // メインレンダリング
  // ========================================================================================

  return <div className="h-full">{authState.isAuthenticated ? renderAuthenticated() : renderUnauthenticated()}</div>;
}

// ========================================================================================
// エクスポート
// ========================================================================================

export default GitHubPanel;
