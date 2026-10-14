<template>
  <div class="h-full flex flex-col bg-card-background border-r border-primary-border/60 w-full sm:w-80 lg:w-88 shrink-0">
    <!-- List Header -->
    <div class="border-b border-primary-border/60">
      <!-- Title & Search Area -->
      <div class="p-3.5 pb-2.5 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="title-text text-base font-semibold text-primary-text tracking-tight">Conversations</h2>
          </div>
          
          <!-- New Chat Dropdown -->
          <div class="relative" ref="newChatDropdownRef">
            <button
              type="button"
              @click="isNewMenuOpen = !isNewMenuOpen"
              class="w-8 h-8 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center transition-all active:scale-95  cursor-pointer"
              title="New Chat"
              aria-label="New Chat"
            >
              <span class="material-symbols-rounded text-base">edit_square</span>
            </button>

            <div
              v-if="isNewMenuOpen"
              class="absolute right-0 mt-1.5 w-48 bg-card-background border border-primary-border/80 rounded-xl p-1 z-50 shadow-lg flex flex-col gap-0.5 animate-in fade-in duration-100"
            >
              <button
                type="button"
                @click="openNewDirect"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors text-left cursor-pointer"
              >
                <span class="material-symbols-rounded text-base text-primary">person_add</span>
                <span class="font-medium">Direct Message</span>
              </button>
              <button
                type="button"
                @click="openNewGroup"
                class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-background transition-colors text-left cursor-pointer"
              >
                <span class="material-symbols-rounded text-base text-primary">group_add</span>
                <span class="font-medium">New Group Channel</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Search Input Component (Supports both Frontend Filtering & Debounced API Directory Search) -->
        <SearchInput
          v-model="searchQuery"
          placeholder="Search conversations or people..."
          variant="pill"
          size="md"
          :search-fn="handleApiSearch"
          @clear="handleSearchClear"
        />
      </div>

      <!-- Tab Filter (All / Direct / Group / Archived) -->
      <div class="px-2">
        <Tabs
          v-model="activeFilter"
          :tabs="filterTabs"
          size="sm"
          :bordered="false"
        />
      </div>
    </div>

    <!-- Conversations Scrollable List -->
    <div class="flex-1 overflow-y-auto no-scrollbar divide-y divide-primary-border/30">
      <!-- Loading Shimmer / Spinner -->
      <div v-if="chatStore.loading" class="p-6 text-center text-xs text-secondary-text flex items-center justify-center gap-2">
        <span class="material-symbols-rounded text-base animate-spin text-primary">progress_activity</span>
        <span>Loading conversations...</span>
      </div>

      <!-- Empty State (When neither local conversations nor API search results exist) -->
      <div
        v-else-if="filteredConversations.length === 0 && apiSearchResults.length === 0"
        class="p-8 text-center text-xs text-secondary-text space-y-2"
      >
        <span class="material-symbols-rounded text-3xl text-secondary-text/50">chat_bubble_outline</span>
        <p class="font-medium text-primary-text">{{ searchQuery ? 'No matches found' : 'No conversations found' }}</p>
        <p class="text-[11px]">{{ searchQuery ? `No conversations or colleagues match "${searchQuery}"` : 'Start a new direct chat or group channel above.' }}</p>
      </div>

      <!-- Local Conversations Section Header (when searching) -->
      <div
        v-if="searchQuery && filteredConversations.length > 0"
        class="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-secondary-text uppercase tracking-wider bg-background/30"
      >
        Conversations ({{ filteredConversations.length }})
      </div>

      <!-- Conversation Item -->
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        @click="handleSelectConversation(conv.id)"
        class="p-3 flex items-start gap-3 hover:bg-background transition-colors cursor-pointer relative"
        :class="{'bg-primary/5': String(chatStore.activeConversationId) === String(conv.id)}"
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

      <!-- People Directory API Results (Shown when searching) -->
      <div v-if="searchQuery && apiSearchResults.length > 0" class="p-2 border-t border-primary-border/40 bg-background/40">
        <div class="px-2 py-1.5 text-[10px] font-semibold text-secondary-text uppercase tracking-wider flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <span class="material-symbols-rounded text-sm text-primary">person_search</span>
            <span>People Directory</span>
          </span>
          <span class="text-[10px] text-primary font-medium">{{ apiSearchResults.length }} found</span>
        </div>

        <div class="space-y-0.5 mt-1">
          <div
            v-for="user in apiSearchResults"
            :key="user.id"
            @click="handleStartChatWithUser(user)"
            class="p-2 rounded-lg flex items-center justify-between hover:bg-card-background transition-colors cursor-pointer group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center border border-primary-border/50 shrink-0">
                {{ getUserInitials(user.name) }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-medium text-primary-text truncate group-hover:text-primary transition-colors">
                  {{ user.name }}
                </p>
                <p class="text-[10px] text-secondary-text truncate">
                  {{ user.email }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0 cursor-pointer"
            >
              Message
            </button>
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
import Tabs from "@/components/common/Tabs.vue";
import SearchInput from "@/components/common/SearchInput.vue";

const emit = defineEmits(["select"]);

const chatStore = useChatStore();
const authStore = useAuthStore();

const searchQuery = ref("");
const apiSearchResults = ref([]);
const activeFilter = ref("all");
const isNewMenuOpen = ref(false);
const isDirectModalOpen = ref(false);
const isGroupModalOpen = ref(false);
const newChatDropdownRef = ref(null);

const handleApiSearch = async (query) => {
  const q = (query || "").trim();
  if (!q) {
    apiSearchResults.value = [];
    return;
  }
  try {
    await chatStore.searchUsers(q);
    // Exclude myself from directory results
    const results = (chatStore.availableUsers || []).filter(
      (u) => u.id !== currentUserId.value
    );
    apiSearchResults.value = results;
  } catch (err) {
    console.warn("API Search failed:", err);
    apiSearchResults.value = [];
  }
};

const handleSearchClear = () => {
  searchQuery.value = "";
  apiSearchResults.value = [];
};

const handleSelectConversation = (convId) => {
  chatStore.selectConversation(convId);
  emit("select", convId);
};

const handleStartChatWithUser = (user) => {
  // Check if a direct chat with this user already exists
  const existingConv = chatStore.conversations.find((c) => {
    if (c.type !== "DIRECT") return false;
    return c.members?.some((m) => m.user_id === user.id);
  });

  if (existingConv) {
    chatStore.selectConversation(existingConv.id);
    emit("select", existingConv.id);
  } else {
    chatStore.createDirectConversation(user.id);
  }
  searchQuery.value = "";
  apiSearchResults.value = [];
};

const getUserInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const filterTabs = computed(() => [
  { id: "all", label: "All", icon: "forum" },
  { id: "direct", label: "Direct", icon: "person" },
  { id: "group", label: "Group", icon: "groups" },
  { id: "archived", label: "Archived", icon: "archive" },
]);

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
  return !!chatStore.onlineUserIds[other.user_id];
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
