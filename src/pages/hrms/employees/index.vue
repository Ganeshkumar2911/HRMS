<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="sub-text text-secondary-text">
        Data scope: <strong>{{ scope || "—" }}</strong>
        <span v-if="scope === 'SELF'"> — employee picker hidden</span>
      </p>
      <button
        v-if="permissions.can('employee.create')"
        type="button"
        class="btn-primary text-xs px-3 py-1.5"
        @click="modalOpen = true"
      >
        New employee
      </button>
    </div>

    <DataTable :data="hrms.employees" :columns="columns" :loading="hrms.loading" row-key="id">
      <template #cell-employment_status="{ row }">
        <StatusBadge :status="row.employment_status" />
      </template>
      <template #actions="{ row }">
        <router-link :to="`/hrms/employees/${row.id}`" class="text-xs text-primary hover:underline">
          Open
        </router-link>
      </template>
    </DataTable>

    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="modalOpen = false"
    >
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="create">
        <h3 class="title-text text-sm">Link employee to user</h3>
        <input v-model.number="form.user_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="User ID" required />
        <input v-model="form.employee_code" class="input-field px-3 py-2 text-sm" placeholder="Employee code" required />
        <select v-model="form.employment_type" class="input-field px-3 py-2 text-sm">
          <option>FULL_TIME</option>
          <option>PART_TIME</option>
          <option>CONTRACT</option>
          <option>INTERN</option>
        </select>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="modalOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Create</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import DataTable from "@/components/common/DataTable";
import StatusBadge from "@/components/common/StatusBadge.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const scope = computed(() => permissions.scopeOf("employee.view"));
const columns = [
  { key: "id", label: "ID", width: 60 },
  { key: "employee_code", label: "Code" },
  { key: "user_id", label: "User" },
  { key: "employment_status", label: "Status" },
  { key: "department_id", label: "Dept" },
  { key: "manager_id", label: "Manager" },
];

const modalOpen = ref(false);
const form = reactive({
  user_id: null,
  employee_code: "",
  employment_type: "FULL_TIME",
});

const create = async () => {
  await hrms.createEmployee({ ...form });
  modalOpen.value = false;
};

onMounted(() => hrms.fetchEmployees({}, true));
</script>
