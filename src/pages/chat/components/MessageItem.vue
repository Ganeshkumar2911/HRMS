<template>
  <div>
    <!-- Soft Delete Tombstone -->
    <div v-if="message.deleted_at" class="flex items-center space-x-2 my-2 text-text-muted italic text-xs pl-3">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
      </svg>
      <span>This message was deleted</span>
    </div>

    <!-- OUTGOING MESSAGE (Mine) -->
    <div
      v-else-if="isMine"
      class="flex items-end justify-end space-x-2.5 max-w-xl ml-auto group relative"
    >
      <div class="text-right flex-1 min-w-0">
        <!-- Header: Time and "You" -->
        <div class="flex items-center justify-end space-x-1.5 mb-1 pr-1">
          <span class="text-[10px] text-text-muted">{{ formattedTime }}</span>
          <span class="text-xs font-semibold text-primary-text">You</span>
        </div>

        <!-- Outgoing Bubble matching Figma -->
        <div
          class="bg-accent text-white rounded-3xl rounded-br-sm p-3.5 text-xs leading-relaxed shadow-sm text-left relative group/bubble"
        >
          <!-- Options menu trigger (on hover) -->
          <div
            v-if="!isEditing"
            class="absolute top-2 right-2 z-20 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
          >
            <div class="relative">
              <button
                type="button"
                @click.stop="showMenu = !showMenu"
                class="w-5 h-5 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 transition cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </button>

              <!-- Dropdown -->
              <div v-if="showMenu" class="fixed inset-0 z-10" @click.stop="showMenu = false"></div>
              <div
                v-if="showMenu"
                class="absolute top-full right-0 mt-1 w-24 bg-card-background text-primary-text rounded-lg shadow-lg py-1 z-20 border border-primary-border text-xs overflow-hidden"
              >
                <button
                  type="button"
                  @click="copyMessage(); showMenu = false"
                  class="w-full text-left px-2.5 py-1.5 hover:bg-surface-subtle flex items-center space-x-1.5 cursor-pointer text-primary-text"
                >
                  <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  <span>Copy</span>
                </button>
                <button
                  type="button"
                  @click="startEditing(); showMenu = false"
                  class="w-full text-left px-2.5 py-1.5 hover:bg-surface-subtle flex items-center space-x-1.5 cursor-pointer text-primary-text"
                >
                  <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  @click="$emit('delete', message.id); showMenu = false"
                  class="w-full text-left px-2.5 py-1.5 hover:bg-primary-red/10 text-primary-red flex items-center space-x-1.5 cursor-pointer"
                >
                  <svg class="w-3 h-3 text-primary-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Inline Edit Area -->
          <div v-if="isEditing" class="space-y-2">
            <textarea
              v-model="editDraft"
              rows="2"
              class="w-full p-2 text-xs text-primary-text bg-card-background border border-primary-border rounded-lg focus:outline-none"
              @keydown.enter.prevent="handleSaveEdit"
              @keydown.esc="isEditing = false"
            ></textarea>
            <div class="flex items-center justify-end space-x-2">
              <button
                type="button"
                @click="isEditing = false"
                class="px-2 py-1 text-[11px] text-white/70 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                @click="handleSaveEdit"
                class="bg-white/20 hover:bg-white/30 text-white rounded px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>

          <!-- Normal Message Content -->
          <div v-else>
            <!-- File attachment preview if exists -->
            <div v-if="message.attachment_id || message.message_type === 'FILE'" class="mb-2">
              <div
                v-if="isImageAttachment"
                class="rounded-lg overflow-hidden border border-white/20 cursor-pointer max-w-xs"
                @click="$emit('preview-image', attachmentUrl, message.content)"
              >
                <img
                  :src="attachmentUrl"
                  :alt="message.content || 'Image'"
                  class="max-h-48 object-cover w-full hover:opacity-95 transition"
                />
              </div>
              <div
                v-else
                class="flex items-center space-x-2 p-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white"
              >
                <svg class="w-4 h-4 text-white/80 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
                <span class="truncate">{{ message.content || 'Attached File' }}</span>
              </div>
            </div>

            <!-- Text Content -->
            <p v-if="message.content" class="leading-relaxed whitespace-pre-wrap break-words">
              {{ message.content }}
            </p>
          </div>
        </div>

        <!-- Read receipt ticks -->
        <div class="flex justify-end items-center space-x-0.5 mt-1 pr-1 text-sky-500">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <svg class="w-3.5 h-3.5 -ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </div>
      </div>

      <!-- Outgoing Avatar (SA) -->
      <div class="w-7 h-7 rounded-full bg-primary text-btn-text-primary font-semibold text-[10px] flex items-center justify-center shrink-0 mb-5">
        {{ myInitials }}
      </div>
    </div>

    <!-- INCOMING MESSAGE (Other) -->
    <div
      v-else
      class="flex items-end space-x-2.5 max-w-xl group relative"
    >
      <!-- Incoming Avatar (SC / Partner) -->
      <div class="w-7 h-7 rounded-full bg-surface-container text-primary-text font-semibold text-[10px] flex items-center justify-center border border-primary-border shrink-0 mb-1">
        {{ senderInitials }}
      </div>

      <div class="flex-1 min-w-0">
        <!-- Header: Sender Name and Time -->
        <div class="flex items-baseline space-x-2 mb-1 pl-1">
          <span class="text-xs font-semibold text-primary-text">{{ senderDisplayName }}</span>
          <span class="text-[10px] text-text-muted">{{ formattedTime }}</span>
        </div>

        <!-- Incoming Bubble matching Figma -->
        <div
          class="bg-card-background border border-primary-border rounded-3xl rounded-bl-sm p-3.5 text-xs text-primary-text leading-relaxed shadow-xs relative group/bubble"
        >
          <!-- Options menu trigger (on hover) -->
          <div
            class="absolute top-2 right-2 z-20 opacity-0 group-hover/bubble:opacity-100 transition-opacity"
          >
            <div class="relative">
              <button
                type="button"
                @click.stop="showMenu = !showMenu"
                class="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                </svg>
              </button>

              <!-- Dropdown -->
              <div v-if="showMenu" class="fixed inset-0 z-10" @click.stop="showMenu = false"></div>
              <div
                v-if="showMenu"
                class="absolute top-full right-0 mt-1 w-24 bg-card-background text-primary-text rounded-lg shadow-lg py-1 z-20 border border-primary-border text-xs overflow-hidden"
              >
                <button
                  type="button"
                  @click="copyMessage(); showMenu = false"
                  class="w-full text-left px-2.5 py-1.5 hover:bg-surface-subtle flex items-center space-x-1.5 cursor-pointer text-primary-text"
                >
                  <svg class="w-3 h-3 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>

          <!-- File attachment preview if exists -->
          <div v-if="message.attachment_id || message.message_type === 'FILE'" class="mb-2">
            <div
              v-if="isImageAttachment"
              class="rounded-lg overflow-hidden border border-primary-border cursor-pointer max-w-xs"
              @click="$emit('preview-image', attachmentUrl, message.content)"
            >
              <img
                :src="attachmentUrl"
                :alt="message.content || 'Image'"
                class="max-h-48 object-cover w-full hover:opacity-95 transition"
              />
            </div>
            <div
              v-else
              class="flex items-center space-x-2 p-2 rounded-lg bg-surface-subtle border border-primary-border text-xs text-primary-text"
            >
              <svg class="w-4 h-4 text-secondary-text shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
              </svg>
              <span class="truncate">{{ message.content || 'Attached File' }}</span>
            </div>
          </div>

          <!-- Text Content -->
          <p v-if="message.content" class="leading-relaxed whitespace-pre-wrap break-words">
            {{ message.content }}
          </p>
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
    default: "",
  },
});

const emit = defineEmits(["edit", "delete", "preview-image"]);

const authStore = useAuthStore();
const chatStore = useChatStore();

const showMenu = ref(false);
const isEditing = ref(false);
const editDraft = ref("");

const isMine = computed(() => {
  const myId = authStore.currentUser?.id;
  return props.message.sender_id === myId;
});

const myInitials = computed(() => {
  const name = authStore.currentUser?.name || "Super Admin";
  return getInitials(name);
});

const senderDisplayName = computed(() => {
  if (props.senderName) return props.senderName;
  if (props.message.sender_name) return props.message.sender_name;
  return "Colleague";
});

const senderInitials = computed(() => {
  return getInitials(senderDisplayName.value);
});

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const formattedTime = computed(() => {
  if (!props.message.created_at) return "";
  const d = new Date(props.message.created_at);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
});

const isImageAttachment = computed(() => {
  if (props.message.message_type === "IMAGE") return true;
  const content = props.message.content || "";
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(content);
});

const attachmentUrl = computed(() => {
  return props.message.attachment_url || props.message.content || "";
});

const copyMessage = () => {
  if (props.message.content) {
    navigator.clipboard?.writeText(props.message.content).catch(() => {});
  }
};

const startEditing = () => {
  editDraft.value = props.message.content || "";
  isEditing.value = true;
};

const handleSaveEdit = () => {
  if (!editDraft.value.trim()) return;
  emit("edit", props.message.id, editDraft.value.trim());
  isEditing.value = false;
};
</script>
