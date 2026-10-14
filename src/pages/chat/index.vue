<template>
  <div class="h-full w-full flex overflow-hidden bg-card-background text-primary-text" data-purpose="chat-application-workspace">
    <!-- Left Column: Conversations List -->
    <ConversationList
      class="sm:flex"
      :class="{'hidden': selectedConversation && isMobileView, 'flex': !selectedConversation || !isMobileView}"
      @select="handleSelectConversation"
    />

    <!-- Middle Column: Message Thread -->
    <div
      v-if="selectedConversation"
      class="flex-1 flex flex-col min-w-0 h-full overflow-hidden"
      :class="{'flex': selectedConversation, 'hidden sm:flex': !selectedConversation}"
    >
      <MessageThread
        :conversation="selectedConversation"
        :is-members-open="isMembersPanelOpen"
        @toggle-members="isMembersPanelOpen = !isMembersPanelOpen"
        @back="handleBackToConversationList"
      />
    </div>

    <!-- No Conversation Selected Placeholder (Desktop) -->
    <div
      v-else
      class="hidden sm:flex flex-1 flex-col items-center justify-center p-8 text-center bg-background text-primary-text"
    >
      <div class="w-14 h-14 rounded-2xl bg-surface-subtle text-secondary-text flex items-center justify-center mb-3 border border-primary-border">
        <svg class="w-7 h-7 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-primary-text mb-1">Select a conversation</h3>
      <p class="text-xs text-secondary-text max-w-sm">
        Pick a conversation from the sidebar or start a new direct message or group channel.
      </p>
    </div>

    <!-- Right Column: Members Side Panel -->
    <MembersPanel
      v-if="selectedConversation && isMembersPanelOpen"
      :conversation="selectedConversation"
      @close="isMembersPanelOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChatStore } from "@/stores/chat/chat";
import ConversationList from "./components/ConversationList.vue";
import MessageThread from "./components/MessageThread.vue";
import MembersPanel from "./components/MembersPanel.vue";

const route = useRoute();
const router = useRouter();
const chatStore = useChatStore();

const isMembersPanelOpen = ref(false);
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1200);

const isMobileView = computed(() => windowWidth.value < 640);

const selectedConversation = computed(() => {
  return chatStore.activeConversation;
});

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

const handleSelectConversation = (conversationId) => {
  chatStore.selectConversation(conversationId);
  router.push(`/chat/${conversationId}`).catch(() => {});
};

const handleBackToConversationList = () => {
  chatStore.activeConversationId = null;
  router.push("/chat").catch(() => {});
};

// Sync route param with store
watch(
  () => route.params.conversationId,
  (newId) => {
    if (newId) {
      chatStore.selectConversation(newId);
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  chatStore.setupRealtimeListeners();
  chatStore.fetchConversations().then(() => {
    if (route.params.conversationId) {
      chatStore.selectConversation(route.params.conversationId);
    }
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chatStore.cleanupRealtimeListeners();
});
</script>
