import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useUsersStore = defineStore("users", () => {
  const snackbar = useSnackbarStore();
  const users = ref([]);
  const activeUser = ref(null);

  const inFlight = { users: false };
  const isFetched = ref({ users: false });
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  const fetchUsers = (force = false) => {
    if (inFlight.users) return Promise.resolve(users.value);
    if (isFetched.value.users && !force) return Promise.resolve(users.value);

    inFlight.users = true;
    loading.value = true;
    error.value = null;

    return apiRequest(urls.KEYS.GET, urls.users.list, {
      isTokenRequired: true,
      onSuccess: (res) => {
        users.value = Array.isArray(res) ? res : [];
        isFetched.value.users = true;
      },
      onFailure: (err) => {
        error.value = err?.message || "Failed to load users";
        snackbar.show(error.value, "error");
      },
      onFinally: () => {
        inFlight.users = false;
        loading.value = false;
      },
    });
  };

  const createUser = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.users.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("User created", "success");
        activeUser.value = res;
        fetchUsers(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Create failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const updateUser = (userId, payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.PATCH, urls.users.update(userId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("User updated", "success");
        activeUser.value = res;
        fetchUsers(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Update failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const deactivateUser = (userId) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.users.deactivate(userId), {
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("User deactivated", "success");
        fetchUsers(true);
      },
      onFailure: (err) => snackbar.show(err?.message || "Deactivate failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const assignRole = (userId, roleId) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.users.assignRole(userId), {
      data: { role_id: roleId },
      isTokenRequired: true,
      onSuccess: () => snackbar.show("Role assigned", "success"),
      onFailure: (err) => snackbar.show(err?.message || "Assign failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const unassignRole = (userId, roleId) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.users.unassignRole(userId, roleId), {
      isTokenRequired: true,
      onSuccess: () => snackbar.show("Role removed", "success"),
      onFailure: (err) => snackbar.show(err?.message || "Unassign failed", "error"),
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  return {
    users,
    activeUser,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deactivateUser,
    assignRole,
    unassignRole,
  };
});
