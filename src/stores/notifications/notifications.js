import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useWsStore } from "@/stores/ws/ws";

export const useNotificationsStore = defineStore("notifications", () => {
  const snackbar = useSnackbarStore();
  const wsStore = useWsStore();

  const notifications = ref([]);
  const unreadCount = ref(0);
  const listOffset = ref(0);
  const listLimit = ref(20);
  const hasMore = ref(false);

  const inFlight = {
    notifications: false,
    unreadCount: false,
  };

  const isFetched = ref({
    notifications: false,
    unreadCount: false,
  });

  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);
  let wsUnsubscribe = null;

  const resetFetchedFlags = () => {
    isFetched.value = {
      notifications: false,
      unreadCount: false,
    };
  };

  const fetchUnreadCount = (force = false) => {
    if (inFlight.unreadCount) return Promise.resolve(unreadCount.value);
    if (isFetched.value.unreadCount && !force) return Promise.resolve(unreadCount.value);

    inFlight.unreadCount = true;

    const successHandler = (res) => {
      unreadCount.value = res?.unread_count ?? 0;
      isFetched.value.unreadCount = true;
    };

    const failureHandler = (err) => {
      if (err?.status !== 404 && err?.status !== 403) {
        console.warn("Failed to fetch unread notifications count:", err?.message);
      }
    };

    const finallyHandler = () => {
      inFlight.unreadCount = false;
    };

    return apiRequest(urls.KEYS.GET, urls.notifications.unreadCount, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const fetchNotifications = (params = {}, force = false) => {
    if (inFlight.notifications) return Promise.resolve(notifications.value);
    if (isFetched.value.notifications && !force) return Promise.resolve(notifications.value);

    inFlight.notifications = true;
    loading.value = true;
    error.value = null;

    const query = {
      limit: params.limit ?? listLimit.value,
      offset: params.offset ?? 0,
      ...(params.unread_only != null ? { unread_only: params.unread_only } : {}),
    };

    const successHandler = (res) => {
      const rows = Array.isArray(res) ? res : [];
      notifications.value = rows;
      listOffset.value = query.offset;
      hasMore.value = rows.length >= query.limit;
      isFetched.value.notifications = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load notifications";
      snackbar.show(error.value, "error");
    };

    const finallyHandler = () => {
      inFlight.notifications = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.notifications.list, {
      params: query,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const markAsRead = (notificationId) => {
    const item = notifications.value.find((n) => n.id === notificationId);
    if (item && !item.is_read) {
      item.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }

    return apiRequest(urls.KEYS.POST, urls.notifications.markRead(notificationId), {
      isTokenRequired: true,
      onSuccess: (res) => {
        if (res && item) Object.assign(item, res);
      },
    }).catch(() => {
      if (item) {
        item.is_read = false;
        unreadCount.value += 1;
      }
    });
  };

  const markAllAsRead = () => {
    actionLoading.value = true;
    const previousUnread = unreadCount.value;
    unreadCount.value = 0;
    notifications.value.forEach((n) => {
      n.is_read = true;
    });

    return apiRequest(urls.KEYS.POST, urls.notifications.markAllRead, {
      isTokenRequired: true,
      onSuccess: (res) => {
        unreadCount.value = res?.unread_count ?? 0;
      },
      onFailure: () => {
        unreadCount.value = previousUnread;
        snackbar.show("Failed to mark all as read", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const broadcast = (payload) => {
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.notifications.broadcast, {
      data: payload,
      isTokenRequired: true,
      onSuccess: (res) => {
        snackbar.show(
          res?.created_count != null
            ? `Broadcast sent to ${res.created_count} recipient(s)`
            : "Broadcast sent",
          "success"
        );
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Broadcast failed", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  const setupRealtimeListener = () => {
    if (wsUnsubscribe) return;

    wsUnsubscribe = wsStore.subscribe("notification.created", (payload) => {
      const item = payload?.notification || payload?.data || payload;
      if (!item || typeof item !== "object" || item.event === "notification.created") return;

      unreadCount.value += 1;
      const exists = notifications.value.some((row) => row.id && row.id === item.id);
      if (!exists) {
        notifications.value.unshift({
          ...item,
          is_read: item.is_read ?? false,
        });
      }
      snackbar.show(item.title || "New notification received", "info");
    });
  };

  const cleanupRealtimeListener = () => {
    if (wsUnsubscribe) {
      wsUnsubscribe();
      wsUnsubscribe = null;
    }
  };

  return {
    notifications,
    unreadCount,
    listOffset,
    listLimit,
    hasMore,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    error,
    resetFetchedFlags,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    broadcast,
    setupRealtimeListener,
    cleanupRealtimeListener,
  };
});
