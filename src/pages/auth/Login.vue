<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import apiRequest from '@/api/request'
import authToken from '@/common/authToken'
import urls from '@/api/urls'

const router = useRouter()
const loading = ref(false)
const showPassword = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
  general: '',
})

const validate = () => {
  let valid = true
  errors.email = ''
  errors.password = ''
  errors.general = ''

  if (!form.email) {
    errors.email = 'Email is required.'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  }

  return valid
}

const handleLogin = () => {
  if (!validate()) return

  loading.value = true

  const successHandler = (res) => {
    loading.value = false
    authToken.setToken(res.access_token)
    if (res.role) {
      localStorage.setItem('role', res.role)
    }
    if (res.user_id) {
      localStorage.setItem('user_id', res.user_id)
    }
    
    router.push('/dashboard').catch(() => {
      window.location.href = '/dashboard'
    })
  }

  const failureHandler = (err) => {
    loading.value = false
    errors.general = err?.error || err?.message || 'Invalid credentials. Please try again.'
  }

  apiRequest(urls.KEYS.POST, urls.auth.login, {
    data: {
      email: form.email,
      password: form.password,
    },
    isTokenRequired: false,
    onSuccess: successHandler,
    onFailure: failureHandler,
  })
}
</script>

<template>
  <div class="bg-card-background border border-primary-border/70 rounded-xl p-6 sm:p-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="title-text text-primary-text mb-1">Sign in</h1>
      <p class="sub-text text-secondary-text">Enter your credentials to access the HRMS workspace</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- General Error Alert -->
      <div 
        v-if="errors.general" 
        class="p-3 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs flex items-center gap-2"
      >
        <span class="material-symbols-rounded text-base shrink-0">error</span>
        <span>{{ errors.general }}</span>
      </div>

      <!-- Email Field -->
      <div>
        <label class="block text-xs font-medium text-primary-text mb-1.5">Email address</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
            <span class="material-symbols-rounded text-[18px]">mail</span>
          </div>
          <input 
            v-model="form.email" 
            type="email" 
            class="input-field pl-9 pr-3 py-2 text-xs" 
            :class="{'border-primary-red/60': errors.email}"
            placeholder="admin@company.com" 
          />
        </div>
        <p v-if="errors.email" class="text-[11px] text-primary-red mt-1">{{ errors.email }}</p>
      </div>

      <!-- Password Field -->
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="block text-xs font-medium text-primary-text">Password</label>
        </div>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary-text">
            <span class="material-symbols-rounded text-[18px]">lock</span>
          </div>
          <input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'" 
            class="input-field pl-9 pr-9 py-2 text-xs" 
            :class="{'border-primary-red/60': errors.password}"
            placeholder="••••••••" 
          />
          <button 
            type="button" 
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            @click="showPassword = !showPassword"
          >
            <span class="material-symbols-rounded text-[18px]">
              {{ showPassword ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>
        <p v-if="errors.password" class="text-[11px] text-primary-red mt-1">{{ errors.password }}</p>
      </div>

      <!-- Remember & Forgot -->
      <div class="flex items-center justify-between text-xs pt-1">
        <label class="flex items-center gap-2 text-secondary-text cursor-pointer select-none">
          <input type="checkbox" class="custom-checkbox" />
          <span>Remember this device</span>
        </label>
        <span class="text-xs text-secondary-text hover:text-primary-text transition-colors cursor-pointer">
          Forgot password?
        </span>
      </div>

      <!-- Submit Button -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full btn-primary py-2.5 text-xs font-medium mt-2 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span v-if="loading" class="material-symbols-rounded text-base animate-spin">progress_activity</span>
        <span>{{ loading ? 'Signing in...' : 'Sign in to Account' }}</span>
      </button>
    </form>

    <!-- Bottom Notice -->
    <div class="mt-6 pt-4 border-t border-primary-border/60 text-center">
      <router-link to="/auth/dev-login" class="text-xs text-secondary-text hover:text-primary-text transition-colors">
        Switch to Developer Environment Login &rarr;
      </router-link>
    </div>
  </div>
</template>
