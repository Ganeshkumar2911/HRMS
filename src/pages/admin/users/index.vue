<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">manage_accounts</span>
          <span>Admin</span>
        </div>
        <h1 class="title-text text-primary-text">Users</h1>
        <p class="sub-text text-secondary-text">Creating a user does not create an employee profile.</p>
      </div>
      <button
        v-if="permissions.can('user.create')"
        type="button"
        class="btn-primary text-xs px-3.5 py-2"
        @click="openCreate"
      >
        New user
      </button>
    </div>

    <DataTable :data="usersStore.users" :columns="columns" :loading="usersStore.loading" row-key="id">
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-if="permissions.can('user.update')"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
            @click="openEdit(row)"
          >
            <Pencil class="w-3 h-3" />
            <span>Edit</span>
          </button>
          <button
            v-if="permissions.can('role.assign')"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
            @click="openAssign(row)"
          >
            <Shield class="w-3 h-3" />
            <span>Role</span>
          </button>
          <button
            v-if="permissions.can('permission.override') || permissions.can('role.assign')"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
            @click="openOverrides(row)"
          >
            <KeyRound class="w-3 h-3" />
            <span>Overrides</span>
          </button>
          <button
            v-if="permissions.can('user.delete') && row.status === 'ACTIVE'"
            type="button"
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary-red/10 text-primary-red border border-primary-red/20 hover:bg-primary-red hover:text-white transition-all duration-150 cursor-pointer shadow-2xs"
            @click="confirmDeactivate(row)"
          >
            <UserX class="w-3 h-3" />
            <span>Deactivate</span>
          </button>
        </div>
      </template>
    </DataTable>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="modalOpen = false"
    >
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="saveUser">
        <h3 class="title-text text-sm">{{ editing ? "Edit user" : "New user" }}</h3>
        <input v-model="form.name" class="input-field px-3 py-2 text-sm" placeholder="Name" required />
        <input v-model="form.email" type="email" class="input-field px-3 py-2 text-sm" placeholder="Email" required />
        <input
          v-model="form.password"
          type="password"
          class="input-field px-3 py-2 text-sm"
          :placeholder="editing ? 'New password (optional)' : 'Password'"
          :required="!editing"
          minlength="8"
        />
        <BaseSelect
          v-if="editing"
          v-model="form.status"
          :options="statusOptions"
          custom-class="!py-2 text-sm"
        />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="modalOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5" :disabled="usersStore.actionLoading">Save</button>
        </div>
      </form>
    </div>

    <div
      v-if="assignOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="assignOpen = false"
    >
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="assignRole">
        <h3 class="title-text text-sm">Assign role to {{ assignUser?.name }}</h3>
        <BaseSelect
          v-model="selectedRoleId"
          :options="roleOptions"
          placeholder="Select role"
          custom-class="!py-2 text-sm"
        />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="assignOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Assign</button>
        </div>
      </form>
    </div>

    <ConfirmationDialog
      v-model="deactivateOpen"
      title="Deactivate user?"
      message="Sets status to INACTIVE. The row is kept."
      confirm-text="Deactivate"
      :loading="usersStore.actionLoading"
      @confirm="doDeactivate"
    />

    <UserPermissionDrawer
      :open="overridesOpen"
      :user="selectedUser"
      @close="overridesOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from "vue";
import { Pencil, Shield, KeyRound, UserX } from "lucide-vue-next";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge.vue";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import BaseSelect from "@/components/common/BaseSelect.vue";
import UserPermissionDrawer from "@/components/rbac/UserPermissionDrawer.vue";
import { useUsersStore } from "@/stores/users/users";
import { useRolesStore } from "@/stores/rbac/roles";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const statusOptions = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "SUSPENDED", value: "SUSPENDED" },
];

const usersStore = useUsersStore();
const rolesStore = useRolesStore();
const permissions = usePermissionsStore();

const roleOptions = computed(() =>
  (rolesStore.roles || []).map((role) => ({ label: role.name, value: role.id }))
);

const columns = [
  { key: "id", label: "ID", width: 60 },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "status", label: "Status" },
];

const modalOpen = ref(false);
const editing = ref(null);
const original = ref(null);
const form = reactive({ name: "", email: "", password: "", status: "ACTIVE" });
const deactivateOpen = ref(false);
const deactivateTarget = ref(null);
const assignOpen = ref(false);
const assignUser = ref(null);
const selectedRoleId = ref(null);
const overridesOpen = ref(false);
const selectedUser = ref(null);

const openOverrides = (row) => {
  selectedUser.value = row;
  overridesOpen.value = true;
};

const openCreate = () => {
  editing.value = null;
  original.value = null;
  Object.assign(form, { name: "", email: "", password: "", status: "ACTIVE" });
  modalOpen.value = true;
};

const openEdit = (row) => {
  editing.value = row;
  original.value = { ...row };
  Object.assign(form, { name: row.name, email: row.email, password: "", status: row.status });
  modalOpen.value = true;
};

const saveUser = async () => {
  if (editing.value) {
    const patch = {};
    if (form.name !== original.value.name) patch.name = form.name;
    if (form.email !== original.value.email) patch.email = form.email;
    if (form.status !== original.value.status) patch.status = form.status;
    if (form.password) patch.password = form.password;
    if (!Object.keys(patch).length) {
      modalOpen.value = false;
      return;
    }
    await usersStore.updateUser(editing.value.id, patch);
  } else {
    await usersStore.createUser({
      name: form.name,
      email: form.email,
      password: form.password,
    });
  }
  modalOpen.value = false;
};

const confirmDeactivate = (row) => {
  deactivateTarget.value = row;
  deactivateOpen.value = true;
};

const doDeactivate = async () => {
  if (deactivateTarget.value) await usersStore.deactivateUser(deactivateTarget.value.id);
  deactivateOpen.value = false;
};

const openAssign = async (row) => {
  assignUser.value = row;
  selectedRoleId.value = null;
  await rolesStore.fetchRoles();
  assignOpen.value = true;
};

const assignRole = async () => {
  if (!assignUser.value || !selectedRoleId.value) return;
  await usersStore.assignRole(assignUser.value.id, selectedRoleId.value);
  assignOpen.value = false;
};

onMounted(() => usersStore.fetchUsers(true));
</script>
