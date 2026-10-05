import { defineStore } from "pinia";
import { ref } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useWsStore } from "@/stores/ws/ws";

export const useNotificationsStore = defineStore("notifications", () => {
  const snackbar = useSnackbarStore();
  const wsStore = useWsStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const notifications = ref([]);
  const unreadCount = ref(0);
  const pagination = ref({
    page: 1,
    per_page: 20,
    total: 0,
  });

  // ─── 2. In-Flight Tracking ─────────────────────────────
  const inFlight = {
    notifications: false,
    unreadCount: false,
  };

  // ─── 3. isFetched Tracking ─────────────────────────────
  const isFetched = ref({
    notifications: false,
    unreadCount: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const error = ref(null);

  let wsUnsubscribe = null;

  // ─── 5. Reset Helper ───────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      notifications: false,
      unreadCount: false,
    };
  };

  // ─── Fetch Unread Count ────────────────────────────────
  const fetchUnreadCount = (force = false) => {
    if (inFlight.unreadCount) return Promise.resolve(unreadCount.value);
    if (isFetched.value.unreadCount && !force) return Promise.resolve(unreadCount.value);

    inFlight.unreadCount = true;

    const successHandler = (res) => {
      // Direct assignment — NO useless mapping
      unreadCount.value =
        typeof res === "number"
          ? res
          : res?.count ?? res?.unread_count ?? 0;
      isFetched.value.unreadCount = true;
    };

    const failureHandler = (err) => {
      // Non-critical, ignore 404/403
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

  // ─── Fetch Notifications List ──────────────────────────
  const fetchNotifications = (params = {}, force = false) => {
    if (inFlight.notifications) return Promise.resolve(notifications.value);
    if (isFetched.value.notifications && !force) return Promise.resolve(notifications.value);

    inFlight.notifications = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      notifications.value = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];

      if (res?.pagination) {
        pagination.value = res.pagination;
      }
      isFetched.value.notifications = true;
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load notifications";
    };

    const finallyHandler = () => {
      inFlight.notifications = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.notifications.list, {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Mark Notification as Read ─────────────────────────
  const markAsRead = (notificationId) => {
    const item = notifications.value.find((n) => n.id === notificationId);
    if (item && !item.is_read) {
      item.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }

    return apiRequest(urls.KEYS.POST, urls.notifications.markRead(notificationId), {
      isTokenRequired: true,
    }).catch(() => {
      // In case server fails, revert local state
      if (item) {
        item.is_read = false;
        unreadCount.value += 1;
      }
    });
  };

  // ─── Mark All as Read ──────────────────────────────────
  const markAllAsRead = () => {
    const previousUnread = unreadCount.value;
    unreadCount.value = 0;
    notifications.value.forEach((n) => (n.is_read = true));

    return apiRequest(urls.KEYS.POST, urls.notifications.markAllRead, {
      isTokenRequired: true,
    }).catch(() => {
      unreadCount.value = previousUnread;
      snackbar.show("Failed to mark all as read", "error");
    });
  };

  // ─── Realtime WS Setup ─────────────────────────────────
  const setupRealtimeListener = () => {
    if (wsUnsubscribe) return;

    wsUnsubscribe = wsStore.subscribe("notification.created", (payload) => {
      unreadCount.value += 1;
      if (payload) {
        notifications.value.unshift({
          id: payload.id || Date.now(),
          title: payload.title || "New Notification",
          message: payload.message || payload.body || "",
          created_at: payload.created_at || new Date().toISOString(),
          is_read: false,
          ...payload,
        });
        snackbar.show(payload.title || "New notification received", "info");
      }
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
    pagination,
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
    setupRealtimeListener,
    cleanupRealtimeListener,
  };
});
