<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-md w-full p-5 shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-rounded text-lg">person_add</span>
          </div>
          <div>
            <h3 class="title-text text-sm font-semibold text-primary-text">Start Direct Message</h3>
            <p class="sub-text text-secondary-text">Select a team member to chat with</p>
          </div>
        </div>
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text transition-colors"
        >
          <span class="material-symbols-rounded text-lg">close</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="py-3">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-3 top-2.5 text-secondary-text text-sm pointer-events-none">search</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search team members by name or email..."
            class="input-field pl-9 pr-3 py-2 text-xs"
          />
        </div>
      </div>

      <!-- User List -->
      <div class="flex-1 overflow-y-auto no-scrollbar space-y-1 divide-y divide-primary-border/30">
        <div
          v-if="filteredUsers.length === 0"
          class="p-6 text-center text-xs text-secondary-text"
        >
          No users found
        </div>

        <div
          v-for="user in filteredUsers"
          :key="user.id"
          @click="selectUser(user.id)"
          class="p-2.5 rounded-lg flex items-center justify-between gap-3 hover:bg-background transition-colors cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center border border-primary-border/50">
              {{ getInitials(user.name) }}
            </div>
            <div>
              <p class="text-xs font-semibold text-primary-text leading-tight">{{ user.name }}</p>
              <p class="text-[11px] text-secondary-text leading-tight mt-0.5">{{ user.email }}</p>
            </div>
          </div>

          <button
            type="button"
            class="btn-primary text-xs px-2.5 py-1"
            :disabled="chatStore.actionLoading"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useChatStore } from "@/stores/chat/chat";
import { useAuthStore } from "@/stores/auth/auth";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const chatStore = useChatStore();
const authStore = useAuthStore();
const searchQuery = ref("");

onMounted(() => {
  chatStore.fetchUsers();
});

const filteredUsers = computed(() => {
  const currentUserId = authStore.currentUser?.id;
  return chatStore.availableUsers.filter((u) => {
    if (u.id === currentUserId) return false;
    if (!searchQuery.value) return true;
    const q = searchQuery.value.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });
});

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const selectUser = async (userId) => {
  await chatStore.createDirectConversation(userId);
  emit("update:modelValue", false);
};
</script>
