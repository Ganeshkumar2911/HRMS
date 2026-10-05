<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-sm w-full p-5 shadow-xl flex flex-col max-h-[80vh] overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
        <h3 class="title-text text-sm font-semibold text-primary-text">Add Member to Channel</h3>
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="p-1 rounded-lg text-secondary-text hover:text-primary-text transition-colors"
        >
          <span class="material-symbols-rounded text-lg">close</span>
        </button>
      </div>

      <div class="py-3">
        <div class="relative">
          <span class="material-symbols-rounded absolute left-2.5 top-2.5 text-secondary-text text-sm pointer-events-none">search</span>
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search team members..."
            class="input-field pl-8 pr-3 py-1.5 text-xs"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto no-scrollbar space-y-1 divide-y divide-primary-border/30 max-h-56">
        <div
          v-if="isSearching"
          class="p-6 text-center text-xs text-secondary-text"
        >
          Searching...
        </div>

        <div
          v-else-if="!searchQuery.trim()"
          class="p-6 text-center text-xs text-secondary-text"
        >
          Type a name or email to find members
        </div>

        <div
          v-else-if="eligibleUsers.length === 0"
          class="p-6 text-center text-xs text-secondary-text"
        >
          No available users to add
        </div>

        <div
          v-for="user in eligibleUsers"
          :key="user.id"
          class="p-2 flex items-center justify-between gap-2 hover:bg-background rounded transition-colors"
        >
          <div>
            <p class="text-xs font-medium text-primary-text">{{ user.name }}</p>
            <p class="text-[10px] text-secondary-text">{{ user.email }}</p>
          </div>
          <button
            type="button"
            @click="handleAdd(user.id)"
            class="btn-primary text-xs px-2.5 py-1"
            :disabled="chatStore.actionLoading"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat/chat";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  conversationId: {
    type: [Number, String],
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

const chatStore = useChatStore();
const searchQuery = ref("");
const searchInputRef = ref(null);
const isSearching = ref(false);

let searchDebounceTimer = null;
const SEARCH_DEBOUNCE_MS = 300;

const eligibleUsers = computed(() => {
  const currentMemberIds = new Set(
    chatStore.activeMembers.filter((member) => !member.left_at).map((member) => member.user_id)
  );
  return chatStore.availableUsers.filter((user) => !currentMemberIds.has(user.id));
});

const runSearch = async (query) => {
  const searchTerm = (query || "").trim();
  if (!searchTerm) {
    chatStore.availableUsers = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  try {
    await chatStore.searchUsers(searchTerm);
  } finally {
    isSearching.value = false;
  }
};

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      searchQuery.value = "";
      chatStore.availableUsers = [];
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      return;
    }
    await nextTick();
    searchInputRef.value?.focus();
  }
);

watch(searchQuery, (query) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    runSearch(query);
  }, SEARCH_DEBOUNCE_MS);
});

const handleAdd = async (userId) => {
  await chatStore.addMember(props.conversationId, userId);
  emit("update:modelValue", false);
};
</script>
