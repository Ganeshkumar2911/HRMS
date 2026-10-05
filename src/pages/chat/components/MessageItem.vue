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
    <div class="max-w-[75%] sm:max-w-[65%] flex flex-col" :class="isMine ? 'items-end' : 'items-start'">
      <!-- Sender Name (for group chats) & Timestamp -->
      <div class="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-secondary-text">
        <span v-if="!isMine" class="font-semibold text-primary-text">{{ senderName }}</span>
        <span>&bull;</span>
        <span>{{ formattedTime }}</span>
      </div>

      <!-- Message Content Box -->
      <div
        class="rounded-2xl px-3.5 py-2.5 text-xs shadow-xs transition-all relative"
        :class="bubbleClasses"
      >
        <!-- Soft Delete Tombstone -->
        <div v-if="message.deleted_at" class="flex items-center gap-1.5 italic opacity-75">
          <span class="material-symbols-rounded text-sm">block</span>
          <span>This message was deleted</span>
        </div>

        <!-- Normal Message -->
        <div v-else>
          <!-- Inline Edit Input -->
          <div v-if="isEditing" class="space-y-2">
            <textarea
              v-model="editDraft"
              rows="2"
              class="input-field p-2 text-xs w-full text-primary-text bg-card-background"
              @keydown.enter.prevent="handleSaveEdit"
              @keydown.esc="isEditing = false"
            ></textarea>
            <div class="flex items-center justify-end gap-1.5">
              <button
                type="button"
                @click="isEditing = false"
                class="px-2 py-1 text-[11px] text-secondary-text hover:text-primary-text"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveEdit"
                class="btn-primary px-2.5 py-1 text-[11px]"
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
                class="rounded-lg overflow-hidden border border-primary-border/60 cursor-pointer max-w-xs"
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
                class="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/10 border border-primary-border/50 text-xs"
              >
                <span class="material-symbols-rounded text-lg text-primary">description</span>
                <span class="truncate font-medium">{{ message.content || 'Attached File' }}</span>
              </div>
            </div>

            <!-- Text Content -->
            <p class="leading-relaxed whitespace-pre-wrap break-words">
              {{ message.content }}
            </p>

            <!-- Edited tag -->
            <span
              v-if="message.edited_at"
              class="text-[10px] opacity-70 ml-1.5 inline-block"
            >
              (edited)
            </span>
          </div>
        </div>
      </div>

      <!-- Action Hover Buttons (Edit / Delete) -->
      <div
        v-if="!message.deleted_at && !isEditing && isMine"
        class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 px-1 text-xs text-secondary-text"
      >
        <button
          type="button"
          @click="startEditing"
          class="hover:text-primary p-0.5 rounded transition-colors cursor-pointer"
          title="Edit message"
        >
          <span class="material-symbols-rounded text-sm">edit</span>
        </button>
        <button
          type="button"
          @click="$emit('delete', message.id)"
          class="hover:text-primary-red p-0.5 rounded transition-colors cursor-pointer"
          title="Delete message"
        >
          <span class="material-symbols-rounded text-sm">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth/auth";

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
const isEditing = ref(false);
const editDraft = ref("");

const isMine = computed(() => {
  return props.message.sender_id === authStore.currentUser?.id;
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
    return "bg-background border border-primary-border/60 text-secondary-text";
  }
  if (isMine.value) {
    return "bg-primary text-white rounded-tr-xs";
  }
  return "bg-card-background border border-primary-border/60 text-primary-text rounded-tl-xs";
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
