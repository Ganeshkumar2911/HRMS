import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const SCOPE_AWARE_PREFIXES = [
  "employee.",
  "attendance.",
  "leave_request.",
  "leave_balance.",
];

export const isScopeAwareCode = (code) =>
  SCOPE_AWARE_PREFIXES.some((prefix) => String(code || "").startsWith(prefix));

export const useRolesStore = defineStore("roles", () => {
  const snackbar = useSnackbarStore();
  const roles = ref([]);
  const activeRole = ref(null);

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

  const createRole = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.roles.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Role created", "success");
        activeRole.value = res;
        fetchRoles(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Create failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const updateRole = (roleId, payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.PATCH, urls.roles.update(roleId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Role updated", "success");
        activeRole.value = res;
        fetchRoles(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Update failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const deleteRole = (roleId) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.roles.delete(roleId), {
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Role deleted", "success");
        fetchRoles(true);
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
    inFlight,
    isFetched,
    loading,
    actionLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
});
