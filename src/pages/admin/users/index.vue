<template>
  <div>
    <!-- Access Check: user.view -->
    <div v-if="!permissionsStore.can('user.view')" class="p-8">
      <NoPermissionsState @retry="permissionsStore.setRole('Admin')" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span class="material-symbols-rounded text-base">manage_accounts</span>
            <span>Administration</span>
          </div>
          <h1 class="title-text text-primary-text">User Accounts</h1>
          <p class="sub-text text-secondary-text">
            Manage system logins, credentials, and user lifecycle.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            Capability: user.view
          </span>
        </div>
      </div>

      <!-- Identity vs Employee Explanation -->
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 flex items-start gap-3">
        <span class="material-symbols-rounded text-primary text-xl mt-0.5">info</span>
        <div class="text-xs space-y-1">
          <p class="font-semibold text-primary-text">Identity Architecture Note</p>
          <p class="text-secondary-text leading-relaxed">
            Same account powers Chat + HRMS + Tasks + Admin. Creating a user does <strong>not</strong> create an employee — HR links them later in the HRMS Employees directory.
          </p>
        </div>
      </div>

      <!-- Users Canvas -->
      <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-95 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span class="material-symbols-rounded text-3xl">group</span>
        </div>
        <h2 class="title-text text-primary-text mb-1">Users Admin Canvas</h2>
        <p class="sub-text text-secondary-text max-w-md mb-6">
          Ready for Users list, create, and detail views. Protected by permission gating.
        </p>
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
          <span>Route: /admin/users &bull; Active Role: {{ permissionsStore.activeRole }}</span>
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
