<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="title-text text-sm">Holidays</h2>
        <button v-if="permissions.can('holiday.create')" type="button" class="btn-primary text-xs px-3 py-1.5" @click="openHoliday">
          Add holiday
        </button>
      </div>
      <DataTable :data="hrms.holidays" :loading="hrms.loading" row-key="id">
        <template #cell-holiday_type="{ row }"><StatusBadge :status="row.holiday_type" /></template>
        <template #actions="{ row }">
          <div class="flex gap-2">
            <button v-if="permissions.can('holiday.update')" type="button" class="text-xs text-primary hover:underline" @click="editHoliday(row)">Edit</button>
            <button v-if="permissions.can('holiday.update')" type="button" class="text-xs text-primary-red hover:underline" @click="hrms.deleteHoliday(row.id)">Delete</button>
          </div>
        </template>
      </DataTable>
    </section>

    <section class="space-y-3">
      <div class="flex justify-between items-center">
        <h2 class="title-text text-sm">Work week policies</h2>
        <button v-if="permissions.can('work_week_policy.create')" type="button" class="btn-primary text-xs px-3 py-1.5" @click="openPolicy">
          New policy
        </button>
      </div>
      <div v-for="policy in hrms.workWeekPolicies" :key="policy.id" class="p-4 rounded-xl border border-primary-border bg-card-background space-y-2">
        <div class="flex justify-between">
          <p class="text-sm font-semibold">{{ policy.name }} <StatusBadge v-if="policy.is_default" status="ACTIVE" label="DEFAULT" /></p>
          <button v-if="permissions.can('work_week_policy.update')" type="button" class="text-xs text-primary hover:underline" @click="editPolicy(policy)">Edit</button>
        </div>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="day in policy.days || []"
            :key="day.weekday"
            class="text-[10px] px-2 py-1 rounded border border-primary-border"
            :class="day.day_type === 'WORKING' ? 'bg-primary-green/10 text-primary-green' : 'bg-secondary-text/10 text-secondary-text'"
          >
            {{ weekdayLabel(day.weekday) }}: {{ day.day_type }}
          </span>
        </div>
      </div>
    </section>

    <div v-if="holidayOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="holidayOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="saveHoliday">
        <h3 class="title-text text-sm">Holiday</h3>
        <input v-model="holidayForm.name" class="input-field px-3 py-2 text-sm" required placeholder="Name" />
        <input v-model="holidayForm.date" type="date" class="input-field px-3 py-2 text-sm" required />
        <select v-model="holidayForm.holiday_type" class="input-field px-3 py-2 text-sm">
          <option>MANDATORY</option>
          <option>OPTIONAL</option>
        </select>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="holidayOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5">Save</button>
        </div>
      </form>
    </div>

    <div v-if="policyOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="policyOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-lg p-5 space-y-3" @submit.prevent="savePolicy">
        <h3 class="title-text text-sm">Work week policy</h3>
        <input v-model="policyForm.name" class="input-field px-3 py-2 text-sm" required placeholder="Name" />
        <label class="flex items-center gap-2 text-xs"><input v-model="policyForm.is_default" type="checkbox" class="custom-checkbox" /> Default policy</label>
        <div v-for="day in policyForm.days" :key="day.weekday" class="flex items-center gap-2">
          <span class="text-xs w-16">{{ weekdayLabel(day.weekday) }}</span>
          <select v-model="day.day_type" class="input-field px-2 py-1 text-xs flex-1">
            <option>WORKING</option>
            <option>WEEK_OFF</option>
          </select>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="policyOpen = false">Cancel</button>
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
const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdayLabel = (n) => labels[n] || n;

const holidayOpen = ref(false);
const holidayEditing = ref(null);
const holidayForm = reactive({ name: "", date: "", holiday_type: "MANDATORY" });

const policyOpen = ref(false);
const policyEditing = ref(null);
const defaultDays = () =>
  Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    day_type: weekday < 5 ? "WORKING" : "WEEK_OFF",
  }));
const policyForm = reactive({ name: "", is_default: false, days: defaultDays() });

const openHoliday = () => {
  holidayEditing.value = null;
  Object.assign(holidayForm, { name: "", date: "", holiday_type: "MANDATORY" });
  holidayOpen.value = true;
};
const editHoliday = (row) => {
  holidayEditing.value = row;
  Object.assign(holidayForm, { name: row.name, date: row.date, holiday_type: row.holiday_type });
  holidayOpen.value = true;
};
const saveHoliday = async () => {
  if (holidayEditing.value) await hrms.updateHoliday(holidayEditing.value.id, { ...holidayForm });
  else await hrms.createHoliday({ ...holidayForm });
  holidayOpen.value = false;
};

const openPolicy = () => {
  policyEditing.value = null;
  Object.assign(policyForm, { name: "", is_default: false, days: defaultDays() });
  policyOpen.value = true;
};
const editPolicy = (row) => {
  policyEditing.value = row;
  policyForm.name = row.name;
  policyForm.is_default = !!row.is_default;
  policyForm.days = (row.days || defaultDays()).map((d) => ({ ...d }));
  policyOpen.value = true;
};
const savePolicy = async () => {
  const payload = {
    name: policyForm.name,
    is_default: policyForm.is_default,
    days: policyForm.days,
  };
  if (policyEditing.value) await hrms.updateWorkWeekPolicy(policyEditing.value.id, payload);
  else await hrms.createWorkWeekPolicy(payload);
  policyOpen.value = false;
};

onMounted(() => {
  hrms.fetchHolidays(true);
  hrms.fetchWorkWeekPolicies(true);
});
</script>
