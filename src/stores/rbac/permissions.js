import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const SCOPE_WEIGHTS = {
  ALL: 3,
  TEAM: 2,
  SELF: 1,
};

export const usePermissionsStore = defineStore("permissions", () => {
  // ─── 1. Primary State ──────────────────────────────────
  const permissions = ref([]);
  const roles = ref([]);

  // ─── 2. In-Flight Tracking ─────────────────────────────
  const inFlight = {
    permissions: false,
  };
  let pendingPermissionsRequest = null;

  // ─── 3. isFetched Tracking ─────────────────────────────
  const isFetched = ref({
    permissions: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ───────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      permissions: false,
    };
  };

  const clearPermissions = () => {
    permissions.value = [];
    roles.value = [];
    resetFetchedFlags();
    localStorage.removeItem("user_permissions");
    localStorage.removeItem("user_role");
  };

  // ─── Permission Check: can(code) ───────────────────────
  const can = (code) => {
    if (!code) return true;
    return permissions.value.some((permission) => {
      if (permission.code === "*" || permission.code === code) return true;
      if (permission.code.endsWith(".*")) {
        const prefix = permission.code.slice(0, -2);
        return code.startsWith(`${prefix}.`);
      }
      return false;
    });
  };

  // ─── Scope Resolver: scopeOf(code) ─────────────────────
  const scopeOf = (code) => {
    let highestScope = null;
    let highestWeight = 0;

    for (const permission of permissions.value) {
      if (permission.code !== code || !permission.scope) continue;
      const weight = SCOPE_WEIGHTS[permission.scope] || 0;
      if (weight > highestWeight) {
        highestWeight = weight;
        highestScope = permission.scope;
      }
    }

    return highestScope;
  };

  const canViewTask = (task, currentUserId) => {
    if (!task || !currentUserId) return false;
    return task.created_by === currentUserId || task.assigned_to === currentUserId;
  };

  const canAccessArea = (areaKey) => {
    switch (areaKey) {
      case "chat":
        return true;
      case "tasks":
        return can("task.view");
      case "notifications":
        return can("notification.view");
      case "hrms":
        return can("employee.view");
      case "admin_users":
        return can("user.view");
      case "admin_roles":
        return can("role.assign");
      case "admin_audit":
        return can("audit.view");
      case "admin_broadcast":
        return can("notification.broadcast");
      default:
        return true;
    }
  };

  const hasAdminAccess = () => {
    return (
      canAccessArea("admin_users") ||
      canAccessArea("admin_roles") ||
      canAccessArea("admin_audit") ||
      canAccessArea("admin_broadcast")
    );
  };

  // ─── Fetch Permissions (GET /users/me/permissions) ─────
  const fetchMyPermissions = (force = false) => {
    if (isFetched.value.permissions && !force) return Promise.resolve(permissions.value);
    if (pendingPermissionsRequest) return pendingPermissionsRequest;

    inFlight.permissions = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      const list = Array.isArray(res?.permissions) ? res.permissions : [];
      permissions.value = list;
      localStorage.setItem("user_permissions", JSON.stringify(list));
      isFetched.value.permissions = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load permissions";
    };

    const finallyHandler = () => {
      inFlight.permissions = false;
      loading.value = false;
      pendingPermissionsRequest = null;
    };

    pendingPermissionsRequest = apiRequest(urls.KEYS.GET, urls.users.myPermissions, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
    return pendingPermissionsRequest;
  };

  return {
    permissions,
    roles,
    inFlight,
    isFetched,
    loading,
    error,
    resetFetchedFlags,
    clearPermissions,
    can,
    scopeOf,
    canViewTask,
    canAccessArea,
    hasAdminAccess,
    fetchMyPermissions,
  };
});
