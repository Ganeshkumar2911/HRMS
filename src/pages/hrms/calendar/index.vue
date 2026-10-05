<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="sub-text text-secondary-text">
        Unified month calendar (attendance + leave + holiday + week-off). Read-only.
      </p>
      <div class="flex gap-2">
        <input
          v-if="scope !== 'SELF'"
          v-model.number="employeeId"
          type="number"
          class="input-field px-2 py-1.5 text-xs w-36"
          placeholder="Employee ID"
        />
        <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="reload">Refresh</button>
      </div>
    </div>

    <div v-if="!employeeId" class="p-6 text-center text-sm text-secondary-text border border-primary-border rounded-xl">
      Employee ID is required for the unified calendar API.
    </div>

    <div v-else-if="!dayEntries.length" class="p-6 text-center text-sm text-secondary-text border border-primary-border rounded-xl">
      No calendar data for this month.
    </div>

    <div v-else class="grid grid-cols-7 gap-1">
      <div
        v-for="[dateKey, cell] in dayEntries"
        :key="dateKey"
        class="p-2 rounded-lg border border-primary-border bg-card-background min-h-20 text-[10px] space-y-0.5"
      >
        <p class="font-semibold text-xs text-primary-text">{{ dateKey.slice(8) }}</p>
        <p v-if="cell.attendance" class="text-primary">Att: {{ cell.attendance }}</p>
        <p v-if="cell.leave" class="text-primary-yellow">Leave: {{ cell.leave }}</p>
        <p v-if="cell.holiday" class="text-primary-blue">{{ cell.holiday }}</p>
        <p v-if="cell.week_off" class="text-secondary-text">Week off</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();
const scope = computed(() => permissions.scopeOf("attendance.view"));
const employeeId = ref(null);

const dayEntries = computed(() => {
  const data = hrms.monthCalendar;
  if (!data || typeof data !== "object") return [];
  // API may return map date -> cell, or { days: ... }
  if (Array.isArray(data)) {
    return data.map((item) => [item.date, item]);
  }
  if (data.days && typeof data.days === "object" && !Array.isArray(data.days)) {
    return Object.entries(data.days).sort(([a], [b]) => a.localeCompare(b));
  }
  return Object.entries(data)
    .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
    .sort(([a], [b]) => a.localeCompare(b));
});

const reload = () => {
  if (!employeeId.value) return;
  hrms.fetchMonthCalendar({ employee_id: employeeId.value });
};

watch([() => hrms.hrmsMonth, () => hrms.hrmsYear], reload);

onMounted(() => {
  if (scope.value === "SELF" && auth.currentEmployee?.id) {
    employeeId.value = auth.currentEmployee.id;
  }
  reload();
});
</script>
