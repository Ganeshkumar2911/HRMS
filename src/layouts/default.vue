<template>
  <div class="min-h-screen w-full flex flex-col bg-background text-primary-text transition-colors duration-200">
    <!-- Top App Shell Bar -->
    <TopBar />

    <!-- Main Content Area -->
    <main class="flex-1 w-full max-w-400 mx-auto p-2.5 sm:p-2.5 lg:p-2.5 overflow-y-auto no-scrollbar">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import TopBar from "@/components/default/TopBar.vue";
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";
import authToken from "@/common/authToken";

const authStore = useAuthStore();
const wsStore = useWsStore();

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
