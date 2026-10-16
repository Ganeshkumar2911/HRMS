<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop Overlay -->
      <Transition name="backdrop">
        <div
          v-if="open"
          class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs cursor-pointer"
          @click="emit('close')"
        />
      </Transition>

      <!-- Side Panel Drawer -->
      <Transition name="drawer">
        <div
          v-if="open"
          class="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-2xl bg-card-background border-l border-primary-border flex flex-col shadow-2xl"
          role="dialog"
          aria-modal="true"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck class="w-5 h-5 text-primary" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-semibold text-primary-text">Manage Role Permissions</h2>
                  <span
                    v-if="role?.is_system"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    System Role
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5">
                  Role: <span class="font-medium text-primary-text">{{ role?.name || "Selected Role" }}</span>
                </p>
              </div>
            </div>

            <button
              class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
              title="Close"
              @click="emit('close')"
            >
              <X class="w-4.5 h-4.5" />
            </button>
          </div>

          <!-- Toolbar / Controls -->
          <div class="px-6 py-3 border-b border-primary-border bg-background/60 shrink-0 space-y-2.5">
            <!-- Search & Quick Selection -->
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search permissions or codes (e.g. attendance, employee.view)..."
                  class="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-card-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
                <button
                  v-if="searchQuery"
                  class="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-text hover:text-primary-text p-0.5 cursor-pointer"
                  @click="searchQuery = ''"
                >
                  <X class="w-3 h-3" />
                </button>
              </div>

              <!-- Quick Selection Actions -->
              <button
                type="button"
                class="px-3 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors whitespace-nowrap cursor-pointer"
                @click="selectAllFiltered"
              >
                Select All
              </button>
              <button
                type="button"
                class="px-3 py-2 rounded-xl border border-primary-border bg-card-background hover:bg-background text-xs font-medium text-secondary-text hover:text-primary-text transition-colors whitespace-nowrap cursor-pointer"
                @click="deselectAllFiltered"
              >
                Clear
              </button>
            </div>

            <!-- Stats Bar -->
            <div class="flex items-center justify-between text-xs text-secondary-text pt-0.5">
              <span>Showing {{ totalFilteredCount }} permissions in {{ filteredModules.length }} modules</span>
              <span class="font-semibold text-primary">
                {{ selectedCount }} / {{ allPermissions.length }} Assigned
              </span>
            </div>
          </div>

          <!-- Scrollable Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <!-- Loading Skeleton -->
            <div v-if="store.permissionLoading" class="space-y-4 animate-pulse">
              <div v-for="n in 4" :key="n" class="bg-background border border-primary-border rounded-xl p-4 space-y-3">
                <div class="h-4 w-40 bg-card-background rounded" />
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="h-14 bg-card-background rounded-lg" />
                  <div class="h-14 bg-card-background rounded-lg" />
                </div>
              </div>
            </div>

            <!-- Empty Search State -->
            <div
              v-else-if="filteredModules.length === 0"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <ShieldAlert class="w-8 h-8 text-secondary-text mb-2" />
              <p class="text-xs font-medium text-primary-text">No permissions matched your query</p>
              <button
                type="button"
                class="mt-2 text-xs text-primary hover:underline cursor-pointer"
                @click="searchQuery = ''"
              >
                Reset search filter
              </button>
            </div>

            <!-- Module Permission Sections -->
            <div
              v-else
              v-for="mod in filteredModules"
              :key="mod.key"
              class="bg-background border border-primary-border rounded-xl overflow-hidden transition-all duration-150 hover:border-primary-border/80"
            >
              <!-- Module Header -->
              <div class="px-4 py-2.5 bg-card-background/60 border-b border-primary-border flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <Layers class="w-4 h-4 text-primary" />
                  <span class="text-xs font-semibold text-primary-text tracking-wide">
                    {{ mod.label }}
                  </span>
                  <span class="text-[10px] px-2 py-0.2 rounded-full bg-background text-secondary-text border border-primary-border font-medium">
                    {{ getSelectedCountForModule(mod) }} / {{ mod.permissions.length }}
                  </span>
                </div>

                <!-- Module Select All Button -->
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-secondary-text hover:text-primary-text font-medium cursor-pointer transition-colors"
                  @click="toggleModulePermissions(mod)"
                >
                  <span>{{ isModuleFullySelected(mod) ? "Deselect All" : "Select All" }}</span>
                  <div
                    class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                    :class="isModuleFullySelected(mod) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
                  >
                    <Check v-if="isModuleFullySelected(mod)" class="w-3 h-3 text-white" />
                  </div>
                </button>
              </div>

              <!-- Permission Cards List -->
              <div class="p-3 grid grid-cols-1 gap-2.5">
                <div
                  v-for="perm in mod.permissions"
                  :key="perm.code"
                  class="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border transition-all duration-150 gap-2.5"
                  :class="isAssigned(perm.code)
                    ? 'bg-primary/5 border-primary/30 text-primary-text'
                    : 'bg-card-background border-primary-border/60 hover:border-primary-border text-secondary-text'"
                >
                  <!-- Checkbox & Label -->
                  <div
                    class="flex items-start gap-2.5 cursor-pointer flex-1 select-none"
                    @click="togglePermission(perm)"
                  >
                    <div
                      class="w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                      :class="isAssigned(perm.code) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
                    >
                      <Check v-if="isAssigned(perm.code)" class="w-3 h-3 text-white" />
                    </div>
                    <div class="min-w-0">
                      <p class="text-xs font-medium text-primary-text">
                        {{ perm.label }}
                      </p>
                      <p class="text-[11px] text-secondary-text font-mono mt-0.5">
                        {{ perm.code }}
                      </p>
                    </div>
                  </div>

                  <!-- Scope Picker for Scope-Aware Permissions -->
                  <div v-if="perm.scope_aware" class="flex items-center gap-1.5 pl-7 sm:pl-0 shrink-0">
                    <span class="text-[10px] text-secondary-text font-medium uppercase tracking-wider">Scope:</span>
                    <div class="inline-flex rounded-lg border border-primary-border p-0.5 bg-background">
                      <button
                        v-for="scopeOption in ['SELF', 'TEAM', 'ALL']"
                        :key="scopeOption"
                        type="button"
                        :disabled="!isAssigned(perm.code)"
                        class="px-2 py-0.5 text-[10px] font-semibold rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        :class="getScope(perm.code) === scopeOption
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-secondary-text hover:text-primary-text'"
                        @click.stop="setScope(perm.code, scopeOption)"
                      >
                        {{ scopeOption }}
                      </button>
                    </div>
                  </div>
                  <div v-else class="pl-7 sm:pl-0 shrink-0">
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-background/80 text-secondary-text border border-primary-border/60 font-medium">
                      Global
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <span class="text-xs text-secondary-text">
              <strong class="text-primary-text">{{ selectedCount }}</strong> permissions assigned
            </span>
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="px-4 py-2 rounded-xl text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button
                type="button"
                :disabled="store.actionLoading"
                class="px-5 py-2 rounded-xl text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                @click="savePermissions"
              >
                <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ store.actionLoading ? "Saving..." : "Save Changes" }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import {
  X,
  Search,
  Check,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Loader2,
} from "lucide-vue-next";
import { useRolesStore, isScopeAwareCode } from "@/stores/rbac/roles";
import { SYSTEM_MODULES } from "@/constants/permissions";

const props = defineProps({
  open: { type: Boolean, default: false },
  role: { type: Object, default: null },
});
const emit = defineEmits(["close"]);
const store = useRolesStore();

const searchQuery = ref("");
// Map of code -> { code, scope }
const assignmentsMap = ref({});

const allPermissions = computed(() => {
  return SYSTEM_MODULES.flatMap((m) => m.permissions);
});

// Watch open to hydrate existing permissions
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.role) {
      searchQuery.value = "";
      const map = {};
      const existing = props.role.permissions || [];
      existing.forEach((p) => {
        if (!p?.code) return;
        map[p.code] = {
          code: p.code,
          scope: p.scope || (isScopeAwareCode(p.code) ? "SELF" : null),
        };
      });
      assignmentsMap.value = map;
    }
  }
);

const isAssigned = (code) => Boolean(assignmentsMap.value[code]);

const getScope = (code) => {
  return assignmentsMap.value[code]?.scope || "SELF";
};

const setScope = (code, scope) => {
  if (assignmentsMap.value[code]) {
    assignmentsMap.value[code].scope = scope;
  }
};

const togglePermission = (perm) => {
  if (isAssigned(perm.code)) {
    const copy = { ...assignmentsMap.value };
    delete copy[perm.code];
    assignmentsMap.value = copy;
  } else {
    assignmentsMap.value = {
      ...assignmentsMap.value,
      [perm.code]: {
        code: perm.code,
        scope: perm.scope_aware ? "SELF" : null,
      },
    };
  }
};

const filteredModules = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return SYSTEM_MODULES;

  return SYSTEM_MODULES.map((mod) => {
    const moduleMatches = mod.label.toLowerCase().includes(query) || mod.key.toLowerCase().includes(query);
    const matchingPerms = mod.permissions.filter(
      (p) =>
        moduleMatches ||
        p.code.toLowerCase().includes(query) ||
        p.label.toLowerCase().includes(query)
    );
    return {
      ...mod,
      permissions: matchingPerms,
    };
  }).filter((mod) => mod.permissions.length > 0);
});

const totalFilteredCount = computed(() => {
  return filteredModules.value.reduce((acc, m) => acc + m.permissions.length, 0);
});

const selectedCount = computed(() => {
  return Object.keys(assignmentsMap.value).length;
});

const getSelectedCountForModule = (mod) => {
  return mod.permissions.filter((p) => isAssigned(p.code)).length;
};

const isModuleFullySelected = (mod) => {
  return mod.permissions.length > 0 && mod.permissions.every((p) => isAssigned(p.code));
};

const toggleModulePermissions = (mod) => {
  const allSelected = isModuleFullySelected(mod);
  const updated = { ...assignmentsMap.value };

  if (allSelected) {
    mod.permissions.forEach((p) => {
      delete updated[p.code];
    });
  } else {
    mod.permissions.forEach((p) => {
      if (!updated[p.code]) {
        updated[p.code] = {
          code: p.code,
          scope: p.scope_aware ? "SELF" : null,
        };
      }
    });
  }
  assignmentsMap.value = updated;
};

const selectAllFiltered = () => {
  const updated = { ...assignmentsMap.value };
  filteredModules.value.forEach((mod) => {
    mod.permissions.forEach((p) => {
      if (!updated[p.code]) {
        updated[p.code] = {
          code: p.code,
          scope: p.scope_aware ? "SELF" : null,
        };
      }
    });
  });
  assignmentsMap.value = updated;
};

const deselectAllFiltered = () => {
  const updated = { ...assignmentsMap.value };
  filteredModules.value.forEach((mod) => {
    mod.permissions.forEach((p) => {
      delete updated[p.code];
    });
  });
  assignmentsMap.value = updated;
};

const savePermissions = async () => {
  if (!props.role) return;

  const payload = {
    name: props.role.name,
    description: props.role.description || null,
    permission_assignments: Object.values(assignmentsMap.value).map((item) => ({
      code: item.code,
      scope: isScopeAwareCode(item.code) ? item.scope || "SELF" : null,
    })),
  };

  await store.updateRole(props.role.id, payload, () => {
    emit("close");
  });
};
</script>

<style scoped>
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}
</style>
