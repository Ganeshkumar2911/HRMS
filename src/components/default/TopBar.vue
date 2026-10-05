<template>
  <header class="w-full bg-card-background border-b border-primary-border/60 sticky top-0 z-40 transition-colors duration-200">
    <div class="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
      
      <!-- ── Left: Brand & Navigation ────────────────────────── -->
      <div class="flex items-center gap-6">
        <!-- Brand Logo -->
        <router-link to="/chat" class="flex items-center gap-2.5 shrink-0 group">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
            <span class="material-symbols-rounded text-lg">workspaces</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm tracking-tight text-primary-text">HRMS Shell</span>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">v1.0</span>
          </div>
        </router-link>

        <!-- Divider -->
        <div class="h-4 w-px bg-primary-border/80 hidden lg:block"></div>

        <!-- Desktop Navigation Items (Gated by permission store) -->
        <nav class="hidden lg:flex items-center gap-1">
          <!-- Chat -->
          <router-link
            to="/chat"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            :class="isActive('/chat')
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
          >
            <span class="material-symbols-rounded text-[17px]">chat</span>
            <span>Chat</span>
          </router-link>

          <!-- Tasks -->
          <router-link
            to="/tasks"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            :class="isActive('/tasks')
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
          >
            <span class="material-symbols-rounded text-[17px]">task_alt</span>
            <span>Tasks</span>
          </router-link>

          <!-- HRMS (Gated by employee.view) -->
          <router-link
            v-if="permissionsStore.canAccessArea('hrms')"
            to="/hrms"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            :class="isActive('/hrms')
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
          >
            <span class="material-symbols-rounded text-[17px]">badge</span>
            <span>HRMS</span>
          </router-link>

          <!-- Admin Dropdown (Users, Roles, Audit) -->
          <div
            v-if="hasAdminAccess"
            class="relative"
            ref="adminDropdownRef"
          >
            <button
              @click="isAdminOpen = !isAdminOpen"
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              :class="isAdminActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
            >
              <span class="material-symbols-rounded text-[17px]">admin_panel_settings</span>
              <span>Admin</span>
              <span class="material-symbols-rounded text-sm transition-transform" :class="{'rotate-180': isAdminOpen}">expand_more</span>
            </button>

            <!-- Admin Submenu -->
            <div
              v-if="isAdminOpen"
              class="absolute left-0 mt-1.5 w-44 bg-card-background border border-primary-border/80 rounded-lg p-1 z-50 flex flex-col gap-0.5 shadow-sm animate-in fade-in duration-100"
            >
              <router-link
                v-if="permissionsStore.canAccessArea('admin_users')"
                to="/admin/users"
                @click="isAdminOpen = false"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors"
                :class="isActive('/admin/users') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              >
                <span class="material-symbols-rounded text-base">manage_accounts</span>
                <span>Users</span>
              </router-link>

              <router-link
                v-if="permissionsStore.canAccessArea('admin_roles')"
                to="/admin/roles"
                @click="isAdminOpen = false"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors"
                :class="isActive('/admin/roles') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              >
                <span class="material-symbols-rounded text-base">security</span>
                <span>Roles &amp; RBAC</span>
              </router-link>

              <router-link
                v-if="permissionsStore.canAccessArea('admin_audit')"
                to="/admin/audit"
                @click="isAdminOpen = false"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors"
                :class="isActive('/admin/audit') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-background'"
              >
                <span class="material-symbols-rounded text-base">history</span>
                <span>Audit Logs</span>
              </router-link>
            </div>
          </div>
        </nav>
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
        <div class="relative" ref="notificationsDropdownRef">
          <button
            @click="isNotificationsOpen = !isNotificationsOpen"
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
                @click="notificationsStore.markAsRead(item.id)"
                class="p-2 rounded-lg text-xs cursor-pointer transition-colors flex items-start gap-2"
                :class="item.is_read ? 'hover:bg-background text-secondary-text' : 'bg-primary/5 text-primary-text font-medium'"
              >
                <span class="material-symbols-rounded text-sm mt-0.5 text-primary">circle_notifications</span>
                <div class="flex-1">
                  <p class="text-xs leading-tight font-medium">{{ item.title }}</p>
                  <p class="text-[11px] text-secondary-text mt-0.5 line-clamp-2">{{ item.message }}</p>
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
            @click="isProfileOpen = !isProfileOpen"
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
                <span>{{ permissionsStore.activeRole }}</span>
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
                <span>{{ authStore.currentEmployee.title || 'Employee' }} ({{ authStore.currentEmployee.employee_code || authStore.currentEmployee.id }})</span>
              </div>
            </div>

            <!-- Capability Inspector Modal Trigger -->
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

        <!-- Mobile Navigation Menu Toggle -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          type="button"
          class="lg:hidden btn-icon p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
        >
          <span class="material-symbols-rounded text-[22px]">
            {{ isMobileMenuOpen ? 'close' : 'menu' }}
          </span>
        </button>

      </div>
    </div>

    <!-- Mobile Navigation Drawer -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden border-t border-primary-border/60 bg-card-background px-4 py-3 flex flex-col gap-1 transition-all"
    >
      <router-link
        to="/chat"
        @click="isMobileMenuOpen = false"
        class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
        :class="isActive('/chat') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:bg-background'"
      >
        <span class="material-symbols-rounded text-[18px]">chat</span>
        <span>Chat</span>
      </router-link>

      <router-link
        to="/tasks"
        @click="isMobileMenuOpen = false"
        class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
        :class="isActive('/tasks') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:bg-background'"
      >
        <span class="material-symbols-rounded text-[18px]">task_alt</span>
        <span>Tasks</span>
      </router-link>

      <router-link
        v-if="permissionsStore.canAccessArea('hrms')"
        to="/hrms"
        @click="isMobileMenuOpen = false"
        class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
        :class="isActive('/hrms') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:bg-background'"
      >
        <span class="material-symbols-rounded text-[18px]">badge</span>
        <span>HRMS</span>
      </router-link>

      <div v-if="hasAdminAccess" class="pt-2 mt-1 border-t border-primary-border/60">
        <span class="text-[10px] font-semibold text-secondary-text uppercase tracking-wider px-3">Admin</span>
        <router-link
          v-if="permissionsStore.canAccessArea('admin_users')"
          to="/admin/users"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 text-secondary-text hover:bg-background"
        >
          <span class="material-symbols-rounded text-[18px]">manage_accounts</span>
          <span>Users</span>
        </router-link>
        <router-link
          v-if="permissionsStore.canAccessArea('admin_roles')"
          to="/admin/roles"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 text-secondary-text hover:bg-background"
        >
          <span class="material-symbols-rounded text-[18px]">security</span>
          <span>Roles</span>
        </router-link>
        <router-link
          v-if="permissionsStore.canAccessArea('admin_audit')"
          to="/admin/audit"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 text-secondary-text hover:bg-background"
        >
          <span class="material-symbols-rounded text-[18px]">history</span>
          <span>Audit Logs</span>
        </router-link>
      </div>
    </div>

    <!-- Permissions & Scopes Inspector Modal -->
    <PermissionsModal v-model="isPermissionsModalOpen" />
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { initTheme, toggleTheme, getTheme } from "@/utils/theme";
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useNotificationsStore } from "@/stores/notifications/notifications";
import PermissionsModal from "./PermissionsModal.vue";

const route = useRoute();
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

const userInitials = computed(() => {
  const name = authStore.currentUser?.name;
  if (!name) return "AU";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const hasAdminAccess = computed(() => {
  return (
    permissionsStore.activeRole === "Admin" ||
    permissionsStore.canAccessArea("admin_users") ||
    permissionsStore.canAccessArea("admin_roles") ||
    permissionsStore.canAccessArea("admin_audit")
  );
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
};

onMounted(() => {
  currentTheme.value = initTheme() || getTheme() || "light";
  document.addEventListener("click", handleClickOutside);
  notificationsStore.setupRealtimeListener();
  notificationsStore.fetchUnreadCount().catch(() => {});
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
  notificationsStore.cleanupRealtimeListener();
});

const handleToggleTheme = () => {
  currentTheme.value = toggleTheme();
};

const handleLogout = () => {
  isProfileOpen.value = false;
  authStore.logout();
};
</script>
