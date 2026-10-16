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
                <ShieldCheck class="w-5.5 h-5.5 text-primary" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <h2 class="text-sm font-semibold text-primary-text truncate">User Permission Overrides</h2>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                    {{ user?.role_name || "User" }}
                  </span>
                </div>
                <p class="text-xs text-secondary-text mt-0.5 truncate">
                  <span class="font-medium text-primary-text">{{ user?.name }}</span> ({{ user?.email }})
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

          <!-- Tab Segmented Control -->
          <div class="border-b border-primary-border bg-background/40 shrink-0 h-12">
            <div class="flex items-center w-full h-full">
              <!-- Tab 1: Inherited Role Permissions -->
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer h-full"
                :class="activeTab === 'role'
                  ? 'border-amber-500 text-amber-500 bg-amber-500/10'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/60'"
                @click="activeTab = 'role'"
              >
                <ShieldAlert class="w-4 h-4 shrink-0" />
                <span class="truncate">Role Permissions</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0"
                  :class="activeTab === 'role' ? 'bg-amber-500/20 text-amber-500' : 'bg-background border border-primary-border text-secondary-text'"
                >
                  {{ rolePermissionsList.length }}
                </span>
              </button>

              <!-- Tab 2: Custom Overrides -->
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer h-full"
                :class="activeTab === 'overrides'
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-secondary-text hover:text-primary-text hover:bg-background/60'"
                @click="activeTab = 'overrides'"
              >
                <PlusCircle class="w-4 h-4 shrink-0" />
                <span class="truncate">Custom Overrides</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0"
                  :class="activeTab === 'overrides' ? 'bg-primary/20 text-primary' : 'bg-background border border-primary-border text-secondary-text'"
                >
                  {{ overrideList.length }}
                </span>
              </button>
            </div>
          </div>

          <!-- Tab 1 Content: Role Inherited Permissions (Read-only) -->
          <div v-if="activeTab === 'role'" class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
              These permissions are inherited directly from the assigned role <strong>{{ userRole?.name || 'Assigned Role' }}</strong>. To modify them, edit the role itself.
            </div>

            <div v-if="rolePermissionsList.length === 0" class="py-12 text-center text-xs text-secondary-text">
              No permissions assigned to this user's role.
            </div>

            <div v-else class="space-y-2">
              <div
                v-for="p in rolePermissionsList"
                :key="p.code"
                class="flex items-center justify-between p-3 rounded-xl bg-card-background border border-primary-border text-xs"
              >
                <div>
                  <p class="font-medium text-primary-text">{{ getPermissionLabel(p.code) }}</p>
                  <p class="text-[11px] text-secondary-text font-mono">{{ p.code }}</p>
                </div>
                <span
                  v-if="p.scope"
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  Scope: {{ p.scope }}
                </span>
                <span
                  v-else
                  class="text-[10px] px-2 py-0.5 rounded-md bg-background text-secondary-text border border-primary-border font-medium"
                >
                  Global
                </span>
              </div>
            </div>
          </div>

          <!-- Tab 2 Content: Custom User Overrides -->
          <div v-else-if="activeTab === 'overrides'" class="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div class="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
              Custom overrides take precedence over role permissions. Grant additional scopes or codes specifically to this user.
            </div>

            <!-- Toolbar / Search -->
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-secondary-text" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search permissions..."
                  class="w-full pl-8 pr-8 py-2 text-xs rounded-xl bg-background border border-primary-border text-primary-text outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
                />
              </div>
            </div>

            <!-- Permissions Tree for Overrides -->
            <div class="space-y-3">
              <div
                v-for="mod in filteredModules"
                :key="mod.key"
                class="border border-primary-border rounded-xl bg-background overflow-hidden"
              >
                <div class="px-4 py-2 bg-card-background/60 border-b border-primary-border text-xs font-semibold text-primary-text">
                  {{ mod.label }}
                </div>
                <div class="p-2.5 space-y-2">
                  <div
                    v-for="perm in mod.permissions"
                    :key="perm.code"
                    class="flex items-center justify-between p-2 rounded-lg border transition-all text-xs"
                    :class="hasOverride(perm.code)
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-card-background border-primary-border/60'"
                  >
                    <div
                      class="flex items-center gap-2 flex-1 cursor-pointer select-none"
                      @click="toggleOverride(perm)"
                    >
                      <div
                        class="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        :class="hasOverride(perm.code) ? 'bg-primary border-primary' : 'bg-background border-primary-border'"
                      >
                        <Check v-if="hasOverride(perm.code)" class="w-2.5 h-2.5 text-white" />
                      </div>
                      <div>
                        <p class="font-medium text-primary-text">{{ perm.label }}</p>
                        <p class="text-[10px] text-secondary-text font-mono">{{ perm.code }}</p>
                      </div>
                    </div>

                    <!-- Scope Picker -->
                    <div v-if="perm.scope_aware" class="flex items-center gap-1">
                      <div class="inline-flex rounded-lg border border-primary-border p-0.5 bg-background">
                        <button
                          v-for="s in ['SELF', 'TEAM', 'ALL']"
                          :key="s"
                          type="button"
                          :disabled="!hasOverride(perm.code)"
                          class="px-1.5 py-0.5 text-[9px] font-semibold rounded transition-colors cursor-pointer disabled:opacity-40"
                          :class="getOverrideScope(perm.code) === s ? 'bg-primary text-white' : 'text-secondary-text'"
                          @click.stop="setOverrideScope(perm.code, s)"
                        >
                          {{ s }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="px-6 py-4 border-t border-primary-border flex items-center justify-between shrink-0 bg-card-background">
            <span class="text-xs text-secondary-text">
              <strong class="text-primary-text">{{ overrideList.length }}</strong> custom overrides
            </span>
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="px-4 py-2 rounded-xl text-xs font-medium text-secondary-text border border-primary-border hover:bg-background transition-colors cursor-pointer"
                @click="emit('close')"
              >
                Close
              </button>
              <button
                v-if="activeTab === 'overrides'"
                type="button"
                :disabled="saving"
                class="px-5 py-2 rounded-xl text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 cursor-pointer"
                @click="saveOverrides"
              >
                <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                <span>{{ saving ? "Saving..." : "Save Overrides" }}</span>
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
  PlusCircle,
  Loader2,
} from "lucide-vue-next";
import { SYSTEM_MODULES } from "@/constants/permissions";
import { useRolesStore } from "@/stores/rbac/roles";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
});
const emit = defineEmits(["close"]);

const rolesStore = useRolesStore();
const snackbar = useSnackbarStore();

const activeTab = ref("overrides");
const searchQuery = ref("");
const saving = ref(false);

const overridesMap = ref({});

const userRole = computed(() => {
  if (!props.user) return null;
  return rolesStore.roles.find((r) => r.id === props.user.role_id) || null;
});

const rolePermissionsList = computed(() => {
  return userRole.value?.permissions || [];
});

const getPermissionLabel = (code) => {
  for (const m of SYSTEM_MODULES) {
    const found = m.permissions.find((p) => p.code === code);
    if (found) return found.label;
  }
  return code;
};

watch(
  () => props.open,
  (val) => {
    if (val && props.user) {
      overridesMap.value = {};
      searchQuery.value = "";
      // If user has permission overrides attached
      const existing = props.user.permission_overrides || [];
      const map = {};
      existing.forEach((p) => {
        map[p.code] = { code: p.code, scope: p.scope || null };
      });
      overridesMap.value = map;
    }
  }
);

const hasOverride = (code) => Boolean(overridesMap.value[code]);
const getOverrideScope = (code) => overridesMap.value[code]?.scope || "SELF";
const setOverrideScope = (code, scope) => {
  if (overridesMap.value[code]) {
    overridesMap.value[code].scope = scope;
  }
};

const toggleOverride = (perm) => {
  if (hasOverride(perm.code)) {
    const copy = { ...overridesMap.value };
    delete copy[perm.code];
    overridesMap.value = copy;
  } else {
    overridesMap.value = {
      ...overridesMap.value,
      [perm.code]: {
        code: perm.code,
        scope: perm.scope_aware ? "SELF" : null,
      },
    };
  }
};

const overrideList = computed(() => Object.values(overridesMap.value));

const filteredModules = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return SYSTEM_MODULES;

  return SYSTEM_MODULES.map((mod) => ({
    ...mod,
    permissions: mod.permissions.filter(
      (p) =>
        mod.label.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.label.toLowerCase().includes(query)
    ),
  })).filter((m) => m.permissions.length > 0);
});

const saveOverrides = async () => {
  if (!props.user) return;
  saving.value = true;

  const payload = {
    permission_overrides: overrideList.value,
  };

  try {
    await apiRequest(urls.KEYS.PUT, urls.users.permissionOverrides(props.user.id), {
      data: payload,
      isTokenRequired: true,
      onSuccess: () => {
        snackbar.show("User overrides saved successfully", "success");
        emit("close");
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to save overrides", "error");
      },
      onFinally: () => {
        saving.value = false;
      },
    });
  } catch (_) {
    saving.value = false;
  }
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
