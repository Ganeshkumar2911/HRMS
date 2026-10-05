<template>
  <div class="space-y-4" v-if="employee">
    <div class="flex items-center justify-between gap-2">
      <div>
        <h2 class="title-text text-sm">{{ employee.employee_code }}</h2>
        <p class="sub-text text-secondary-text">Employee #{{ employee.id }} · user {{ employee.user_id }}</p>
      </div>
      <StatusBadge :status="employee.employment_status" />
    </div>

    <div class="flex gap-1 border-b border-primary-border/60">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="px-3 py-2 text-xs font-medium"
        :class="activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-secondary-text'"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <div v-if="activeTab === 'Profile'" class="space-y-3 max-w-lg">
      <div class="grid grid-cols-2 gap-3">
        <input v-model="form.phone" class="input-field px-3 py-2 text-sm" placeholder="Phone" />
        <input v-model="form.personal_email" class="input-field px-3 py-2 text-sm" placeholder="Personal email" />
        <select v-model="form.employment_status" class="input-field px-3 py-2 text-sm">
          <option>ACTIVE</option>
          <option>INACTIVE</option>
          <option>ON_NOTICE</option>
          <option>ON_LEAVE</option>
          <option>TERMINATED</option>
          <option>RESIGNED</option>
        </select>
        <input v-model.number="form.department_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="Department ID" />
        <input v-model.number="form.manager_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="Manager employee ID" />
        <input v-model.number="form.work_location_id" type="number" class="input-field px-3 py-2 text-sm" placeholder="Location ID" />
      </div>
      <button
        v-if="permissions.can('employee.update')"
        type="button"
        class="btn-primary text-xs px-3 py-1.5"
        @click="saveProfile"
      >
        Save changes
      </button>
    </div>

    <div v-else-if="activeTab === 'Address'" class="space-y-3 max-w-lg">
      <select v-model="address.address_type" class="input-field px-3 py-2 text-sm">
        <option>CURRENT</option>
        <option>PERMANENT</option>
      </select>
      <input v-model="address.line1" class="input-field px-3 py-2 text-sm" placeholder="Line 1" />
      <input v-model="address.city" class="input-field px-3 py-2 text-sm" placeholder="City" />
      <button type="button" class="btn-primary text-xs px-3 py-1.5" @click="saveAddress">Add address</button>
    </div>

    <div v-else-if="activeTab === 'Emergency'" class="space-y-3 max-w-lg">
      <input v-model="emergency.name" class="input-field px-3 py-2 text-sm" placeholder="Name" />
      <input v-model="emergency.relation" class="input-field px-3 py-2 text-sm" placeholder="Relation" />
      <input v-model="emergency.phone" class="input-field px-3 py-2 text-sm" placeholder="Phone" />
      <button type="button" class="btn-primary text-xs px-3 py-1.5" @click="saveEmergency">Add contact</button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in hrms.employeeHistory"
        :key="item.id || item.created_at"
        class="p-3 rounded-lg border border-primary-border bg-card-background text-xs"
      >
        <p class="font-semibold">{{ item.action || item.module }} · {{ item.created_at }}</p>
        <p class="text-secondary-text">{{ item.entity_type }} #{{ item.entity_id }}</p>
      </div>
      <p v-if="!hrms.employeeHistory.length" class="text-xs text-secondary-text">No history.</p>
    </div>
  </div>
  <div v-else class="text-sm text-secondary-text">Loading employee…</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import StatusBadge from "@/components/common/StatusBadge.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const route = useRoute();
const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const tabs = ["Profile", "Address", "Emergency", "History"];
const activeTab = ref("Profile");
const employeeId = computed(() => Number(route.params.employeeId));
const employee = computed(() => hrms.activeEmployee);

const form = reactive({});
const address = reactive({ address_type: "CURRENT", line1: "", city: "" });
const emergency = reactive({ name: "", relation: "", phone: "" });

watch(
  employee,
  (value) => {
    if (!value) return;
    Object.assign(form, {
      phone: value.phone || "",
      personal_email: value.personal_email || "",
      employment_status: value.employment_status,
      department_id: value.department_id,
      manager_id: value.manager_id,
      work_location_id: value.work_location_id,
    });
  },
  { immediate: true }
);

const saveProfile = async () => {
  const patch = {};
  const original = employee.value;
  Object.keys(form).forEach((key) => {
    const next = form[key] === "" ? null : form[key];
    if (next !== (original[key] ?? null)) patch[key] = next;
  });
  if (!Object.keys(patch).length) return;
  await hrms.updateEmployee(employeeId.value, patch);
};

const saveAddress = () => hrms.addAddress(employeeId.value, { ...address });
const saveEmergency = () => hrms.addEmergencyContact(employeeId.value, { ...emergency });

onMounted(async () => {
  await hrms.fetchEmployee(employeeId.value);
  hrms.fetchEmployeeHistory(employeeId.value);
});
</script>
