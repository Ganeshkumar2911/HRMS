<template>
  <section class="w-full sm:w-80 border-r border-primary-border bg-background flex flex-col shrink-0 h-full" data-purpose="conversations-pane">
    <!-- Conversations Top Header & Action -->
    <div class="p-3.5 pb-2.5 border-b border-primary-border">
      <div class="flex items-center justify-between mb-3">
        <h1 class="text-base font-bold text-primary-text tracking-tight">Conversations</h1>
        <!-- New message button + dropdown -->
        <div class="relative" ref="newChatDropdownRef">
          <button
            type="button"
            @click="isNewMenuOpen = !isNewMenuOpen"
            class="w-7 h-7 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary flex items-center justify-center transition shadow-xs cursor-pointer"
            title="New message"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="isNewMenuOpen"
            class="absolute right-0 mt-1.5 w-48 bg-card-background border border-primary-border rounded-xl p-1 z-50 shadow-lg flex flex-col gap-0.5 animate-in fade-in duration-100"
          >
            <button
              type="button"
              @click="openNewDirect"
              class="flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors text-left cursor-pointer"
            >
              <svg class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <span class="font-medium">Direct Message</span>
            </button>
            <button
              type="button"
              @click="openNewGroup"
              class="flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-xs text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition-colors text-left cursor-pointer"
            >
              <svg class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <span class="font-medium">New Group Channel</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Internal Search -->
      <div class="relative mb-3">
        <span class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-text-muted">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          @input="handleSearchInput"
          class="w-full pl-8 pr-3 py-1.5 bg-card-background border border-primary-border rounded-lg text-xs placeholder:text-text-muted focus:outline-none focus:border-secondary-text text-primary-text transition"
          placeholder="Search conversations or people..."
          type="text"
        />
        <button
          v-if="searchQuery"
          @click="handleSearchClear"
          class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-text-muted hover:text-primary-text cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
      </div>

      <!-- Sub Filter Navigation -->
      <div class="flex items-center space-x-1 p-0.5 bg-surface-subtle rounded-lg text-xs font-medium text-secondary-text">
        <button
          @click="activeFilter = 'all'"
          type="button"
          class="flex-1 py-1 rounded-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
          :class="activeFilter === 'all' ? 'bg-card-background text-primary-text font-semibold shadow-xs' : 'hover:text-primary-text text-secondary-text'"
        >
          <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span>All</span>
        </button>
        <button
          @click="activeFilter = 'direct'"
          type="button"
          class="flex-1 py-1 rounded-md flex items-center justify-center space-x-1 transition cursor-pointer"
          :class="activeFilter === 'direct' ? 'bg-card-background text-primary-text font-semibold shadow-xs' : 'hover:text-primary-text text-secondary-text'"
        >
          <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span>Direct</span>
        </button>
        <button
          @click="activeFilter = 'group'"
          type="button"
          class="flex-1 py-1 rounded-md flex items-center justify-center space-x-1 transition cursor-pointer"
          :class="activeFilter === 'group' ? 'bg-card-background text-primary-text font-semibold shadow-xs' : 'hover:text-primary-text text-secondary-text'"
        >
          <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span>Group</span>
        </button>
        <button
          @click="activeFilter = 'archived'"
          type="button"
          class="px-2 py-1 rounded-md transition cursor-pointer"
          :class="activeFilter === 'archived' ? 'bg-card-background text-primary-text font-semibold shadow-xs' : 'hover:text-primary-text text-secondary-text'"
          title="Archived"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="chatStore.loading" class="p-6 text-center text-xs text-text-muted flex items-center justify-center space-x-2">
        <svg class="w-4 h-4 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Loading conversations...</span>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredConversations.length === 0 && apiSearchResults.length === 0"
        class="p-8 text-center text-xs text-text-muted space-y-2"
      >
        <div class="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center mx-auto text-text-muted">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </div>
        <p class="font-medium text-primary-text">{{ searchQuery ? 'No matches found' : 'No conversations found' }}</p>
        <p class="text-[11px] text-text-muted">{{ searchQuery ? `No conversations match "${searchQuery}"` : 'Start a new direct chat or group channel above.' }}</p>
      </div>

      <!-- Conversation Item -->
      <div
        v-for="conv in filteredConversations"
        :key="conv.id"
        @click="handleSelectConversation(conv.id)"
        class="p-3 cursor-pointer transition select-none"
        :class="String(chatStore.activeConversationId) === String(conv.id)
          ? 'bg-card-background border-l-2 border-primary'
          : 'hover:bg-card-background/70 border-l-2 border-transparent'"
      >
        <div class="flex items-start space-x-3">
          <!-- Avatar Icon -->
          <div class="relative shrink-0 mt-0.5">
            <!-- DIRECT: Round Initials Avatar -->
            <div
              v-if="conv.type === 'DIRECT'"
              class="w-8 h-8 rounded-full bg-surface-container text-primary-text font-semibold text-xs flex items-center justify-center border border-primary-border"
            >
              {{ getInitials(getConversationTitle(conv)) }}
            </div>

            <!-- GROUP: Rounded Square Icon Avatar -->
            <div
              v-else
              class="w-8 h-8 rounded-lg bg-surface-container text-secondary-text flex items-center justify-center border border-primary-border"
            >
              <!-- Group Specific Icons matching Figma -->
              <svg v-if="conv.name && conv.name.includes('Design')" class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg v-else-if="conv.name && conv.name.includes('Announce')" class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <svg v-else class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </div>

            <!-- Online Indicator for Direct Partner -->
            <span
              v-if="conv.type === 'DIRECT' && isDirectPartnerOnline(conv)"
              class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-green border-2 border-card-background"
            ></span>
          </div>

          <!-- Conv Title & Snippet -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <!-- Group title with member count badge -->
              <div v-if="conv.type === 'GROUP'" class="flex items-center space-x-1.5 truncate">
                <span class="text-xs font-semibold text-primary-text truncate">{{ conv.name || 'Group' }}</span>
                <span class="text-[9px] px-1 py-0.2 rounded bg-surface-subtle text-secondary-text font-medium border border-primary-border/60">
                  {{ (conv.members?.length || 0) }} members
                </span>
              </div>
              <!-- Direct Chat title -->
              <span v-else class="text-xs font-semibold text-primary-text truncate">
                {{ getConversationTitle(conv) }}
              </span>
              <span class="text-[10px] text-text-muted shrink-0">
                {{ formatTime(conv.updated_at || conv.created_at) }}
              </span>
            </div>

            <!-- Last Message Snippet -->
            <p class="text-xs text-secondary-text truncate font-normal leading-relaxed">
              <template v-if="conv.type === 'GROUP' && conv.last_message && conv.last_message.includes(':')">
                <span class="text-primary-text font-medium">{{ conv.last_message.split(':')[0] }}:</span>{{ conv.last_message.substring(conv.last_message.indexOf(':') + 1) }}
              </template>
              <template v-else>
                {{ conv.last_message || 'No messages yet' }}
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- People Directory API Results (When Searching) -->
      <div v-if="searchQuery && apiSearchResults.length > 0" class="p-2 border-t border-primary-border bg-surface-subtle/50">
        <div class="px-2 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span class="flex items-center space-x-1.5">
            <svg class="w-3.5 h-3.5 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
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
            <div class="flex items-center space-x-2.5 min-w-0">
              <div class="w-7 h-7 rounded-full bg-surface-container text-primary-text font-semibold text-xs flex items-center justify-center border border-primary-border shrink-0">
                {{ getInitials(user.name) }}
              </div>
              <div class="min-w-0">
                <p class="text-xs font-semibold text-primary-text truncate group-hover:text-primary transition-colors">
                  {{ user.name }}
                </p>
                <p class="text-[10px] text-text-muted truncate">
                  {{ user.email }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary text-btn-text-primary transition-all shrink-0 cursor-pointer"
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
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useChatStore } from "@/stores/chat/chat";
import { useAuthStore } from "@/stores/auth/auth";
import NewDirectModal from "./NewDirectModal.vue";
import NewGroupModal from "./NewGroupModal.vue";

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

let searchDebounce = null;

const handleSearchInput = () => {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(async () => {
    const q = searchQuery.value.trim();
    if (!q) {
      apiSearchResults.value = [];
      return;
    }
    try {
      await chatStore.searchUsers(q);
      const results = (chatStore.availableUsers || []).filter(
        (u) => u.id !== currentUserId.value
      );
      apiSearchResults.value = results;
    } catch {
      apiSearchResults.value = [];
    }
  }, 250);
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

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  if (diffDays === 1) {
    return "Yesterday";
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
