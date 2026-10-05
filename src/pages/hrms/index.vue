<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">groups</span>
          <span>Human Resources</span>
        </div>
        <h1 class="title-text text-primary-text">HRMS Workspace</h1>
        <p class="sub-text text-secondary-text">
          Employee management, attendance, leave requests, and organizational directory.
        </p>
      </div>

      <!-- Scope Badge -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-secondary-text">Resolved Data Scope:</span>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-bold"
          :class="{
            'bg-primary-green/15 text-primary-green': employeeScope === 'ALL',
            'bg-primary-blue/15 text-primary-blue': employeeScope === 'TEAM',
            'bg-primary-yellow/15 text-primary-yellow': employeeScope === 'SELF',
            'bg-secondary-text/10 text-secondary-text': !employeeScope
          }"
        >
          {{ employeeScope || 'RESTRICTED' }}
        </span>
      </div>
    </div>

    <!-- Identity & Scope Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- HR Identity Card -->
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
            <span class="material-symbols-rounded text-sm text-primary">badge</span>
            <span>HR Identity (<code class="font-mono text-xs">employees</code>)</span>
          </div>
          <span
            class="text-[10px] font-semibold px-2 py-0.5 rounded"
            :class="authStore.currentEmployee ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-yellow/10 text-primary-yellow'"
          >
            {{ authStore.currentEmployee ? 'LINKED' : 'UNLINKED' }}
          </span>
        </div>
        <p class="text-sm font-semibold text-primary-text">
          {{ authStore.currentEmployee?.first_name ? `${authStore.currentEmployee.first_name} ${authStore.currentEmployee.last_name || ''}` : 'No employee row found' }}
        </p>
        <p class="text-[11px] text-secondary-text">
          {{ authStore.currentEmployee ? `Code: ${authStore.currentEmployee.employee_code || authStore.currentEmployee.id} &bull; Dept: ${authStore.currentEmployee.department || 'General'}` : 'Creating a user does not create an employee. HR links them later.' }}
        </p>
      </div>

      <!-- Scope Resolution Card -->
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1.5">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">filter_alt</span>
          <span>Scope Resolution Hierarchy</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">ALL &gt; TEAM &gt; SELF</p>
        <p class="text-[11px] text-secondary-text">
          Current role (<span class="font-medium text-primary-text">{{ permissionsStore.activeRole }}</span>) resolves to
          <span class="font-semibold text-primary">{{ employeeScope }}</span> scope.
        </p>
      </div>

      <!-- Capability Matrix Card -->
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1.5">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">shield</span>
          <span>HRMS Capabilities</span>
        </div>
        <div class="grid grid-cols-2 gap-1 text-[11px]">
          <span :class="permissionsStore.can('employee.view') ? 'text-primary-green font-medium' : 'text-secondary-text'">
            &bull; employee.view
          </span>
          <span :class="permissionsStore.can('attendance.view') ? 'text-primary-green font-medium' : 'text-secondary-text'">
            &bull; attendance.view
          </span>
          <span :class="permissionsStore.can('leave_request.view') ? 'text-primary-green font-medium' : 'text-secondary-text'">
            &bull; leave.view
          </span>
          <span :class="permissionsStore.can('leave_request.approve') ? 'text-primary-green font-medium' : 'text-secondary-text'">
            &bull; leave.approve
          </span>
        </div>
      </div>
    </div>

    <!-- HRMS Canvas Placeholder -->
    <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-105 flex flex-col items-center justify-center p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <span class="material-symbols-rounded text-3xl">diversity_3</span>
      </div>
      <h2 class="title-text text-primary-text mb-1">HRMS Module Canvas</h2>
      <p class="sub-text text-secondary-text max-w-md mb-6">
        App shell shared contract: Login identity (<code class="font-mono text-xs">users.id = {{ authStore.currentUser?.id }}</code>) is ready for employee linkage, department directory, and attendance management.
      </p>
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
        <span>Route: /hrms/* &bull; Scope: {{ employeeScope }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();

const employeeScope = computed(() => {
  return permissionsStore.scopeOf("employee.view");
});
</script>
