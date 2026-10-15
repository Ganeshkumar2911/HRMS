<script setup>
import { ref, reactive } from "vue";
import { useAuthStore } from "@/stores/auth/auth";
import loginImg from "@/assets/login-img.png";

const authStore = useAuthStore();
const showPassword = ref(false);
const rememberDevice = ref(true);

const form = reactive({
  email: "superadmin@test.com",
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
    errors.email = "Corporate email is required.";
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
    // Errors are displayed via authStore.error & alert
  }
};

const handleSSO = (provider) => {
  if (provider) {
    // Placeholder feedback for SSO action
    console.info(`SSO action triggered: ${provider}`);
  }
};
</script>

<<template>
  <div class="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
    
    <!-- Left Column: Editorial & Value Proposition -->
    <div class="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-5 xl:space-y-6 pr-3">
      <div class="space-y-4">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-primary-border text-secondary-text text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-[#D6A564]"></span>
          <span>A quiet, calm workspace for high-focus teams</span>
        </div>

        <h2 class="text-2xl xl:text-3xl font-semibold tracking-tight text-primary-text leading-snug">
          Work with clarity.<br>
          <span class="text-text-muted font-normal">Tasks, Chat &amp; HR unified into one quiet rhythm.</span>
        </h2>

        <p class="text-xs xl:text-sm text-secondary-text leading-relaxed max-w-md">
          Modus HR cuts through cluttered enterprise dashboards with calm typography, respectful contrast, and purposeful information density.
        </p>
      </div>

      <!-- Editorial Photo Frame with Floating Glassmorphic Pill -->
      <div class="relative rounded-2xl overflow-hidden border border-primary-border  group">
        <img
          :src="loginImg"
          alt="Minimalist quiet architectural workspace desk with notebook and tablet"
          class="w-full h-48 sm:h-52 xl:h-60 object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>

        <!-- Frosted Glass Status Pill Overlaid -->
        <div class="absolute bottom-3 left-3 right-3 backdrop-blur-md bg-card-background/90 border border-primary-border rounded-xl px-4 py-2.5 flex items-center justify-between ">
          <div class="flex items-center gap-3.5 text-xs font-medium text-primary-text">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full dot-status-completed animate-pulse"></span>
              <span class="font-semibold text-primary-text">6</span>
              <span class="text-text-muted text-[11px]">Tasks in SLA</span>
            </div>
            <div class="h-3 w-px bg-primary-border"></div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full dot-status-pending"></span>
              <span class="font-semibold text-primary-text">5</span>
              <span class="text-text-muted text-[11px]">Active Channels synced</span>
            </div>
          </div>
          <div class="hidden sm:flex items-center gap-1 text-[11px] text-text-muted font-medium">
            <span class="material-symbols-rounded text-sm text-status-completed">verified</span>
            <span>ACME Global</span>
          </div>
        </div>
      </div>

      <!-- Elegant Subtle Quote -->
      <div class="flex items-center gap-3.5 pt-1">
        <div class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center font-semibold text-primary-text text-[10px] shrink-0 border border-primary-border">
          SC
        </div>
        <div class="text-xs text-text-muted">
          <p class="font-medium text-primary-text leading-tight">Sarah Chen <span class="font-normal text-text-muted">• Engineering Lead</span></p>
          <p class="text-[11px] text-secondary-text mt-0.5">"The quiet-work aesthetic makes long shift handoffs effortless."</p>
        </div>
      </div>
    </div>

    <!-- Right Column: Authentication Card -->
    <div class="w-full lg:col-span-6">
      <div class="bg-card-background rounded-2xl border border-primary-border p-6 sm:p-8  transition-all">
        
        <!-- Card Header with Brand mark for mobile and title -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-2.5">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subtle border border-primary-border text-primary-text text-[11px] font-semibold">
              <span class="material-symbols-rounded text-xs text-secondary-text">shield_lock</span>
              <span>Enterprise Access</span>
            </div>
            <span class="text-[11px] font-medium text-text-muted">Single Sign-On enabled</span>
          </div>
          
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-primary-text">Sign in to your account</h1>
          <p class="text-xs text-secondary-text mt-1">Unified workspace for Chat, HRMS, Tasks, and Admin delegation.</p>
        </div>

        <!-- SSO Fast Action -->
        <div class="space-y-2.5 mb-4">
          <button
            type="button"
            @click="handleSSO('Google Workspace')"
            class="w-full py-2.5 px-4 rounded-xl border border-primary-border bg-surface-subtle hover:bg-surface-container text-xs font-semibold text-primary-text flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"></path>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"></path>
            </svg>
            <span>Continue with Google Workspace</span>
          </button>

          <button
            type="button"
            @click="handleSSO('Okta / SAML SSO')"
            class="w-full py-2.5 px-4 rounded-xl border border-primary-border bg-surface-subtle hover:bg-surface-container text-xs font-semibold text-primary-text flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <svg class="w-4 h-4 text-primary-text shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm6-4H7v-2h10v2zm0-4H7V7h10v2z"></path>
            </svg>
            <span>Sign in with Okta / SAML SSO</span>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative flex items-center my-4">
          <div class="flex-grow border-t border-primary-border"></div>
          <span class="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-text-muted font-medium bg-card-background px-1">or with work email</span>
          <div class="flex-grow border-t border-primary-border"></div>
        </div>

        <!-- Form Element -->
        <form @submit.prevent="handleLogin" class="space-y-3.5">
          
          <!-- Optional Dynamic Error Alert -->
          <div
            v-if="authStore.error"
            class="p-2.5 rounded-xl bg-status-overdue-bg border border-primary-red/30 text-primary-red text-xs flex items-center gap-2"
          >
            <span class="material-symbols-rounded text-base shrink-0">error_outline</span>
            <span class="font-medium">{{ authStore.error }}</span>
          </div>

          <!-- Email Field -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="email" class="block text-xs font-medium text-primary-text">Corporate email</label>
              <span class="text-[11px] text-text-muted">e.g. ada@acmeglobal.com</span>
            </div>
            <div class="relative rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <span class="material-symbols-rounded text-[18px]">mail</span>
              </div>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="name@company.com"
                class="w-full bg-surface-subtle border border-primary-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-primary-text placeholder:text-text-muted/70 focus:outline-none focus:bg-card-background focus:border-secondary transition-colors font-medium"
                :class="{'border-primary-red/60': errors.email}"
              />
            </div>
            <p v-if="errors.email" class="text-[11px] text-primary-red mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="block text-xs font-medium text-primary-text">Password</label>
              <a href="#reset" class="text-[11px] font-medium text-secondary-text hover:text-primary-text hover:underline">
                Forgot password?
              </a>
            </div>
            <div class="relative rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                <span class="material-symbols-rounded text-[18px]">lock</span>
              </div>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••••••"
                class="w-full bg-surface-subtle border border-primary-border rounded-xl pl-10 pr-10 py-2.5 text-xs text-primary-text placeholder:text-text-muted/70 focus:outline-none focus:bg-card-background focus:border-secondary transition-colors font-medium"
                :class="{'border-primary-red/60': errors.password}"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted hover:text-primary-text transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                <span class="material-symbols-rounded text-[18px]">
                  {{ showPassword ? 'visibility_off' : 'visibility' }}
                </span>
              </button>
            </div>
            <p v-if="errors.password" class="text-[11px] text-primary-red mt-1">{{ errors.password }}</p>
          </div>

          <!-- Remember me & device security -->
          <div class="flex items-center justify-between pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                v-model="rememberDevice"
                class="w-4 h-4 rounded border-primary-border text-primary focus:ring-0 accent-primary cursor-pointer"
              />
              <span class="text-xs text-secondary-text font-normal">Remember device for 30 days</span>
            </label>
            <span class="text-[11px] text-text-muted flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full dot-status-completed"></span>
              Encrypted session
            </span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.actionLoading"
            class="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary text-btn-text-primary hover:bg-primary-hover active:scale-[0.99] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer  disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.actionLoading" class="material-symbols-rounded text-sm animate-spin">progress_activity</span>
            <span>{{ authStore.actionLoading ? 'Authenticating...' : 'Sign in to Modus' }}</span>
            <span class="material-symbols-rounded text-sm">arrow_forward</span>
          </button>
        </form>

        <!-- Footer Links & Delegation -->
        <div class="mt-5 pt-4 border-t border-primary-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-secondary-text">
          <div>
            <span>Don't have an enterprise account?</span>
            <router-link to="/signup" class="text-primary-text font-semibold hover:underline ml-1">
              Request access
            </router-link>
          </div>
          <a href="#sso" class="text-[11px] text-text-muted hover:text-primary-text transition-colors">
            Self-hosted gateway →
          </a>
        </div>

      </div>

      <!-- Privacy & Security Compliance Strip -->
      <div class="mt-4 text-center flex items-center justify-center gap-4 text-[11px] text-text-muted">
        <a href="#privacy" class="hover:text-primary-text transition-colors">Privacy Policy</a>
        <span>•</span>
        <a href="#terms" class="hover:text-primary-text transition-colors">Terms of Service</a>
        <span>•</span>
        <a href="#audit" class="hover:text-primary-text transition-colors">Audit &amp; Compliance</a>
      </div>
    </div>
  </div>
</template>

