<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">security</span>
          <span>Admin</span>
        </div>
        <h1 class="title-text text-primary-text">Roles & permissions</h1>
        <p class="sub-text text-secondary-text">
          Scope picker only for employee / attendance / leave_request / leave_balance codes.
        </p>
      </div>
      <button
        v-if="permissions.can('role.create')"
        type="button"
        class="btn-primary text-xs px-3.5 py-2"
        @click="openCreate"
      >
        New role
      </button>
    </div>

    <DataTable :data="rolesStore.roles" :columns="columns" :loading="rolesStore.loading" row-key="id">
      <template #cell-permissions="{ row }">
        <span class="text-xs text-secondary-text">{{ row.permissions?.length || 0 }} grants</span>
      </template>
      <template #actions="{ row }">
        <div class="flex items-center gap-2">
          <button type="button" class="text-xs text-primary hover:underline" @click="openEdit(row)">Edit</button>
          <button
            v-if="permissions.can('role.update')"
            type="button"
            class="text-xs text-primary-red hover:underline"
            @click="confirmDelete(row)"
          >
            Delete
          </button>
        </div>
      </template>
    </DataTable>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="modalOpen = false"
    >
      <form
        class="bg-card-background border border-primary-border rounded-xl w-full max-w-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto"
        @submit.prevent="saveRole"
      >
        <h3 class="title-text text-sm">{{ editing ? "Edit role" : "New role" }}</h3>
        <input v-model="form.name" class="input-field px-3 py-2 text-sm" placeholder="Role name" required />
        <input v-model="form.description" class="input-field px-3 py-2 text-sm" placeholder="Description" />

        <div class="space-y-2 border border-primary-border rounded-lg p-3">
          <p class="text-xs font-semibold text-primary-text">Permission assignments</p>
          <div v-for="(item, index) in form.assignments" :key="index" class="flex gap-2 items-center">
            <input v-model="item.code" class="input-field px-2 py-1.5 text-xs flex-1" placeholder="code e.g. employee.view" />
            <select
              v-if="isScopeAwareCode(item.code)"
              v-model="item.scope"
              class="input-field px-2 py-1.5 text-xs w-28"
            >
              <option value="SELF">SELF</option>
              <option value="TEAM">TEAM</option>
              <option value="ALL">ALL</option>
            </select>
            <span v-else class="text-[10px] text-secondary-text w-28">no scope</span>
            <button type="button" class="text-primary-red text-xs" @click="form.assignments.splice(index, 1)">✕</button>
          </div>
          <button type="button" class="btn-secondary text-xs px-2 py-1" @click="form.assignments.push({ code: '', scope: 'SELF' })">
            Add permission
          </button>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="modalOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5" :disabled="rolesStore.actionLoading">Save</button>
        </div>
      </form>
    </div>

    <ConfirmationDialog
      v-model="deleteOpen"
      title="Delete role?"
      message="Seeded/system roles may be rejected by the API."
      :loading="rolesStore.actionLoading"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.vue";
import { useRolesStore, isScopeAwareCode } from "@/stores/rbac/roles";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const rolesStore = useRolesStore();
const permissions = usePermissionsStore();

const columns = [
  { key: "id", label: "ID", width: 60 },
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "permissions", label: "Permissions" },
];

const modalOpen = ref(false);
const editing = ref(null);
const form = reactive({
  name: "",
  description: "",
  assignments: [],
});
const deleteOpen = ref(false);
const deleteTarget = ref(null);

const openCreate = () => {
  editing.value = null;
  Object.assign(form, { name: "", description: "", assignments: [{ code: "task.view", scope: null }] });
  modalOpen.value = true;
};

const openEdit = (row) => {
  editing.value = row;
  form.name = row.name;
  form.description = row.description || "";
  form.assignments = (row.permissions || []).map((p) => ({
    code: p.code,
    scope: p.scope || (isScopeAwareCode(p.code) ? "SELF" : null),
  }));
  modalOpen.value = true;
};

const buildPayload = () => ({
  name: form.name,
  description: form.description || null,
  permission_assignments: form.assignments
    .filter((a) => a.code)
    .map((a) => ({
      code: a.code,
      scope: isScopeAwareCode(a.code) ? a.scope || "SELF" : null,
    })),
});

const saveRole = async () => {
  const payload = buildPayload();
  if (editing.value) {
    await rolesStore.updateRole(editing.value.id, payload);
  } else {
    await rolesStore.createRole(payload);
  }
  modalOpen.value = false;
};

const confirmDelete = (row) => {
  deleteTarget.value = row;
  deleteOpen.value = true;
};

const doDelete = async () => {
  if (deleteTarget.value) await rolesStore.deleteRole(deleteTarget.value.id);
  deleteOpen.value = false;
};

onMounted(() => rolesStore.fetchRoles(true));
</script>
