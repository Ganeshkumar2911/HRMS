<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer shrink-0 select-none"
    :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': disabled }"
  >
    <input
      type="checkbox"
      role="switch"
      :checked="modelValue"
      :disabled="disabled"
      class="peer sr-only"
      @change="handleChange"
    />
    <span
      class="relative block h-[22px] w-10 rounded-full bg-zinc-300 transition-colors duration-200 dark:bg-zinc-600 peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/40 peer-checked:[&>span]:translate-x-[18px]"
    >
      <span
        class="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200"
      ></span>
    </span>
    <span
      v-if="showLabel"
      class="text-xs font-bold"
      :class="modelValue ? 'text-emerald-500' : 'text-zinc-500'"
    >
      {{ modelValue ? activeText : inactiveText }}
    </span>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showLabel: {
    type: Boolean,
    default: true,
  },
  activeText: {
    type: String,
    default: "Enabled",
  },
  inactiveText: {
    type: String,
    default: "Disabled",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const handleChange = (e) => {
  emit("update:modelValue", e.target.checked);
  emit("change", e.target.checked);
};
</script>
