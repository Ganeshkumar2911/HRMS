<template>
  <div
    class="flex items-center"
    :class="[
      variant === 'line'
        ? bordered ? 'border-b border-primary-border/60' : ''
        : 'p-1 rounded-lg bg-background border border-primary-border/60 gap-1',
      fullWidth ? 'w-full' : 'inline-flex gap-2'
    ]"
  >
    <button
      v-for="tab in normalizedTabs"
      :key="tab.id"
      type="button"
      :disabled="tab.disabled"
      @click="handleSelect(tab.id)"
      class="group relative flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none"
      :class="[
        fullWidth ? 'flex-1' : '',
        sizeClasses.button,
        variant === 'line'
          ? (modelValue === tab.id
              ? 'text-primary font-semibold'
              : 'text-secondary-text hover:text-primary-text font-medium')
          : (modelValue === tab.id
              ? 'bg-card-background text-primary-text font-semibold shadow-xs rounded-md'
              : 'text-secondary-text hover:text-primary-text rounded-md')
      ]"
    >
      <slot name="tab" :tab="tab" :active="modelValue === tab.id">
        <!-- Icon -->
        <span
          v-if="tab.icon"
          class="material-symbols-rounded transition-colors"
          :class="[
            sizeClasses.icon,
            modelValue === tab.id ? 'text-primary' : 'text-secondary-text group-hover:text-primary-text'
          ]"
        >
          {{ tab.icon }}
        </span>

        <!-- Label -->
        <span class="truncate">{{ tab.label }}</span>

        <!-- Badge / Count -->
        <span
          v-if="tab.count !== undefined && tab.count !== null"
          class="inline-flex items-center justify-center rounded-full font-semibold transition-colors"
          :class="[
            sizeClasses.badge,
            modelValue === tab.id
              ? 'bg-primary/10 text-primary font-bold'
              : 'bg-primary-border/40 text-secondary-text'
          ]"
        >
          {{ tab.count }}
        </span>
      </slot>

      <!-- Active indicator underline for 'line' variant (like image) -->
      <span
        v-if="variant === 'line' && modelValue === tab.id"
        class="absolute -bottom-px inset-x-1.5 h-[2.5px] bg-primary rounded-full transition-all duration-200"
      ></span>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
    // Can be ['all', 'direct'] or [{ id: 'all', label: 'All', icon: 'chat', count: 2 }]
  },
  variant: {
    type: String,
    default: "line", // 'line' | 'pill'
    validator: (v) => ["line", "pill"].includes(v),
  },
  size: {
    type: String,
    default: "sm", // 'sm' | 'md' | 'lg'
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const normalizedTabs = computed(() => {
  return props.tabs.map((tab) => {
    if (typeof tab === "string" || typeof tab === "number") {
      const label = String(tab).charAt(0).toUpperCase() + String(tab).slice(1);
      return { id: tab, label };
    }
    return {
      id: tab.id ?? tab.value,
      label: tab.label ?? tab.name ?? String(tab.id),
      icon: tab.icon,
      count: tab.count,
      disabled: tab.disabled ?? false,
    };
  });
});

const sizeClasses = computed(() => {
  if (props.size === "md") {
    return {
      button: props.variant === "line" ? "py-2 px-3 gap-2 text-xs" : "py-1.5 px-3 gap-2 text-xs",
      icon: "text-[17px]",
      badge: "text-[10px] px-1.5 py-0.2 min-w-[18px]",
    };
  }
  if (props.size === "lg") {
    return {
      button: props.variant === "line" ? "py-2.5 px-4 gap-2 text-sm" : "py-2 px-4 gap-2 text-sm",
      icon: "text-lg",
      badge: "text-[11px] px-2 py-0.5 min-w-[20px]",
    };
  }
  // Default 'sm'
  return {
    button: props.variant === "line" ? "py-1.5 px-2 gap-1.5 text-[11px]" : "py-1 px-2 gap-1.5 text-[11px]",
    icon: "text-[15px]",
    badge: "text-[9px] px-1.5 py-0.2 min-w-[16px]",
  };
});

const handleSelect = (id) => {
  if (props.modelValue !== id) {
    emit("update:modelValue", id);
    emit("change", id);
  }
};
</script>
