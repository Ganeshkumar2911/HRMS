<template>
  <div class="h-full flex flex-col bg-card-background border-r border-primary-border/60 w-full sm:w-80 lg:w-88 shrink-0">
    <!-- List Header -->
    <div class="p-3.5 border-b border-primary-border/60 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="title-text text-base font-semibold text-primary-text">Conversations</h2>
        
        <!-- New Chat Dropdown -->
        <div class="relative" ref="newChatDropdownRef">
          <button
            type="button"
            @click="isNewMenuOpen = !isNewMenuOpen"
            class="btn-primary text-xs px-2.5 py-1.5 flex items-center gap-1 cursor-pointer"
          >
            <span class="material-symbols-rounded text-base">add</span>
            <span>New Chat</span>
          </button>

          <div
            v-if="isNewMenuOpen"
            class="absolute right-0 mt-1 w-44 bg-card-background border border-primary-border/80 rounded-lg p-1 z-50 shadow-lg flex flex-col gap-0.5 animate-in fade-in duration-100"
          >
            <button
              type="button"
              @click="openNewDirect"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors text-left cursor-pointer"
            >
              <span class="material-symbols-rounded text-base text-primary">person_add</span>
              <span>Direct Message</span>
            </button>
            <button
              type="button"
              @click="openNewGroup"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors text-left cursor-pointer"
            >
              <span class="material-symbols-rounded text-base text-primary">group_add</span>
              <span>New Group Channel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <span class="material-symbols-rounded absolute left-2.5 top-2 text-secondary-text text-sm pointer-events-none">search</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Filter conversations..."
          class="input-field pl-8 pr-3 py-1.5 text-xs w-full"
        />
      </div>

      <!-- Tab Filter (All / Direct / Group / Archived) -->
      <div class="flex items-center gap-1 p-0.5 rounded-lg bg-background border border-primary-border/60 text-xs">
        <button
          v-for="tab in ['all', 'direct', 'group', 'archived']"
          :key="tab"
          type="button"
          @click="activeFilter = tab"
          class="flex-1 py-1 rounded-md text-[11px] font-medium capitalize text-center transition-all cursor-pointer"
          :class="activeFilter === tab
            ? 'bg-card-background text-primary-text font-semibold shadow-xs'
            : 'text-secondary-text hover:text-primary-text'"
        >
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Conversations Scrollable List -->
    <div class="flex-1 overflow-y-auto no-scrollbar divide-y divide-primary-border/30">
      <!-- Loading Shimmer / Spinner -->
      <div v-if="chatStore.loading" class="p-6 text-center text-xs text-secondary-text flex items-center justify-center gap-2">
        <span class="material-symbols-rounded text-base animate-spin text-primary">progress_activity</span>
        <span>Loading conversations...</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredConversations.length === 0"
        class="p-8 text-center text-xs text-secondary-text space-y-2"
      >
        <span class="material-symbols-rounded text-3xl text-secondary-text/50">chat_bubble_outline</span>
        <p class="font-medium text-primary-text">No conversations found</p>
        <p class="text-[11px]">Start a new direct chat or group channel above.</p>
      </div>

      <!-- Conversation Item -->
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        @click="$emit('select', conv.id)"
        class="p-3 flex items-start gap-3 hover:bg-background transition-colors cursor-pointer relative"
        :class="{'bg-primary/5 border-l-2 border-primary': chatStore.activeConversationId === conv.id}"
      >
        <!-- Icon Avatar -->
        <div class="relative shrink-0 mt-0.5">
          <div class="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center border border-primary-border/50">
            <span class="material-symbols-rounded text-lg">
              {{ conv.type === 'GROUP' ? 'groups' : 'person' }}
            </span>
          </div>
          <!-- Online indicator for direct chat -->
          <span
            v-if="conv.type === 'DIRECT' && isDirectPartnerOnline(conv)"
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-green border-2 border-card-background"
            title="Online"
          ></span>
        </div>

        <!-- Details -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <h4 class="text-xs font-semibold text-primary-text truncate leading-tight">
              {{ getConversationTitle(conv) }}
            </h4>
            <span class="text-[10px] text-secondary-text shrink-0">
              {{ formatTime(conv.updated_at || conv.created_at) }}
            </span>
          </div>

          <p class="text-[11px] text-secondary-text truncate leading-tight">
            {{ conv.last_message || 'No messages yet' }}
          </p>

          <!-- Badges -->
          <div class="flex items-center gap-1.5 mt-1.5">
            <span
              v-if="conv.type === 'GROUP'"
              class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-background text-secondary-text border border-primary-border/40"
            >
              {{ conv.members?.length || 0 }} members
            </span>
            <span
              v-if="conv.archived_at"
              class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary-yellow/10 text-primary-yellow border border-primary-yellow/20"
            >
              Archived
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <NewDirectModal v-model="isDirectModalOpen" />
    <NewGroupModal v-model="isGroupModalOpen" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useChatStore } from "@/stores/chat/chat";
import { useAuthStore } from "@/stores/auth/auth";
import NewDirectModal from "./NewDirectModal.vue";
import NewGroupModal from "./NewGroupModal.vue";

defineEmits(["select"]);

const chatStore = useChatStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const activeFilter = ref("all");
const isNewMenuOpen = ref(false);
const isDirectModalOpen = ref(false);
const isGroupModalOpen = ref(false);
const newChatDropdownRef = ref(null);

const currentUserId = computed(() => authStore.currentUser?.id);

const filteredConversations = computed(() => {
  return chatStore.conversations.filter((c) => {
    // Filter tab
    if (activeFilter.value === "archived") {
      if (!c.archived_at) return false;
    } else {
      if (c.archived_at) return false; // Hide archived by default
      if (activeFilter.value === "direct" && c.type !== "DIRECT") return false;
      if (activeFilter.value === "group" && c.type !== "GROUP") return false;
    }

    // Search query
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      const title = getConversationTitle(c).toLowerCase();
      const lastMsg = (c.last_message || "").toLowerCase();
      return title.includes(q) || lastMsg.includes(q);
    }

    return true;
  });
});

const getConversationTitle = (conv) => {
  if (conv.type === "GROUP") {
    return conv.name || "Group Channel";
  }
  const other = conv.members?.find((m) => m.user_id !== currentUserId.value);
  return other?.user_name || other?.user_email || "Direct Message";
};

const isDirectPartnerOnline = (conv) => {
  const other = conv.members?.find((m) => m.user_id !== currentUserId.value);
  if (!other) return false;
  return chatStore.onlineUserIds.has(other.user_id);
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const openNewDirect = () => {
  isNewMenuOpen.value = false;
  isDirectModalOpen.value = true;
};

const openNewGroup = () => {
  isNewMenuOpen.value = false;
  isGroupModalOpen.value = true;
};

const handleClickOutside = (e) => {
  if (newChatDropdownRef.value && !newChatDropdownRef.value.contains(e.target)) {
    isNewMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
