<template>
  <header class="w-full bg-card-background/90 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200">
    <div class="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
      
      <!-- ── Left: Mobile Toggle & Global Search Bar ─────────── -->
      <div class="flex items-center gap-3">
        <!-- Mobile Sidebar Toggle Button -->
        <button
          @click="$emit('toggle-sidebar')"
          type="button"
          class="lg:hidden p-2 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span class="material-symbols-rounded text-xl block">menu</span>
        </button>

        <!-- Mobile Brand (Visible only when sidebar is hidden on small screens) -->
        <router-link to="/tasks" class="flex lg:hidden items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-primary text-btn-text-primary flex items-center justify-center shrink-0 shadow-xs">
            <span class="material-symbols-rounded text-base">corporate_fare</span>
          </div>
          <span class="font-bold text-sm text-primary-text tracking-tight">Kora HR</span>
        </router-link>

        <!-- Stitch Global Search Bar (Desktop / Tablet) -->
        <div class="hidden sm:flex items-center gap-2 bg-surface-subtle px-3 py-1.5 rounded-lg w-64 md:w-80 border border-primary-border/60 focus-within:border-primary transition-colors">
          <span class="material-symbols-rounded text-secondary-text text-[18px]">search</span>
          <input
            :value="globalSearch.query"
            type="text"
            :placeholder="globalSearch.placeholder"
            @input="globalSearch.triggerSearch($event.target.value)"
            @keydown.enter="globalSearch.triggerSearch($event.target.value, true)"
            @keydown.esc="globalSearch.clear()"
            class="bg-transparent text-xs text-primary-text placeholder:text-secondary-text/60 outline-none w-full"
          />
          <button
            v-if="globalSearch.query"
            type="button"
            @click="globalSearch.clear()"
            class="text-secondary-text hover:text-primary-text p-0.5 rounded cursor-pointer shrink-0"
            title="Clear search"
            aria-label="Clear search"
          >
            <span class="material-symbols-rounded text-sm block">close</span>
          </button>
        </div>
      </div>
    </div>
    <PermissionsModal v-model="isPermissionsModalOpen" />
  </header>
</template>

<script setup>
import { useGlobalSearchStore } from "@/stores/ui/globalSearch";

const globalSearch = useGlobalSearchStore();
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { initTheme, toggleTheme, getTheme } from "@/utils/theme";
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import PermissionsModal from "./PermissionsModal.vue";

const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const wsStore = useWsStore();
const permissionsStore = usePermissionsStore();
const notificationsStore = useNotificationsStore();

const isProfileOpen = ref(false);
const isAdminOpen = ref(false);
const isNotificationsOpen = ref(false);
const isMobileMenuOpen = ref(false);
const isPermissionsModalOpen = ref(false);
const currentTheme = ref("light");

const profileDropdownRef = ref(null);
const adminDropdownRef = ref(null);
const notificationsDropdownRef = ref(null);
const mobileMenuRef = ref(null);
const mobileMenuButtonRef = ref(null);

const userInitials = computed(() => {
  const name = authStore.currentUser?.name;
  if (!name) return "AU";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const hasAdminAccess = computed(() => permissionsStore.hasAdminAccess());

const permissionSummary = computed(() => {
  const count = permissionsStore.permissions.length;
  if (!count) return "No grants";
  return `${count} permission${count === 1 ? "" : "s"}`;
});

const isAdminActive = computed(() => {
  return route.path.startsWith("/admin");
});

const isActive = (path) => {
  return route.path.startsWith(path);
};

// WebSocket status UI
const wsStatusLabel = computed(() => {
  if (wsStore.isConnected) return "WS Live";
  if (wsStore.isReconnecting) return "Reconnecting...";
  return "WS Offline";
});

const wsStatusClasses = computed(() => {
  if (wsStore.isConnected) {
    return "bg-primary-green/10 text-primary-green border-primary-green/20";
  }
  if (wsStore.isReconnecting) {
    return "bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20";
  }
  return "bg-secondary-text/10 text-secondary-text border-primary-border/60 hover:text-primary-text";
});

const wsTooltip = computed(() => {
  if (wsStore.isConnected) {
    return `Connected to WS /ws. Last heartbeat: ${wsStore.lastHeartbeat ? wsStore.lastHeartbeat.toLocaleTimeString() : 'Active'}`;
  }
  if (wsStore.isReconnecting) {
    return `Reconnecting to WS /ws (Attempt ${wsStore.reconnectAttempts})`;
  }
  return "Disconnected. Click to connect.";
});

const handleWsClick = () => {
  if (!wsStore.isConnected) {
    wsStore.connect();
  }
};

const openPermissionsModal = () => {
  isProfileOpen.value = false;
  isPermissionsModalOpen.value = true;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (isMobileMenuOpen.value) {
    isProfileOpen.value = false;
    isAdminOpen.value = false;
    isNotificationsOpen.value = false;
  }
};

const toggleProfileDropdown = () => {
  isProfileOpen.value = !isProfileOpen.value;
  if (isProfileOpen.value) {
    isMobileMenuOpen.value = false;
    isAdminOpen.value = false;
    isNotificationsOpen.value = false;
  }
};

const handleClickOutside = (event) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target)) {
    isProfileOpen.value = false;
  }
  if (adminDropdownRef.value && !adminDropdownRef.value.contains(event.target)) {
    isAdminOpen.value = false;
  }
  if (notificationsDropdownRef.value && !notificationsDropdownRef.value.contains(event.target)) {
    isNotificationsOpen.value = false;
  }
  if (
    isMobileMenuOpen.value &&
    mobileMenuRef.value &&
    !mobileMenuRef.value.contains(event.target) &&
    mobileMenuButtonRef.value &&
    !mobileMenuButtonRef.value.contains(event.target)
  ) {
    isMobileMenuOpen.value = false;
  }
};

const handleResize = () => {
  if (window.innerWidth >= 768 && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false;
  }
};

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
    isProfileOpen.value = false;
    isAdminOpen.value = false;
    isNotificationsOpen.value = false;
  }
);

onMounted(() => {
  currentTheme.value = initTheme() || getTheme() || "light";
  document.addEventListener("click", handleClickOutside);
  window.addEventListener("resize", handleResize);
  notificationsStore.setupRealtimeListener();
  notificationsStore.fetchUnreadCount().catch(() => {});
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("resize", handleResize);
  notificationsStore.cleanupRealtimeListener();
});

const handleToggleTheme = () => {
  currentTheme.value = toggleTheme();
};

const handleLogout = () => {
  isProfileOpen.value = false;
  authStore.logout();
};

const handleNotificationClick = (item) => {
  notificationsStore.markAsRead(item.id);
  isNotificationsOpen.value = false;
  const conversationId = item?.data?.conversation_id;
  if (item?.type === "MESSAGE" && conversationId) {
    router.push(`/chat/${conversationId}`).catch(() => {});
    return;
  }
  router.push("/notifications").catch(() => {});
};

const toggleNotificationsDropdown = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (!isNotificationsOpen.value) return;
  isMobileMenuOpen.value = false;
  isProfileOpen.value = false;
  isAdminOpen.value = false;
  notificationsStore.fetchUnreadCount(true).catch(() => {});
  notificationsStore.fetchNotifications({ limit: 5, offset: 0 }, true).catch(() => {});
};
</script>

<style scoped>
.mobile-menu-grid {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  visibility: hidden;
  transition:
    grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.24s ease,
    visibility 0.3s;
  pointer-events: none;
}

.mobile-menu-grid.is-open {
  grid-template-rows: 1fr;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.mobile-menu-inner {
  overflow: hidden;
}

.mobile-menu-content {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateY(-8px);
}

.mobile-menu-grid.is-open .mobile-menu-content {
  transform: translateY(0);
}

.mobile-backdrop-enter-active,
.mobile-backdrop-leave-active {
  transition: opacity 0.22s ease;
}

.mobile-backdrop-enter-from,
.mobile-backdrop-leave-to {
  opacity: 0;
}
</style>
