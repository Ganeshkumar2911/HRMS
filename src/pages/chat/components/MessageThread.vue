<template>
  <div class="h-full flex flex-col bg-background min-w-0 flex-1 relative overflow-hidden">
    <!-- Thread Header -->
    <div class="px-4 py-3 bg-card-background border-b border-primary-border/60 flex items-center justify-between gap-3 shrink-0">
      <div class="flex items-center gap-3 overflow-hidden">
        <!-- Back button on mobile -->
        <button
          type="button"
          @click="$emit('back')"
          class="sm:hidden p-1 text-secondary-text hover:text-primary-text rounded-lg"
        >
          <span class="material-symbols-rounded text-xl">arrow_back</span>
        </button>

        <!-- Avatar -->
        <div class="w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary-border/60">
          <span class="material-symbols-rounded text-lg">
            {{ isGroup ? 'groups' : 'person' }}
          </span>
        </div>

        <!-- Name & Status -->
        <div class="overflow-hidden">
          <div class="flex items-center gap-2">
            <h3 class="text-xs font-bold text-primary-text truncate">
              {{ conversationTitle }}
            </h3>
            <!-- Inline Rename for Group -->
            <button
              v-if="isGroup && canManage"
              type="button"
              @click="isRenameModalOpen = true"
              class="text-secondary-text hover:text-primary p-0.5 rounded transition-colors"
              title="Rename Channel"
            >
              <span class="material-symbols-rounded text-xs">edit</span>
            </button>
          </div>
          <p class="text-[11px] text-secondary-text truncate leading-tight">
            {{ statusSubtitle }}
          </p>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Members Panel Toggle -->
        <button
          type="button"
          @click="$emit('toggle-members')"
          class="btn-icon p-2 text-secondary-text hover:text-primary-text rounded-lg hover:bg-background transition-colors"
          :class="{'text-primary bg-primary/10': isMembersOpen}"
          title="Channel details and members"
        >
          <span class="material-symbols-rounded text-lg">info</span>
        </button>
      </div>
    </div>

    <!-- Messages Scroll Area -->
    <div
      ref="messagesContainerRef"
      class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3"
      @scroll="handleScroll"
    >
      <!-- "Load Older Messages" Button (Cursor Pagination) -->
      <div v-if="hasOlderMessages" class="text-center py-2">
        <button
          type="button"
          @click="loadOlder"
          class="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5 shadow-xs"
          :disabled="chatStore.messagesLoading"
        >
          <span v-if="chatStore.messagesLoading" class="material-symbols-rounded text-xs animate-spin">progress_activity</span>
          <span v-else class="material-symbols-rounded text-xs">history</span>
          <span>Load older messages</span>
        </button>
      </div>

      <!-- Empty Thread -->
      <div
        v-if="messages.length === 0 && !chatStore.messagesLoading"
        class="h-64 flex flex-col items-center justify-center text-center text-secondary-text"
      >
        <span class="material-symbols-rounded text-4xl text-secondary-text/40 mb-2">forum</span>
        <p class="text-xs font-semibold text-primary-text">No messages in this conversation yet</p>
        <p class="text-[11px] text-secondary-text mt-1">Send a greeting to start the conversation!</p>
      </div>

      <!-- Messages List -->
      <MessageItem
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :sender-name="getSenderName(msg.sender_id)"
        @edit="handleEditMessage"
        @delete="handleDeleteMessage"
        @preview-image="handlePreviewImage"
      />
    </div>

    <!-- Composer -->
    <MessageComposer :conversation-id="conversation.id" />

    <!-- Image Viewer Modal -->
    <ImageViewerModal
      v-model="isImageModalOpen"
      :image-url="previewImageUrl"
      :title="previewImageTitle"
    />

    <!-- Rename Modal -->
    <div
      v-if="isRenameModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      @click.self="isRenameModalOpen = false"
    >
      <div class="bg-card-background border border-primary-border rounded-xl max-w-sm w-full p-5 shadow-xl space-y-4">
        <h3 class="title-text text-sm font-semibold text-primary-text">Rename Channel</h3>
        <input
          v-model="renameDraft"
          type="text"
          placeholder="Enter new channel name..."
          class="input-field px-3 py-2 text-xs w-full"
          @keydown.enter="handleSaveRename"
        />
        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            @click="isRenameModalOpen = false"
            class="btn-secondary text-xs px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSaveRename"
            class="btn-primary text-xs px-3.5 py-1.5"
            :disabled="!renameDraft.trim() || chatStore.actionLoading"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
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
const isRenameModalOpen = ref(false);
const renameDraft = ref("");

const currentUserId = computed(() => authStore.currentUser?.id);

const isGroup = computed(() => props.conversation.type === "GROUP");

const canManage = computed(() => chatStore.isOwnerOrAdmin);

const conversationTitle = computed(() => {
  if (isGroup.value) {
    return props.conversation.name || "Group Channel";
  }
  const other = props.conversation.members?.find((m) => m.user_id !== currentUserId.value);
  return other?.user_name || other?.user_email || "Direct Message";
});

const statusSubtitle = computed(() => {
  if (isGroup.value) {
    const count = chatStore.activeMembers.filter((m) => !m.left_at).length;
    return `${count} active members`;
  }
  const other = props.conversation.members?.find((m) => m.user_id !== currentUserId.value);
  if (other && chatStore.onlineUserIds.has(other.user_id)) {
    return "Online now";
  }
  return "Direct message";
});

const messages = computed(() => {
  return chatStore.messagesByConversation[props.conversation.id] || [];
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
    scrollToBottom();
    renameDraft.value = props.conversation.name || "";
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

const handleEditMessage = ({ messageId, newContent }) => {
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

const handleSaveRename = async () => {
  if (!renameDraft.value.trim()) return;
  await chatStore.renameConversation(props.conversation.id, renameDraft.value.trim());
  isRenameModalOpen.value = false;
};
</script>
