<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-sm w-full p-5 shadow-xl flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-lg bg-primary-red/10 text-primary-red flex items-center justify-center shrink-0">
          <span class="material-symbols-rounded text-xl">{{ icon || 'warning' }}</span>
        </div>
        <div>
          <h3 class="title-text text-sm font-semibold text-primary-text">{{ title }}</h3>
          <p class="sub-text text-secondary-text mt-1 leading-relaxed">{{ message }}</p>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-primary-border/60">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="btn-secondary text-xs px-3.5 py-1.5"
          :disabled="loading"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="$emit('confirm')"
          class="btn-danger text-xs px-3.5 py-1.5"
          :disabled="loading"
        >
          <span v-if="loading" class="material-symbols-rounded text-xs animate-spin">progress_activity</span>
          <span>{{ confirmText || 'Confirm' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Are you sure?",
  },
  message: {
    type: String,
    default: "This action cannot be undone.",
  },
  icon: {
    type: String,
    default: "warning",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue", "confirm"]);
</script>
