<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    @click.self="$emit('update:modelValue', false)"
  >
    <div class="bg-card-background border border-primary-border rounded-xl max-w-md w-full p-5 shadow-xl flex flex-col max-h-[85vh] overflow-hidden">
      <div class="flex items-center justify-between pb-3 border-b border-primary-border/60">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span class="material-symbols-rounded text-lg">group_add</span>
          </div>
          <div>
            <h3 class="title-text text-sm font-semibold text-primary-text">Create Group Channel</h3>
            <p class="sub-text text-secondary-text">Name your channel and search members</p>
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

      <form @submit.prevent="handleCreateGroup" class="flex flex-col flex-1 overflow-hidden pt-3 space-y-4">
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

        <div class="flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-medium text-primary-text">
              Select Members ({{ selectedUsers.length }} selected)
            </label>
          </div>

          <div class="relative mb-2">
            <span class="material-symbols-rounded absolute left-2.5 top-2 text-secondary-text text-sm pointer-events-none">search</span>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Search users by name or email..."
              class="input-field pl-8 pr-3 py-1.5 text-xs"
              autocomplete="off"
            />
          </div>

          <div
            v-if="selectedUsers.length > 0"
            class="flex flex-wrap gap-1 mb-2"
          >
            <span
              v-for="user in selectedUsers"
              :key="`selected-${user.id}`"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium"
            >
              {{ user.name }}
              <button type="button" class="leading-none" @click="toggleUser(user)">
                <span class="material-symbols-rounded text-xs">close</span>
              </button>
            </span>
          </div>

          <div class="flex-1 overflow-y-auto no-scrollbar border border-primary-border/60 rounded-lg p-2 space-y-1 divide-y divide-primary-border/30 max-h-48">
            <div v-if="isSearching" class="p-4 text-center text-xs text-secondary-text">
              Searching...
            </div>
            <div v-else-if="!searchQuery.trim()" class="p-4 text-center text-xs text-secondary-text">
              Type a name or email to find members
            </div>
            <div v-else-if="searchResults.length === 0" class="p-4 text-center text-xs text-secondary-text">
              No users found
            </div>
            <div
              v-for="user in searchResults"
              :key="user.id"
              class="pt-1.5 first:pt-0"
            >
              <label class="flex items-center justify-between p-1.5 rounded hover:bg-background transition-colors cursor-pointer select-none">
                <div class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    class="custom-checkbox"
                    :checked="isSelected(user.id)"
                    @change="toggleUser(user)"
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
            :disabled="!groupName.trim() || selectedUsers.length === 0 || chatStore.actionLoading"
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
import { ref, computed, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat/chat";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const chatStore = useChatStore();
const groupName = ref("");
const searchQuery = ref("");
const searchInputRef = ref(null);
const isSearching = ref(false);
const selectedById = ref({});
const searchResults = ref([]);

let searchDebounceTimer = null;
const SEARCH_DEBOUNCE_MS = 300;

const selectedUsers = computed(() => Object.values(selectedById.value));

const isSelected = (userId) => Boolean(selectedById.value[userId]);

const toggleUser = (user) => {
  const nextSelected = { ...selectedById.value };
  if (nextSelected[user.id]) {
    delete nextSelected[user.id];
  } else {
    nextSelected[user.id] = user;
  }
  selectedById.value = nextSelected;
};

const runSearch = async (query) => {
  const searchTerm = (query || "").trim();
  if (!searchTerm) {
    searchResults.value = [];
    isSearching.value = false;
    return;
  }

  isSearching.value = true;
  try {
    await chatStore.searchUsers(searchTerm);
    searchResults.value = [...chatStore.availableUsers];
  } finally {
    isSearching.value = false;
  }
};

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (!isOpen) {
      groupName.value = "";
      searchQuery.value = "";
      selectedById.value = {};
      searchResults.value = [];
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

const handleCreateGroup = async () => {
  if (!groupName.value.trim() || selectedUsers.value.length === 0) return;

  await chatStore.createGroupConversation({
    name: groupName.value.trim(),
    memberIds: selectedUsers.value.map((user) => user.id),
  });

  emit("update:modelValue", false);
};
</script>
