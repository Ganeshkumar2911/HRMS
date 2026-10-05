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
  const permissions = ref([]);
  const roles = ref([]);

  const inFlight = {
    permissions: false,
  };
  let pendingPermissionsRequest = null;

  const isFetched = ref({
    permissions: false,
  });

  const loading = ref(false);
  const error = ref(null);

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

  const can = (code) => {
    if (!code) return true;
    return permissions.value.some((permission) => {
      if (!permission?.code) return false;
      if (permission.code === "*" || permission.code === code) return true;
      if (permission.code.endsWith(".*")) {
        const prefix = permission.code.slice(0, -2);
        return code.startsWith(`${prefix}.`);
      }
      return false;
    });
  };

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

  const fetchMyPermissions = async (force = false) => {
    if (isFetched.value.permissions && !force) {
      return permissions.value;
    }

    if (pendingPermissionsRequest) {
      try {
        await pendingPermissionsRequest;
      } catch (_) {
        // Previous attempt failed — fall through to retry when needed.
      }
      if (isFetched.value.permissions && !force) {
        return permissions.value;
      }
    }

    inFlight.permissions = true;
    loading.value = true;
    error.value = null;
    let succeeded = false;

    pendingPermissionsRequest = apiRequest(urls.KEYS.GET, urls.users.myPermissions, {
      isTokenRequired: true,
      onSuccess: (res) => {
        const list = Array.isArray(res?.permissions) ? res.permissions : [];
        permissions.value = list;
        localStorage.setItem("user_permissions", JSON.stringify(list));
        isFetched.value.permissions = true;
        succeeded = true;
      },
      onFailure: (err) => {
        error.value = err?.message || "Failed to load permissions";
      },
      onFinally: () => {
        inFlight.permissions = false;
        loading.value = false;
        pendingPermissionsRequest = null;
      },
    }).then((result) => {
      if (!succeeded) {
        return Promise.reject(new Error(error.value || "Failed to load permissions"));
      }
      return result;
    });

    return pendingPermissionsRequest;
  };

  const ensurePermissionsLoaded = async () => {
    if (isFetched.value.permissions && permissions.value.length > 0) {
      return permissions.value;
    }
    try {
      await fetchMyPermissions(true);
    } catch (_) {
      // Caller decides whether missing codes are fatal.
    }
    return permissions.value;
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
    ensurePermissionsLoaded,
  };
});
