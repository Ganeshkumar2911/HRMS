import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import authToken from "@/common/authToken";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useWsStore } from "@/stores/ws/ws";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import router from "@/router";

export const useAuthStore = defineStore("auth", () => {
  const snackbar = useSnackbarStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const currentUser = ref(authToken.getUser());
  const currentEmployee = ref(null);
  const sessionInitialized = ref(false);

  // ─── 2. In-Flight Tracking ─────────────────────────────
  const inFlight = {
    currentUser: false,
    currentEmployee: false,
    login: false,
    signup: false,
    logout: false,
  };

  // ─── 3. isFetched Tracking ─────────────────────────────
  const isFetched = ref({
    currentUser: false,
    currentEmployee: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  const isAuthenticated = computed(() => {
    return authToken.hasToken() && (!currentUser.value || currentUser.value.status === "ACTIVE");
  });

  const isActiveUser = computed(() => {
    return currentUser.value?.status === "ACTIVE";
  });

  const resetFetchedFlags = () => {
    isFetched.value = {
      currentUser: false,
      currentEmployee: false,
    };
  };

  const redirectAfterAuth = () => {
    const redirectPath = router.currentRoute.value.query?.redirect;
    if (typeof redirectPath === "string" && redirectPath.startsWith("/")) {
      router.push(redirectPath).catch(() => {
        router.push("/chat").catch(() => {});
      });
      return;
    }
    router.push("/chat").catch(() => {});
  };

  const bootstrapAfterAuth = async (accessToken) => {
    const wsStore = useWsStore();
    const permissionsStore = usePermissionsStore();
    // Permissions first — do not wait on WebSocket/Redis for route access.
    await permissionsStore.fetchMyPermissions(true).catch(() => {});
    wsStore.connect(accessToken);
    fetchCurrentEmployee(true).catch(() => {});
  };

  // ─── Fetch Current User (GET /api/v1/users/me) ─────────
  const fetchCurrentUser = (force = false) => {
    if (inFlight.currentUser) return Promise.resolve(currentUser.value);
    if (isFetched.value.currentUser && !force) return Promise.resolve(currentUser.value);

    inFlight.currentUser = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      currentUser.value = res;
      authToken.setUser(res);
      isFetched.value.currentUser = true;

      if (res?.status && res.status !== "ACTIVE") {
        snackbar.show("Account is inactive. Access restricted.", "error");
        logout(false);
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load user profile";
      if (err?.status === 401) {
        logout(false);
      }
    };

    const finallyHandler = () => {
      inFlight.currentUser = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.users.me, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Fetch Current Employee ────────────────────────────
  const fetchCurrentEmployee = (force = false) => {
    if (inFlight.currentEmployee) return Promise.resolve(currentEmployee.value);
    if (isFetched.value.currentEmployee && !force) return Promise.resolve(currentEmployee.value);

    inFlight.currentEmployee = true;
    detailLoading.value = true;

    const successHandler = (res) => {
      currentEmployee.value = res;
      isFetched.value.currentEmployee = true;
    };

    const failureHandler = (err) => {
      currentEmployee.value = null;
      isFetched.value.currentEmployee = true;
      if (err?.status !== 403 && err?.status !== 404) {
        console.warn("Could not load employee profile:", err?.message);
      }
    };

    const finallyHandler = () => {
      inFlight.currentEmployee = false;
      detailLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.hrms.employeeProfile, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Login Action ──────────────────────────────────────
  const login = (credentials) => {
    if (inFlight.login) return Promise.reject(new Error("Login already in progress"));

    inFlight.login = true;
    actionLoading.value = true;
    error.value = null;

    const successHandler = async (res) => {
      if (res?.user && res.user.status !== "ACTIVE") {
        snackbar.show("Account is inactive. Please contact your administrator.", "error");
        actionLoading.value = false;
        inFlight.login = false;
        return;
      }

      authToken.setTokens({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      currentUser.value = res.user || null;
      isFetched.value.currentUser = !!res.user;

      await bootstrapAfterAuth(res.access_token);
      snackbar.show("Welcome back!", "success");
      redirectAfterAuth();
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Invalid credentials. Please try again.";
      snackbar.show(error.value, "error");
    };

    const finallyHandler = () => {
      inFlight.login = false;
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.auth.login, {
      data: credentials,
      isTokenRequired: false,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Signup Action ─────────────────────────────────────
  const signup = (payload) => {
    if (inFlight.signup) return Promise.reject(new Error("Signup already in progress"));

    inFlight.signup = true;
    actionLoading.value = true;
    error.value = null;

    const successHandler = async (res) => {
      authToken.setTokens({
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        user: res.user,
      });

      currentUser.value = res.user || null;
      isFetched.value.currentUser = !!res.user;

      await bootstrapAfterAuth(res.access_token);
      snackbar.show("Account created successfully!", "success");
      redirectAfterAuth();
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Registration failed. Please check your inputs.";
      snackbar.show(error.value, "error");
    };

    const finallyHandler = () => {
      inFlight.signup = false;
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.auth.signup, {
      data: payload,
      isTokenRequired: false,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Logout Action ─────────────────────────────────────
  const logout = async (notify = true) => {
    actionLoading.value = true;

    const wsStore = useWsStore();
    const permissionsStore = usePermissionsStore();
    wsStore.disconnect();

    const finallyHandler = () => {
      authToken.removeToken();
      currentUser.value = null;
      currentEmployee.value = null;
      permissionsStore.clearPermissions();
      resetFetchedFlags();
      sessionInitialized.value = false;
      actionLoading.value = false;

      if (notify) {
        snackbar.show("Signed out successfully.", "info");
      }

      router.push("/login").catch(() => {
        window.location.href = "/login";
      });
    };

    try {
      await apiRequest(urls.KEYS.POST, urls.auth.logout, {
        isTokenRequired: true,
        onFinally: finallyHandler,
      });
    } catch (_) {
      finallyHandler();
    }
  };

  // ─── Shell Initialization ──────────────────────────────
  const initSession = async () => {
    if (sessionInitialized.value) return;

    if (authToken.hasToken()) {
      try {
        await fetchCurrentUser();
        if (authToken.hasToken() && currentUser.value?.status === "ACTIVE") {
          await bootstrapAfterAuth(authToken.getAccessToken());
        }
      } catch (_) {
        // Handled in handlers
      }
    }

    sessionInitialized.value = true;
  };

  return {
    currentUser,
    currentEmployee,
    sessionInitialized,
    isAuthenticated,
    isActiveUser,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    detailLoading,
    error,
    resetFetchedFlags,
    fetchCurrentUser,
    fetchCurrentEmployee,
    login,
    signup,
    logout,
    initSession,
  };
});
