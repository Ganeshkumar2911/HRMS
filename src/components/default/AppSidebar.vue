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
      class="fixed left-0 top-0 h-full w-64 bg-card-background border-r border-primary-border/70 z-50 flex flex-col justify-between py-5 transition-transform duration-200 ease-in-out lg:translate-x-0"
      :class="isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- Top Section: Brand + Workspace + Nav -->
      <div class="flex flex-col gap-5 overflow-y-auto no-scrollbar">
        <!-- Brand Header -->
        <div class="px-5 flex items-center justify-between">
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
            <span class="text-[11px] font-semibold text-secondary-text bg-surface-subtle px-2 py-0.5 rounded-full border border-primary-border/60">
              v2.4
            </span>
            <!-- Mobile Close Button -->
            <button
              type="button"
              class="lg:hidden p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle cursor-pointer"
              @click="$emit('close-mobile')"
            >
              <span class="material-symbols-rounded text-lg">close</span>
            </button>
          </div>
        </div>

        <!-- Workspace / Company Pill Switcher -->
        <div class="px-3.5">
          <div class="p-2.5 rounded-xl bg-surface-subtle border border-primary-border/70 flex items-center justify-between cursor-pointer hover:border-primary-border transition-colors">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                <span class="material-symbols-rounded text-xs">apartment</span>
              </div>
              <div class="flex flex-col leading-none min-w-0">
                <span class="text-xs font-semibold text-primary-text truncate">Acme Global</span>
                <span class="text-[10px] text-secondary-text mt-0.5 truncate">Enterprise HQ</span>
              </div>
            </div>
            <span class="material-symbols-rounded text-secondary-text text-base shrink-0">unfold_more</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex flex-col gap-1 px-3.5">
          <!-- Tasks (Primary Highlighted View) -->
          <router-link
            v-if="permissionsStore.canAccessArea('tasks')"
            to="/tasks"
            @click="handleNavClick"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="isActive('/tasks')
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[18px]">checklist</span>
            <span>Tasks</span>
          </router-link>

          <!-- Chat -->
          <router-link
            to="/chat"
            @click="handleNavClick"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="isActive('/chat')
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[18px]">chat</span>
            <span>Chat</span>
          </router-link>

          <!-- People / HRMS -->
          <router-link
            v-if="permissionsStore.canAccessArea('hrms')"
            to="/hrms"
            @click="handleNavClick"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="isActive('/hrms') && !route.path.includes('/hrms/leave') && !route.path.includes('/hrms/attendance') && !route.path.includes('/hrms/calendar')
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[18px]">group</span>
            <span>People</span>
          </router-link>

          <!-- Leave & Attendance -->
          <router-link
            v-if="permissionsStore.canAccessArea('hrms')"
            to="/hrms/attendance"
            @click="handleNavClick"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="isActive('/hrms/attendance') || isActive('/hrms/leave') || isActive('/hrms/calendar')
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[18px]">date_range</span>
            <span>Leave &amp; Attendance</span>
          </router-link>

          <!-- Section Divider -->
          <div class="my-2 border-t border-primary-border/60"></div>

          <!-- Admin Submenu (Users, Roles, Audit, Broadcast) -->
          <div v-if="hasAdminAccess" class="space-y-1">
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

          <!-- Settings / Profile -->
          <router-link
            to="/profile"
            @click="handleNavClick"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
            :class="isActive('/profile')
              ? 'bg-primary text-white font-semibold shadow-xs'
              : 'text-secondary-text hover:bg-surface-subtle hover:text-primary-text'"
          >
            <span class="material-symbols-rounded text-[18px]">settings</span>
            <span>Settings</span>
          </router-link>
        </nav>
      </div>

      <!-- Bottom User Capsule (Exact Stitch Design) -->
      <div class="px-3.5 relative" ref="userMenuRef">
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
    </aside>

    <!-- Permissions Modal -->
    <PermissionsModal
      :is-open="isPermissionsModalOpen"
      @close="isPermissionsModalOpen = false"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import PermissionsModal from "@/components/default/PermissionsModal.vue";

const props = defineProps({
  isMobileOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-mobile"]);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();

const isUserMenuOpen = ref(false);
const isAdminExpanded = ref(false);
const isPermissionsModalOpen = ref(false);
const userMenuRef = ref(null);

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
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    isUserMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleOutsideClick);
  if (isAdminActive.value) {
    isAdminExpanded.value = true;
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutsideClick);
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
