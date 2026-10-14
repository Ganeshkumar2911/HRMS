<template>
  <div class="min-h-screen w-full flex bg-background text-primary-text transition-colors duration-200">
    <!-- Left Navigation Sidebar (Desktop Fixed & Mobile Drawer) -->
    <AppSidebar
      :is-mobile-open="isMobileSidebarOpen"
      @close-mobile="isMobileSidebarOpen = false"
    />

    <!-- Main Content Area with Header -->
    <div class="flex-1 flex flex-col min-w-0 lg:pl-64">
      <!-- Top App Header -->
      <TopBar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />

      <!-- Main Content Page -->
      <main class="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto overflow-y-auto no-scrollbar">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import TopBar from "@/components/default/TopBar.vue";
import AppSidebar from "@/components/default/AppSidebar.vue";
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";
import authToken from "@/common/authToken";

const authStore = useAuthStore();
const wsStore = useWsStore();
const isMobileSidebarOpen = ref(false);

const handleTokenRefreshed = () => {
  wsStore.connect(authToken.getAccessToken());
};

onMounted(async () => {
  window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
  // Finish session bootstrap so later navigations see loaded permissions.
  await authStore.initSession();
});

onBeforeUnmount(() => {
  window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
});
</script>
