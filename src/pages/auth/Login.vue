<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/auth/auth";

const authStore = useAuthStore();
const showPassword = ref(false);

const form = reactive({
  email: "",
  password: "",
});

const errors = reactive({
  email: "",
  password: "",
});

const validate = () => {
  let valid = true;
  errors.email = "";
  errors.password = "";

  if (!form.email) {
    errors.email = "Email is required.";
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address.";
    valid = false;
  }

  if (!form.password) {
    errors.password = "Password is required.";
    valid = false;
  }

  return valid;
};

const handleLogin = async () => {
  if (!validate()) return;

  try {
    await authStore.login({
      email: form.email,
      password: form.password,
    });
  } catch (_) {
    // Errors are displayed via authStore.error & snackbar
  }
};
</script>

<template>
  <div class="bg-card-background border border-primary-border/70 rounded-xl p-6 sm:p-8 shadow-sm">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2 text-primary">
        <span class="material-symbols-rounded text-2xl">workspaces</span>
        <span class="text-xs font-bold uppercase tracking-wider">Enterprise Access</span>
      </div>
      <h1 class="title-text text-primary-text mb-1">Sign in to your account</h1>
      <p class="sub-text text-secondary-text">Unified workspace for Chat, HRMS, Tasks, and Admin</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- General Error Alert -->
      <div
        v-if="authStore.error"
        class="p-3 rounded-lg bg-primary-red/10 border border-primary-red/20 text-primary-red text-xs flex items-center gap-2"
      >
        <span class="material-symbols-rounded text-base shrink-0">error</span>
        <span>{{ authStore.error }}</span>
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
            placeholder="ada@example.com"
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

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.actionLoading"
        class="w-full btn-primary py-2.5 text-xs font-medium mt-2 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span v-if="authStore.actionLoading" class="material-symbols-rounded text-base animate-spin">progress_activity</span>
        <span>{{ authStore.actionLoading ? 'Signing in...' : 'Sign in' }}</span>
      </button>
    </form>

    <!-- Footer Links -->
    <div class="mt-6 pt-4 border-t border-primary-border/60 text-center text-xs text-secondary-text">
      Don't have an account?
      <router-link to="/signup" class="text-primary hover:underline font-semibold ml-1">
        Create account
      </router-link>
    </div>
  </div>
</template>
