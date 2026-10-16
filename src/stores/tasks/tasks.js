import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

// Auto-detect optional dummy data file (*.dummy.js)
const dummyModules = import.meta.glob("./*.dummy.js", { eager: true });
const dummyKey = Object.keys(dummyModules)[0];
const dummyStore = dummyKey ? (dummyModules[dummyKey].default || dummyModules[dummyKey]) : null;

const emptyListParams = () => ({
  limit: 50,
  offset: 0,
  status: "",
  priority: "",
  q: "",
  from_date: "",
  to_date: "",
  sort_by: "updated_at",
  sort_dir: "desc",
});

const compactQuery = (params) => {
  const query = { ...params };
  Object.keys(query).forEach((key) => {
    if (query[key] === "" || query[key] == null) delete query[key];
  });
  return query;
};

const summaryFiltersFromList = (listParams) => {
  const { status, priority, q, from_date, to_date } = listParams;
  return compactQuery({ status, priority, q, from_date, to_date });
};

export const useTasksStore = defineStore("tasks", () => {
  const snackbar = useSnackbarStore();

  const tasks = ref([]);
  const summary = ref(null);
  const activeTask = ref(null);
  const listParams = ref(emptyListParams());
  const hasMore = ref(false);
  const pagination = ref({ limit: 50, offset: 0, total: 0, has_more: false });
  const assigneeMatches = ref([]);

  const inFlight = {
    tasks: false,
    summary: false,
    detail: false,
    assignees: false,
  };

  const isFetched = ref({
    tasks: false,
    summary: false,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const detailLoading = ref(false);
  const assigneesLoading = ref(false);
  const error = ref(null);

  const resetFetchedFlags = () => {
    isFetched.value = { tasks: false, summary: false };
  };

  const fetchSummary = (force = false) => {
    if (dummyStore) {
      summary.value =
        typeof dummyStore.getSummary === "function"
          ? dummyStore.getSummary()
          : dummyStore.dummySummary;
      isFetched.value.summary = true;
      return Promise.resolve(summary.value);
    }

    if (inFlight.summary && !force) return Promise.resolve(summary.value);
    if (isFetched.value.summary && !force) return Promise.resolve(summary.value);

    inFlight.summary = true;

    const successHandler = (res) => {
      summary.value = res;
      isFetched.value.summary = true;
    };

    const failureHandler = (err) => {
      if (err?.status !== 403) {
        snackbar.show(err?.message || "Failed to load task summary", "error");
      }
    };

    const finallyHandler = () => {
      inFlight.summary = false;
    };

    return apiRequest(urls.KEYS.GET, urls.tasks.summary, {
      params: summaryFiltersFromList(listParams.value),
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchTasks = (params = {}, force = false) => {
    listParams.value = { ...listParams.value, ...params };
    const query = compactQuery(listParams.value);

    if (dummyStore) {
      loading.value = true;
      const res =
        typeof dummyStore.getTasks === "function"
          ? dummyStore.getTasks(query)
          : {
              items: dummyStore.dummyTasks || [],
              pagination: {
                limit: 50,
                offset: 0,
                total: (dummyStore.dummyTasks || []).length,
                has_more: false,
              },
            };
      const rows = res.items || [];
      tasks.value = rows;
      pagination.value = res.pagination || {
        limit: query.limit || 50,
        offset: query.offset || 0,
        total: rows.length,
        has_more: false,
      };
      hasMore.value = !!pagination.value.has_more;
      isFetched.value.tasks = true;
      loading.value = false;
      return Promise.resolve(tasks.value);
    }

    if (inFlight.tasks && !force) return Promise.resolve(tasks.value);
    if (isFetched.value.tasks && !force) return Promise.resolve(tasks.value);

    inFlight.tasks = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      tasks.value = rows;
      hasMore.value = rows.length >= (query.limit || 50);
      isFetched.value.tasks = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load tasks";
      snackbar.show(error.value, "error");
    };

    const finallyHandler = () => {
      inFlight.tasks = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.tasks.list, {
      params: query,
      isTokenRequired: true,
      cancelPrevious: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const searchAssignees = (query, { limit = 20 } = {}) => {
    const searchTerm = (query || "").trim();
    if (!searchTerm) {
      assigneeMatches.value = [];
      return Promise.resolve([]);
    }

    if (dummyStore && dummyStore.dummyUsers) {
      const lower = searchTerm.toLowerCase();
      const matches = dummyStore.dummyUsers
        .filter(
          (u) =>
            u.name?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower),
        )
        .slice(0, limit);
      assigneeMatches.value = matches;
      return Promise.resolve(matches);
    }

    inFlight.assignees = true;
    assigneesLoading.value = true;

    return apiRequest(urls.KEYS.GET, urls.users.search, {
      isTokenRequired: true,
      params: { q: searchTerm, limit },
      onSuccess: (res) => {
        assigneeMatches.value = Array.isArray(res)
          ? res
          : Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
      },
      onFailure: () => {
        assigneeMatches.value = [];
      },
      onFinally: () => {
        inFlight.assignees = false;
        assigneesLoading.value = false;
      },
    });
  };

  const createTask = (payload) => {
    if (dummyStore) {
      actionLoading.value = true;
      const created =
        typeof dummyStore.createTask === "function"
          ? dummyStore.createTask(payload)
          : payload;
      snackbar.show("Task created", "success");
      if (created) activeTask.value = created;
      actionLoading.value = false;
      fetchTasks({}, true);
      fetchSummary(true);
      return Promise.resolve(created);
    }

    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.tasks.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Task created", "success");
        if (res) activeTask.value = res;
        fetchTasks({}, true);
        fetchSummary(true);
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to create task", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const updateTask = (taskId, payload) => {
    if (dummyStore) {
      actionLoading.value = true;
      const updated =
        typeof dummyStore.updateTask === "function"
          ? dummyStore.updateTask(taskId, payload)
          : payload;
      snackbar.show("Task updated", "success");
      if (updated) {
        activeTask.value = updated;
        tasks.value = tasks.value.map((task) =>
          task.id === taskId ? updated : task,
        );
      }
      actionLoading.value = false;
      fetchSummary(true);
      return Promise.resolve(updated);
    }

    actionLoading.value = true;
    return apiRequest(urls.KEYS.PATCH, urls.tasks.update(taskId), {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show("Task updated", "success");
        if (res) {
          activeTask.value = res;
          tasks.value = tasks.value.map((task) => (task.id === taskId ? res : task));
        }
        fetchSummary(true);
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to update task", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const deleteTask = (taskId) => {
    if (dummyStore) {
      actionLoading.value = true;
      if (typeof dummyStore.deleteTask === "function") {
        dummyStore.deleteTask(taskId);
      }
      snackbar.show("Task deleted", "success");
      tasks.value = tasks.value.filter((task) => task.id !== taskId);
      actionLoading.value = false;
      fetchSummary(true);
      return Promise.resolve(true);
    }

    actionLoading.value = true;
    return apiRequest(urls.KEYS.DELETE, urls.tasks.delete(taskId), {
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("Task deleted", "success");
        tasks.value = tasks.value.filter((task) => task.id !== taskId);
        fetchSummary(true);
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to delete task", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  return {
    tasks,
    summary,
    pagination,
    activeTask,
    listParams,
    hasMore,
    assigneeMatches,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    detailLoading,
    assigneesLoading,
    error,
    resetFetchedFlags,
    fetchSummary,
    fetchTasks,
    searchAssignees,
    createTask,
    updateTask,
    deleteTask,
  };
});
