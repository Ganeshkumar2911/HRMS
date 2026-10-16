<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      @click="emit('close')"
    >
      <div
        class="bg-card-background rounded-2xl border border-primary-border w-full max-w-md shadow-2xl overflow-hidden"
        @click.stop
      >
        <div class="px-6 py-4 border-b border-primary-border flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ShieldCheck class="w-4 h-4 text-primary" />
            </div>
            <h2 class="text-sm font-semibold text-primary-text">
              {{ isEdit ? "Edit Role" : "Create New Role" }}
            </h2>
          </div>
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="block text-xs font-medium text-secondary-text mb-1.5">Role Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. HR Operations Specialist"
              class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-secondary-text mb-1.5">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Brief description of the role responsibilities..."
              class="w-full px-3 py-2 rounded-lg bg-background border border-primary-border text-primary-text text-sm outline-none focus:border-primary transition-colors placeholder:text-secondary-text resize-none"
            />
          </div>
        </div>

        <div class="px-6 py-4 border-t border-primary-border flex gap-3 bg-background/30">
          <button
            type="button"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary-text border border-primary-border hover:bg-background hover:text-primary-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="store.actionLoading || !form.name.trim()"
            class="flex-1 px-4 py-2.5 rounded-lg text-xs font-medium text-white bg-primary hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            @click="submit"
          >
            <Loader2 v-if="store.actionLoading" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ store.actionLoading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Role" : "Create Role") }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { X, ShieldCheck, Loader2 } from "lucide-vue-next";
import { useRolesStore } from "@/stores/rbac/roles";

const props = defineProps({
  open: { type: Boolean, default: false },
  editData: { type: Object, default: null },
});
const emit = defineEmits(["close"]);
const store = useRolesStore();

const isEdit = computed(() => !!props.editData);
const form = ref({ name: "", description: "" });

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        name: props.editData?.name ?? "",
        description: props.editData?.description ?? "",
      };
    }
  }
);

const submit = () => {
  if (!form.value.name.trim()) return;

  if (isEdit.value) {
    store.updateRole(props.editData.id, form.value, () => emit("close"));
  } else {
    store.createRole(form.value, () => emit("close"));
  }
};
</script>
