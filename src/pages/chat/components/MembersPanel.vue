<template>
  <div class="h-full flex flex-col bg-card-background border-l border-primary-border/60 w-72 shrink-0">
    <!-- Panel Header -->
    <div class="p-4 border-b border-primary-border/60 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-rounded text-primary text-base">info</span>
        <h3 class="text-xs font-semibold text-primary-text uppercase tracking-wider">Channel Details</h3>
      </div>
      <button
        type="button"
        @click="$emit('close')"
        class="p-1 rounded-lg text-secondary-text hover:text-primary-text transition-colors"
      >
        <span class="material-symbols-rounded text-lg">close</span>
      </button>
    </div>

    <!-- Panel Content -->
    <div class="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
      <!-- Conversation Summary -->
      <div class="text-center pb-4 border-b border-primary-border/40">
        <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold text-base mb-2 border border-primary-border/50">
          <span class="material-symbols-rounded text-2xl">
            {{ isGroup ? 'groups' : 'person' }}
          </span>
        </div>
        <h4 class="text-xs font-bold text-primary-text leading-tight">
          {{ conversationName }}
        </h4>
        <span class="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-background text-secondary-text border border-primary-border/60">
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
            class="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span class="material-symbols-rounded text-sm">add</span>
            <span>Add</span>
          </button>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="member in activeMembersList"
            :key="member.id || member.user_id"
            class="p-2 rounded-lg bg-background border border-primary-border/40 flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-2 overflow-hidden">
              <!-- Avatar with online dot -->
              <div class="relative shrink-0">
                <div class="w-7 h-7 rounded-full bg-primary/10 text-primary font-semibold text-[11px] flex items-center justify-center border border-primary-border/50">
                  {{ getInitials(member.user_name || member.user_email) }}
                </div>
                <span
                  v-if="isUserOnline(member.user_id)"
                  class="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary-green border border-card-background"
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
                    'bg-primary/10 text-primary': member.role === 'OWNER',
                    'bg-primary-blue/10 text-primary-blue': member.role === 'ADMIN',
                    'bg-secondary-text/10 text-secondary-text': member.role === 'MEMBER',
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
              class="text-secondary-text hover:text-primary-red p-1 rounded transition-colors"
              title="Remove member"
            >
              <span class="material-symbols-rounded text-sm">person_remove</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Channel Actions -->
      <div class="pt-4 border-t border-primary-border/40 space-y-2">
        <!-- Leave Conversation (for groups) -->
        <button
          v-if="isGroup"
          type="button"
          @click="isConfirmLeaveOpen = true"
          class="w-full btn-secondary text-xs text-primary-red hover:bg-primary-red/10 border-primary-red/30 py-2"
        >
          <span class="material-symbols-rounded text-sm">logout</span>
          <span>Leave Channel</span>
        </button>

        <!-- Archive Conversation (for Owners/Admins) -->
        <button
          v-if="canManageMembers && !conversation?.archived_at"
          type="button"
          @click="isConfirmArchiveOpen = true"
          class="w-full btn-secondary text-xs py-2"
        >
          <span class="material-symbols-rounded text-sm">archive</span>
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
import { ref, computed } from "vue";
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
  return chatStore.onlineUserIds.has(userId);
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
</script>
