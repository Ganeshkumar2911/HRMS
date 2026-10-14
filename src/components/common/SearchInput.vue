<template>
  <div
    class="relative group w-full flex items-center transition-all"
    :class="[
      disabled ? 'opacity-60 cursor-not-allowed' : ''
    ]"
  >
    <!-- Prepend Slot / Leading Icon (or Spinner when Loading) -->
    <slot name="prepend">
      <span
        v-if="effectiveLoading"
        class="material-symbols-rounded absolute pointer-events-none animate-spin text-primary transition-colors select-none"
        :class="sizeClasses.icon"
      >
        progress_activity
      </span>
      <span
        v-else
        class="material-symbols-rounded absolute pointer-events-none text-secondary-text/70 group-focus-within:text-primary transition-colors select-none"
        :class="sizeClasses.icon"
      >
        {{ icon }}
      </span>
    </slot>

    <!-- Main Text Input -->
    <input
      ref="inputRef"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="w-full bg-background border text-primary-text placeholder:text-secondary-text/50 outline-none transition-all"
      :class="[
        sizeClasses.input,
        variantClasses,
        isFocused
          ? 'border-primary/60 ring-2 ring-primary/10 shadow-xs'
          : 'border-primary-border/80 hover:border-primary-border'
      ]"
      @input="handleInput"
      @keydown.esc="handleEscape"
      @keydown.enter="handleEnter"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- Append Slot / Clear Button & Results Counter -->
    <div
      class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-auto"
    >
      <slot name="append">
        <!-- Results count badge when searching items -->
        <span
          v-if="showCount && items && items.length > 0 && modelValue"
          class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary pointer-events-none select-none"
        >
          {{ filteredItems.length }}
        </span>

        <!-- Clear Button -->
        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          @click="handleClear"
          class="rounded-full text-secondary-text hover:text-primary-text hover:bg-card-background flex items-center justify-center transition-colors cursor-pointer select-none"
          :class="sizeClasses.clearBtn"
          title="Clear search"
          aria-label="Clear search"
        >
          <span class="material-symbols-rounded" :class="sizeClasses.clearIcon">close</span>
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Search...",
  },
  debounce: {
    type: Number,
    default: 300,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  variant: {
    type: String,
    default: "pill",
    validator: (v) => ["pill", "rounded", "default"].includes(v),
  },
  icon: {
    type: String,
    default: "search",
  },
  type: {
    type: String,
    default: "text",
  },
  autocomplete: {
    type: String,
    default: "off",
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  showCount: {
    type: Boolean,
    default: false,
  },
  // ── Frontend List Search Props ──────────────────────────
  items: {
    type: Array,
    default: null,
  },
  filterKeys: {
    type: Array,
    default: () => ["name", "title", "label", "email"],
  },
  filterFn: {
    type: Function,
    default: null,
  },
  // ── API / Server Search Prop ────────────────────────────
  searchFn: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "update:filteredItems",
  "search",
  "submit",
  "clear",
  "focus",
  "blur",
]);

const inputRef = ref(null);
const isFocused = ref(false);
const isSearching = ref(false);
let debounceTimer = null;
let currentSearchId = 0;

const effectiveLoading = computed(() => props.loading || isSearching.value);

// ── Size Classes ──────────────────────────────────────────
const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return {
        input: "text-[11px] py-1.5 pl-8 pr-8",
        icon: "text-[16px] left-2.5 top-1/2 -translate-y-1/2",
        clearBtn: "w-4 h-4",
        clearIcon: "text-[12px]",
      };
    case "lg":
      return {
        input: "text-sm py-2.5 pl-10 pr-10",
        icon: "text-[20px] left-3.5 top-1/2 -translate-y-1/2",
        clearBtn: "w-6 h-6",
        clearIcon: "text-[16px]",
      };
    case "md":
    default:
      return {
        input: "text-xs py-2 pl-9 pr-9",
        icon: "text-[18px] left-3 top-1/2 -translate-y-1/2",
        clearBtn: "w-5 h-5",
        clearIcon: "text-[14px]",
      };
  }
});

// ── Variant Classes ───────────────────────────────────────
const variantClasses = computed(() => {
  switch (props.variant) {
    case "rounded":
      return "rounded-lg";
    case "default":
      return "rounded-md";
    case "pill":
    default:
      return "rounded-full";
  }
});

// ── Frontend List Filter Logic ────────────────────────────
const filteredItems = computed(() => {
  if (!props.items) return [];
  const q = (props.modelValue || "").trim().toLowerCase();
  if (!q) return props.items;

  if (typeof props.filterFn === "function") {
    return props.items.filter((item) => props.filterFn(item, q));
  }

  return props.items.filter((item) => {
    if (!item) return false;
    if (typeof item === "string") {
      return item.toLowerCase().includes(q);
    }
    return props.filterKeys.some((key) => {
      const val = item[key];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(q);
    });
  });
});

// Sync filtered items to parent via v-model:filteredItems or event
watch(
  () => filteredItems.value,
  (newVal) => {
    if (props.items) {
      emit("update:filteredItems", newVal);
    }
  },
  { immediate: true, deep: true }
);

// ── Debounced Search / API Search ─────────────────────────
const triggerSearch = async (query) => {
  emit("search", query);

  if (typeof props.searchFn === "function") {
    const searchId = ++currentSearchId;
    isSearching.value = true;
    try {
      await props.searchFn(query);
    } catch (err) {
      console.warn("SearchInput searchFn error:", err);
    } finally {
      if (searchId === currentSearchId) {
        isSearching.value = false;
      }
    }
  }
};

const handleInput = (e) => {
  const value = e.target.value;
  emit("update:modelValue", value);

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerSearch(value);
  }, props.debounce);
};

const handleClear = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  emit("update:modelValue", "");
  emit("clear");
  triggerSearch("");
  inputRef.value?.focus();
};

const handleEscape = () => {
  if (props.modelValue) {
    handleClear();
  }
};

const handleEnter = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  emit("submit", props.modelValue);
  triggerSearch(props.modelValue);
};

const handleFocus = (e) => {
  isFocused.value = true;
  emit("focus", e);
};

const handleBlur = (e) => {
  isFocused.value = false;
  emit("blur", e);
};

onMounted(() => {
  if (props.autofocus) {
    inputRef.value?.focus();
  }
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: handleClear,
  inputRef,
});
</script>
