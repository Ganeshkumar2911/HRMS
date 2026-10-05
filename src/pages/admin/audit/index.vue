<template>
  <div>
    <!-- Access Check: audit.view -->
    <div v-if="!permissionsStore.can('audit.view')" class="p-8">
      <NoPermissionsState @retry="permissionsStore.setRole('Admin')" />
    </div>

    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <span class="material-symbols-rounded text-base">history</span>
            <span>Security &amp; Compliance</span>
          </div>
          <h1 class="title-text text-primary-text">Audit Trail</h1>
          <p class="sub-text text-secondary-text">
            Immutable log of system actions, role modifications, and authentication events.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            Capability: audit.view
          </span>
        </div>
      </div>

      <!-- Pagination convention card -->
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 flex items-start gap-3">
        <span class="material-symbols-rounded text-primary text-xl mt-0.5">dataset</span>
        <div class="text-xs space-y-1">
          <p class="font-semibold text-primary-text">Response Convention: Offset Pagination</p>
          <p class="text-secondary-text leading-relaxed">
            Audit API returns offset-paged results: <code class="font-mono text-xs">{ "items": [...], "pagination": { "limit", "offset", "has_more", "total" } }</code>.
          </p>
        </div>
      </div>

      <!-- Audit Canvas -->
      <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-95 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
          <span class="material-symbols-rounded text-3xl">list_alt</span>
        </div>
        <h2 class="title-text text-primary-text mb-1">Audit Log Canvas</h2>
        <p class="sub-text text-secondary-text max-w-md mb-6">
          Ready for offset-paginated audit trail visualization and filtering.
        </p>
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
          <span>Route: /admin/audit &bull; Requires: audit.view</span>
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
