const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "currentUser";
const ROLE_KEY = "role";
const USER_ID_KEY = "user_id";

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
      if (user.id) {
        localStorage.setItem(USER_ID_KEY, String(user.id));
      }
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
      if (user.id) {
        localStorage.setItem(USER_ID_KEY, String(user.id));
      }
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Remove authentication tokens & user session without clearing custom environment overrides
   */
  removeToken: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },
};

export default authToken;
