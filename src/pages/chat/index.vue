<template>
  <div class="h-[calc(100vh-5rem)] max-h-220 bg-card-background border border-primary-border/70 rounded-2xl overflow-hidden shadow-sm flex flex-col">
    <!-- Main Chat Workspace -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Column: Conversations List -->
      <ConversationList
        class="sm:flex"
        :class="{'hidden': selectedConversation && isMobileView, 'flex': !selectedConversation || !isMobileView}"
        @select="handleSelectConversation"
      />

      <!-- Middle Column: Message Thread -->
      <div
        v-if="selectedConversation"
        class="flex-1 flex flex-col min-w-0"
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
        class="hidden sm:flex flex-1 flex-col items-center justify-center p-8 text-center bg-background"
      >
        <div class="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary-border/60">
          <span class="material-symbols-rounded text-3xl">chat</span>
        </div>
        <h3 class="title-text text-base font-semibold text-primary-text mb-1">Select a conversation</h3>
        <p class="sub-text text-secondary-text max-w-sm">
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
      chatStore.selectConversation(Number(newId) || newId);
    }
  },
  { immediate: true }
);

onMounted(() => {
  window.addEventListener("resize", handleResize);
  chatStore.setupRealtimeListeners();
  chatStore.fetchConversations().then(() => {
    if (route.params.conversationId) {
      chatStore.selectConversation(
        Number(route.params.conversationId) || route.params.conversationId
      );
    }
  });
  chatStore.fetchUsers();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  chatStore.cleanupRealtimeListeners();
});
</script>
