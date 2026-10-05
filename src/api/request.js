import axios from "axios";
import authToken from "../common/authToken";
import router from "../router";

// ─── Base URL Resolution ──────────────────────────────────────────

export const getBaseOrigin = () => {
  // Prefer project env so a leftover localStorage override (e.g. old Dev Tunnel)
  // cannot silently point the SPA at the wrong API.
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  const customUrl = localStorage.getItem("custom_base_url");
  if (customUrl) {
    return customUrl.trim().replace(/\/+$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
};

export const getBaseURL = () => {
  const origin = getBaseOrigin();
  if (origin.endsWith("/api/v1")) {
    return `${origin}/`;
  }
  return `${origin}/api/v1/`;
};

export const getWsURL = (token = "") => {
  const origin = getBaseOrigin();
  let wsProto = "ws:";
  let host = "";

  try {
    const parsed = new URL(origin);
    wsProto = parsed.protocol === "https:" ? "wss:" : "ws:";
    host = parsed.host;
  } catch (_) {
    wsProto = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    host = typeof window !== "undefined" ? window.location.host : "localhost:8000";
  }

  const tokenParam = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${wsProto}//${host}/ws${tokenParam}`;
};

// ─── Constants ────────────────────────────────────────────────────

const DEFAULT_TIMEOUT = 2 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 2;
const RETRYABLE_STATUS_CODES = [502, 503, 504];
const NO_BODY_METHODS = ["get", "delete", "head", "options"];
const ALLOWED_METHODS = ["get", "post", "patch", "put", "delete"];

// ─── Request Deduplication (takeLatest) ───────────────────────────

const pendingRequests = new Map();

const generateRequestKey = (method, url) => {
  return `${method.toUpperCase()}:${url}`;
};

const cancelPreviousRequest = (requestKey) => {
  const existing = pendingRequests.get(requestKey);
  if (existing) {
    existing.abortController.abort();
  }
};

const cleanupRequest = (requestKey, controller) => {
  const current = pendingRequests.get(requestKey);
  if (current?.abortController === controller) {
    pendingRequests.delete(requestKey);
  }
};

// ─── Axios Instance ───────────────────────────────────────────────

const axiosInstance = axios.create({
  timeout: DEFAULT_TIMEOUT,
});

// ─── Request Interceptor ──────────────────────────────────────────

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.isTokenRequired !== false) {
      const accessToken = authToken.getAccessToken();
      if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Token Refresh Coordination ───────────────────────────────────

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const onTokenRefreshFailed = (err) => {
  refreshSubscribers.forEach((callback) => callback(null, err));
  refreshSubscribers = [];
};

// ─── Response Interceptor ─────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ── 401 Handling: Token Refresh Cycle
    if (error.response?.status === 401 && originalRequest) {
      const requestUrl = originalRequest.url || "";
      const isAuthEndpoint =
        requestUrl.includes("auth/login") ||
        requestUrl.includes("auth/signup") ||
        requestUrl.includes("auth/refresh") ||
        requestUrl.includes("auth/logout");

      // Don't refresh if the failure came from an auth route itself
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Check if this request already retried once
      if (originalRequest._retry) {
        authToken.removeToken();
        router.push({ name: "Login" }).catch(() => {
          window.location.href = "/auth/login";
        });
        return Promise.reject(error);
      }

      const refreshToken = authToken.getRefreshToken();
      if (!refreshToken) {
        authToken.removeToken();
        router.push({ name: "Login" }).catch(() => {
          window.location.href = "/auth/login";
        });
        return Promise.reject(error);
      }

      // If refresh is already in-flight, wait for it
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, refreshErr) => {
            if (refreshErr || !newToken) {
              return reject(refreshErr || error);
            }
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${getBaseURL()}auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
          }
        );

        const data = refreshResponse.data;
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token || refreshToken;

        authToken.setTokens({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          user: data.user,
        });

        onTokenRefreshed(newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        window.dispatchEvent(new CustomEvent("auth:token-refreshed"));
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        onTokenRefreshFailed(refreshErr);
        authToken.removeToken();
        router.push({ name: "Login" }).catch(() => {
          window.location.href = "/auth/login";
        });
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Retry on transient server errors
    const shouldRetry =
      RETRYABLE_STATUS_CODES.includes(error.response?.status) &&
      (originalRequest?._retryCount ?? 0) < MAX_RETRY_ATTEMPTS;

    if (shouldRetry && originalRequest) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      const delay = 300 * originalRequest._retryCount;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return axiosInstance(originalRequest);
    }

    handleError(error);
    return Promise.reject(error);
  }
);

// ─── Global Error Handler ─────────────────────────────────────────

const handleError = (error) => {
  if (error.code === "ERR_CANCELED") {
    console.warn("Request cancelled:", error.message);
    return;
  }

  if (!error.response) {
    console.error("Network error:", error.message || "Unknown network error");
    return;
  }

  const { status, statusText, data } = error.response;

  switch (status) {
    case 404:
      console.error(`Not found (404): ${error.config?.url}`);
      break;

    case 500:
    case 502:
    case 503:
      console.error(`Server error (${status}): ${statusText}`);
      break;

    default: {
      const message = extractErrorMessage(data);
      if (message) {
        console.error(`API error (${status}):`, message);
      }
    }
  }
};

/**
 * Format and extract clean error message from FastAPI / Django / Express payloads
 */
export const extractErrorMessage = (data) => {
  if (!data) return "An unexpected error occurred.";
  if (typeof data === "string") return data;

  // FastAPI detail can be string or array of validation errors
  if (data.detail) {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
    }
    return JSON.stringify(data.detail);
  }

  if (data.message) {
    if (typeof data.message === "string") return data.message;
    if (typeof data.message === "object") {
      return Object.entries(data.message)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
        .join("; ");
    }
  }

  if (data.error) {
    if (typeof data.error === "string") return data.error;
    return JSON.stringify(data.error);
  }

  return "An unexpected error occurred.";
};

// ─── apiRequest Core Function ─────────────────────────────────────

const apiRequest = (
  method,
  url,
  {
    headers = {},
    params = {},
    data = {},
    look_up_key = null,
    onSuccess = null,
    onFailure = null,
    onFinally = null,
    responseType = "json",
    onUploadProgress = null,
    onDownloadProgress = null,
    isTokenRequired = true,
    signal = null,
    timeout = null,
    cancelPrevious = false,
  } = {}
) => {
  if (!ALLOWED_METHODS.includes(method)) {
    throw new Error(
      `Method "${method}" is not allowed. Use one of: ${ALLOWED_METHODS.join(", ")}`
    );
  }
  if (!url) {
    throw new Error("URL is required");
  }
  if (look_up_key !== null && look_up_key !== undefined) {
    url = `${url.replace(/\/$/, "")}/${look_up_key}`;
  }

  let abortController = null;
  let requestKey = null;

  if (cancelPrevious) {
    requestKey = generateRequestKey(method, url);
    abortController = new AbortController();
    cancelPreviousRequest(requestKey);
    pendingRequests.set(requestKey, { abortController });
  }

  const config = {
    method,
    url,
    headers,
    params,
    responseType,
    onUploadProgress,
    onDownloadProgress,
    isTokenRequired,
    baseURL: getBaseURL(),
    signal: abortController?.signal || signal,
    ...(timeout != null && { timeout }),
  };

  if (!NO_BODY_METHODS.includes(method)) {
    config.data = data;
  }

  return axiosInstance(config)
    .then(async (response) => {
      // 204 No Content — empty body is success
      const payload = response.status === 204 ? null : response.data;
      if (onSuccess) await onSuccess(payload);
      return payload;
    })
    .catch(async (error) => {
      if (error.code === "ERR_CANCELED") {
        console.warn("Request cancelled:", error.message);
        throw error;
      }

      const parsedError = {
        status: error.response?.status,
        message: extractErrorMessage(error.response?.data) || error.message,
        data: error.response?.data,
        raw: error,
      };

      if (onFailure) {
        await onFailure(parsedError);
        return;
      }

      throw parsedError;
    })
    .finally(async () => {
      if (requestKey) {
        cleanupRequest(requestKey, abortController);
      }
      if (onFinally) await onFinally();
    });
};

export { axiosInstance };
export default apiRequest;
