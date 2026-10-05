<template>
  <div class="min-h-screen w-full flex flex-col bg-background text-primary-text transition-colors duration-200">
    <!-- Single Top Navigation Bar -->
    <TopBar />

    <!-- Main Workspace Content Area -->
    <main class="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import TopBar from "@/components/default/TopBar.vue";
</script>
