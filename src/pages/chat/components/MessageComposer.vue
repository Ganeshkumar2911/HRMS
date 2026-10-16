<template>
  <div class="p-4 bg-card-background border-t border-primary-border shrink-0" data-purpose="chat-input-controls">
    <!-- Typing Indicator banner -->
    <div
      v-if="typingUserNames.length > 0"
      class="text-[11px] text-text-muted mb-1.5 flex items-center space-x-1.5 animate-pulse pl-1"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-primary-green animate-ping"></span>
      <span class="font-medium">{{ typingText }}</span>
    </div>

    <!-- Selected Attachment Card Preview -->
    <div
      v-if="selectedFile"
      class="mb-2 p-2 rounded-lg bg-surface-subtle border border-primary-border flex items-center justify-between text-xs"
    >
      <div class="flex items-center space-x-2 min-w-0">
        <svg class="w-4 h-4 text-secondary-text shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
        <span class="truncate font-semibold text-primary-text">{{ selectedFile.name }}</span>
        <span class="text-[10px] text-text-muted">({{ (selectedFile.size / 1024).toFixed(1) }} KB)</span>
      </div>
      <button
        type="button"
        @click="clearSelectedFile"
        class="text-text-muted hover:text-primary-text p-0.5 cursor-pointer rounded"
        title="Remove attachment"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>
    </div>

    <!-- Main Composer Box matching Figma -->
    <div class="rounded-xl border border-primary-border bg-surface-subtle/60 focus-within:border-secondary-text focus-within:bg-card-background transition-all shadow-xs p-2.5 sm:p-3 relative">
      <!-- Hidden File Input -->
      <input
        type="file"
        ref="fileInputRef"
        class="hidden"
        @change="handleFileSelected"
      />

      <!-- Text area -->
      <textarea
        ref="textareaRef"
        v-model="text"
        rows="2"
        placeholder="Type a message..."
        class="w-full bg-transparent border-0 resize-none text-xs text-primary-text placeholder:text-text-muted focus:ring-0 p-1 focus:outline-none block"
        @keydown="handleKeyDown"
        @input="handleInput"
      ></textarea>

      <!-- Emoji Quick Tray Popover -->
      <div
        v-if="isEmojiPickerOpen"
        class="absolute bottom-14 left-3 bg-card-background border border-primary-border rounded-xl p-2 shadow-lg flex items-center space-x-1.5 z-30"
      >
        <button
          v-for="emoji in ['👍', '🎉', '❤️', '😊', '🚀', '👀', '🔥', '👏']"
          :key="emoji"
          type="button"
          @click="insertEmoji(emoji)"
          class="w-7 h-7 text-sm rounded hover:bg-surface-subtle flex items-center justify-center transition cursor-pointer"
        >
          {{ emoji }}
        </button>
      </div>

      <!-- Bottom utility tool bar inside composer -->
      <div class="flex items-center justify-between pt-2 border-t border-primary-border/60 mt-1.5">
        <!-- Left Action Icons (Attachments, Mention, Emoji, Code) -->
        <div class="flex items-center space-x-1">
          <!-- Attach File -->
          <button
            type="button"
            @click="triggerFileInput"
            class="p-1.5 rounded-md text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
            title="Attach file"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>

          <!-- Mention Teammate -->
          <button
            type="button"
            @click="insertMention"
            class="p-1.5 rounded-md text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
            title="Mention teammate"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>

          <!-- Insert Emoji -->
          <button
            type="button"
            @click="isEmojiPickerOpen = !isEmojiPickerOpen"
            class="p-1.5 rounded-md transition cursor-pointer"
            :class="isEmojiPickerOpen ? 'bg-surface-subtle text-primary-text' : 'text-secondary-text hover:text-primary-text hover:bg-surface-subtle'"
            title="Insert Emoji"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>

          <div class="h-3.5 w-px bg-primary-border mx-1"></div>

          <!-- Code Snippet -->
          <button
            type="button"
            @click="insertCodeBlock"
            class="p-1.5 rounded-md text-secondary-text hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
            title="Code snippet"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
            </svg>
          </button>
        </div>

        <!-- Send Button matching Figma -->
        <div class="flex items-center space-x-2.5">
          <span class="text-[10px] text-text-muted hidden sm:inline select-none">Press Enter ↵ to send</span>
          <button
            type="button"
            @click="handleSend"
            :disabled="!hasContent || isSending"
            class="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-btn-text-primary text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <span v-if="isSending" class="flex items-center space-x-1">
              <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Sending...</span>
            </span>
            <template v-else>
              <span>Send</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
            </template>
          </button>
        </div>
      </div>
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
const isEmojiPickerOpen = ref(false);
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

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

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

const insertEmoji = (emoji) => {
  text.value += (text.value ? " " : "") + emoji + " ";
  isEmojiPickerOpen.value = false;
  textareaRef.value?.focus();
};

const insertMention = () => {
  text.value += (text.value && !text.value.endsWith(" ") ? " @" : "@");
  textareaRef.value?.focus();
};

const insertCodeBlock = () => {
  text.value += (text.value ? "\n```\n\n```" : "```\n\n```");
  textareaRef.value?.focus();
};

const handleInput = () => {
  chatStore.startTyping(props.conversationId);

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
  } finally {
    isSending.value = false;
  }
};

watch(
  () => props.conversationId,
  () => {
    text.value = "";
    isSending.value = false;
    isEmojiPickerOpen.value = false;
    clearSelectedFile();
    chatStore.stopTyping(props.conversationId);
  }
);
</script>
