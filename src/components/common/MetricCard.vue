<template>
  <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1.5">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
        <span v-if="icon" class="material-symbols-rounded text-sm text-primary">{{ icon }}</span>
        <span>{{ title }}</span>
      </div>
      <slot name="badge" />
    </div>
    <p class="text-2xl font-semibold text-primary-text">{{ value }}</p>
    <p v-if="subtitle" class="text-[11px] text-secondary-text">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], default: "—" },
  subtitle: { type: String, default: "" },
  icon: { type: String, default: "" },
});
</script>
