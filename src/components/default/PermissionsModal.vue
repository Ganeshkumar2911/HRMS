<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-xl w-full p-6 shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-primary-border/60">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span class="material-symbols-rounded text-lg">admin_panel_settings</span>
          </div>
          <div>
            <h3 class="title-text text-primary-text">Permission & Scope Inspector</h3>
            <p class="sub-text text-secondary-text">Client permission store & HRMS scopes</p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
        >
          <span class="material-symbols-rounded text-xl">close</span>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="py-4 space-y-5 overflow-y-auto no-scrollbar flex-1">
        <!-- Role Simulator -->
        <div>
          <label class="block text-xs font-semibold text-primary-text mb-2">Simulate Role Preset</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              v-for="role in ['Admin', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']"
              :key="role"
              type="button"
              @click="permissionsStore.setRole(role)"
              class="px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer"
              :class="permissionsStore.activeRole === role
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-background text-secondary-text border-primary-border hover:border-primary-text hover:text-primary-text'"
            >
              {{ role }}
            </button>
          </div>
          <p class="text-[11px] text-secondary-text mt-1.5">
            Until a server bootstrap API exists, navigation is gated by capability and role heuristics.
          </p>
        </div>

        <!-- Scope Hierarchy Legend -->
        <div class="p-3 rounded-lg bg-background border border-primary-border/60 space-y-1.5 text-xs">
          <div class="font-semibold text-primary-text flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary">shield</span>
            <span>Scope Resolution Rule: Widest Scope Wins</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-secondary-text">
            <span class="px-1.5 py-0.5 rounded bg-primary-green/10 text-primary-green font-semibold">ALL</span>
            <span>&gt;</span>
            <span class="px-1.5 py-0.5 rounded bg-primary-blue/10 text-primary-blue font-semibold">TEAM</span>
            <span>&gt;</span>
            <span class="px-1.5 py-0.5 rounded bg-primary-yellow/10 text-primary-yellow font-semibold">SELF</span>
            <span>&gt;</span>
            <span class="px-1.5 py-0.5 rounded bg-secondary-text/10 text-secondary-text font-semibold">null</span>
          </div>
        </div>

        <!-- Active Permissions List -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-primary-text">Active Capabilities ({{ permissionsStore.permissions.length }})</span>
            <span class="text-[11px] text-secondary-text">can(code) &amp; scopeOf(code)</span>
          </div>

          <div class="divide-y divide-primary-border/40 border border-primary-border/60 rounded-lg overflow-hidden bg-background max-h-56 overflow-y-auto">
            <div
              v-for="(item, idx) in permissionsStore.permissions"
              :key="idx"
              class="px-3 py-2 flex items-center justify-between text-xs hover:bg-card-background transition-colors"
            >
              <div class="flex items-center gap-2">
                <span class="material-symbols-rounded text-primary-green text-sm">check_circle</span>
                <code class="text-xs text-primary-text font-mono">{{ item.code }}</code>
              </div>
              <div>
                <span
                  v-if="item.scope"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded"
                  :class="{
                    'bg-primary-green/15 text-primary-green': item.scope === 'ALL',
                    'bg-primary-blue/15 text-primary-blue': item.scope === 'TEAM',
                    'bg-primary-yellow/15 text-primary-yellow': item.scope === 'SELF',
                  }"
                >
                  Scope: {{ item.scope }}
                </span>
                <span v-else class="text-[10px] text-secondary-text px-1.5 py-0.5 bg-card-background border border-primary-border/50 rounded">
                  Unrestricted
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="pt-4 border-t border-primary-border/60 flex justify-end">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="btn-primary px-4 py-2 text-xs"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePermissionsStore } from "@/stores/rbac/permissions";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);

const permissionsStore = usePermissionsStore();
</script>
