import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

import { SYSTEM_MODULES } from "@/constants/permissions";

export const SCOPE_AWARE_PREFIXES = [
  "employee.",
  "attendance.",
  "leave_request.",
  "leave_balance.",
];

export const isScopeAwareCode = (code) => {
  const value = String(code || "");
  // Org-wide settings; registered scope_aware=False in the backend catalog.
  if (value === "attendance.settings.manage") return false;
  return SCOPE_AWARE_PREFIXES.some((prefix) => value.startsWith(prefix));
};

export const useRolesStore = defineStore("roles", () => {
  const snackbar = useSnackbarStore();
  const roles = ref([]);
  const activeRole = ref(null);
  const permissions = ref([]);
  const permissionLoading = ref(false);

  const filters = ref({
    search: "",
  });

  const inFlight = { roles: false };
  const isFetched = ref({ roles: false });
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  const fetchRoles = (force = false) => {
    if (inFlight.roles) return Promise.resolve(roles.value);
    if (isFetched.value.roles && !force) return Promise.resolve(roles.value);

    inFlight.roles = true;
    loading.value = true;

    return apiRequest(urls.KEYS.GET, urls.roles.list, {
      isTokenRequired: true,
      onSuccess: (res) => {
        roles.value = Array.isArray(res) ? res : [];
        isFetched.value.roles = true;
      },
      onFailure: (err) => {
        error.value = err?.message || "Failed to load roles";
        snackbar.show(error.value, "error");
      },
      onFinally: () => {
        inFlight.roles = false;
        loading.value = false;
      },
    });
  };

  const fetchPermissions = () => {
    permissionLoading.value = true;
    return apiRequest(urls.KEYS.GET, urls.roles.permissions, {
      isTokenRequired: true,
      onSuccess: (res) => {
        if (Array.isArray(res) && res.length > 0) {
          permissions.value = res;
        } else {
          // Fall back to SYSTEM_MODULES flat list
          permissions.value = SYSTEM_MODULES.flatMap((m) => m.permissions);
        }
      },
      onFailure: () => {
        // Graceful fallback to default system catalog
        permissions.value = SYSTEM_MODULES.flatMap((m) => m.permissions);
      },
      onFinally: () => {
        permissionLoading.value = false;
      },
    });
  };

  const createRole = (payload, onSuccess) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.roles.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Role created successfully", "success");
        activeRole.value = res;
        fetchRoles(true);
        if (onSuccess) onSuccess(res);
      },
      onFailure: (err) => snackbar.show(err?.message || "Create failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const updateRole = (roleId, payload, onSuccess) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.PATCH, urls.roles.update(roleId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Role updated successfully", "success");
        activeRole.value = res;
        fetchRoles(true);
        if (onSuccess) onSuccess(res);
      },
      onFailure: (err) => snackbar.show(err?.message || "Update failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const deleteRole = (roleId, onSuccess) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.roles.delete(roleId), {
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Role deleted successfully", "success");
        fetchRoles(true);
        if (onSuccess) onSuccess();
      },
      onFailure: (err) => snackbar.show(err?.message || "Delete failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  return {
    roles,
    activeRole,
    permissions,
    permissionLoading,
    filters,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    error,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
  };
});
