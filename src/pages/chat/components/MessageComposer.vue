<template>
  <div class="p-3 sm:px-4 sm:py-3.5 bg-card-background border-t border-primary-border/60">
    <!-- Typing Indicator banner -->
    <div
      v-if="typingUserNames.length > 0"
      class="text-[11px] text-secondary-text mb-2 flex items-center animate-pulse"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-primary-green animate-ping"></span>
      <span class="font-medium">{{ typingText }}</span>
    </div>

    <!-- Selected Attachment Card Preview -->
    <div
      v-if="selectedFile"
      class="mb-2.5 p-2 rounded-xl bg-background border border-primary-border flex items-center justify-between text-xs "
    >
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <span class="material-symbols-rounded text-lg">description</span>
        </div>
        <div class="min-w-0">
          <p class="truncate font-semibold text-primary-text text-xs leading-tight">{{ selectedFile.name }}</p>
          <span class="text-secondary-text text-[10px]">{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
        </div>
      </div>
      <button
        type="button"
        @click="clearSelectedFile"
        class="w-6 h-6 rounded-full hover:bg-card-background text-secondary-text hover:text-primary-red flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
        title="Remove attachment"
      >
        <span class="material-symbols-rounded text-base">close</span>
      </button>
    </div>

    <!-- Unified Modern Composer Capsule -->
    <div
      class="bg-background border border-primary-border/80 rounded-full p-1.5 transition-all  flex items-end gap-1.5"
    >
      <!-- Attachment Trigger Button -->
      <label
        class="w-8 h-8 rounded-full text-secondary-text hover:text-primary hover:bg-card-background flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 mb-0.5"
        title="Attach file"
      >
        <span class="material-symbols-rounded text-[20px] mt-1">attach_file</span>
        <input
          type="file"
          ref="fileInputRef"
          class="hidden"
          @change="handleFileSelected"
        />
      </label>

      <!-- Message Text Area -->
      <div class="flex-1 min-w-0 py-1">
        <textarea
          ref="textareaRef"
          v-model="text"
          rows="1"
          placeholder="Type a message..."
          class="w-full bg-transparent border-0 outline-none focus:outline-none focus:ring-0 text-primary-text placeholder:text-secondary-text/50 text-xs leading-5 resize-none no-scrollbar block max-h-32"
          @keydown="handleKeyDown"
          @input="handleInput"
        ></textarea>
      </div>

      <!-- Send Button -->
      <button
        type="button"
        @click="handleSend"
        class="w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer mb-0.5 active:scale-95 disabled:pointer-events-none "
        :class="hasContent
          ? 'bg-primary text-white hover:bg-primary-hover shadow-primary/25 scale-100'
          : 'bg-card-background text-secondary-text/30 border border-primary-border/40 cursor-not-allowed'"
        :disabled="!hasContent || isSending"
        title="Send message (Enter)"
      >
        <span v-if="isSending" class="material-symbols-rounded text-base animate-spin">progress_activity</span>
        <span v-else class="material-symbols-rounded text-base translate-x-0.5">send</span>
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

const hasContent = computed(() => !!text.value.trim() || !!selectedFile.value);

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
  // Auto-adjust height to content
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto";
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 128)}px`;
  }

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
