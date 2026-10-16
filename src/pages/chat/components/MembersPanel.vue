<template>
  <div class="h-full flex flex-col bg-card-background border-l border-primary-border w-72 shrink-0">
    <!-- Panel Header -->
    <div class="p-4 border-b border-primary-border flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <h3 class="text-xs font-bold text-primary-text uppercase tracking-wider">Channel Details</h3>
      </div>
      <button
        type="button"
        @click="$emit('close')"
        class="p-1 rounded-lg text-text-muted hover:text-primary-text hover:bg-surface-subtle transition cursor-pointer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
        </svg>
      </button>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
      <!-- Conversation Summary -->
      <div class="text-center pb-4 border-b border-primary-border">
        <div class="w-10 h-10 rounded-xl bg-surface-container text-primary-text mx-auto flex items-center justify-center font-bold mb-2 border border-primary-border">
          <svg v-if="isGroup" class="w-5 h-5 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
          <svg v-else class="w-5 h-5 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
          </svg>
        </div>

        <!-- Channel / Direct Name with Inline Editor -->
        <div class="px-1">
          <!-- View Mode -->
          <div
            v-if="!isEditingName"
            class="inline-flex items-center justify-center gap-1.5 px-2 py-0.5 rounded-lg max-w-full group transition-colors"
            :class="isGroup && canManageMembers ? 'hover:bg-primary/5 cursor-pointer' : ''"
            @click="isGroup && canManageMembers ? startRename() : null"
            :title="isGroup && canManageMembers ? 'Click to rename channel' : ''"
          >
            <h4 class="text-xs font-bold text-primary-text leading-tight truncate">
              {{ conversationName }}
            </h4>
            <button
              v-if="isGroup && canManageMembers"
              type="button"
              @click.stop="startRename"
              class="w-5 h-5 rounded hover:bg-background text-secondary-text hover:text-primary flex items-center justify-center transition-colors cursor-pointer shrink-0 opacity-70 group-hover:opacity-100"
              title="Rename Channel"
              aria-label="Rename Channel"
            >
              <span class="material-symbols-rounded text-[13px]">edit</span>
            </button>
          </div>

          <!-- Inline Edit Field -->
          <div
            v-else
            class="flex items-center gap-1 bg-background border border-primary/50 focus-within:border-primary rounded-lg p-1 shadow-xs transition-all animate-in fade-in duration-150"
          >
            <input
              ref="renameInputRef"
              v-model="renameDraft"
              type="text"
              class="flex-1 min-w-0 bg-transparent border-0 text-xs font-semibold text-primary-text outline-none px-1.5 py-0.5 placeholder:text-secondary-text/50"
              placeholder="Channel name..."
              maxlength="60"
              :disabled="chatStore.actionLoading"
              @keydown.enter.prevent="handleSaveRename"
              @keydown.esc="cancelRename"
            />
            
            <div class="flex items-center gap-0.5 shrink-0">
              <!-- Save button -->
              <button
                type="button"
                @click="handleSaveRename"
                :disabled="!renameDraft.trim() || chatStore.actionLoading"
                class="w-5 h-5 rounded hover:bg-primary-green/15 text-primary-green flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Save (Enter)"
                aria-label="Save rename"
              >
                <span v-if="chatStore.actionLoading" class="material-symbols-rounded text-[13px] animate-spin">progress_activity</span>
                <span v-else class="material-symbols-rounded text-[14px]">check</span>
              </button>

              <!-- Cancel button -->
              <button
                type="button"
                @click="cancelRename"
                :disabled="chatStore.actionLoading"
                class="w-5 h-5 rounded hover:bg-primary-red/15 text-secondary-text hover:text-primary-red flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                title="Cancel (Esc)"
                aria-label="Cancel rename"
              >
                <span class="material-symbols-rounded text-[14px]">close</span>
              </button>
            </div>
          </div>
        </div>

        <span class="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-subtle text-secondary-text border border-primary-border">
          {{ conversation?.type || 'CONVERSATION' }}
        </span>
      </div>

      <!-- Members Section -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-primary-text">
            Members ({{ activeMembersList.length }})
          </span>
          <!-- Add Member button (gated by OWNER or ADMIN role) -->
          <button
            v-if="isGroup && canManageMembers"
            type="button"
            @click="isAddModalOpen = true"
            class="text-[11px] text-primary hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
            <span>Add</span>
          </button>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="member in activeMembersList"
            :key="member.id || member.user_id"
            class="p-2 rounded-lg bg-surface-subtle border border-primary-border flex items-center justify-between gap-2"
          >
            <div class="flex items-center space-x-2.5 overflow-hidden">
              <!-- Avatar with online dot -->
              <div class="relative shrink-0">
                <div class="w-7 h-7 rounded-full bg-surface-container text-primary-text font-semibold text-xs flex items-center justify-center border border-primary-border">
                  {{ getInitials(member.user_name || member.user_email) }}
                </div>
                <span
                  v-if="isUserOnline(member.user_id)"
                  class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary-green border border-card-background"
                  title="Online"
                ></span>
              </div>

              <!-- Name & Email -->
              <div class="overflow-hidden">
                <p class="text-xs font-medium text-primary-text truncate leading-tight">
                  {{ member.user_name || member.user_email }}
                  <span v-if="member.user_id === currentUserId" class="text-[10px] text-secondary-text font-normal">(You)</span>
                </p>
                <span
                  class="inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded mt-0.5"
                  :class="{
                    'bg-primary text-btn-text-primary': member.role === 'OWNER',
                    'bg-surface-container text-primary-text': member.role === 'ADMIN',
                    'bg-surface-subtle text-secondary-text': member.role === 'MEMBER',
                  }"
                >
                  {{ member.role }}
                </span>
              </div>
            </div>

            <!-- Remove Member Button (if I am OWNER/ADMIN and not removing myself) -->
            <button
              v-if="canManageMembers && member.user_id !== currentUserId && isGroup"
              type="button"
              @click="confirmRemove(member)"
              class="text-text-muted hover:text-primary-red p-1 rounded transition-colors cursor-pointer"
              title="Remove member"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Channel Actions -->
      <div class="pt-4 border-t border-primary-border space-y-2">
        <!-- Leave Conversation (for groups) -->
        <button
          v-if="isGroup"
          type="button"
          @click="isConfirmLeaveOpen = true"
          class="w-full text-xs text-primary-red hover:bg-primary-red/10 border border-primary-red/30 rounded-lg py-2 font-medium flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
          <span>Leave Channel</span>
        </button>

        <!-- Archive Conversation (for Owners/Admins) -->
        <button
          v-if="canManageMembers && !conversation?.archived_at"
          type="button"
          @click="isConfirmArchiveOpen = true"
          class="w-full text-xs text-secondary-text hover:text-primary-text bg-surface-subtle hover:bg-surface-hover border border-primary-border rounded-lg py-2 font-medium flex items-center justify-center space-x-1.5 transition cursor-pointer"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path></svg>
          <span>Archive Channel</span>
        </button>
      </div>
    </div>

    <!-- Modals -->
    <AddMemberModal
      v-if="conversation"
      v-model="isAddModalOpen"
      :conversation-id="conversation.id"
    />

    <ConfirmModal
      v-model="isConfirmLeaveOpen"
      title="Leave Channel?"
      message="You will no longer receive messages from this group channel unless re-added by an admin."
      confirm-text="Leave Channel"
      @confirm="handleLeave"
    />

    <ConfirmModal
      v-model="isConfirmArchiveOpen"
      title="Archive Channel?"
      message="This channel will be hidden from the active chat list."
      confirm-text="Archive"
      @confirm="handleArchive"
    />

    <ConfirmModal
      v-model="isConfirmRemoveOpen"
      title="Remove Member?"
      :message="`Are you sure you want to remove ${memberToRemove?.user_name || 'this user'} from the channel?`"
      confirm-text="Remove"
      @confirm="handleRemove"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat/chat";
import { useAuthStore } from "@/stores/auth/auth";
import AddMemberModal from "./AddMemberModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps({
  conversation: {
    type: Object,
    required: true,
  },
});

defineEmits(["close"]);

const chatStore = useChatStore();
const authStore = useAuthStore();

const isAddModalOpen = ref(false);
const isConfirmLeaveOpen = ref(false);
const isConfirmArchiveOpen = ref(false);
const isConfirmRemoveOpen = ref(false);
const isEditingName = ref(false);
const renameInputRef = ref(null);
const renameDraft = ref("");
const memberToRemove = ref(null);

const currentUserId = computed(() => authStore.currentUser?.id);

const isGroup = computed(() => props.conversation.type === "GROUP");

const activeMembersList = computed(() => {
  return chatStore.activeMembers.filter((m) => !m.left_at);
});

const canManageMembers = computed(() => {
  return chatStore.isOwnerOrAdmin;
});

const conversationName = computed(() => {
  if (props.conversation.type === "GROUP") {
    return props.conversation.name || "Group Channel";
  }
  const other = props.conversation.members?.find((m) => m.user_id !== currentUserId.value);
  return other?.user_name || other?.user_email || "Direct Message";
});

const isUserOnline = (userId) => {
  return !!chatStore.onlineUserIds[userId];
};

const getInitials = (name) => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
};

const confirmRemove = (member) => {
  memberToRemove.value = member;
  isConfirmRemoveOpen.value = true;
};

const handleRemove = async () => {
  if (!memberToRemove.value) return;
  await chatStore.removeMember(props.conversation.id, memberToRemove.value.user_id);
  isConfirmRemoveOpen.value = false;
  memberToRemove.value = null;
};

const handleLeave = async () => {
  await chatStore.removeMember(props.conversation.id, currentUserId.value);
  isConfirmLeaveOpen.value = false;
};

const handleArchive = async () => {
  await chatStore.archiveConversation(props.conversation.id);
  isConfirmArchiveOpen.value = false;
};

watch(
  () => props.conversation?.id,
  () => {
    isEditingName.value = false;
    renameDraft.value = "";
  }
);

const startRename = async () => {
  renameDraft.value = props.conversation?.name || "";
  isEditingName.value = true;
  await nextTick();
  renameInputRef.value?.focus();
  renameInputRef.value?.select();
};

const cancelRename = () => {
  isEditingName.value = false;
  renameDraft.value = "";
};

const handleSaveRename = async () => {
  const trimmed = renameDraft.value.trim();
  if (!trimmed || trimmed === props.conversation?.name) {
    isEditingName.value = false;
    return;
  }
  await chatStore.renameConversation(props.conversation.id, trimmed);
  isEditingName.value = false;
};
</script>
