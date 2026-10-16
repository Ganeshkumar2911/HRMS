<template>
  <div class="min-h-screen flex flex-col justify-between selection:bg-surface-container selection:text-primary-text bg-background text-primary-text transition-colors duration-200">
    <!-- Top Navigation Utility Bar -->
    <header class="w-full border-b border-primary-border px-6 lg:px-12 py-2.5 flex items-center justify-between bg-card-background/80 backdrop-blur-sm sticky top-0 z-30 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg overflow-hidden bg-primary flex items-center justify-center shadow-xs shrink-0">
          <img :src="modusLogo" alt="Modus HR" class="w-full h-full object-cover">
        </div>
        <div class="flex items-baseline gap-2">
          <span class="font-bold tracking-tight text-primary-text text-base">Modus</span>
          <span class="text-[11px] font-semibold text-text-muted uppercase tracking-wider">HR &amp; Workspaces</span>
        </div>
      </div>
      
      <div class="flex items-center gap-4 text-xs font-medium text-secondary-text">
        <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full badge-status-completed text-[11px] font-medium border border-status-completed/20">
          <span class="w-1.5 h-1.5 rounded-full dot-status-completed animate-pulse"></span>
          Systems Operational
        </span>
        <div class="h-4 w-px bg-primary-border hidden sm:block"></div>
        <a href="#help" class="hover:text-primary-text text-secondary-text transition-colors flex items-center gap-1">
          <span class="material-symbols-rounded text-sm">help_outline</span>
          Support
        </a>
        <div class="h-4 w-px bg-primary-border"></div>
        <span class="text-text-muted text-[11px]">v2.4 Enterprise</span>
        <div class="h-4 w-px bg-primary-border"></div>
        <button
          @click="handleToggleTheme"
          type="button"
          class="btn-icon text-secondary-text hover:text-primary-text p-1.5 rounded-lg transition-colors cursor-pointer"
          :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span class="material-symbols-rounded text-[18px]">
            {{ currentTheme === 'dark' ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>
      </div>
    </header>

    <!-- Main Content Layout -->
    <main class="flex-1 flex items-center justify-center px-4 py-2 sm:py-3 lg:px-8 overflow-hidden">
      <router-view />
    </main>

    <!-- Global Footer -->
    <footer class="w-full border-t border-primary-border px-6 lg:px-12 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-text-muted shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full dot-status-completed"></div>
        <span>Modus HR Platform • Connected to <code class="bg-surface-subtle px-1.5 py-0.5 rounded border border-primary-border font-mono text-[10px] text-primary-text">api.modus.internal:8000</code></span>
      </div>
      <div class="flex items-center gap-4">
        <span>Protected by TLS 1.3 Strict Transport</span>
        <span>© {{ new Date().getFullYear() }} Modus Technologies Inc.</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { initTheme, toggleTheme, getTheme } from '@/utils/theme'
import modusLogo from '@/assets/modus-logo.png'

const currentTheme = ref('light')

onMounted(() => {
  currentTheme.value = initTheme() || getTheme() || 'light'
})

const handleToggleTheme = () => {
  currentTheme.value = toggleTheme()
}
</script>