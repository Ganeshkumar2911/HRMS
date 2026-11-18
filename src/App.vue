<template>
  <div>
    <!-- Global Top API Progress Bar -->
    <Transition name="fade">
      <div
        v-if="apiLoader.isLoading"
        class="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary/15 overflow-hidden pointer-events-none"
        role="progressbar"
        aria-label="Loading"
      >
        <div class="h-full w-1/3 bg-primary animate-[api-progress_1s_ease-in-out_infinite]"></div>
      </div>
    </Transition>
    <router-view />
    <Snackbar />
  </div>
</template>

<script setup>
import Snackbar from '@/components/common/snackbar.vue'
import { useApiLoaderStore } from '@/stores/ui/apiLoader'

const apiLoader = useApiLoaderStore()
</script>

<style>
@keyframes api-progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}
</style>