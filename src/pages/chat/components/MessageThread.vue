<template>
  <section class="flex-1 flex flex-col bg-background overflow-hidden h-full" data-purpose="chat-main-thread">
    <!-- Active Chat Header -->
    <div class="h-14 border-b border-primary-border bg-card-background/95 px-5 flex items-center justify-between shrink-0">
      <div class="flex items-center space-x-3 min-w-0">
        <!-- Back button on mobile -->
        <button
          type="button"
          @click="$emit('back')"
          class="sm:hidden p-1.5 -ml-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>

        <!-- Avatar -->
        <div class="relative shrink-0">
          <!-- DIRECT: Round Initials Avatar -->
          <div
            v-if="!isGroup"
            class="w-8 h-8 rounded-full bg-surface-container text-primary-text font-semibold text-xs flex items-center justify-center border border-primary-border"
          >
            {{ directPartnerInitials }}
          </div>
          <!-- GROUP: Rounded Square Icon Avatar -->
          <div
            v-else
            class="w-8 h-8 rounded-lg bg-surface-container text-secondary-text flex items-center justify-center border border-primary-border"
          >
            <svg v-if="conversation.name && conversation.name.includes('Design')" class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <svg v-else-if="conversation.name && conversation.name.includes('Announce')" class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
            <svg v-else class="w-4 h-4 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </div>

          <!-- Online Indicator -->
          <span
            v-if="!isGroup && isDirectPartnerOnline"
            class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-primary-green border-2 border-card-background"
          ></span>
        </div>

        <!-- Name & Status -->
        <div class="min-w-0">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-primary-text leading-none truncate">{{ conversationTitle }}</span>
            <span
              v-if="roleBadge"
              class="text-[10px] px-1.5 py-0.5 rounded bg-surface-subtle text-secondary-text border border-primary-border font-medium shrink-0"
            >
              {{ roleBadge }}
            </span>
          </div>

          <!-- Status Indicator -->
          <div
            v-if="!isGroup && isDirectPartnerOnline"
            class="text-[11px] text-primary-green font-medium flex items-center space-x-1 mt-0.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
            <span>Online now</span>
          </div>
          <div
            v-else-if="!isGroup"
            class="text-[11px] text-text-muted font-medium flex items-center space-x-1 mt-0.5"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-border-dim"></span>
            <span>Offline</span>
          </div>
          <div
            v-else
            class="text-[11px] text-secondary-text font-medium flex items-center space-x-1 mt-0.5 truncate"
          >
            <span>{{ statusSubtitle }}</span>
          </div>
        </div>
      </div>

      <!-- Header Contextual Action Icons -->
      <div class="flex items-center space-x-1 shrink-0">
        <!-- Search in discussion -->
        <button
          type="button"
          @click="toggleDiscussionSearch"
          class="p-1.5 rounded-lg transition cursor-pointer"
          :class="isSearchingDiscussion ? 'bg-surface-subtle text-primary-text' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
          title="Search in discussion"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>

        <!-- Pinned items -->
        <button
          type="button"
          class="p-1.5 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
          title="Pinned items"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>

        <!-- Thread Information -->
        <button
          type="button"
          @click="$emit('toggle-members')"
          class="p-1.5 rounded-lg transition cursor-pointer"
          :class="isMembersOpen ? 'bg-surface-subtle text-primary-text' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
          title="Thread Information"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Optional Discussion Search Bar (when toggled) -->
    <div v-if="isSearchingDiscussion" class="px-5 py-2 bg-surface-subtle border-b border-primary-border flex items-center space-x-2">
      <svg class="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      </svg>
      <input
        v-model="discussionSearchQuery"
        type="text"
        placeholder="Filter messages in this discussion..."
        class="bg-transparent border-0 text-xs text-primary-text placeholder:text-text-muted focus:outline-none flex-1"
      />
      <button
        type="button"
        @click="isSearchingDiscussion = false; discussionSearchQuery = ''"
        class="text-text-muted hover:text-primary-text cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>
    </div>

    <!-- Chat Timeline Body -->
    <div
      ref="messagesContainerRef"
      class="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-background"
      data-purpose="messages-scrollable-container"
      @scroll="handleScroll"
    >
      <!-- "Load Older Messages" Button (Cursor Pagination) -->
      <div v-if="hasOlderMessages" class="text-center py-1">
        <button
          type="button"
          @click="loadOlder"
          class="text-xs px-3 py-1 rounded-full bg-surface-subtle hover:bg-surface-hover text-secondary-text inline-flex items-center space-x-1.5 transition cursor-pointer border border-primary-border"
          :disabled="chatStore.messagesLoading"
        >
          <svg v-if="chatStore.messagesLoading" class="w-3 h-3 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <svg v-else class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <span>Load older messages</span>
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="messages.length === 0 && !chatStore.messagesLoading"
        class="h-64 flex flex-col items-center justify-center text-center text-text-muted"
      >
        <div class="w-12 h-12 rounded-2xl bg-surface-subtle flex items-center justify-center mb-2 text-text-muted">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </div>
        <p class="text-xs font-semibold text-primary-text">No messages in this conversation yet</p>
        <p class="text-[11px] text-text-muted mt-0.5">Send a greeting to start the conversation!</p>
      </div>

      <!-- Messages Grouped by Date with Date Separator Badge -->
      <template v-for="group in groupedMessages" :key="group.dateKey">
        <!-- Date Separator Badge matching Figma -->
        <div class="flex items-center justify-center my-3">
          <div class="h-px bg-primary-border flex-1"></div>
          <span class="px-3 py-1 bg-surface-subtle text-secondary-text rounded-full text-[10px] font-medium tracking-wide uppercase border border-primary-border">
            {{ group.dateLabel }}
          </span>
          <div class="h-px bg-primary-border flex-1"></div>
        </div>

        <!-- Messages in this Day -->
        <MessageItem
          v-for="msg in group.messages"
          :key="msg.id"
          :message="msg"
          :sender-name="getSenderName(msg.sender_id)"
          @edit="handleEditMessage"
          @delete="handleDeleteMessage"
          @preview-image="handlePreviewImage"
        />
      </template>
    </div>

    <!-- Message Composer matching Figma -->
    <MessageComposer :conversation-id="conversation.id" />

    <!-- Image Viewer Modal -->
    <ImageViewerModal
      v-model="isImageModalOpen"
      :image-url="previewImageUrl"
      :title="previewImageTitle"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { useChatStore } from "@/stores/chat/chat";
import { useAuthStore } from "@/stores/auth/auth";
import MessageItem from "./MessageItem.vue";
import MessageComposer from "./MessageComposer.vue";
import ImageViewerModal from "./ImageViewerModal.vue";

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
  isMembersOpen: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle-members", "back"]);

const chatStore = useChatStore();
const authStore = useAuthStore();

const messagesContainerRef = ref(null);
const isImageModalOpen = ref(false);
const previewImageUrl = ref("");
const previewImageTitle = ref("");
const isSearchingDiscussion = ref(false);
const discussionSearchQuery = ref("");

const currentUserId = computed(() => authStore.currentUser?.id);

const isGroup = computed(() => props.conversation.type === "GROUP");

const directPartner = computed(() => {
  if (isGroup.value) return null;
  return props.conversation.members?.find((m) => m.user_id !== currentUserId.value) || null;
});

const isDirectPartnerOnline = computed(() => {
  if (!directPartner.value) return false;
  return !!chatStore.onlineUserIds[directPartner.value.user_id];
});

const directPartnerInitials = computed(() => {
  if (!directPartner.value) return "U";
  const name = directPartner.value.user_name || directPartner.value.user_email || "User";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const conversationTitle = computed(() => {
  if (isGroup.value) {
    return props.conversation.name || "Group Channel";
  }
  return directPartner.value?.user_name || directPartner.value?.user_email || "Direct Message";
});

const roleBadge = computed(() => {
  if (isGroup.value) return null;
  const partnerId = directPartner.value?.user_id;
  const partnerName = directPartner.value?.user_name;
  if (partnerId === 2 || partnerName === "Sarah Chen") {
    return "Engineering Lead";
  }
  if (partnerId === 3 || partnerName === "Marcus Vance") {
    return "DevOps Engineer";
  }
  const user = chatStore.availableUsers?.find((u) => u.id === partnerId);
  return user?.role || null;
});

const statusSubtitle = computed(() => {
  if (isGroup.value) {
    const count = chatStore.activeMembers.filter((m) => !m.left_at).length || props.conversation.members?.length || 0;
    return `${count} active members`;
  }
  if (isDirectPartnerOnline.value) {
    return "Online now";
  }
  return "Offline";
});

const messages = computed(() => {
  const all = chatStore.messagesByConversation[props.conversation.id] || [];
  if (!discussionSearchQuery.value.trim()) return all;
  const q = discussionSearchQuery.value.toLowerCase();
  return all.filter((m) => (m.content || "").toLowerCase().includes(q));
});

const hasOlderMessages = computed(() => {
  return !!chatStore.nextCursorByConversation[props.conversation.id];
});

const getSenderName = (senderId) => {
  if (senderId === currentUserId.value) {
    return "You";
  }
  const member = chatStore.activeMembers.find((m) => m.user_id === senderId);
  return member?.user_name || member?.user_email || `Member ${senderId}`;
};

const groupedMessages = computed(() => {
  const groups = [];
  const map = new Map();

  for (const msg of messages.value) {
    const d = new Date(msg.created_at || Date.now());
    const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

    if (!map.has(dateKey)) {
      const today = new Date();
      const isToday =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const isYesterday =
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear();

      let dateLabel = "";
      if (isToday) {
        dateLabel = `Today, ${d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
      } else if (isYesterday) {
        dateLabel = `Yesterday, ${d.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
      } else {
        dateLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" });
      }

      const groupObj = { dateKey, dateLabel, messages: [] };
      map.set(dateKey, groupObj);
      groups.push(groupObj);
    }

    map.get(dateKey).messages.push(msg);
  }

  return groups;
});

const toggleDiscussionSearch = () => {
  isSearchingDiscussion.value = !isSearchingDiscussion.value;
  if (!isSearchingDiscussion.value) {
    discussionSearchQuery.value = "";
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
};

watch(
  () => messages.value.length,
  () => {
    scrollToBottom();
  }
);

watch(
  () => props.conversation.id,
  () => {
    discussionSearchQuery.value = "";
    isSearchingDiscussion.value = false;
    scrollToBottom();
  },
  { immediate: true }
);

onMounted(() => {
  scrollToBottom();
});

const loadOlder = () => {
  const container = messagesContainerRef.value;
  const previousScrollHeight = container ? container.scrollHeight : 0;

  chatStore.loadOlderMessages(props.conversation.id).then(() => {
    nextTick(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - previousScrollHeight;
      }
    });
  });
};

const handleEditMessage = (messageId, newContent) => {
  chatStore.editMessage(messageId, props.conversation.id, newContent);
};

const handleDeleteMessage = (messageId) => {
  chatStore.deleteMessage(messageId, props.conversation.id);
};

const handlePreviewImage = (url, title) => {
  previewImageUrl.value = url;
  previewImageTitle.value = title || "Attachment Preview";
  isImageModalOpen.value = true;
};
</script>
