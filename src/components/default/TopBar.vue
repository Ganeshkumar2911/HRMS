<template>
  <header class="w-full bg-card-background/90 backdrop-blur-md sticky top-0 z-30 transition-colors duration-200 shadow-sm">
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
          <div class="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
            <span class="material-symbols-rounded text-base">corporate_fare</span>
          </div>
          <span class="font-bold text-sm text-primary-text tracking-tight">Kora HR</span>
        </router-link>

        <!-- Stitch Global Search Bar (Desktop / Tablet) -->
        <div class="hidden sm:flex items-center gap-2 bg-surface-subtle px-3 py-1.5 rounded-lg w-64 md:w-80 border border-primary-border/60 focus-within:border-primary transition-colors">
          <span class="material-symbols-rounded text-secondary-text text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search employees, records, workflows..."
            class="bg-transparent text-xs text-primary-text placeholder:text-secondary-text/60 outline-none w-full"
          />
        </div>
      </div>

      <!-- ── Right: Realtime Status, Bell, Theme, Profile ───── -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- WebSocket Health Pill -->
        <button
          type="button"
          @click="handleWsClick"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer"
          :class="wsStatusClasses"
          :title="wsTooltip"
        >
          <span class="w-2 h-2 rounded-full relative flex items-center justify-center">
            <span
              v-if="wsStore.isConnected"
              class="w-2 h-2 rounded-full bg-primary-green inline-block"
            ></span>
            <span
              v-else-if="wsStore.isReconnecting"
              class="w-2 h-2 rounded-full bg-primary-yellow inline-block animate-ping"
            ></span>
            <span
              v-else
              class="w-2 h-2 rounded-full bg-primary-red inline-block"
            ></span>
          </span>
          <span class="hidden sm:inline">{{ wsStatusLabel }}</span>
        </button>

        <!-- Notifications Bell -->
        <div
          v-if="permissionsStore.canAccessArea('notifications')"
          class="relative"
          ref="notificationsDropdownRef"
        >
          <button
            @click="toggleNotificationsDropdown"
            type="button"
            class="btn-icon relative p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
            title="Notifications"
          >
            <span class="material-symbols-rounded text-[20px]">notifications</span>
            <!-- Red Unread Badge -->
            <span
              v-if="notificationsStore.unreadCount > 0"
              class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary-red text-white text-[10px] font-bold flex items-center justify-center shadow-xs"
            >
              {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
            </span>
          </button>

          <!-- Notifications Popover -->
          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 mt-1.5 w-80 bg-card-background border border-primary-border/80 rounded-xl p-3 z-50 shadow-lg flex flex-col gap-2 animate-in fade-in duration-100"
          >
            <div class="flex items-center justify-between pb-2 border-b border-primary-border/60">
              <span class="text-xs font-semibold text-primary-text">Notifications</span>
              <button
                v-if="notificationsStore.unreadCount > 0"
                @click="notificationsStore.markAllAsRead"
                type="button"
                class="text-[11px] text-primary hover:underline font-medium cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <!-- List of preview notifications -->
            <div class="max-h-64 overflow-y-auto no-scrollbar space-y-1.5">
              <div
                v-if="notificationsStore.notifications.length === 0"
                class="py-6 text-center text-xs text-secondary-text"
              >
                No notifications right now
              </div>

              <div
                v-for="item in notificationsStore.notifications.slice(0, 5)"
                :key="item.id"
                @click="handleNotificationClick(item)"
                class="p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-start gap-2"
                :class="item.is_read ? 'hover:bg-background text-secondary-text' : 'bg-primary/5 text-primary-text font-medium'"
              >
                <span class="material-symbols-rounded text-sm mt-0.5 text-primary">circle_notifications</span>
                <div class="flex-1">
                  <p class="text-xs leading-tight font-medium">{{ item.title }}</p>
                  <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-2">{{ item.body || item.message }}</p>
                </div>
              </div>
            </div>

            <router-link
              to="/notifications"
              @click="isNotificationsOpen = false"
              class="pt-2 text-center text-xs text-primary hover:underline font-medium border-t border-primary-border/60 block"
            >
              View all notifications &rarr;
            </router-link>
          </div>
        </div>

        <!-- Theme Toggle -->
        <button
          @click="handleToggleTheme"
          type="button"
          class="btn-icon p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
          :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span class="material-symbols-rounded text-[19px]">
            {{ currentTheme === 'dark' ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Vertical Divider -->
        <div class="h-4 w-px bg-primary-border/80 hidden sm:block"></div>

        <!-- User Profile Dropdown -->
        <div class="relative" ref="profileDropdownRef">
          <button
            @click="toggleProfileDropdown"
            type="button"
            class="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer text-left"
          >
            <!-- User Avatar with Initials -->
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center border border-primary-border/60">
              {{ userInitials }}
            </div>

            <!-- Name & Status -->
            <div class="hidden sm:flex flex-col">
              <span class="text-xs font-semibold text-primary-text leading-tight">
                {{ authStore.currentUser?.name || 'Authorized User' }}
              </span>
              <span class="text-[10px] text-secondary-text leading-tight flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
                <span>{{ permissionSummary }}</span>
              </span>
            </div>

            <span
              class="material-symbols-rounded text-base text-secondary-text transition-transform duration-150"
              :class="{'rotate-180': isProfileOpen}"
            >
              expand_more
            </span>
          </button>

          <!-- Profile Dropdown Menu -->
          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-1.5 w-60 bg-card-background border border-primary-border/80 rounded-xl p-1.5 z-50 flex flex-col gap-0.5 shadow-lg animate-in fade-in duration-100"
          >
            <!-- User Info Card -->
            <div class="px-3 py-2 border-b border-primary-border/60">
              <p class="text-xs font-semibold text-primary-text">
                {{ authStore.currentUser?.name || 'User' }}
              </p>
              <p class="text-[11px] text-secondary-text truncate">
                {{ authStore.currentUser?.email || 'No email' }}
              </p>
              <!-- Employee Profile Notice -->
              <div v-if="authStore.currentEmployee" class="mt-1.5 pt-1.5 border-t border-primary-border/40 text-[10px] text-secondary-text flex items-center gap-1">
                <span class="material-symbols-rounded text-xs text-primary">badge</span>
                <span>{{ authStore.currentEmployee.employee_code || 'Employee' }} (#{{ authStore.currentEmployee.id }})</span>
              </div>
            </div>

            <router-link
              to="/profile"
              @click="isProfileOpen = false"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
            >
              <span class="material-symbols-rounded text-base text-primary">person</span>
              <span>My profile</span>
            </router-link>

            <button
              @click="openPermissionsModal"
              type="button"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors text-left cursor-pointer"
            >
              <span class="material-symbols-rounded text-base text-primary">shield</span>
              <span>Permissions &amp; Scopes</span>
            </button>

            <div class="my-1 border-t border-primary-border/60"></div>

            <!-- Sign Out -->
            <button
              @click="handleLogout"
              type="button"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-primary-red hover:bg-primary-red/10 transition-colors text-left cursor-pointer"
            >
              <span class="material-symbols-rounded text-base">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Permissions & Scopes Inspector Modal -->
    <PermissionsModal v-model="isPermissionsModalOpen" />
  </header>
</template>

<script setup>
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
