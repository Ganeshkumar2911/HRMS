<template>
  <div class="space-y-6 max-w-2xl">
    <div class="pb-5 border-b border-primary-border/60">
      <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        <span class="material-symbols-rounded text-base">person</span>
        <span>Account</span>
      </div>
      <h1 class="title-text text-primary-text">My profile</h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 rounded-xl bg-card-background border border-primary-border space-y-2">
        <p class="text-xs text-secondary-text">User identity</p>
        <p class="text-sm font-semibold text-primary-text">{{ auth.currentUser?.name }}</p>
        <p class="text-xs text-secondary-text">{{ auth.currentUser?.email }}</p>
        <StatusBadge :status="auth.currentUser?.status" />
        <p class="text-[11px] text-secondary-text font-mono">id: {{ auth.currentUser?.id }}</p>
      </div>
      <div class="p-4 rounded-xl bg-card-background border border-primary-border space-y-2">
        <p class="text-xs text-secondary-text">Employee profile</p>
        <template v-if="auth.currentEmployee">
          <p class="text-sm font-semibold text-primary-text">{{ auth.currentEmployee.employee_code }}</p>
          <StatusBadge :status="auth.currentEmployee.employment_status" />
          <router-link to="/hrms/me" class="text-xs text-primary hover:underline">Open HRMS profile →</router-link>
        </template>
        <p v-else class="text-sm text-secondary-text">No employee profile linked.</p>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-card-background border border-primary-border">
      <p class="text-xs font-semibold text-primary-text mb-2">
        Effective permissions ({{ permissions.permissions.length }})
      </p>
      <div class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
        <code
          v-for="p in permissions.permissions"
          :key="p.code"
          class="text-[10px] px-2 py-1 rounded bg-background border border-primary-border"
        >
          {{ p.code }}{{ p.scope ? `:${p.scope}` : "" }}
        </code>
      </div>
    </div>
  </div>
</template>

<script setup>
import StatusBadge from "@/components/common/StatusBadge.vue";
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const auth = useAuthStore();
const permissions = usePermissionsStore();
</script>
