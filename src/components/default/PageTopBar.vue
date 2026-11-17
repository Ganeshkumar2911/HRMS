<script setup>
import { ref, computed, watch, useSlots } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobalSearchStore } from "@/stores/ui/globalSearch";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  showBackButton: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Optional controlled state for the expandable filter bar.
   * When omitted, PageTopBar manages and persists state per route.
   */
  filtersOpen: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Force showing/hiding the filter toggle button.
   * Defaults to true when the #filters slot is provided.
   */
  showFilterToggle: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Optional count of active filters to display as a badge on the filter button.
   */
  activeFilterCount: {
    type: Number,
    default: 0,
  },
  /**
   * Custom storage key for persisting filter bar open/closed state.
   * Defaults to `kora_page_filters_open:${route.path}`.
   */
  persistKey: {
    type: String,
    default: "",
  },
  /**
   * Disable persisting open/closed state across page visits.
   */
  disablePersist: {
    type: Boolean,
    default: false,
  },
  showSearch: {
    type: Boolean,
    default: false,
  },
  searchPlaceholder: {
    type: String,
    default: "Search...",
  },
});

const emit = defineEmits(["update:filtersOpen", "toggle-filters", "back"]);

const route = useRoute();
const router = useRouter();
const slots = useSlots();
const globalSearch = useGlobalSearchStore();

const resolvedTitle = computed(() => props.title || route.meta?.title || "");
const resolvedDescription = computed(
  () => props.description || route.meta?.description || ""
);
const resolvedShowBack = computed(() =>
  props.showBackButton !== undefined
    ? props.showBackButton
    : Boolean(route.meta?.showBackButton)
);

const hasFiltersSlot = computed(() => Boolean(slots.filters));
const shouldShowFilterToggle = computed(() =>
  props.showFilterToggle !== undefined
    ? props.showFilterToggle
    : hasFiltersSlot.value
);

const storageKey = computed(
  () => props.persistKey || `kora_page_filters_open:${route.path}`
);

const readPersistedState = () => {
  if (props.disablePersist) return false;
  try {
    return localStorage.getItem(storageKey.value) === "true";
  } catch {
    return false;
  }
};

const writePersistedState = (val) => {
  if (props.disablePersist) return;
  try {
    localStorage.setItem(storageKey.value, String(val));
  } catch {
    // ignore storage errors
  }
};

const internalOpen = ref(readPersistedState());

// Re-sync internal state when navigating to a different route
watch(storageKey, () => {
  if (props.filtersOpen === undefined) {
    internalOpen.value = readPersistedState();
  }
});

const isFiltersOpen = computed(() =>
  props.filtersOpen !== undefined ? props.filtersOpen : internalOpen.value
);

const isFilterActive = computed(
  () => isFiltersOpen.value || props.activeFilterCount > 0
);

const toggleFilters = () => {
  const next = !isFiltersOpen.value;
  if (props.filtersOpen === undefined) {
    internalOpen.value = next;
  }
  writePersistedState(next);
  emit("update:filtersOpen", next);
  emit("toggle-filters", next);
};

const handleBack = () => {
  emit("back");
  router.back();
};
</script>

<template>
  <div
    class="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-card-background border-b border-primary-border/60 transition-colors duration-200"
  >
    <!-- Top Header Row -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 lg:px-8 py-3 gap-3 sm:gap-4"
    >
      <!-- Left: Back Button + Page Title & Description -->
      <div class="flex items-center gap-3 min-w-0">
        <button
          v-if="resolvedShowBack"
          type="button"
          @click="handleBack"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle border border-transparent hover:border-primary-border/60 transition-colors cursor-pointer shrink-0 active:scale-95"
          title="Back"
          aria-label="Go back"
        >
          <span class="material-symbols-rounded text-lg">arrow_back</span>
        </button>

        <div class="min-w-0">
          <h1
            v-if="resolvedTitle"
            class="text-primary-text text-sm sm:text-base font-semibold tracking-tight truncate leading-tight"
          >
            {{ resolvedTitle }}
          </h1>
          <p
            v-if="resolvedDescription"
            class="text-secondary-text text-xs truncate mt-0.5"
          >
            {{ resolvedDescription }}
          </p>
        </div>
      </div>

      <!-- Right: Search + Filter Toggle + Page Actions Slot -->
      <div class="flex items-center gap-2 shrink-0 flex-wrap">
        <div
          v-if="showSearch"
          class="flex items-center gap-2 bg-surface-subtle px-2.5 h-8.5 rounded-lg w-48 sm:w-64 border border-primary-border/60 focus-within:border-primary transition-colors"
        >
          <span class="material-symbols-rounded text-secondary-text text-[17px]">search</span>
          <input
            :value="globalSearch.query"
            type="text"
            :placeholder="searchPlaceholder || globalSearch.placeholder"
            @input="globalSearch.triggerSearch($event.target.value)"
            @keydown.enter="globalSearch.triggerSearch($event.target.value, true)"
            @keydown.esc="globalSearch.clear()"
            class="bg-transparent text-xs text-primary-text placeholder:text-secondary-text/60 outline-none w-full"
          />
          <button
            v-if="globalSearch.query"
            type="button"
            @click="globalSearch.clear()"
            class="text-secondary-text hover:text-primary-text p-0.5 rounded cursor-pointer shrink-0"
            title="Clear search"
            aria-label="Clear search"
          >
            <span class="material-symbols-rounded text-sm block">close</span>
          </button>
        </div>

        <button
          v-if="shouldShowFilterToggle"
          type="button"
          @click="toggleFilters"
          :aria-expanded="isFiltersOpen"
          :title="isFiltersOpen ? 'Hide filters' : 'Show filters'"
          class="relative inline-flex items-center justify-center gap-1.5 h-8.5 px-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer active:scale-95 border"
          :class="
            isFilterActive
              ? 'bg-primary text-btn-text-primary border-primary shadow-xs'
              : 'bg-surface-subtle text-secondary-text hover:text-primary-text hover:bg-surface-container border-primary-border/60'
          "
        >
          <span class="material-symbols-rounded text-[18px]">
            {{ isFiltersOpen ? "filter_list_off" : "filter_list" }}
          </span>
          <span class="hidden sm:inline">Filters</span>
          <span
            v-if="activeFilterCount > 0"
            class="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold leading-none"
            :class="
              isFilterActive
                ? 'bg-btn-text-primary/20 text-btn-text-primary'
                : 'bg-primary text-btn-text-primary'
            "
          >
            {{ activeFilterCount }}
          </span>
        </button>

        <slot name="actions" />
      </div>
    </div>

    <!-- Expandable Filter Panel (Smooth CSS Grid Row Animation) -->
    <div
      v-if="hasFiltersSlot"
      class="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
      :class="
        isFiltersOpen
          ? 'grid-rows-[1fr] opacity-100'
          : 'grid-rows-[0fr] opacity-0 pointer-events-none'
      "
    >
      <div class="overflow-hidden">
        <div
          class="px-4 sm:px-6 lg:px-8 py-3.5 border-t border-primary-border/60 bg-surface-subtle/50"
        >
          <slot name="filters" />
        </div>
      </div>
    </div>
  </div>
</template>
