<template>
  <div class="min-h-screen w-full flex flex-col bg-background text-primary-text transition-colors duration-200">
    <!-- Top App Shell Bar -->
    <TopBar />

    <!-- Main Content Area -->
    <main class="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import TopBar from "@/components/default/TopBar.vue";
import { useAuthStore } from "@/stores/auth/auth";

const authStore = useAuthStore();

onMounted(() => {
  authStore.initSession();
});
</script>
