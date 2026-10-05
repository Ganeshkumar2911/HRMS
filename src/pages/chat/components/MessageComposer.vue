<template>
  <div class="p-3 sm:p-4 bg-card-background border-t border-primary-border/60">
    <!-- Typing Indicator banner -->
    <div
      v-if="typingUserNames.length > 0"
      class="text-[11px] text-secondary-text mb-2 flex items-center gap-1.5 animate-pulse"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-primary-green"></span>
      <span>{{ typingText }}</span>
    </div>

    <!-- Selected Attachment Pending upload Preview -->
    <div
      v-if="selectedFile"
      class="mb-2 p-2 rounded-lg bg-background border border-primary-border/60 flex items-center justify-between text-xs"
    >
      <div class="flex items-center gap-2 overflow-hidden">
        <span class="material-symbols-rounded text-primary text-base">attach_file</span>
        <span class="truncate font-medium text-primary-text">{{ selectedFile.name }}</span>
        <span class="text-secondary-text text-[10px]">({{ (selectedFile.size / 1024).toFixed(1) }} KB)</span>
      </div>
      <button
        type="button"
        @click="clearSelectedFile"
        class="text-secondary-text hover:text-primary-red p-1 rounded transition-colors"
      >
        <span class="material-symbols-rounded text-sm">close</span>
      </button>
    </div>

    <!-- Composer Box -->
    <div class="flex items-end gap-2">
      <!-- File Attachment Button -->
      <label
        class="btn-icon p-2 text-secondary-text hover:text-primary-text hover:bg-background rounded-lg cursor-pointer transition-colors shrink-0"
        title="Attach file"
      >
        <span class="material-symbols-rounded text-xl">attach_file</span>
        <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          @change="handleFileSelected"
        />
      </label>

      <!-- Message Text Area -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="text"
          rows="1"
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          class="input-field w-full py-2.5 px-3.5 text-xs max-h-32 resize-none no-scrollbar"
          @keydown="handleKeyDown"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- Send Button -->
      <button
        type="button"
        @click="handleSend"
        class="btn-primary p-2.5 rounded-lg shrink-0"
        :disabled="(!text.trim() && !selectedFile) || isSending"
        title="Send message"
      >
        <span v-if="isSending" class="material-symbols-rounded text-lg animate-spin">progress_activity</span>
        <span v-else class="material-symbols-rounded text-lg">send</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useChatStore } from "@/stores/chat/chat";

const props = defineProps({
  conversationId: {
    type: [Number, String],
    required: true,
  },
});

const chatStore = useChatStore();

const text = ref("");
const selectedFile = ref(null);
const isSending = ref(false);
const fileInputRef = ref(null);
const textareaRef = ref(null);

let typingDebounceTimer = null;

const typingUserNames = computed(() => {
  return chatStore.activeTypingUsers;
});

const typingText = computed(() => {
  if (typingUserNames.value.length === 1) {
    return `${typingUserNames.value[0]} is typing...`;
  }
  if (typingUserNames.value.length === 2) {
    return `${typingUserNames.value[0]} and ${typingUserNames.value[1]} are typing...`;
  }
  return `Multiple team members are typing...`;
});

const handleFileSelected = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const handleInput = () => {
  // Emit typing.start
  chatStore.startTyping(props.conversationId);

  // Debounce typing.stop after 1.5 seconds of inactivity
  if (typingDebounceTimer) {
    clearTimeout(typingDebounceTimer);
  }
  typingDebounceTimer = setTimeout(() => {
    chatStore.stopTyping(props.conversationId);
  }, 1500);
};

const handleKeyDown = (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
};

const handleSend = async () => {
  const content = text.value.trim();
  const file = selectedFile.value;

  if (!content && !file) return;

  isSending.value = true;
  chatStore.stopTyping(props.conversationId);

  try {
    if (file) {
      await chatStore.sendFileMessage({
        conversationId: props.conversationId,
        file,
        caption: content,
      });
      clearSelectedFile();
    } else {
      await chatStore.sendMessage({
        conversationId: props.conversationId,
        content,
      });
    }

    text.value = "";
    if (textareaRef.value) {
      textareaRef.value.style.height = "auto";
    }
  } finally {
    isSending.value = false;
  }
};

watch(
  () => props.conversationId,
  () => {
    text.value = "";
    isSending.value = false;
    clearSelectedFile();
    chatStore.stopTyping(props.conversationId);
  }
);
</script>
