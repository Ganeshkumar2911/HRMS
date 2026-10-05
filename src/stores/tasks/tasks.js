import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

const emptyListParams = () => ({
  limit: 50,
  offset: 0,
  status: "",
  priority: "",
  q: "",
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
  const { status, priority, q } = listParams;
  return compactQuery({ status, priority, q });
};

export const useTasksStore = defineStore("tasks", () => {
  const snackbar = useSnackbarStore();

  const tasks = ref([]);
  const summary = ref(null);
  const activeTask = ref(null);
  const listParams = ref(emptyListParams());
  const hasMore = ref(false);
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
  const error = ref(null);

  const resetFetchedFlags = () => {
    isFetched.value = { tasks: false, summary: false };
  };

  const fetchSummary = (force = false) => {
    if (inFlight.summary) return Promise.resolve(summary.value);
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
    if (inFlight.tasks) return Promise.resolve(tasks.value);
    if (isFetched.value.tasks && !force) return Promise.resolve(tasks.value);

    inFlight.tasks = true;
    loading.value = true;
    error.value = null;

    listParams.value = { ...listParams.value, ...params };
    const query = compactQuery(listParams.value);

    const successHandler = (res) => {
      const rows = Array.isArray(res) ? res : [];
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

    inFlight.assignees = true;

    return apiRequest(urls.KEYS.GET, urls.users.search, {
      isTokenRequired: true,
      params: { q: searchTerm, limit },
      onSuccess: (res) => {
        assigneeMatches.value = Array.isArray(res) ? res : [];
      },
      onFailure: () => {
        assigneeMatches.value = [];
      },
      onFinally: () => {
        inFlight.assignees = false;
      },
    });
  };

  const createTask = (payload) => {
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
    activeTask,
    listParams,
    hasMore,
    assigneeMatches,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    detailLoading,
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
