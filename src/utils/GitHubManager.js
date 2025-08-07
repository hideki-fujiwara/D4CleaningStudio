// ========================================================================================
// GitHub連携管理ユーティリティ
// ========================================================================================

import ConsoleMsg from "./ConsoleMsg";

/**
 * GitHub API設定
 */
const GITHUB_CONFIG = {
  BASE_URL: "https://api.github.com",
  CLIENT_ID: null, // 環境変数から設定される予定
  SCOPES: ["repo", "user", "gist"],
};

/**
 * GitHub認証状態
 */
let authState = {
  isAuthenticated: false,
  token: null,
  user: null,
  repos: [],
};

/**
 * GitHub認証状態を取得
 */
export const getAuthState = () => ({ ...authState });

/**
 * GitHubアクセストークンを設定
 * @param {string} token - GitHubアクセストークン
 */
export const setAccessToken = (token) => {
  authState.token = token;
  authState.isAuthenticated = !!token;

  // ローカルストレージに保存（セキュリティ要注意）
  if (token) {
    localStorage.setItem("github_token", token);
    ConsoleMsg("info", "GitHubアクセストークンを設定しました");
  } else {
    localStorage.removeItem("github_token");
    ConsoleMsg("info", "GitHubアクセストークンを削除しました");
  }
};

/**
 * 保存されたアクセストークンを読み込み
 */
export const loadSavedToken = () => {
  const savedToken = localStorage.getItem("github_token");
  if (savedToken) {
    setAccessToken(savedToken);
    return savedToken;
  }
  return null;
};

/**
 * GitHub APIリクエストを実行
 * @param {string} endpoint - APIエンドポイント
 * @param {object} options - リクエストオプション
 */
const makeGitHubRequest = async (endpoint, options = {}) => {
  if (!authState.token) {
    throw new Error("GitHub認証が必要です");
  }

  const url = `${GITHUB_CONFIG.BASE_URL}${endpoint}`;
  const headers = {
    Authorization: `token ${authState.token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API エラー: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    ConsoleMsg("error", "GitHub APIリクエストエラー:", error);
    throw error;
  }
};

/**
 * 認証されたユーザー情報を取得
 */
export const fetchUserInfo = async () => {
  try {
    const user = await makeGitHubRequest("/user");
    authState.user = user;
    ConsoleMsg("info", "GitHubユーザー情報を取得:", user.login);
    return user;
  } catch (error) {
    ConsoleMsg("error", "ユーザー情報取得エラー:", error);
    throw error;
  }
};

/**
 * ユーザーのリポジトリ一覧を取得
 * @param {number} per_page - 1ページあたりの件数
 * @param {number} page - ページ番号
 */
export const fetchUserRepos = async (per_page = 30, page = 1) => {
  try {
    const repos = await makeGitHubRequest(`/user/repos?per_page=${per_page}&page=${page}&sort=updated`);
    authState.repos = repos;
    ConsoleMsg("info", `GitHubリポジトリを${repos.length}件取得`);
    return repos;
  } catch (error) {
    ConsoleMsg("error", "リポジトリ取得エラー:", error);
    throw error;
  }
};

/**
 * 特定のリポジトリ情報を取得
 * @param {string} owner - リポジトリオーナー
 * @param {string} repo - リポジトリ名
 */
export const fetchRepoInfo = async (owner, repo) => {
  try {
    const repoInfo = await makeGitHubRequest(`/repos/${owner}/${repo}`);
    ConsoleMsg("info", `リポジトリ情報を取得: ${owner}/${repo}`);
    return repoInfo;
  } catch (error) {
    ConsoleMsg("error", "リポジトリ情報取得エラー:", error);
    throw error;
  }
};

/**
 * リポジトリのブランチ一覧を取得
 * @param {string} owner - リポジトリオーナー
 * @param {string} repo - リポジトリ名
 */
export const fetchRepoBranches = async (owner, repo) => {
  try {
    const branches = await makeGitHubRequest(`/repos/${owner}/${repo}/branches`);
    ConsoleMsg("info", `ブランチを${branches.length}件取得: ${owner}/${repo}`);
    return branches;
  } catch (error) {
    ConsoleMsg("error", "ブランチ取得エラー:", error);
    throw error;
  }
};

/**
 * GitHubからログアウト
 */
export const logout = () => {
  authState.isAuthenticated = false;
  authState.token = null;
  authState.user = null;
  authState.repos = [];
  localStorage.removeItem("github_token");
  ConsoleMsg("info", "GitHubからログアウトしました");
};

/**
 * GitHubアクセストークンの有効性を確認
 */
export const validateToken = async () => {
  try {
    await fetchUserInfo();
    return true;
  } catch (error) {
    ConsoleMsg("error", "トークン検証失敗:", error);
    logout();
    return false;
  }
};

/**
 * 初期化処理
 */
export const initializeGitHub = async () => {
  const savedToken = loadSavedToken();
  if (savedToken) {
    const isValid = await validateToken();
    if (isValid) {
      ConsoleMsg("info", "GitHub認証を復元しました");
      return true;
    }
  }
  return false;
};
