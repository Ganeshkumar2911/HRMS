<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <p class="sub-text text-secondary-text">No DELETE — set status INACTIVE.</p>
      <button v-if="permissions.can('department.create')" type="button" class="btn-primary text-xs px-3 py-1.5" @click="openCreate">
        New department
      </button>
    </div>
    <DataTable :data="hrms.departments" :loading="hrms.loading" row-key="id">
      <template #cell-status="{ row }"><StatusBadge :status="row.status" /></template>
      <template #actions="{ row }">
        <button v-if="permissions.can('department.update')" type="button" class="text-xs text-primary hover:underline" @click="openEdit(row)">Edit</button>
      </template>
    </DataTable>

    <div v-if="modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="modalOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="save">
        <h3 class="title-text text-sm">{{ editing ? "Edit" : "New" }} department</h3>
        <input v-model="form.name" class="input-field px-3 py-2 text-sm" placeholder="Name" required />
        <input v-model="form.code" class="input-field px-3 py-2 text-sm" placeholder="Code" required />
        <input v-model.number="form.parent_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="Parent ID (optional)" />
        <select v-model="form.status" class="input-field px-3 py-2 text-sm">
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </select>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="modalOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const modalOpen = ref(false);
const editing = ref(null);
const form = reactive({ name: "", code: "", parent_id: null, status: "ACTIVE" });

const openCreate = () => {
  editing.value = null;
  Object.assign(form, { name: "", code: "", parent_id: null, status: "ACTIVE" });
  modalOpen.value = true;
};
const openEdit = (row) => {
  editing.value = row;
  Object.assign(form, { name: row.name, code: row.code, parent_id: row.parent_id, status: row.status });
  modalOpen.value = true;
};
const save = async () => {
  const payload = {
    name: form.name,
    code: form.code,
    parent_id: form.parent_id || null,
    status: form.status,
  };
  if (editing.value) await hrms.updateDepartment(editing.value.id, payload);
  else await hrms.createDepartment(payload);
  modalOpen.value = false;
};

onMounted(() => hrms.fetchDepartments(true));
</script>
