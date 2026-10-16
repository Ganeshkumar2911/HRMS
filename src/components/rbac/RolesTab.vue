<template>
  <div class="space-y-6">
    <!-- Top Action & Filter Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <!-- Search Input -->
        <div class="relative w-full sm:w-64">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search roles..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-all placeholder:text-secondary-text"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
            @click="searchQuery = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Role Summary Counters -->
        <div class="hidden md:flex items-center gap-2 text-xs text-secondary-text">
          <span class="px-3 py-1.5 rounded-xl bg-card-background border border-primary-border font-medium">
            Total Roles: <strong class="text-primary-text">{{ filteredRoles.length }}</strong>
          </span>
        </div>
      </div>

      <!-- Add Role Button -->
      <button
        v-if="permissions.can('role.create')"
        class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer shrink-0"
        @click="openCreate"
      >
        <Plus class="w-4 h-4" />
        <span>Add New Role</span>
      </button>
    </div>

    <!-- Skeleton Loading State -->
    <div v-if="rolesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="n in 6"
        :key="n"
        class="bg-card-background border border-primary-border rounded-2xl p-5 animate-pulse space-y-4"
      >
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-background" />
          <div class="h-5 w-16 bg-background rounded-full" />
        </div>
        <div class="space-y-2">
          <div class="h-4 w-3/4 bg-background rounded" />
          <div class="h-3 w-full bg-background rounded" />
        </div>
        <div class="h-8 bg-background rounded-xl pt-2" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredRoles.length === 0"
      class="flex flex-col items-center justify-center py-20 bg-card-background border border-primary-border rounded-2xl text-center p-6"
    >
      <div class="w-14 h-14 rounded-2xl bg-background border border-primary-border flex items-center justify-center mb-4">
        <ShieldCheck class="w-7 h-7 text-secondary-text" />
      </div>
      <h3 class="text-sm font-bold text-primary-text mb-1">No Roles Found</h3>
      <p class="text-xs text-secondary-text max-w-sm mb-5">
        {{ searchQuery ? "No roles match your search query. Try clearing the search filter." : "Create custom roles to define granular access permissions for your team members." }}
      </p>
      <button
        v-if="searchQuery"
        class="px-4 py-2 rounded-xl border border-primary-border text-xs font-medium text-secondary-text hover:text-primary-text hover:bg-background transition-colors cursor-pointer"
        @click="searchQuery = ''"
      >
        Clear Search
      </button>
      <button
        v-else-if="permissions.can('role.create')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer"
        @click="openCreate"
      >
        <Plus class="w-4 h-4" /> Create First Role
      </button>
    </div>

    <!-- Role Cards Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="role in filteredRoles"
        :key="role.id"
        class="bg-card-background border border-primary-border rounded-2xl p-5 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all duration-300 group"
      >
        <!-- Header Info -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0">
              <ShieldCheck class="w-5 h-5 text-primary" />
            </div>

            <!-- Role Type Badge -->
            <span
              v-if="role.is_system"
              class="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0"
            >
              System Role
            </span>
            <span
              v-else
              class="text-[10px] font-medium px-2.5 py-1 rounded-full bg-background text-secondary-text border border-primary-border shrink-0"
            >
              Custom Role
            </span>
          </div>

          <div>
            <h3 class="text-sm font-bold text-primary-text tracking-wide group-hover:text-primary transition-colors">
              {{ role.name }}
            </h3>
            <p class="text-xs text-secondary-text mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
              {{ role.description || "No description provided for this role." }}
            </p>
          </div>
        </div>

        <!-- Meta & Actions Footer -->
        <div class="space-y-3 pt-3 border-t border-primary-border">
          <!-- Meta Pill -->
          <div class="flex items-center justify-between text-xs text-secondary-text">
            <span class="flex items-center gap-1.5 font-medium">
              <Lock class="w-3.5 h-3.5 text-primary" />
              <span>{{ role.permissions?.length ?? 0 }} Permissions</span>
            </span>
          </div>

          <!-- Buttons Row -->
          <div class="flex items-center gap-2">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-background border border-primary-border hover:border-primary/40 text-xs font-semibold text-primary-text hover:bg-primary/5 transition-all duration-200 cursor-pointer"
              @click="openPermissions(role)"
            >
              <ShieldCheck class="w-3.5 h-3.5 text-primary" />
              <span>Permissions</span>
            </button>

            <button
              v-if="!role.is_system && permissions.can('role.update')"
              class="w-9 h-9 flex items-center justify-center rounded-xl bg-background border border-primary-border text-secondary-text hover:text-primary-text hover:border-primary-border/80 transition-colors cursor-pointer"
              title="Edit Role Details"
              @click="openEdit(role)"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>

            <button
              v-if="!role.is_system && permissions.can('role.delete')"
              :disabled="rolesStore.actionLoading"
              class="w-9 h-9 flex items-center justify-center rounded-xl bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red/20 transition-colors disabled:opacity-50 cursor-pointer"
              title="Delete Role"
              @click="deleteTarget = role"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="deleteTarget"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        @click="deleteTarget = null"
      >
        <div
          class="bg-card-background rounded-2xl border border-primary-border w-full max-w-sm p-6 shadow-2xl space-y-4"
          @click.stop
        >
          <div class="w-11 h-11 rounded-2xl bg-primary-red/10 border border-primary-red/20 flex items-center justify-center">
            <Trash2 class="w-5 h-5 text-primary-red" />
          </div>

          <div>
            <h3 class="text-sm font-bold text-primary-text">Delete Role</h3>
            <p class="text-xs text-secondary-text mt-1 leading-relaxed">
              Are you sure you want to delete <strong class="text-primary-text">{{ deleteTarget.name }}</strong>? Users assigned to this role will lose their granted permissions.
            </p>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
              @click="deleteTarget = null"
            >
              Cancel
            </button>
            <button
              :disabled="rolesStore.actionLoading"
              class="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-primary-red hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
              @click="rolesStore.deleteRole(deleteTarget.id, () => deleteTarget = null)"
            >
              <Loader2 v-if="rolesStore.actionLoading" class="w-3.5 h-3.5 animate-spin" />
              <span>{{ rolesStore.actionLoading ? "Deleting..." : "Delete Role" }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Dialogs -->
    <RoleDialog :open="roleDialog.open" :edit-data="roleDialog.editData" @close="roleDialog.open = false" />
    <PermissionDialog :open="permDialog.open" :role="permDialog.role" @close="permDialog.open = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Search,
  Plus,
  ShieldCheck,
  Pencil,
  Trash2,
  Lock,
  Loader2,
  X,
} from "lucide-vue-next";
import { useRolesStore } from "@/stores/rbac/roles";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import RoleDialog from "./RoleDialog.vue";
import PermissionDialog from "./PermissionDialog.vue";

const rolesStore = useRolesStore();
const permissions = usePermissionsStore();

const searchQuery = ref("");
const deleteTarget = ref(null);
const roleDialog = ref({ open: false, editData: null });
const permDialog = ref({ open: false, role: null });

const filteredRoles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return rolesStore.roles;
  return rolesStore.roles.filter(
    (r) =>
      r.name?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query)
  );
});

const openCreate = () => {
  roleDialog.value = { open: true, editData: null };
};

const openEdit = (role) => {
  roleDialog.value = { open: true, editData: role };
};

const openPermissions = (role) => {
  permDialog.value = { open: true, role };
};

onMounted(() => {
  rolesStore.fetchRoles();
  rolesStore.fetchPermissions();
});
</script>
