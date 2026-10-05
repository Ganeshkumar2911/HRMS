<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-xl">
      <div class="flex items-center justify-between px-5 py-4 border-b border-primary-border/60">
        <div>
          <h3 class="title-text text-sm text-primary-text">Effective permissions</h3>
          <p class="sub-text text-secondary-text mt-0.5">
            Loaded from <code class="text-[11px]">GET /users/me/permissions</code>
          </p>
        </div>
        <button
          type="button"
          class="btn-icon p-1.5 text-secondary-text hover:text-primary-text rounded-lg"
          @click="$emit('update:modelValue', false)"
        >
          <span class="material-symbols-rounded text-xl">close</span>
        </button>
      </div>

      <div class="p-4 overflow-y-auto no-scrollbar space-y-2">
        <div v-if="permissionsStore.loading" class="py-8 text-center text-xs text-secondary-text">
          Loading permissions…
        </div>
        <div
          v-else-if="permissionsStore.permissions.length === 0"
          class="py-8 text-center text-xs text-secondary-text"
        >
          No permissions returned for this account.
        </div>
        <div
          v-for="permission in permissionsStore.permissions"
          :key="permission.code"
          class="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-primary-border/50"
        >
          <code class="text-xs text-primary-text">{{ permission.code }}</code>
          <span
            v-if="permission.scope"
            class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            :class="{
              'bg-primary-green/15 text-primary-green': permission.scope === 'ALL',
              'bg-primary-blue/15 text-primary-blue': permission.scope === 'TEAM',
              'bg-primary-yellow/15 text-primary-yellow': permission.scope === 'SELF',
            }"
          >
            {{ permission.scope }}
          </span>
          <span v-else class="text-[10px] text-secondary-text">—</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePermissionsStore } from "@/stores/rbac/permissions";

defineProps({
  modelValue: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);

const permissionsStore = usePermissionsStore();
</script>
