<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">notifications</span>
          <span>Inbox</span>
        </div>
        <h1 class="title-text text-primary-text">Notifications</h1>
        <p class="sub-text text-secondary-text">In-app inbox. Unread badge updates over the shared WebSocket.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="store.unreadCount > 0"
          type="button"
          class="btn-secondary text-xs px-3 py-1.5"
          :disabled="store.actionLoading"
          @click="store.markAllAsRead()"
        >
          Mark all read
        </button>
        <router-link
          v-if="permissions.can('notification.broadcast')"
          to="/admin/notifications/broadcast"
          class="btn-primary text-xs px-3 py-1.5"
        >
          Broadcast
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard title="Unread" :value="store.unreadCount" icon="mark_email_unread" />
      <MetricCard title="Loaded" :value="store.notifications.length" icon="inbox" />
      <MetricCard title="Has more" :value="store.hasMore ? 'Yes' : 'No'" icon="more_horiz" />
    </div>

    <div class="rounded-xl border border-primary-border bg-card-background divide-y divide-primary-border/60">
      <div v-if="store.loading" class="p-8 text-center text-sm text-secondary-text">Loading…</div>
      <div v-else-if="store.notifications.length === 0" class="p-8 text-center text-sm text-secondary-text">
        No notifications.
      </div>
      <button
        v-for="item in store.notifications"
        :key="item.id"
        type="button"
        class="w-full text-left p-4 flex gap-3 hover:bg-background transition-colors"
        :class="item.is_read ? 'opacity-80' : 'bg-primary/5'"
        @click="openNotification(item)"
      >
        <span class="material-symbols-rounded text-primary mt-0.5">
          {{ item.type === 'MESSAGE' ? 'chat' : 'campaign' }}
        </span>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-semibold text-primary-text">{{ item.title }}</p>
            <StatusBadge :status="item.is_read ? 'READ' : 'PENDING'" :label="item.is_read ? 'Read' : 'Unread'" />
          </div>
          <p class="mid-text text-secondary-text mt-1">{{ item.body }}</p>
          <p class="text-[11px] text-secondary-text mt-1">{{ formatDate(item.created_at) }}</p>
        </div>
      </button>
    </div>

    <div v-if="store.hasMore" class="flex justify-center">
      <button type="button" class="btn-secondary text-xs px-4 py-2" @click="loadMore">Load more</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import MetricCard from "@/components/common/MetricCard.vue";
import StatusBadge from "@/components/common/StatusBadge.vue";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const store = useNotificationsStore();
const permissions = usePermissionsStore();
const router = useRouter();

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

const openNotification = async (item) => {
  await store.markAsRead(item.id);
  const conversationId = item?.data?.conversation_id;
  if (item.type === "MESSAGE" && conversationId) {
    router.push(`/chat/${conversationId}`);
  }
};

const loadMore = () => {
  const nextOffset = store.listOffset + store.listLimit;
  store.fetchNotifications({ offset: nextOffset, limit: store.listLimit }, true);
};

onMounted(() => {
  store.fetchNotifications({}, true);
  store.fetchUnreadCount(true);
  store.setupRealtimeListener();
});
</script>
