<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">notifications</span>
          <span>Activity</span>
        </div>
        <h1 class="title-text text-primary-text">Notifications Center</h1>
        <p class="sub-text text-secondary-text">
          In-app alerts, system announcements, and event notifications.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          v-if="notificationsStore.unreadCount > 0"
          @click="notificationsStore.markAllAsRead"
          type="button"
          class="btn-secondary text-xs px-3 py-1.5"
        >
          <span class="material-symbols-rounded text-base">done_all</span>
          <span>Mark all as read</span>
        </button>

        <button
          @click="refreshNotifications"
          type="button"
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="notificationsStore.loading"
        >
          <span class="material-symbols-rounded text-base" :class="{'animate-spin': notificationsStore.loading}">refresh</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Notification Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <span class="text-xs text-secondary-text font-medium">Unread Alerts</span>
        <p class="text-2xl font-bold text-primary-text">{{ notificationsStore.unreadCount }}</p>
        <p class="text-[11px] text-secondary-text">Incremented via REST &amp; WebSocket (notification.created)</p>
      </div>

      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <span class="text-xs text-secondary-text font-medium">Realtime Listener</span>
        <p class="text-2xl font-bold text-primary-green">Active</p>
        <p class="text-[11px] text-secondary-text">Connected to shared WebSocket</p>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="bg-card-background border border-primary-border/70 rounded-xl overflow-hidden shadow-xs">
      <div class="p-4 border-b border-primary-border/60 flex items-center justify-between">
        <h2 class="text-xs font-semibold text-primary-text uppercase tracking-wider">All Notifications</h2>
        <span class="text-xs text-secondary-text">{{ notificationsStore.notifications.length }} items</span>
      </div>

      <div v-if="notificationsStore.notifications.length === 0" class="p-12 text-center text-secondary-text">
        <span class="material-symbols-rounded text-4xl mb-2 text-secondary-text/50">notifications_off</span>
        <p class="text-sm font-medium text-primary-text">No notifications found</p>
        <p class="text-xs text-secondary-text mt-1">You're all caught up! New events will arrive via the shared WebSocket.</p>
      </div>

      <div v-else class="divide-y divide-primary-border/50">
        <div
          v-for="item in notificationsStore.notifications"
          :key="item.id"
          class="p-4 flex items-start justify-between gap-4 hover:bg-background transition-colors"
          :class="{'bg-primary/5': !item.is_read}"
        >
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" :class="item.is_read ? 'bg-secondary-text/10 text-secondary-text' : 'bg-primary/10 text-primary'">
              <span class="material-symbols-rounded text-lg">circle_notifications</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-xs font-semibold text-primary-text">{{ item.title }}</p>
                <span v-if="!item.is_read" class="w-2 h-2 rounded-full bg-primary-red"></span>
              </div>
              <p class="text-xs text-secondary-text mt-0.5">{{ item.message || item.body }}</p>
              <span class="text-[10px] text-secondary-text/80 mt-1 block">
                {{ item.created_at ? new Date(item.created_at).toLocaleString() : 'Just now' }}
              </span>
            </div>
          </div>

          <button
            v-if="!item.is_read"
            @click="notificationsStore.markAsRead(item.id)"
            type="button"
            class="text-xs text-primary hover:underline font-medium shrink-0 cursor-pointer"
          >
            Mark read
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useNotificationsStore } from "@/stores/notifications/notifications";

const notificationsStore = useNotificationsStore();

const refreshNotifications = () => {
  notificationsStore.fetchNotifications({}, true);
  notificationsStore.fetchUnreadCount(true);
};

onMounted(() => {
  notificationsStore.fetchNotifications();
  notificationsStore.fetchUnreadCount();
});
</script>
