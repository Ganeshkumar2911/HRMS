<template>
  <div class="space-y-6">
    <div class="pb-4 border-b border-primary-border/60 space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span class="material-symbols-rounded text-base">badge</span>
            <span>Human Resources</span>
          </div>
          <h1 class="title-text text-primary-text">HRMS</h1>
          <p class="sub-text text-secondary-text">
            Scope for employee.view:
            <span class="font-semibold text-primary-text">{{ employeeScope || "—" }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <select v-model.number="hrms.hrmsMonth" class="input-field px-2 py-1.5 text-xs w-28">
            <option v-for="m in 12" :key="m" :value="m">Month {{ m }}</option>
          </select>
          <input v-model.number="hrms.hrmsYear" type="number" class="input-field px-2 py-1.5 text-xs w-24" />
        </div>
      </div>

      <nav class="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors"
          :class="isActive(item.to)
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
        >
          {{ item.label }}
        </router-link>
      </nav>
    </div>

    <router-view />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePermissionsStore } from "@/stores/rbac/permissions";
import { useHrmsStore } from "@/stores/hrms/hrms";

const route = useRoute();
const permissions = usePermissionsStore();
const hrms = useHrmsStore();

const employeeScope = computed(() => permissions.scopeOf("employee.view"));

const allNav = [
  { to: "/hrms/me", label: "My profile", perm: "employee.view" },
  { to: "/hrms/employees", label: "Employees", perm: "employee.view" },
  { to: "/hrms/org/departments", label: "Departments", perm: "department.view" },
  { to: "/hrms/org/designations", label: "Designations", perm: "designation.view" },
  { to: "/hrms/org/work-locations", label: "Locations", perm: "work_location.view" },
  { to: "/hrms/holidays", label: "Holidays", perm: "holiday.view" },
  { to: "/hrms/attendance", label: "Attendance", perm: "attendance.view" },
  { to: "/hrms/leave", label: "Leave", perm: "leave_request.view" },
  { to: "/hrms/calendar", label: "Calendar", perm: "attendance.view" },
];

const navItems = computed(() => allNav.filter((item) => permissions.can(item.perm)));

const isActive = (path) => route.path === path || route.path.startsWith(`${path}/`);
</script>
