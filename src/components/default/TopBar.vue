<template>
  <header class="w-full bg-card-background border-b border-primary-border/60 sticky top-0 z-40 transition-colors duration-200">
    <div class="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
      
      <!-- Left: Brand & Navigation -->
      <div class="flex items-center gap-6">
        <!-- Brand Logo -->
        <router-link to="/dashboard" class="flex items-center gap-2.5 shrink-0 group">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
            <span class="material-symbols-rounded text-lg">diversity_3</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-sm tracking-tight text-primary-text">PeopleHR</span>
            <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">Admin</span>
          </div>
        </router-link>

        <!-- Divider -->
        <div class="h-4 w-px bg-primary-border/80 hidden lg:block"></div>

        <!-- Desktop Navigation Items -->
        <nav class="hidden lg:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            :class="isActive(item.path) 
              ? 'bg-primary/10 text-primary font-semibold' 
              : 'text-secondary-text hover:text-primary-text hover:bg-primary-border/30'"
          >
            <span class="material-symbols-rounded text-[17px]">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </div>

      <!-- Right: Search, Utilities & Profile -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Quick Search Pill -->
        <div class="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-background border border-primary-border/60 text-xs text-secondary-text hover:border-primary-border transition-colors cursor-pointer">
          <span class="material-symbols-rounded text-sm">search</span>
          <span class="text-[11px]">Search records...</span>
          <kbd class="text-[10px] font-sans px-1 py-0.2 rounded border border-primary-border bg-card-background text-secondary-text">⌘K</kbd>
        </div>

        <!-- Notifications -->
        <button
          type="button"
          class="btn-icon relative p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
          title="Notifications"
        >
          <span class="material-symbols-rounded text-[19px]">notifications</span>
          <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-red"></span>
        </button>

        <!-- Theme Toggle -->
        <button
          @click="handleToggleTheme"
          type="button"
          class="btn-icon p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
          :title="currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <span class="material-symbols-rounded text-[19px]">
            {{ currentTheme === 'dark' ? 'light_mode' : 'dark_mode' }}
          </span>
        </button>

        <!-- Vertical Divider -->
        <div class="h-4 w-px bg-primary-border/80 hidden sm:block"></div>

        <!-- User Profile Dropdown -->
        <div class="relative" ref="profileDropdownRef">
          <button
            @click="isProfileOpen = !isProfileOpen"
            type="button"
            class="flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-background transition-colors cursor-pointer text-left"
          >
            <!-- User Avatar -->
            <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center border border-primary-border/60">
              AU
            </div>
            <!-- Name & Role -->
            <div class="hidden sm:flex flex-col">
              <span class="text-xs font-semibold text-primary-text leading-tight">Admin User</span>
              <span class="text-[10px] text-secondary-text leading-tight">Super Admin</span>
            </div>
            <span 
              class="material-symbols-rounded text-base text-secondary-text transition-transform duration-150"
              :class="{'rotate-180': isProfileOpen}"
            >
              expand_more
            </span>
          </button>

          <!-- Flat Dropdown Menu (No drop shadow, subtle border) -->
          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-1.5 w-48 bg-card-background border border-primary-border/80 rounded-lg p-1 z-50 flex flex-col gap-0.5 animate-in fade-in duration-100"
          >
            <div class="px-3 py-2 border-b border-primary-border/60 sm:hidden">
              <p class="text-xs font-semibold text-primary-text">Admin User</p>
              <p class="text-[10px] text-secondary-text">admin@hrms.com</p>
            </div>

            <router-link
              to="/dashboard"
              @click="isProfileOpen = false"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
            >
              <span class="material-symbols-rounded text-base">person</span>
              <span>My Profile</span>
            </router-link>

            <router-link
              to="/auth/dev-login"
              @click="isProfileOpen = false"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors"
            >
              <span class="material-symbols-rounded text-base">terminal</span>
              <span>Dev Console</span>
            </router-link>

            <div class="my-1 border-t border-primary-border/60"></div>

            <button
              @click="handleLogout"
              type="button"
              class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-primary-red hover:bg-primary-red/10 transition-colors text-left cursor-pointer"
            >
              <span class="material-symbols-rounded text-base">logout</span>
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu Toggle -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          type="button"
          class="lg:hidden btn-icon p-1.5 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors cursor-pointer"
        >
          <span class="material-symbols-rounded text-[22px]">
            {{ isMobileMenuOpen ? 'close' : 'menu' }}
          </span>
        </button>

      </div>
    </div>

    <!-- Mobile Navigation Drawer / Dropdown -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden border-t border-primary-border/60 bg-card-background px-4 py-3 flex flex-col gap-1 transition-all"
    >
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        @click="isMobileMenuOpen = false"
        class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
        :class="isActive(item.path) 
          ? 'bg-primary/10 text-primary font-semibold' 
          : 'text-secondary-text hover:text-primary-text hover:bg-background'"
      >
        <span class="material-symbols-rounded text-[18px]">{{ item.icon }}</span>
        <span>{{ item.label }}</span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { initTheme, toggleTheme, getTheme } from '@/utils/theme'
import authToken from '@/common/authToken'

const route = useRoute()
const router = useRouter()

const isProfileOpen = ref(false)
const isMobileMenuOpen = ref(false)
const currentTheme = ref('light')
const profileDropdownRef = ref(null)

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
  { label: 'Transfers', path: '/vendor/transfers', icon: 'swap_horiz' },
]

const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/'
  }
  return route.path.startsWith(path)
}

onMounted(() => {
  currentTheme.value = initTheme() || getTheme() || 'light'
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(event.target)) {
    isProfileOpen.value = false
  }
}

const handleToggleTheme = () => {
  currentTheme.value = toggleTheme()
}

const handleLogout = () => {
  isProfileOpen.value = false
  authToken.removeToken()
  router.push('/auth/login').catch(() => {
    window.location.href = '/auth/login'
  })
}
</script>
