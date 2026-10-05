<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">task_alt</span>
          <span>Workflow</span>
        </div>
        <h1 class="title-text text-primary-text">Tasks Workspace</h1>
        <p class="sub-text text-secondary-text">
          Task assignment and tracking governed by ownership rule.
        </p>
      </div>

      <!-- Scope note -->
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card-background border border-primary-border text-xs text-secondary-text">
        <span class="material-symbols-rounded text-sm text-primary">policy</span>
        <span>Visibility: <code class="font-mono text-primary font-semibold">created_by = me OR assigned_to = me</code></span>
      </div>
    </div>

    <!-- Ownership Rules & Identity Context -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">badge</span>
          <span>Actor User ID</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">{{ authStore.currentUser?.name }}</p>
        <p class="text-[11px] text-secondary-text font-mono">id: {{ authStore.currentUser?.id }} &bull; email: {{ authStore.currentUser?.email }}</p>
      </div>

      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">shield</span>
          <span>Task Capabilities</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">Not Scope-Aware</p>
        <p class="text-[11px] text-secondary-text">Independent of HRMS ALL / TEAM / SELF</p>
      </div>

      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">edit_note</span>
          <span>Permission Checks</span>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded" :class="permissionsStore.can('task.create') ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'">
            task.create: {{ permissionsStore.can('task.create') ? 'YES' : 'NO' }}
          </span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded" :class="permissionsStore.can('task.assign') ? 'bg-primary-green/10 text-primary-green' : 'bg-primary-red/10 text-primary-red'">
            task.assign: {{ permissionsStore.can('task.assign') ? 'YES' : 'NO' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tasks Workspace Canvas -->
    <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <span class="material-symbols-rounded text-3xl">checklist</span>
      </div>
      <h2 class="title-text text-primary-text mb-1">Tasks Module Canvas</h2>
      <p class="sub-text text-secondary-text max-w-md mb-6">
        App shell shared contracts, identity binding, and task ownership rules are established for the Tasks module.
      </p>
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
        <span>Route: /tasks &bull; User ID: {{ authStore.currentUser?.id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth/auth";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const authStore = useAuthStore();
const permissionsStore = usePermissionsStore();
</script>
