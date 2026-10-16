<template>
  <div>
    <!-- Mobile Backdrop Overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        @click="$emit('close-mobile')"
      />
    </Transition>

    <!-- Sidebar Container -->
    <aside
      class="fixed left-0 top-0 h-full bg-card-background z-50 flex flex-col justify-between py-5 border-r border-primary-border/60 transition-[width,transform] duration-200 ease-in-out lg:translate-x-0"
      :class="[
        isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'w-64 lg:w-16' : 'w-64'
      ]"
    >
      <!-- Top Section: Brand + Navigation -->
      <div class="flex flex-col gap-5 overflow-y-auto no-scrollbar">
        <!-- Brand Header (Expanded State) -->
        <div v-if="!isCollapsed" class="px-4.5 flex items-center justify-between">
          <router-link
            to="/tasks"
            class="flex items-center gap-2.5 group cursor-pointer"
            @click="handleNavClick"
          >
            <div class="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
              <span class="material-symbols-rounded text-base">corporate_fare</span>
            </div>
            <span class="text-base font-bold text-primary-text tracking-tight font-sans">Kora HR</span>
          </router-link>

          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-semibold text-secondary-text bg-surface-subtle px-1.5 py-0.5 rounded border border-primary-border/60">
              v2.4
            </span>
            <!-- Desktop Collapse Button -->
            <button
              type="button"
              @click="toggleCollapse"
              class="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-subtle border border-transparent hover:border-primary-border/60 transition-all cursor-pointer active:scale-95"
              title="Collapse sidebar (⌘B)"
              aria-label="Collapse sidebar"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9-3 3 3 3" />
              </svg>
            </button>
            <!-- Mobile Close Button -->
            <button
              type="button"
              class="lg:hidden p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle cursor-pointer"
              @click="$emit('close-mobile')"
              aria-label="Close navigation"
            >
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>
        </div>

        <!-- Brand Header (Collapsed Rail State) -->
        <div v-else class="flex flex-col items-center gap-2 px-2">
          <router-link
            to="/tasks"
            class="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer group"
            title="Kora HR"
            @click="handleNavClick"
          >
            <span class="material-symbols-rounded text-base">corporate_fare</span>
          </router-link>
          <!-- Desktop Expand Button -->
          <button
            type="button"
            @click="toggleCollapse"
            class="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-secondary-text hover:text-primary-text hover:bg-surface-subtle border border-transparent hover:border-primary-border/60 transition-all cursor-pointer active:scale-95"
            title="Expand sidebar (⌘B)"
            aria-label="Expand sidebar"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="m12 9 3 3-3 3" />
            </svg>
          </button>
          <!-- Mobile Close Button (when opened on mobile) -->
          <button
            type="button"
            class="lg:hidden p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle cursor-pointer"
            @click="$emit('close-mobile')"
            aria-label="Close navigation"
          >
            <span class="material-symbols-rounded text-lg">close</span>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav
          class="flex flex-col"
          :class="isCollapsed ? 'items-center gap-1.5 px-2' : 'gap-1 px-3.5'"
        >
          <!-- Tasks (Primary Highlighted View) -->
          <router-link
            v-if="permissionsStore.canAccessArea('tasks')"
            to="/tasks"
            @click="handleNavClick"
            class="flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="[
              isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2',
              isActive('/tasks')
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'
            ]"
            :title="isCollapsed ? 'Tasks' : undefined"
          >
            <span class="material-symbols-rounded text-[18px]">checklist</span>
            <span v-if="!isCollapsed">Tasks</span>
          </router-link>

          <!-- Chat -->
          <router-link
            to="/chat"
            @click="handleNavClick"
            class="flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer relative"
            :class="[
              isCollapsed ? 'w-10 h-10 justify-center' : 'justify-between px-3 py-2',
              isActive('/chat')
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'
            ]"
            :title="isCollapsed ? 'Chat' : undefined"
          >
            <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'gap-2.5'">
              <span class="material-symbols-rounded text-[18px]">chat</span>
              <span v-if="!isCollapsed">Chat</span>
            </div>
            <span
              v-if="isActive('/chat')"
              class="rounded-full bg-emerald-400"
              :class="isCollapsed ? 'absolute top-2 right-2 w-1.5 h-1.5' : 'w-2 h-2'"
            ></span>
          </router-link>

          <!-- People / HRMS -->
          <router-link
            v-if="permissionsStore.canAccessArea('hrms')"
            to="/hrms"
            @click="handleNavClick"
            class="flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="[
              isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2',
              isActive('/hrms') && !route.path.includes('/hrms/leave') && !route.path.includes('/hrms/attendance') && !route.path.includes('/hrms/calendar')
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'
            ]"
            :title="isCollapsed ? 'People' : undefined"
          >
            <span class="material-symbols-rounded text-[18px]">group</span>
            <span v-if="!isCollapsed">People</span>
          </router-link>

          <!-- Leave & Attendance -->
          <router-link
            v-if="permissionsStore.canAccessArea('hrms')"
            to="/hrms/attendance"
            @click="handleNavClick"
            class="flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="[
              isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2',
              isActive('/hrms/attendance') || isActive('/hrms/leave') || isActive('/hrms/calendar')
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'
            ]"
            :title="isCollapsed ? 'Leave & Attendance' : undefined"
          >
            <span class="material-symbols-rounded text-[18px]">date_range</span>
            <span v-if="!isCollapsed">Leave &amp; Attendance</span>
          </router-link>

          <!-- Section Divider -->
          <div
            class="border-t border-primary-border/60"
            :class="isCollapsed ? 'my-1.5 w-7' : 'my-2'"
          ></div>

          <!-- Admin Menu (Expanded State) -->
          <div v-if="!isCollapsed && hasAdminAccess" class="space-y-1">
            <button
              type="button"
              @click="isAdminExpanded = !isAdminExpanded"
              class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
              :class="isAdminActive
                ? 'bg-surface-subtle text-primary-text font-semibold'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
            >
              <div class="flex items-center gap-3">
                <span class="material-symbols-rounded text-[18px]">admin_panel_settings</span>
                <span>Admin</span>
              </div>
              <span
                class="material-symbols-rounded text-sm transition-transform duration-150"
                :class="{ 'rotate-180': isAdminExpanded }"
              >
                expand_more
              </span>
            </button>

            <!-- Nested Admin Links -->
            <div v-if="isAdminExpanded" class="pl-8 pr-1 space-y-0.5">
              <router-link
                v-if="permissionsStore.canAccessArea('admin_users')"
                to="/admin/users"
                @click="handleNavClick"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                :class="isActive('/admin/users')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
              >
                <span>Users</span>
              </router-link>

              <router-link
                v-if="permissionsStore.canAccessArea('admin_roles')"
                to="/admin/roles"
                @click="handleNavClick"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                :class="isActive('/admin/roles')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
              >
                <span>Roles &amp; Scopes</span>
              </router-link>

              <router-link
                v-if="permissionsStore.canAccessArea('admin_audit')"
                to="/admin/audit"
                @click="handleNavClick"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                :class="isActive('/admin/audit')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
              >
                <span>Audit Logs</span>
              </router-link>

              <router-link
                v-if="permissionsStore.can('broadcast.send') || permissionsStore.can('broadcast.view')"
                to="/admin/notifications/broadcast"
                @click="handleNavClick"
                class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors"
                :class="isActive('/admin/notifications/broadcast')
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
              >
                <span>Broadcasts</span>
              </router-link>
            </div>
          </div>

          <!-- Admin Menu (Collapsed Rail State with Flyout) -->
          <div v-else-if="isCollapsed && hasAdminAccess" class="relative" ref="adminMenuRef">
            <button
              type="button"
              @click="toggleAdminFlyout"
              class="w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer relative"
              :class="isAdminActive
                ? 'bg-primary text-white font-semibold shadow-xs'
                : (isAdminFlyoutOpen ? 'bg-surface-subtle text-primary-text' : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text')"
              title="Admin"
              aria-label="Admin settings"
            >
              <span class="material-symbols-rounded text-[18px]">admin_panel_settings</span>
              <span v-if="isAdminActive" class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white"></span>
            </button>

            <!-- Admin Flyout Popover -->
            <Transition name="fade">
              <div
                v-if="isAdminFlyoutOpen"
                class="fixed left-16 ml-2 bg-card-background border border-primary-border rounded-xl p-1.5 shadow-xl z-50 w-48 space-y-0.5"
                :style="{ top: adminFlyoutTop + 'px' }"
              >
                <div class="px-2.5 py-1.5 border-b border-primary-border/60 mb-1">
                  <span class="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">Admin</span>
                </div>
                <router-link
                  v-if="permissionsStore.canAccessArea('admin_users')"
                  to="/admin/users"
                  @click="closeAdminFlyout"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  :class="isActive('/admin/users') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
                >
                  <span>Users</span>
                </router-link>
                <router-link
                  v-if="permissionsStore.canAccessArea('admin_roles')"
                  to="/admin/roles"
                  @click="closeAdminFlyout"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  :class="isActive('/admin/roles') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
                >
                  <span>Roles &amp; Scopes</span>
                </router-link>
                <router-link
                  v-if="permissionsStore.canAccessArea('admin_audit')"
                  to="/admin/audit"
                  @click="closeAdminFlyout"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  :class="isActive('/admin/audit') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
                >
                  <span>Audit Logs</span>
                </router-link>
                <router-link
                  v-if="permissionsStore.can('broadcast.send') || permissionsStore.can('broadcast.view')"
                  to="/admin/notifications/broadcast"
                  @click="closeAdminFlyout"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  :class="isActive('/admin/notifications/broadcast') ? 'bg-primary/10 text-primary font-semibold' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
                >
                  <span>Broadcasts</span>
                </router-link>
              </div>
            </Transition>
          </div>

          <!-- Settings / Profile -->
          <router-link
            to="/profile"
            @click="handleNavClick"
            class="flex items-center rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="[
              isCollapsed ? 'w-10 h-10 justify-center' : 'gap-3 px-3 py-2',
              isActive('/profile')
                ? 'bg-primary text-white font-semibold shadow-xs'
                : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'
            ]"
            :title="isCollapsed ? 'Settings' : undefined"
          >
            <span class="material-symbols-rounded text-[18px]">settings</span>
            <span v-if="!isCollapsed">Settings</span>
          </router-link>
        </nav>
      </div>

      <!-- Bottom User Capsule (Expanded State) -->
      <div v-if="!isCollapsed" class="px-3.5 relative" ref="userMenuRef">
        <!-- User Menu Trigger Pill -->
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="w-full p-2.5 rounded-xl bg-surface-subtle border border-primary-border/70 flex items-center justify-between cursor-pointer hover:border-primary-border transition-colors text-left"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {{ userInitials }}
            </div>
            <div class="flex flex-col leading-tight min-w-0">
              <span class="text-xs font-semibold text-primary-text truncate">
                {{ authStore.currentUser?.name || 'Elinor Vance' }}
              </span>
              <span class="text-[10px] text-secondary-text truncate">
                {{ userRoleTitle }}
              </span>
            </div>
          </div>
          <span
            class="material-symbols-rounded text-secondary-text text-base shrink-0 transition-transform duration-150"
            :class="{ 'rotate-180': isUserMenuOpen }"
          >
            expand_more
          </span>
        </button>

        <!-- User Dropdown Popover -->
        <Transition name="fade">
          <div
            v-if="isUserMenuOpen"
            class="absolute bottom-full left-3.5 right-3.5 mb-2 bg-card-background border border-primary-border rounded-xl p-1.5 shadow-xl z-50 space-y-0.5"
          >
            <div class="px-3 py-2 border-b border-primary-border/60 mb-1">
              <p class="text-xs font-semibold text-primary-text">
                {{ authStore.currentUser?.name || 'User' }}
              </p>
              <p class="text-[10px] text-secondary-text truncate">
                {{ authStore.currentUser?.email || '' }}
              </p>
            </div>

            <router-link
              to="/profile"
              @click="closeUserMenu"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <span class="material-symbols-rounded text-base">person</span>
              <span>My Profile</span>
            </router-link>

            <button
              type="button"
              @click="openPermissions"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer text-left"
            >
              <span class="material-symbols-rounded text-base">shield</span>
              <span>Permissions &amp; Scopes</span>
            </button>

            <div class="my-1 border-t border-primary-border/60"></div>

            <button
              type="button"
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-primary-red hover:bg-primary-red/10 transition-colors cursor-pointer text-left font-medium"
            >
              <span class="material-symbols-rounded text-base">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Bottom User Capsule (Collapsed Rail State) -->
      <div v-else class="flex justify-center px-2 relative" ref="userCollapsedBtnRef">
        <button
          type="button"
          @click="isUserMenuOpen = !isUserMenuOpen"
          class="w-10 h-10 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
          :title="authStore.currentUser?.name || 'User Profile'"
          aria-label="User profile menu"
        >
          {{ userInitials }}
        </button>

        <!-- Floating Flyout Menu for Collapsed State -->
        <Transition name="fade">
          <div
            v-if="isUserMenuOpen"
            class="fixed left-16 bottom-5 ml-2 bg-card-background border border-primary-border rounded-xl p-1.5 shadow-xl z-50 w-60 space-y-0.5"
          >
            <div class="px-3 py-2 border-b border-primary-border/60 mb-1">
              <p class="text-xs font-semibold text-primary-text">
                {{ authStore.currentUser?.name || 'User' }}
              </p>
              <p class="text-[10px] text-secondary-text truncate">
                {{ authStore.currentUser?.email || '' }}
              </p>
            </div>

            <router-link
              to="/profile"
              @click="closeUserMenu"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <span class="material-symbols-rounded text-base">person</span>
              <span>My Profile</span>
            </router-link>

            <button
              type="button"
              @click="openPermissions"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors cursor-pointer text-left"
            >
              <span class="material-symbols-rounded text-base">shield</span>
              <span>Permissions &amp; Scopes</span>
            </button>

            <div class="my-1 border-t border-primary-border/60"></div>

            <button
              type="button"
              @click="handleLogout"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-primary-red hover:bg-primary-red/10 transition-colors cursor-pointer text-left font-medium"
            >
              <span class="material-symbols-rounded text-base">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </Transition>
      </div>
    </aside>

    <!-- Permissions Modal -->
    <PermissionsModal
      :is-open="isPermissionsModalOpen"
      @close="isPermissionsModalOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import PermissionsModal from "@/components/default/PermissionsModal.vue";

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
  isCollapsed: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile", "toggle-collapse", "update:isCollapsed"]);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();

const isUserMenuOpen = ref(false);
const isAdminExpanded = ref(false);
const isAdminFlyoutOpen = ref(false);
const adminFlyoutTop = ref(180);
const isPermissionsModalOpen = ref(false);

const userMenuRef = ref(null);
const userCollapsedBtnRef = ref(null);
const adminMenuRef = ref(null);

const toggleCollapse = () => {
  emit("toggle-collapse");
  emit("update:isCollapsed", !props.isCollapsed);
};

const toggleAdminFlyout = () => {
  if (adminMenuRef.value) {
    const rect = adminMenuRef.value.getBoundingClientRect();
    adminFlyoutTop.value = Math.max(16, rect.top);
  }
  isAdminFlyoutOpen.value = !isAdminFlyoutOpen.value;
};

const closeAdminFlyout = () => {
  isAdminFlyoutOpen.value = false;
  emit("close-mobile");
};

const isActive = (path) => {
  if (path === "/tasks") return route.path.startsWith("/tasks");
  if (path === "/chat") return route.path.startsWith("/chat");
  if (path === "/hrms") return route.path.startsWith("/hrms") && !route.path.includes("/attendance") && !route.path.includes("/leave") && !route.path.includes("/calendar");
  return route.path === path || route.path.startsWith(path + "/");
};

const hasAdminAccess = computed(() => {
  return (
    permissionsStore.canAccessArea("admin_users") ||
    permissionsStore.canAccessArea("admin_roles") ||
    permissionsStore.canAccessArea("admin_audit") ||
    permissionsStore.can("broadcast.send") ||
    permissionsStore.can("broadcast.view")
  );
});

const isAdminActive = computed(() => route.path.startsWith("/admin"));

const userInitials = computed(() => {
  const name = authStore.currentUser?.name;
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
});

const userRoleTitle = computed(() => {
  if (authStore.currentEmployee?.job_title) {
    return authStore.currentEmployee.job_title;
  }
  if (authStore.currentUser?.role_name) {
    return authStore.currentUser.role_name;
  }
  if (authStore.currentUser?.roles?.[0]?.name) {
    return authStore.currentUser.roles[0].name;
  }
  return "HR Operations";
});

const handleNavClick = () => {
  emit("close-mobile");
};

const closeUserMenu = () => {
  isUserMenuOpen.value = false;
};

const openPermissions = () => {
  isUserMenuOpen.value = false;
  isPermissionsModalOpen.value = true;
};

const handleLogout = async () => {
  closeUserMenu();
  emit("close-mobile");
  await authStore.logout();
  router.push("/auth/login");
};

const handleOutsideClick = (event) => {
  if (
    userMenuRef.value && !userMenuRef.value.contains(event.target) &&
    (!userCollapsedBtnRef.value || !userCollapsedBtnRef.value.contains(event.target))
  ) {
    isUserMenuOpen.value = false;
  }
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target)) {
    isAdminFlyoutOpen.value = false;
  }
};

const handleKeyDown = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
    const targetTag = event.target?.tagName?.toLowerCase();
    if (targetTag === "input" || targetTag === "textarea" || event.target?.isContentEditable) {
      return;
    }
    event.preventDefault();
    toggleCollapse();
  }
};

watch(
  () => props.isCollapsed,
  () => {
    isAdminFlyoutOpen.value = false;
    isUserMenuOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("mousedown", handleOutsideClick);
  window.addEventListener("keydown", handleKeyDown);
  if (isAdminActive.value) {
    isAdminExpanded.value = true;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutsideClick);
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
