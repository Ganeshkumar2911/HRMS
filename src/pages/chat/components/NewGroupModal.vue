<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-md w-full p-5 shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-rounded text-lg">group_add</span>
          </div>
          <div>
            <h3 class="title-text text-sm font-semibold text-primary-text">Create Group Channel</h3>
            <p class="sub-text text-secondary-text">Name your channel and select members</p>
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

      <!-- Form -->
      <form @submit.prevent="handleCreateGroup" class="flex flex-col flex-1 overflow-hidden pt-3 space-y-4">
        <!-- Group Name -->
        <div>
          <label class="block text-xs font-medium text-primary-text mb-1">Channel Name</label>
          <input
            v-model="groupName"
            type="text"
            required
            placeholder="e.g. Engineering Updates"
            class="input-field px-3 py-2 text-xs"
          />
        </div>

        <!-- Members Selection -->
        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-medium text-primary-text">
              Select Members ({{ selectedMemberIds.length }} selected)
            </label>
          </div>

          <!-- Search member filter -->
          <div class="relative mb-2">
            <span class="material-symbols-rounded absolute left-2.5 top-2 text-secondary-text text-sm pointer-events-none">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="input-field pl-8 pr-3 py-1.5 text-xs"
            />
          </div>

          <!-- Users Checklist -->
          <div class="flex-1 overflow-y-auto no-scrollbar border border-primary-border/60 rounded-lg p-2 space-y-1 divide-y divide-primary-border/30 max-h-48">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="pt-1.5 first:pt-0"
            >
              <label class="flex items-center justify-between p-1.5 rounded hover:bg-background transition-colors cursor-pointer select-none">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    :value="user.id"
                    v-model="selectedMemberIds"
                    class="custom-checkbox"
                  />
                  <div>
                    <p class="text-xs font-medium text-primary-text leading-tight">{{ user.name }}</p>
                    <p class="text-[10px] text-secondary-text leading-tight">{{ user.email }}</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-3 border-t border-primary-border/60 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="btn-secondary text-xs px-3.5 py-1.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn-primary text-xs px-4 py-1.5"
            :disabled="!groupName.trim() || selectedMemberIds.length === 0 || chatStore.actionLoading"
          >
            <span v-if="chatStore.actionLoading" class="material-symbols-rounded text-xs animate-spin">progress_activity</span>
            <span>Create Channel</span>
          </button>
        </div>
      </form>
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

const groupName = ref("");
const selectedMemberIds = ref([]);
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

const handleCreateGroup = async () => {
  if (!groupName.value.trim() || selectedMemberIds.value.length === 0) return;

  await chatStore.createGroupConversation({
    name: groupName.value.trim(),
    memberIds: selectedMemberIds.value,
  });

  groupName.value = "";
  selectedMemberIds.value = [];
  emit("update:modelValue", false);
};
</script>
