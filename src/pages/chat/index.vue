<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-primary-border/60">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <span class="material-symbols-rounded text-base">forum</span>
          <span>Communication</span>
        </div>
        <h1 class="title-text text-primary-text">Team Chat</h1>
        <p class="sub-text text-secondary-text">
          Realtime messaging powered by shared WebSocket (<code class="font-mono text-xs">/ws</code>).
        </p>
      </div>

      <!-- Realtime indicator -->
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <div
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium"
          :class="wsStore.isConnected ? 'bg-primary-green/10 text-primary-green border-primary-green/20' : 'bg-primary-yellow/10 text-primary-yellow border-primary-yellow/20'"
        >
          <span class="w-2 h-2 rounded-full" :class="wsStore.isConnected ? 'bg-primary-green' : 'bg-primary-yellow animate-ping'"></span>
          <span>{{ wsStore.isConnected ? 'WS Connected' : 'Connecting to /ws...' }}</span>
        </div>
      </div>
    </div>

    <!-- Contract Information Card -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">person</span>
          <span>Login Identity</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">{{ authStore.currentUser?.name || 'Anonymous' }}</p>
        <p class="text-[11px] text-secondary-text font-mono">user_id: {{ authStore.currentUser?.id || '-' }}</p>
      </div>

      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">groups</span>
          <span>Membership Model</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">Conversation Active Member</p>
        <p class="text-[11px] text-secondary-text">Independent of HRMS RBAC hierarchy</p>
      </div>

      <div class="p-4 rounded-xl bg-card-background border border-primary-border/70 space-y-1">
        <div class="flex items-center gap-1.5 text-xs text-secondary-text font-medium">
          <span class="material-symbols-rounded text-sm text-primary">bolt</span>
          <span>Realtime Status</span>
        </div>
        <p class="text-sm font-semibold text-primary-text">
          {{ wsStore.isConnected ? 'Active Channel' : 'Offline / Standby' }}
        </p>
        <p class="text-[11px] text-secondary-text">Presence heartbeat: 30s interval</p>
      </div>
    </div>

    <!-- Chat Workspace Area Placeholder -->
    <div class="bg-card-background border border-primary-border/70 rounded-xl min-h-[420px] flex flex-col items-center justify-center p-8 text-center">
      <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <span class="material-symbols-rounded text-3xl">chat_bubble</span>
      </div>
      <h2 class="title-text text-primary-text mb-1">Chat Module Canvas</h2>
      <p class="sub-text text-secondary-text max-w-md mb-6">
        The shared App Shell contract is ready. Realtime WebSocket events, heartbeat, and user identity have been attached.
      </p>
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-primary-border text-xs text-secondary-text font-mono">
        <span class="w-2 h-2 rounded-full bg-primary-green"></span>
        <span>Route: /chat &bull; Auth: Bearer {{ authStore.currentUser?.email }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth/auth";
import { useWsStore } from "@/stores/ws/ws";

const authStore = useAuthStore();
const wsStore = useWsStore();
</script>
