<template>
  <div class="min-h-screen w-full flex bg-background text-primary-text transition-colors duration-200">
    <!-- Left Navigation Sidebar (Desktop Fixed & Mobile Drawer) -->
    <AppSidebar
      :is-mobile-open="isMobileSidebarOpen"
      :is-collapsed="isSidebarCollapsed"
      @toggle-collapse="handleToggleCollapse"
      @update:is-collapsed="isSidebarCollapsed = $event"
      @close-mobile="isMobileSidebarOpen = false"
    />

    <!-- Main Content Area with Header -->
    <div
      class="flex-1 flex flex-col min-w-0 transition-[padding] duration-200 ease-in-out"
      :class="isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'"
    >
      <!-- Top App Header -->
      <TopBar @toggle-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen" />

      <!-- Main Content Page -->
      <main
        class="flex-1 w-full"
        :class="isChatRoute ? 'h-[calc(100vh-4rem)] p-0 max-w-none overflow-hidden flex flex-col' : 'px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto overflow-y-auto no-scrollbar'"
      >
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import TopBar from "@/components/default/TopBar.vue";
import AppSidebar from "@/components/default/AppSidebar.vue";
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";
import authToken from "@/common/authToken";

const authStore = useAuthStore();
const wsStore = useWsStore();
const route = useRoute();
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);

const isChatRoute = computed(() => route.path.startsWith('/chat'));

const handleToggleCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  try {
    localStorage.setItem("kora_sidebar_collapsed", String(isSidebarCollapsed.value));
  } catch (e) {
    // ignore local storage restrictions
  }
};

const handleTokenRefreshed = () => {
  wsStore.connect(authToken.getAccessToken());
};

onMounted(async () => {
  try {
    const saved = localStorage.getItem("kora_sidebar_collapsed");
    if (saved !== null) {
      isSidebarCollapsed.value = saved === "true";
    }
  } catch (e) {
    // ignore
  }

  window.addEventListener("auth:token-refreshed", handleTokenRefreshed);
  // Finish session bootstrap so later navigations see loaded permissions.
  await authStore.initSession();
});

onBeforeUnmount(() => {
  window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
});
</script>
