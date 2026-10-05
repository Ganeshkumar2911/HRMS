import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";

export const useAuditStore = defineStore("audit", () => {
  const snackbar = useSnackbarStore();
  const items = ref([]);
  const pagination = ref({ limit: 50, offset: 0, has_more: false, total: null });
  const activeLog = ref(null);
  const filters = ref({
    module: "",
    action: "",
    from: "",
    to: "",
    limit: 50,
    offset: 0,
  });

  const inFlight = { list: false, detail: false };
  const isFetched = ref({ list: false });
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  const fetchLogs = (params = {}, force = false) => {
    if (inFlight.list) return Promise.resolve(items.value);
    if (isFetched.value.list && !force) return Promise.resolve(items.value);

    inFlight.list = true;
    loading.value = true;
    const query = { ...filters.value, ...params };
    Object.keys(query).forEach((key) => {
      if (query[key] === "" || query[key] == null) delete query[key];
    });
    filters.value = { ...filters.value, ...params };

    return apiRequest(urls.KEYS.GET, urls.audit.list, {
      params: query,
      isTokenRequired: true,
      onSuccess: (res) => {
        items.value = Array.isArray(res?.items) ? res.items : [];
        if (res?.pagination) pagination.value = res.pagination;
        isFetched.value.list = true;
      },
      onFailure: (err) => {
        error.value = err?.message || "Failed to load audit logs";
        snackbar.show(error.value, "error");
      },
      onFinally: () => {
        inFlight.list = false;
        loading.value = false;
      },
    });
  };

  const fetchDetail = (auditId) => {
    inFlight.detail = true;
    detailLoading.value = true;
    return apiRequest(urls.KEYS.GET, urls.audit.detail(auditId), {
      isTokenRequired: true,
      onSuccess: (res) => {
        activeLog.value = res;
      },
      onFailure: (err) => snackbar.show(err?.message || "Failed to load detail", "error"),
      onFinally: () => {
        inFlight.detail = false;
        detailLoading.value = false;
      },
    });
  };

  return {
    items,
    pagination,
    activeLog,
    filters,
    inFlight,
    isFetched,
    loading,
    detailLoading,
    error,
    fetchLogs,
    fetchDetail,
  };
});
