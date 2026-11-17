import { defineStore } from "pinia";
import { ref } from "vue";

const DEFAULT_PLACEHOLDER = "Search employees, records, workflows...";

export const useGlobalSearchStore = defineStore("globalSearch", () => {
  const query = ref("");
  const placeholder = ref(DEFAULT_PLACEHOLDER);
  const activeHandler = ref(null);
  let debounceTimer = null;

  const register = (handler, customPlaceholder = DEFAULT_PLACEHOLDER) => {
    activeHandler.value = typeof handler === "function" ? handler : null;
    placeholder.value = customPlaceholder || DEFAULT_PLACEHOLDER;

    return () => {
      if (activeHandler.value === handler) {
        activeHandler.value = null;
        placeholder.value = DEFAULT_PLACEHOLDER;
        query.value = "";
        if (debounceTimer) {
          clearTimeout(debounceTimer);
          debounceTimer = null;
        }
      }
    };
  };

  const triggerSearch = (val, immediate = false) => {
    query.value = val;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    if (!activeHandler.value) return;

    if (immediate) {
      activeHandler.value(val);
      return;
    }

    debounceTimer = setTimeout(() => {
      if (activeHandler.value) {
        activeHandler.value(val);
      }
    }, 300);
  };

  const clear = () => {
    triggerSearch("", true);
  };

  return {
    query,
    placeholder,
    register,
    triggerSearch,
    clear,
  };
});
