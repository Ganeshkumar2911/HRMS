const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "currentUser";

const authToken = {
  /**
   * Set accessToken and optionally refreshToken
   */
  setToken: (accessToken = null, refreshToken = null) => {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * Set both tokens and user data from TokenResponse
   * @param {{ access_token: string, refresh_token: string, user?: object }} response
   */
  setTokens: ({ access_token, refresh_token, user = null } = {}) => {
    if (access_token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
    }
    if (refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    }
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  /**
   * Get all active tokens
   */
  getToken: () => {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  },

  getAccessToken: () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
  },

  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
  },

  hasToken: () => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Clear authentication tokens and user state
   */
  removeToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export default authToken;
