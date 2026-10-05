<template>
  <div class="space-y-6 max-w-2xl">
    <div class="pb-5 border-b border-primary-border/60">
      <div class="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
        <span class="material-symbols-rounded text-base">campaign</span>
        <span>Admin</span>
      </div>
      <h1 class="title-text text-primary-text">Broadcast notification</h1>
      <p class="sub-text text-secondary-text">Sends in-app SYSTEM notifications. Actor is excluded from recipients.</p>
    </div>

    <form class="space-y-4 p-5 rounded-xl border border-primary-border bg-card-background" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-xs font-medium text-secondary-text mb-1">Title</label>
        <input v-model="form.title" class="input-field px-3 py-2 text-sm" required maxlength="255" />
      </div>
      <div>
        <label class="block text-xs font-medium text-secondary-text mb-1">Body</label>
        <textarea v-model="form.body" class="input-field px-3 py-2 text-sm min-h-28" required />
      </div>
      <div>
        <label class="block text-xs font-medium text-secondary-text mb-1">Target</label>
        <select v-model="form.target" class="input-field px-3 py-2 text-sm">
          <option value="ALL">ALL users</option>
          <option value="USERS">Specific user IDs</option>
          <option value="ROLES">Role IDs</option>
        </select>
      </div>
      <div v-if="form.target === 'USERS'">
        <label class="block text-xs font-medium text-secondary-text mb-1">User IDs (comma-separated)</label>
        <input v-model="userIdsText" class="input-field px-3 py-2 text-sm" placeholder="1, 2, 3" />
      </div>
      <div v-if="form.target === 'ROLES'">
        <label class="block text-xs font-medium text-secondary-text mb-1">Role IDs (comma-separated)</label>
        <input v-model="roleIdsText" class="input-field px-3 py-2 text-sm" placeholder="1, 2" />
      </div>
      <button type="submit" class="btn-primary text-xs px-4 py-2" :disabled="store.actionLoading">
        Send broadcast
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useNotificationsStore } from "@/stores/notifications/notifications";

const store = useNotificationsStore();
const userIdsText = ref("");
const roleIdsText = ref("");
const form = reactive({
  title: "",
  body: "",
  target: "ALL",
});

const parseIds = (text) =>
  text
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

const handleSubmit = async () => {
  const payload = {
    title: form.title,
    body: form.body,
    target: form.target,
  };
  if (form.target === "USERS") payload.user_ids = parseIds(userIdsText.value);
  if (form.target === "ROLES") payload.role_ids = parseIds(roleIdsText.value);
  await store.broadcast(payload);
};
</script>
