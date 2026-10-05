<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center bg-card-background border border-primary-border rounded-xl overflow-hidden shadow-2xl">
      <!-- Close button -->
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black flex items-center justify-center transition-colors"
      >
        <span class="material-symbols-rounded text-lg">close</span>
      </button>

      <!-- Image display -->
      <div class="p-2 overflow-auto max-h-[80vh] flex items-center justify-center">
        <img
          :src="imageUrl"
          :alt="title || 'Attachment Preview'"
          class="max-h-[75vh] max-w-full object-contain rounded-lg shadow-sm"
        />
      </div>

      <!-- Caption -->
      <div v-if="title" class="w-full px-4 py-3 bg-background border-t border-primary-border/60 text-xs text-secondary-text text-center">
        {{ title }}
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
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>
