<template>
  <div
    class="flex gap-2.5 group relative"
    :class="isMine ? 'flex-row-reverse' : 'flex-row'"
  >
    <!-- Sender Avatar -->
    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary-border/60">
      {{ senderInitials }}
    </div>

    <!-- Message Bubble Container -->
    <div class="max-w-[75%] sm:max-w-[65%] flex flex-col relative" :class="isMine ? 'items-end' : 'items-start'">
      <!-- Sender Name (for group chats) -->
      <div v-if="!isMine" class="mb-1 px-1 text-[12px] font-medium text-primary-text/80">
        {{ senderName }}
      </div>

      <div class="relative group/bubble flex items-start" :class="isMine ? 'flex-row-reverse' : 'flex-row'">
        <!-- Message Content Box -->
        <div
          class="relative px-3 pt-2 pb-1.5 text-[14px] shadow-sm transition-all min-w-22.5"
          :class="bubbleClasses"
        >
          <!-- SVG Tail -->
          <span v-if="!message.deleted_at"
                class="absolute top-0 w-2 h-3"
                :class="isMine ? '-right-1.75 text-primary' : '-left-1.75 text-card-background'">
            <svg v-if="isMine" viewBox="0 0 8 13" fill="currentColor" class="w-full h-full"><path d="M1.5 12C1.5 12 1.5 0 1.5 0H0C0 0 8 0 8 0C8 0 2.5 1 1.5 12Z"/></svg>
            <svg v-else viewBox="0 0 8 13" fill="currentColor" class="w-full h-full"><path d="M6.5 12C6.5 12 6.5 0 6.5 0H8C8 0 0 0 0 0C0 0 5.5 1 6.5 12Z"/></svg>
          </span>

          <!-- Dropdown Options (Chevron) -->
          <div
            v-if="!message.deleted_at && !isEditing && isMine"
            class="absolute top-1 right-2 z-20 transition-opacity"
            :class="showMenu ? 'opacity-100' : 'opacity-0 group-hover/bubble:opacity-100'"
          >
            <div class="relative">
              <button
                type="button"
                @click.stop="toggleMenu"
                class="rounded-full bg-black/20 hover:bg-black/30 text-white w-4 h-4 cursor-pointer flex items-center justify-center backdrop-blur-sm"
              >
                <span class="material-symbols-rounded text-[13px]">expand_more</span>
              </button>
              
              <!-- Dropdown Menu -->
              <div v-if="showMenu" class="fixed inset-0 z-10" @click.stop="showMenu = false"></div>
              <div
                v-if="showMenu"
                class="absolute top-full right-0 mt-1 w-24 bg-card-background border border-primary-border/50 rounded-md shadow-lg py-1 z-20"
              >
                <button
                  @click="startEditing(); showMenu = false"
                  class="w-full text-left px-2 py-1 text-xs text-primary-text hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-rounded text-[13px]">edit</span> Edit
                </button>
                <button
                  @click="$emit('delete', message.id); showMenu = false"
                  class="w-full text-left px-2 py-1 text-xs text-primary-red hover:bg-primary-red/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span class="material-symbols-rounded text-[13px]">delete</span> Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Soft Delete Tombstone -->
          <div v-if="message.deleted_at" class="flex items-center gap-1.5 italic opacity-75">
            <span class="material-symbols-rounded text-sm">block</span>
            <span>This message was deleted</span>
          </div>

          <!-- Normal Message -->
          <div v-else>
            <!-- Inline Edit Input -->
            <div v-if="isEditing" class="space-y-2 mt-1">
              <textarea
                v-model="editDraft"
                rows="2"
                class="input-field p-2 text-[14px] w-full text-primary-text bg-background border border-primary-border/50 rounded-md focus:outline-none"
                @keydown.enter.prevent="handleSaveEdit"
                @keydown.esc="isEditing = false"
              ></textarea>
              <div class="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  @click="isEditing = false"
                  class="px-2 py-1 text-[12px] text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  @click="handleSaveEdit"
                  class="bg-white/20 hover:bg-white/30 text-white rounded px-2.5 py-1 text-[12px] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>

            <!-- Message Text & Attachment -->
            <div v-else>
              <!-- File Attachment Preview -->
              <div v-if="message.attachment_id || message.message_type === 'FILE'" class="mb-2">
                <div
                  v-if="isImageAttachment"
                  class="rounded-lg overflow-hidden border border-primary-border/20 cursor-pointer max-w-xs"
                  @click="$emit('preview-image', attachmentUrl, message.content)"
                >
                  <img
                    :src="attachmentUrl"
                    :alt="message.content || 'Image Attachment'"
                    class="max-h-48 object-cover w-full hover:opacity-95 transition-opacity"
                  />
                </div>

                <!-- Generic File / Document Badge -->
                <div
                  v-else
                  class="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/10 border border-primary-border/20 text-[13px]"
                >
                  <span class="material-symbols-rounded text-lg" :class="isMine ? 'text-white' : 'text-primary'">description</span>
                  <span class="truncate font-medium">{{ message.content || 'Attached File' }}</span>
                </div>
              </div>

              <!-- Text Content -->
              <div v-if="message.content" class="min-h-5">
                <p class="leading-relaxed whitespace-pre-wrap wrap-break-word">
                  {{ message.content }}
                  <!-- Invisible spacer to prevent text from overlapping the absolute time -->
                  <span class="inline-block h-3" :style="{ width: isMine ? (message.edited_at ? '95px' : '65px') : (message.edited_at ? '75px' : '45px') }"></span>
                </p>
              </div>
            </div>
            
            <!-- WhatsApp style Absolute Timestamp & Read Receipt -->
            <div v-if="!message.deleted_at && !isEditing" class="absolute bottom-0.5 right-1 flex items-center justify-end gap-0.5 text-[9px] leading-none" :class="isMine ? 'text-white/80' : 'text-secondary-text'">
              <span v-if="message.edited_at" class="opacity-70 italic mr-0.5">
                (edited)
              </span>
              <span>{{ formattedTime }}</span>
              <span
                v-if="isMine"
                class="material-symbols-rounded text-[11px] leading-none translate-y-[0.5px]"
                style="font-variation-settings: 'wght' 200, 'opsz' 20;"
                :class="isReadByOthers ? 'text-[#53bdeb]' : 'text-white/80'"
                :title="readReceiptTitle"
              >
                {{ isReadByOthers ? "done_all" : "done" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth/auth";
import { useChatStore } from "@/stores/chat/chat";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  senderName: {
    type: String,
    default: "Member",
  },
});

const emit = defineEmits(["edit", "delete", "preview-image"]);

const authStore = useAuthStore();
const chatStore = useChatStore();
const isEditing = ref(false);
const editDraft = ref("");
const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const isMine = computed(() => {
  return props.message.sender_id === authStore.currentUser?.id;
});

const isReadByOthers = computed(() => {
  if (!isMine.value) return false;
  return chatStore.isMessageReadByOthers(
    props.message.conversation_id,
    props.message.id,
    props.message.sender_id
  );
});

const readReceiptTitle = computed(() => {
  return isReadByOthers.value ? "Read" : "Sent";
});

const senderInitials = computed(() => {
  const name = isMine.value ? authStore.currentUser?.name : props.senderName;
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
});

const formattedTime = computed(() => {
  if (!props.message.created_at) return "";
  const d = new Date(props.message.created_at);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
});

const bubbleClasses = computed(() => {
  if (props.message.deleted_at) {
    return "bg-background border border-primary-border/60 text-secondary-text rounded-xl";
  }
  if (isMine.value) {
    return "bg-primary text-white rounded-xl rounded-tr-none";
  }
  return "bg-card-background border border-primary-border/60 text-primary-text rounded-xl rounded-tl-none";
});

const isImageAttachment = computed(() => {
  const content = (props.message.content || "").toLowerCase();
  return (
    content.endsWith(".png") ||
    content.endsWith(".jpg") ||
    content.endsWith(".jpeg") ||
    content.endsWith(".webp") ||
    content.endsWith(".gif") ||
    props.message.attachment_url?.includes("image")
  );
});

const attachmentUrl = computed(() => {
  return (
    props.message.attachment_url ||
    props.message.storage_key ||
    props.message.content ||
    ""
  );
});

const startEditing = () => {
  editDraft.value = props.message.content;
  isEditing.value = true;
};

const handleSaveEdit = () => {
  if (!editDraft.value.trim() || editDraft.value === props.message.content) {
    isEditing.value = false;
    return;
  }
  emit("edit", {
    messageId: props.message.id,
    newContent: editDraft.value.trim(),
  });
  isEditing.value = false;
};
</script>
