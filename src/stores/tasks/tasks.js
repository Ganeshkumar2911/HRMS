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
    if (inFlight.tasks && !force) return Promise.resolve(tasks.value);
    if (isFetched.value.tasks && !force) return Promise.resolve(tasks.value);

    inFlight.tasks = true;
    loading.value = true;
    error.value = null;

    listParams.value = { ...listParams.value, ...params };
    const query = compactQuery(listParams.value);

    const successHandler = (res) => {
      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      tasks.value = rows;
      if (res?.pagination) {
        pagination.value = {
          limit: res.pagination.limit ?? 50,
          offset: res.pagination.offset ?? 0,
          total: res.pagination.total ?? rows.length,
          has_more: !!res.pagination.has_more,
        };
        hasMore.value = !!res.pagination.has_more;
      } else {
        hasMore.value = rows.length >= (query.limit || 50);
        pagination.value = {
          limit: query.limit || 50,
          offset: query.offset || 0,
          total: rows.length,
          has_more: hasMore.value,
        };
      }
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
