<template>
  <div class="space-y-5 pb-12">
    <PageTopBar
      title="Attendance Central"
      :description="isAdminOrManager ? 'Monitor organization attendance, handle exceptions, and manage corrections.' : 'Review your monthly attendance, daily punch times, and submit correction requests.'"
      show-search
      show-refresh
      search-placeholder="Search employee name, code, email..."
      :active-filter-count="filterEmployeeId ? 1 : 0"
      @refresh="reload"
    >
      <template #actions>
        <router-link
          v-if="permissions.can('attendance.punch')"
          to="/hrms/attendance/punch"
          class="btn-primary text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          Punch In / Out
        </router-link>

        <button
          v-if="permissions.can('attendance.mark') && isAdminOrManager"
          type="button"
          class="btn-secondary text-xs px-3 py-2 rounded-lg flex items-center gap-1.5"
          @click="openBulkMarkModal = true"
        >
          Bulk Mark
        </button>
      </template>

      <template #filters>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs font-semibold text-secondary-text">Period:</span>
          <div class="w-28">
            <BaseSelect
              v-model="hrms.hrmsMonth"
              :options="monthOptions"
              custom-class="!h-8.5 !py-1 text-xs rounded-lg bg-card-background border border-primary-border/60"
              @update:model-value="reload"
            />
          </div>
          <div class="w-24">
            <BaseSelect
              v-model="hrms.hrmsYear"
              :options="yearOptions"
              custom-class="!h-8.5 !py-1 text-xs rounded-lg bg-card-background border border-primary-border/60"
              @update:model-value="reload"
            />
          </div>
        </div>
      </template>
    </PageTopBar>

    <!-- Admin / Manager KPI Summary Bar (when user has view scope ALL or TEAM) -->
    <div v-if="isAdminOrManager && attendanceSummary" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-3.5 rounded-xl border border-primary-border bg-card-background">
        <span class="text-[11px] text-secondary-text uppercase font-semibold">Total Records</span>
        <p class="text-xl font-bold text-primary-text mt-1">{{ attendanceSummary.total ?? "—" }}</p>
      </div>
      <div class="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
        <span class="text-[11px] text-emerald-600 uppercase font-semibold">Present</span>
        <p class="text-xl font-bold text-emerald-700 mt-1">{{ attendanceSummary.present ?? attendanceSummary.status_counts?.PRESENT ?? 0 }}</p>
      </div>
      <div class="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5">
        <span class="text-[11px] text-red-600 uppercase font-semibold">Absent</span>
        <p class="text-xl font-bold text-red-700 mt-1">{{ attendanceSummary.absent ?? attendanceSummary.status_counts?.ABSENT ?? 0 }}</p>
      </div>
      <div class="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
        <span class="text-[11px] text-amber-600 uppercase font-semibold">Half Day / Leave</span>
        <p class="text-xl font-bold text-amber-700 mt-1">
          {{ (attendanceSummary.half_day || attendanceSummary.status_counts?.HALF_DAY || 0) + (attendanceSummary.leave || attendanceSummary.status_counts?.LEAVE || 0) }}
        </p>
      </div>
    </div>

    <!-- Admin View Tabs (Calendar View vs Table Records vs Petitions) -->
    <div v-if="isAdminOrManager" class="flex border-b border-primary-border space-x-6 text-sm font-medium">
      <button
        type="button"
        class="pb-2.5 transition-colors relative"
        :class="activeTab === 'calendar' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-secondary-text hover:text-primary-text'"
        @click="activeTab = 'calendar'"
      >
        Calendar Grid
      </button>
      <button
        type="button"
        class="pb-2.5 transition-colors relative"
        :class="activeTab === 'records' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-secondary-text hover:text-primary-text'"
        @click="switchToRecordsTab"
      >
        Records Log
      </button>
      <button
        type="button"
        class="pb-2.5 transition-colors relative"
        :class="activeTab === 'petitions' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-secondary-text hover:text-primary-text'"
        @click="switchToPetitionsTab"
      >
        <span class="inline-flex items-center gap-1.5">
          <FilePenLine class="w-3.5 h-3.5" />
          <span>Correction Petitions</span>
        </span>
      </button>
    </div>

    <!-- ── TAB 1: CALENDAR VIEW ── -->
    <div v-if="activeTab === 'calendar'" class="space-y-4">
      <!-- LEVEL 1: Employee Monthly Summary List + Daily Strip -->
      <template v-if="!selectedCalendarEmployeeId">
        <div v-if="!hrms.attendanceEmployeeSummaries?.items?.length" class="p-10 text-center text-sm text-secondary-text border border-primary-border rounded-2xl bg-card-background">
          No attendance records found for this period.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="item in hrms.attendanceEmployeeSummaries.items"
            :key="item.employee_id"
            class="border border-primary-border rounded-2xl p-4 bg-card-background hover:border-primary/50 transition-all cursor-pointer space-y-3"
            @click="selectCalendarEmployee(item.employee_id)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-primary-text truncate">
                    {{ item.employee?.user?.name ?? `Employee #${item.employee_id}` }}
                  </span>
                  <span v-if="item.employee?.employee_code" class="text-[11px] font-medium text-secondary-text bg-surface-subtle px-2 py-0.5 rounded">
                    {{ item.employee.employee_code }}
                  </span>
                </div>
                <p class="text-[11px] text-secondary-text truncate mt-0.5">
                  {{ [item.employee?.designation?.name, item.employee?.department?.name, item.employee?.work_location?.name].filter(Boolean).join(" · ") || item.employee?.user?.email }}
                </p>
              </div>

              <!-- Summary Pills -->
              <div class="flex items-center gap-2 flex-wrap text-[11px]">
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">P: {{ item.summary?.present ?? 0 }}</span>
                <span class="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-semibold">A: {{ item.summary?.absent ?? 0 }}</span>
                <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">HD: {{ item.summary?.half_day ?? 0 }}</span>
                <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">L: {{ item.summary?.leave ?? 0 }}</span>
                <span class="px-2 py-0.5 rounded-full bg-surface-subtle text-secondary-text font-medium">
                  {{ Math.round((item.summary?.total_worked_minutes ?? 0) / 60) }}h
                </span>
              </div>
            </div>

            <!-- Compact Daily Strip -->
            <div v-if="item.daily_strip?.length" class="flex items-center gap-1 flex-wrap pt-2 border-t border-primary-border/50">
              <span
                v-for="d in item.daily_strip"
                :key="d.date"
                class="w-3 h-3 rounded-xs"
                :class="stripDotClass(d.status)"
                :title="`${d.date}: ${d.status}`"
              ></span>
            </div>
          </div>
        </div>
      </template>

      <!-- LEVEL 2: Selected Employee Month Calendar Detail -->
      <template v-else>
        <div class="border border-primary-border rounded-2xl p-4 bg-card-background space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-primary-border/60 pb-3">
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="btn-secondary text-xs px-2.5 py-1.5 rounded-lg"
                @click="clearSelectedCalendarEmployee"
              >
                ← Back
              </button>
              <div>
                <h3 class="text-sm font-semibold text-primary-text">
                  {{ hrms.employeeMonthCalendar?.employee?.user?.name ?? `Employee #${selectedCalendarEmployeeId}` }}
                  <span v-if="hrms.employeeMonthCalendar?.employee?.employee_code" class="text-xs font-normal text-secondary-text">
                    ({{ hrms.employeeMonthCalendar.employee.employee_code }})
                  </span>
                </h3>
                <p class="text-[11px] text-secondary-text">
                  {{ [hrms.employeeMonthCalendar?.employee?.designation?.name, hrms.employeeMonthCalendar?.employee?.department?.name].filter(Boolean).join(" · ") }}
                </p>
              </div>
            </div>

            <div v-if="hrms.employeeMonthCalendar?.summary" class="flex items-center gap-2 flex-wrap text-[11px]">
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">Present: {{ hrms.employeeMonthCalendar.summary.present }}</span>
              <span class="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 font-semibold">Absent: {{ hrms.employeeMonthCalendar.summary.absent }}</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-semibold">Half Day: {{ hrms.employeeMonthCalendar.summary.half_day }}</span>
              <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-semibold">Leave: {{ hrms.employeeMonthCalendar.summary.leave }}</span>
            </div>
          </div>

          <!-- 7-column day cell grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            <div
              v-for="day in hrms.employeeMonthCalendar?.days || []"
              :key="day.date"
              class="p-2.5 rounded-xl border text-left text-xs min-h-[76px] transition-all flex flex-col justify-between cursor-pointer hover:shadow-xs"
              :class="dayCellClass(day)"
              @click="selectDay(selectedCalendarEmployeeId, day)"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs">{{ day.date?.slice?.(8) || day.date }}</span>
                  <span class="text-[9px] font-semibold uppercase px-1 py-0.5 rounded" :class="statusBadgeMiniClass(day.status)">
                    {{ day.status }}
                  </span>
                </div>
                <p v-if="day.holiday_name" class="text-[10px] text-primary-blue truncate font-medium mt-1">
                  {{ day.holiday_name }}
                </p>
                <p v-else-if="day.leave_type" class="text-[10px] text-blue-600 truncate font-medium mt-1">
                  {{ day.leave_type }}
                </p>
              </div>

              <div class="space-y-0.5 text-[10px] opacity-80 pt-1 border-t border-primary-border/30">
                <div v-if="day.check_in_at" class="truncate">In: {{ shortTime(day.check_in_at) }}</div>
                <div v-if="day.check_out_at" class="truncate">Out: {{ shortTime(day.check_out_at) }}</div>
                <div v-if="day.worked_minutes != null" class="font-medium text-primary-text">
                  Worked: {{ day.worked_minutes }}m
                </div>
                <div v-if="!day.check_in_at && !day.holiday_name && day.status === 'ABSENT'" class="text-red-500">
                  No Punch
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- ── TAB 2: RECORDS LOG (ADMIN/MANAGER TABLE) ── -->
    <div v-if="activeTab === 'records'" class="space-y-4">
      <div class="border border-primary-border rounded-2xl bg-card-background overflow-hidden">
        <div class="p-4 border-b border-primary-border flex flex-wrap items-center justify-between gap-3">
          <h3 class="text-sm font-semibold text-primary-text">Detailed Attendance Logs</h3>
          <button type="button" class="btn-secondary text-xs px-3 py-1.5 rounded-lg" @click="fetchRecords">
            Refresh Logs
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="bg-primary-background/40 border-b border-primary-border text-secondary-text uppercase font-semibold">
              <tr>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Employee</th>
                <th class="px-4 py-3">Status</th>
                <th class="px-4 py-3">Check-In</th>
                <th class="px-4 py-3">Check-Out</th>
                <th class="px-4 py-3">Minutes</th>
                <th class="px-4 py-3">Source</th>
                <th class="px-4 py-3">Reason</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-primary-border/60">
              <tr v-if="!hrms.attendanceRows?.length" class="text-center">
                <td colspan="9" class="py-8 text-secondary-text">No attendance records found.</td>
              </tr>
              <tr v-for="row in hrms.attendanceRows" :key="row.id" class="hover:bg-primary-background/20">
                <td class="px-4 py-3 font-medium whitespace-nowrap">{{ row.attendance_date }}</td>
                <td class="px-4 py-3">
                  <div class="leading-tight">
                    <div class="font-semibold text-primary-text">{{ row.employee?.user?.name ?? `#${row.employee_id}` }}</div>
                    <div v-if="row.employee?.employee_code" class="text-[11px] text-secondary-text">{{ row.employee.employee_code }}</div>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold border" :class="statusBadgeMiniClass(row.status)">
                    {{ row.status }}
                  </span>
                </td>
                <td class="px-4 py-3">{{ row.check_in_at ? shortTime(row.check_in_at) : "—" }}</td>
                <td class="px-4 py-3">{{ row.check_out_at ? shortTime(row.check_out_at) : "—" }}</td>
                <td class="px-4 py-3">{{ row.worked_minutes != null ? row.worked_minutes + "m" : "—" }}</td>
                <td class="px-4 py-3">
                  <div class="leading-tight">
                    <div class="text-primary-text">{{ row.source }}</div>
                    <div v-if="row.marker?.name" class="text-[11px] text-secondary-text">by {{ row.marker.name }}</div>
                  </div>
                </td>
                <td class="px-4 py-3 text-secondary-text max-w-[180px] truncate">{{ row.reason || row.remarks || "—" }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="permissions.can('attendance.correct')"
                    type="button"
                    class="text-xs text-primary hover:underline font-medium"
                    @click="openCorrectionModalForRow(row)"
                  >
                    Correct
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ── TAB 3: CORRECTION PETITIONS TAB ── -->
    <div v-if="activeTab === 'petitions'" class="space-y-4">
      <div class="border border-primary-border rounded-2xl bg-card-background overflow-hidden">
        <div class="p-4 border-b border-primary-border flex items-center justify-between">
          <h3 class="text-sm font-semibold text-primary-text">Correction Petitions</h3>
          <button type="button" class="btn-secondary text-xs px-3 py-1.5 rounded-lg" @click="fetchPetitions">
            Refresh
          </button>
        </div>

        <div class="divide-y divide-primary-border/60">
          <div v-if="!hrms.attendanceCorrections?.length" class="p-8 text-center text-xs text-secondary-text">
            No correction petitions at this time.
          </div>
          <div
            v-for="p in hrms.attendanceCorrections"
            :key="p.id"
            class="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-primary-background/20"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-xs text-primary-text">
                  {{ p.employee?.user?.name ?? `Employee #${p.employee_id}` }}
                </span>
                <span v-if="p.employee?.employee_code" class="text-[11px] text-secondary-text bg-surface-subtle px-1.5 py-0.5 rounded">
                  {{ p.employee.employee_code }}
                </span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full border font-semibold"
                  :class="p.status === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : p.status === 'REJECTED'
                      ? 'bg-red-500/10 text-red-600 border-red-500/30'
                      : 'bg-surface-subtle text-secondary-text border-primary-border'"
                >
                  {{ p.status }}
                </span>
              </div>
              <p class="text-xs text-secondary-text">
                <span v-if="p.old_status" class="line-through opacity-70 mr-1">{{ p.old_status }}</span>
                <span v-if="p.old_status" class="mr-1">→</span>
                <strong class="text-primary-text">{{ p.proposed_status || p.requested_status }}</strong>
                <span v-if="p.reason"> · {{ p.reason }}</span>
              </p>
              <p v-if="p.remarks || p.requester?.name" class="text-[11px] text-secondary-text">
                <span v-if="p.remarks">{{ p.remarks }}</span>
                <span v-if="p.remarks && p.requester?.name"> · </span>
                <span v-if="p.requester?.name">Requested by {{ p.requester.name }}</span>
              </p>
            </div>

            <div v-if="p.status === 'PENDING' && permissions.can('attendance_correction.approve')" class="flex items-center gap-2">
              <button
                type="button"
                class="btn-primary text-xs px-3 py-1.5 rounded-lg"
                :disabled="hrms.actionLoading"
                @click="approvePetition(p.id)"
              >
                Approve
              </button>
              <button
                type="button"
                class="btn-secondary text-xs px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50"
                :disabled="hrms.actionLoading"
                @click="rejectPetition(p.id)"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── DAY DETAILS & MARK / PETITION MODAL ── -->
    <div v-if="markOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="markOpen = false">
      <div class="bg-card-background border border-primary-border rounded-2xl w-full max-w-md p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <div>
            <h3 class="title-text text-sm font-semibold text-primary-text">
              {{ isAdminOrManager ? (isCorrection ? "Correct Attendance (Instant Override)" : "Mark Day Attendance") : "Submit Correction Request" }}
            </h3>
            <p class="text-xs text-secondary-text">Employee #{{ selected.employee_id }} · Date: {{ selected.date }}</p>
          </div>
          <button type="button" class="text-secondary-text hover:text-primary-text text-sm" @click="markOpen = false">✕</button>
        </div>

        <form class="space-y-3" @submit.prevent="submitDayAction">
          <div class="block space-y-1">
            <span class="text-xs font-medium text-secondary-text">Target Status</span>
            <BaseSelect
              v-model="markForm.status"
              :options="markStatusOptions"
              custom-class="!py-2 text-xs w-full rounded-lg"
            />
          </div>

          <label class="block space-y-1">
            <span class="text-xs font-medium text-secondary-text">
              {{ (isCorrection || !isAdminOrManager) ? "Reason (Required)" : "Reason" }}
            </span>
            <input
              v-model="markForm.reason"
              class="input-field px-3 py-2 text-xs w-full rounded-lg"
              :placeholder="isAdminOrManager ? 'e.g. Geofence rejected false positive' : 'e.g. Was on site, forgot to punch checkout'"
              :required="isCorrection || !isAdminOrManager"
            />
          </label>

          <label class="block space-y-1">
            <span class="text-xs font-medium text-secondary-text">Remarks (Optional)</span>
            <input v-model="markForm.remarks" class="input-field px-3 py-2 text-xs w-full rounded-lg" placeholder="Additional audit notes" />
          </label>

          <div class="flex justify-end gap-2 pt-2 border-t border-primary-border">
            <button type="button" class="btn-secondary text-xs px-3.5 py-1.5 rounded-lg" @click="markOpen = false">Cancel</button>
            <button type="submit" class="btn-primary text-xs px-4 py-1.5 rounded-lg" :disabled="hrms.actionLoading">
              {{ hrms.actionLoading ? "Saving..." : (isAdminOrManager ? "Save Attendance" : "Submit Petition") }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── BULK MARK MODAL (HR / ADMIN) ── -->
    <div v-if="openBulkMarkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" @click.self="openBulkMarkModal = false">
      <div class="bg-card-background border border-primary-border rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-primary-border pb-3">
          <div>
            <h3 class="title-text text-sm font-semibold text-primary-text">Bulk Mark Attendance</h3>
            <p class="text-xs text-secondary-text">Apply attendance status across multiple employees for a date.</p>
          </div>
          <button type="button" class="text-secondary-text hover:text-primary-text" @click="openBulkMarkModal = false">✕</button>
        </div>

        <form class="space-y-3" @submit.prevent="submitBulkMark">
          <div class="grid grid-cols-2 gap-3">
            <div class="block space-y-1">
              <span class="text-xs font-medium text-secondary-text">Attendance Date</span>
              <BaseDatePicker
                v-model="bulkForm.date"
                placeholder="Select date"
                custom-class="!py-2 text-xs w-full rounded-lg"
              />
            </div>
            <div class="block space-y-1">
              <span class="text-xs font-medium text-secondary-text">Status</span>
              <BaseSelect
                v-model="bulkForm.status"
                :options="markStatusOptions"
                custom-class="!py-2 text-xs w-full rounded-lg"
              />
            </div>
          </div>

          <div class="block space-y-1">
            <span class="text-xs font-medium text-secondary-text">Employees</span>
            <BaseSelect
              v-model="bulkForm.employeeIds"
              :options="employeeSelectOptions"
              multiple
              searchable
              placeholder="Search and select employees..."
              custom-class="!py-1.5 text-xs w-full rounded-lg"
              @search="searchEmployeesForBulk"
            />
          </div>

          <label class="block space-y-1">
            <span class="text-xs font-medium text-secondary-text">Reason / Remarks</span>
            <input v-model="bulkForm.reason" class="input-field px-3 py-2 text-xs w-full rounded-lg" placeholder="Bulk update reason" />
          </label>

          <div class="flex justify-end gap-2 pt-2 border-t border-primary-border">
            <button type="button" class="btn-secondary text-xs px-3.5 py-1.5 rounded-lg" @click="openBulkMarkModal = false">Cancel</button>
            <button type="submit" class="btn-primary text-xs px-4 py-1.5 rounded-lg" :disabled="hrms.actionLoading">
              {{ hrms.actionLoading ? "Processing..." : "Apply Bulk Mark" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { FilePenLine } from "lucide-vue-next";
import { useGlobalSearchStore } from "@/stores/ui/globalSearch";
import BaseSelect from "@/components/common/BaseSelect.vue";
import BaseDatePicker from "@/components/common/BaseDatePicker.vue";
import { useHrmsStore } from "@/stores/hrms/hrms";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useAuthStore } from "@/stores/auth/auth";

const hrms = useHrmsStore();
const globalSearch = useGlobalSearchStore();
let unregisterGlobalSearch = null;

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - 2 + i;
  return { label: String(y), value: y };
});

onMounted(() => {
  unregisterGlobalSearch = globalSearch.register((q) => {
    hrms.fetchAttendanceEmployeeSummaries(q ? { q } : {});
  }, "Search employee name, code, email...");
});

onUnmounted(() => {
  if (unregisterGlobalSearch) unregisterGlobalSearch();
});
const permissions = usePermissionsStore();
const auth = useAuthStore();

const scope = computed(() => permissions.scopeOf("attendance.view"));
const isAdminOrManager = computed(() => scope.value === "ALL" || scope.value === "TEAM");

const activeTab = ref("calendar");
const filterEmployeeId = ref(null);
const markOpen = ref(false);
const openBulkMarkModal = ref(false);
const isCorrection = ref(false);

const selected = reactive({ employee_id: null, date: "", attendance_id: null });
const markForm = reactive({ status: "PRESENT", reason: "", remarks: "" });
const bulkForm = reactive({ date: new Date().toISOString().slice(0, 10), status: "PRESENT", employeeIds: [], reason: "" });

const employeeSelectOptions = computed(() =>
  (hrms.employees || []).map((emp) => ({
    label: `${emp.user?.name || emp.employee_code} (${emp.employee_code})`,
    value: emp.id,
  }))
);

let empSearchTimer = null;
const searchEmployeesForBulk = (q) => {
  if (empSearchTimer) clearTimeout(empSearchTimer);
  empSearchTimer = setTimeout(() => {
    hrms.fetchEmployees({ limit: 10, ...(q ? { q } : {}) }, true);
  }, 250);
};

watch(openBulkMarkModal, (open) => {
  if (open && !hrms.employees?.length) {
    hrms.fetchEmployees({ limit: 10 }, true);
  }
});

const markStatuses = ["PRESENT", "ABSENT", "HALF_DAY", "WFH", "ON_DUTY", "LEAVE"];
const markStatusOptions = markStatuses.map((s) => ({ label: s, value: s }));
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthOptions = months.map((m, idx) => ({ label: m, value: idx + 1 }));

const calendarEmployees = computed(() => hrms.attendanceCalendar || []);
const attendanceSummary = computed(() => hrms.attendanceSummary);

const shortTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const dayCellClass = (day) => {
  if (day.week_off || day.status === "WEEK_OFF") return "border-primary-border/60 bg-secondary-background/50 text-secondary-text";
  if (day.status === "HOLIDAY") return "border-blue-500/30 bg-blue-500/5 text-blue-700";
  if (day.status === "PRESENT") return "border-emerald-500/30 bg-emerald-500/5";
  if (day.status === "ABSENT") return "border-red-500/30 bg-red-500/5";
  if (day.status === "LEAVE") return "border-purple-500/30 bg-purple-500/5";
  if (day.status === "HALF_DAY") return "border-amber-500/30 bg-amber-500/5";
  return "border-primary-border bg-card-background";
};

const statusBadgeMiniClass = (status) => {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-500/10 text-emerald-600";
    case "ABSENT":
      return "bg-red-500/10 text-red-600";
    case "HALF_DAY":
      return "bg-amber-500/10 text-amber-600";
    case "LEAVE":
      return "bg-purple-500/10 text-purple-600";
    case "HOLIDAY":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-secondary-background text-secondary-text";
  }
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

const openCorrectionModalForRow = (row) => {
  selected.employee_id = row.employee_id;
  selected.date = row.attendance_date;
  selected.attendance_id = row.id || row.attendance_id;
  isCorrection.value = true;
  markForm.status = row.status || "PRESENT";
  markForm.reason = "";
  markForm.remarks = "";
  markOpen.value = true;
};

const selectedCalendarEmployeeId = ref(null);

const selectCalendarEmployee = (employeeId) => {
  selectedCalendarEmployeeId.value = employeeId;
  hrms.fetchEmployeeMonthCalendar(employeeId);
};

const clearSelectedCalendarEmployee = () => {
  selectedCalendarEmployeeId.value = null;
  hrms.employeeMonthCalendar = null;
};

const stripDotClass = (status) => {
  if (status === "PRESENT") return "bg-emerald-500";
  if (status === "ABSENT") return "bg-red-500";
  if (status === "HALF_DAY") return "bg-amber-500";
  if (status === "LEAVE") return "bg-blue-500";
  if (status === "HOLIDAY") return "bg-purple-500";
  return "bg-surface-container";
};

const reload = () => {
  const params = {};
  if (filterEmployeeId.value) params.employee_id = filterEmployeeId.value;
  hrms.fetchAttendanceEmployeeSummaries(params);
  if (selectedCalendarEmployeeId.value) {
    hrms.fetchEmployeeMonthCalendar(selectedCalendarEmployeeId.value);
  }
  if (isAdminOrManager.value) {
    hrms.fetchAttendanceSummary(params);
  }
};

const switchToRecordsTab = () => {
  activeTab.value = "records";
  fetchRecords();
};

const switchToPetitionsTab = () => {
  activeTab.value = "petitions";
  fetchPetitions();
};

const fetchRecords = () => {
  hrms.fetchAttendanceRows();
};

const fetchPetitions = () => {
  hrms.fetchAttendanceCorrections();
};

const approvePetition = async (id) => {
  await hrms.approveAttendanceCorrection(id);
};

const rejectPetition = async (id) => {
  const reason = prompt("Enter rejection reason:");
  if (reason) {
    await hrms.rejectAttendanceCorrection(id, { reason });
  }
};

const submitDayAction = async () => {
  if (isAdminOrManager.value) {
    // Admin Instant Correction or Mark
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
  } else {
    // Employee petition submission
    await hrms.createAttendanceCorrectionPetition(selected.attendance_id, {
      requested_status: markForm.status,
      reason: markForm.reason,
      remarks: markForm.remarks || null,
    });
  }
  markOpen.value = false;
};

const submitBulkMark = async () => {
  const ids = Array.isArray(bulkForm.employeeIds)
    ? bulkForm.employeeIds.map(Number).filter(Boolean)
    : [];
  if (!ids.length) {
    alert("Please enter at least one valid Employee ID.");
    return;
  }
  const items = ids.map((id) => ({
    employee_id: id,
    attendance_date: bulkForm.date,
    status: bulkForm.status,
    reason: bulkForm.reason || "Bulk mark update",
  }));
  await hrms.bulkMarkAttendance({ items });
  openBulkMarkModal.value = false;
};

watch([() => hrms.hrmsMonth, () => hrms.hrmsYear], reload);

onMounted(() => {
  if (scope.value === "SELF" && auth.currentEmployee?.id) {
    filterEmployeeId.value = auth.currentEmployee.id;
  }
  reload();
});
</script>
