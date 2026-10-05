<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="sub-text text-secondary-text">
        Status calendar — no punch clock. UNMARKED is a real state.
        Scope: {{ scope || "—" }}
      </p>
      <div class="flex gap-2 items-center">
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

    <div v-if="!calendarEmployees.length" class="p-6 text-center text-sm text-secondary-text border border-primary-border rounded-xl">
      No calendar rows for this month.
    </div>

    <div v-for="emp in calendarEmployees" :key="emp.employee_id" class="space-y-2">
      <p class="text-xs font-semibold text-primary-text">Employee #{{ emp.employee_id }}</p>
      <div class="grid grid-cols-7 gap-1">
        <button
          v-for="day in emp.days"
          :key="day.date"
          type="button"
          class="p-2 rounded-lg border text-left text-[10px] min-h-16 transition-colors"
          :class="dayCellClass(day)"
          :disabled="!canInteract(day)"
          @click="selectDay(emp.employee_id, day)"
        >
          <p class="font-semibold">{{ day.date?.slice?.(8) || day.date }}</p>
          <p>{{ day.status }}</p>
          <p v-if="day.holiday_name" class="text-primary-blue truncate">{{ day.holiday_name }}</p>
        </button>
      </div>
    </div>

    <div v-if="markOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="markOpen = false">
      <form class="bg-card-background border border-primary-border rounded-xl w-full max-w-md p-5 space-y-3" @submit.prevent="submitMark">
        <h3 class="title-text text-sm">{{ isCorrection ? "Correct attendance" : "Mark attendance" }}</h3>
        <p class="text-xs text-secondary-text">Employee {{ selected.employee_id }} · {{ selected.date }}</p>
        <select v-model="markForm.status" class="input-field px-3 py-2 text-sm">
          <option v-for="s in markStatuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <input v-model="markForm.reason" class="input-field px-3 py-2 text-sm" :placeholder="isCorrection ? 'Reason (required)' : 'Reason'" :required="isCorrection" />
        <input v-model="markForm.remarks" class="input-field px-3 py-2 text-sm" placeholder="Remarks" />
        <div class="flex justify-end gap-2">
          <button type="button" class="btn-secondary text-xs px-3 py-1.5" @click="markOpen = false">Cancel</button>
          <button type="submit" class="btn-primary text-xs px-3 py-1.5" :disabled="hrms.actionLoading">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const hrms = useHrmsStore();
const permissions = usePermissionsStore();
const auth = useAuthStore();
const scope = computed(() => permissions.scopeOf("attendance.view"));
const employeeId = ref(null);
const markOpen = ref(false);
const isCorrection = ref(false);
const selected = reactive({ employee_id: null, date: "", attendance_id: null });
const markForm = reactive({ status: "PRESENT", reason: "", remarks: "" });
const markStatuses = ["PRESENT", "ABSENT", "HALF_DAY", "WFH", "ON_DUTY", "LEAVE"];

const calendarEmployees = computed(() => hrms.attendanceCalendar || []);

const dayCellClass = (day) => {
  if (day.week_off || day.status === "WEEK_OFF") return "border-primary-border bg-secondary-text/10 text-secondary-text";
  if (day.status === "HOLIDAY") return "border-primary-blue/30 bg-primary-blue/10 text-primary-blue";
  if (day.status === "PRESENT") return "border-primary-green/30 bg-primary-green/10";
  if (day.status === "ABSENT") return "border-primary-red/30 bg-primary-red/10";
  if (day.status === "LEAVE") return "border-primary-yellow/30 bg-primary-yellow/10";
  return "border-primary-border bg-card-background hover:bg-background";
};

const canInteract = (day) => {
  if (day.week_off || day.status === "WEEK_OFF" || day.status === "HOLIDAY") {
    return permissions.can("attendance.correct");
  }
  return permissions.can("attendance.mark") || permissions.can("attendance.correct");
};

const selectDay = (empId, day) => {
  selected.employee_id = empId;
  selected.date = day.date;
  selected.attendance_id = day.attendance_id || day.id || null;
  isCorrection.value = ["LEAVE", "HOLIDAY", "WEEK_OFF"].includes(day.status) || !!selected.attendance_id;
  markForm.status = markStatuses.includes(day.status) ? day.status : "PRESENT";
  markForm.reason = "";
  markForm.remarks = "";
  markOpen.value = true;
};

const reload = () => {
  const params = {};
  if (employeeId.value) params.employee_id = employeeId.value;
  hrms.fetchAttendanceCalendar(params);
};

const submitMark = async () => {
  if (isCorrection.value && selected.attendance_id && permissions.can("attendance.correct")) {
    await hrms.correctAttendance(selected.attendance_id, {
      status: markForm.status,
      reason: markForm.reason,
      remarks: markForm.remarks || null,
    });
  } else {
    await hrms.markAttendance({
      employee_id: selected.employee_id,
      attendance_date: selected.date,
      status: markForm.status,
      reason: markForm.reason || null,
      remarks: markForm.remarks || null,
    });
  }
  markOpen.value = false;
};

watch([() => hrms.hrmsMonth, () => hrms.hrmsYear], reload);

onMounted(() => {
  if (scope.value === "SELF" && auth.currentEmployee?.id) {
    employeeId.value = auth.currentEmployee.id;
  }
  reload();
});
</script>
