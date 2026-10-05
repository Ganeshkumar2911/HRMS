<template>
  <div>
    <!-- Access Check: role.view or role.assign -->
    <div v-if="!permissionsStore.can('role.view') && !permissionsStore.can('role.assign')" class="p-8">
      <NoPermissionsState @retry="permissionsStore.setRole('Admin')" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span class="material-symbols-rounded text-base">security</span>
            <span>Role-Based Access Control</span>
          </div>
          <h1 class="title-text text-primary-text">Roles &amp; Permissions</h1>
          <p class="sub-text text-secondary-text">
            Configure system roles, granular capability codes, and HRMS data scopes.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            Capability: role.assign
          </span>
        </div>
      </div>

      <!-- Scope Hierarchy Guide -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-2">
          <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">HRMS Scope Hierarchy</h3>
          <p class="text-xs text-secondary-text leading-relaxed">
            For employee-scoped resources (<code class="font-mono text-xs">employee</code>, <code class="font-mono text-xs">attendance</code>, <code class="font-mono text-xs">leave_request</code>, <code class="font-mono text-xs">leave_balance</code>), widest scope wins across assigned roles:
          </p>
          <div class="flex items-center gap-2 text-xs font-mono font-bold">
            <span class="px-2 py-0.5 rounded bg-primary-green/10 text-primary-green">ALL</span>
            <span>&gt;</span>
            <span class="px-2 py-0.5 rounded bg-primary-blue/10 text-primary-blue">TEAM</span>
            <span>&gt;</span>
            <span class="px-2 py-0.5 rounded bg-primary-yellow/10 text-primary-yellow">SELF</span>
            <span>&gt;</span>
            <span class="px-2 py-0.5 rounded bg-secondary-text/10 text-secondary-text">null</span>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-2">
          <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">Independent Hierarchies</h3>
          <p class="text-xs text-secondary-text leading-relaxed">
            Reporting hierarchy (<code class="font-mono text-xs">employees.manager_id</code>) is completely independent of RBAC role names. Server remains single source of truth for authorization.
          </p>
        </div>
      </div>

      <!-- Roles Canvas -->
      <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-95 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span class="material-symbols-rounded text-3xl">admin_panel_settings</span>
        </div>
        <h2 class="title-text text-primary-text mb-1">Roles Admin Canvas</h2>
        <p class="sub-text text-secondary-text max-w-md mb-6">
          Ready for Role listing, creation, permission matrix editor, and user assignment.
        </p>
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
          <span>Route: /admin/roles &bull; Requires: role.assign</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePermissionsStore } from "@/stores/rbac/permissions";
import NoPermissionsState from "@/components/common/NoPermissionsState.vue";

const permissionsStore = usePermissionsStore();
</script>
