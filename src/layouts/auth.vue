<template>
  <div class="min-h-screen flex flex-col justify-between bg-background text-primary-text transition-colors duration-200">
    <!-- Top Minimal Navigation -->
    <header class="w-full px-6 py-4 flex items-center justify-between border-b border-primary-border/60 bg-card-background">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <span class="material-symbols-rounded text-lg">diversity_3</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-sm tracking-tight text-primary-text">HRMS Portal</span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">Enterprise</span>
        </div>
      </div>

      <!-- Quick Theme Toggle -->
      <button
        @click="handleToggleTheme"
        type="button"
        class="btn-icon text-secondary-text hover:text-primary-text p-2 rounded-lg transition-colors cursor-pointer"
        :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <span class="material-symbols-rounded text-[18px]">
          {{ currentTheme === 'dark' ? 'light_mode' : 'dark_mode' }}
        </span>
      </button>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div class="w-full max-w-md">
        <router-view />
      </div>
    </main>

    <!-- Clean Minimal Footer -->
    <footer class="w-full py-4 px-6 border-t border-primary-border/60 bg-card-background text-center">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-md mx-auto text-xs text-secondary-text">
        <span>&copy; {{ new Date().getFullYear() }} HRMS Platform. All rights reserved.</span>
        <div class="flex items-center gap-3">
          <span class="hover:text-primary-text transition-colors cursor-pointer">Support</span>
          <span>&bull;</span>
          <span class="hover:text-primary-text transition-colors cursor-pointer">Privacy</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initTheme, toggleTheme, getTheme } from '@/utils/theme'

const currentTheme = ref('light')

onMounted(() => {
  currentTheme.value = initTheme() || getTheme() || 'light'
})

const handleToggleTheme = () => {
  currentTheme.value = toggleTheme()
}
</script>