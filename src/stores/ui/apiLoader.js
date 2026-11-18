import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useApiLoaderStore = defineStore("apiLoader", () => {
  const activeCount = ref(0);
  const isLoading = computed(() => activeCount.value > 0);

  const start = () => {
    activeCount.value += 1;
  };

  const stop = () => {
    activeCount.value = Math.max(0, activeCount.value - 1);
  };

  return {
    activeCount,
    isLoading,
    start,
    stop,
  };
});
