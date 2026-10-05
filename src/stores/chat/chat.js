import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";
import { useSnackbarStore } from "@/stores/snackbar/snackbar";
import { useWsStore } from "@/stores/ws/ws";
import { useAuthStore } from "@/stores/auth/auth";

export const useChatStore = defineStore("chat", () => {
  const snackbar = useSnackbarStore();
  const wsStore = useWsStore();
  const authStore = useAuthStore();

  // ─── 1. Primary State (Direct Data Storage) ────────────
  const conversations = ref([]);
  const activeConversationId = ref(null);
  const messagesByConversation = ref({});
  const nextCursorByConversation = ref({});
  const typingUsers = ref({}); // conversationId -> Map of userId -> userName
  const onlineUserIds = ref(new Set());
  const membersByConversation = ref({});
  const availableUsers = ref([]);

  // ─── 2. In-Flight Tracking ─────────────────────────────
  const inFlight = {
    conversations: false,
    messages: false,
    users: false,
    members: false,
    action: false,
    upload: false,
  };

  // ─── 3. isFetched Tracking ─────────────────────────────
  const isFetched = ref({
    conversations: false,
    users: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const actionLoading = ref(false);
  const messagesLoading = ref(false);
  const detailLoading = ref(false);
  const error = ref(null);

  let wsListenersCleanups = [];
  const typingTimers = new Map();

  // ─── Computed State ────────────────────────────────────
  const activeConversation = computed(() => {
    return conversations.value.find((c) => c.id === activeConversationId.value) || null;
  });

  const activeMessages = computed(() => {
    if (!activeConversationId.value) return [];
    return messagesByConversation.value[activeConversationId.value] || [];
  });

  const activeMembers = computed(() => {
    if (!activeConversationId.value) return [];
    return (
      membersByConversation.value[activeConversationId.value] ||
      activeConversation.value?.members ||
      []
    );
  });

  const activeTypingUsers = computed(() => {
    if (!activeConversationId.value) return [];
    const typingMap = typingUsers.value[activeConversationId.value];
    if (!typingMap) return [];
    const myId = authStore.currentUser?.id;
    return Array.from(typingMap.values()).filter((name) => name !== authStore.currentUser?.name);
  });

  const myMembership = computed(() => {
    if (!activeConversationId.value) return null;
    const myId = authStore.currentUser?.id;
    return activeMembers.value.find((m) => m.user_id === myId) || null;
  });

  const isOwnerOrAdmin = computed(() => {
    const role = myMembership.value?.role;
    return role === "OWNER" || role === "ADMIN";
  });

  // ─── 5. Reset Helper ───────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      conversations: false,
      users: false,
    };
  };

  // ─── Fetch Conversations (GET /conversations) ──────────
  const fetchConversations = (force = false) => {
    if (inFlight.conversations) return Promise.resolve(conversations.value);
    if (isFetched.value.conversations && !force) return Promise.resolve(conversations.value);

    inFlight.conversations = true;
    loading.value = true;
    error.value = null;

    const successHandler = (res) => {
      // Direct assignment — NO useless mapping
      conversations.value = Array.isArray(res) ? res : res?.data || [];
      isFetched.value.conversations = true;

      // Auto-select first conversation if none selected
      if (!activeConversationId.value && conversations.value.length > 0) {
        selectConversation(conversations.value[0].id);
      }
    };

    const failureHandler = (err) => {
      error.value = err?.message || "Failed to load conversations";
      snackbar.show(error.value, "error");
    };

    const finallyHandler = () => {
      inFlight.conversations = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.conversations.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Fetch Available Users (GET /admin/users) ──────────
  const fetchUsers = (force = false) => {
    if (inFlight.users) return Promise.resolve(availableUsers.value);
    if (isFetched.value.users && !force) return Promise.resolve(availableUsers.value);

    inFlight.users = true;

    const successHandler = (res) => {
      availableUsers.value = Array.isArray(res)
        ? res
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      isFetched.value.users = true;
    };

    const failureHandler = (err) => {
      console.warn("Could not load users list for chat:", err?.message);
    };

    const finallyHandler = () => {
      inFlight.users = false;
    };

    return apiRequest(urls.KEYS.GET, urls.users.list, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Select Active Conversation ────────────────────────
  const selectConversation = (conversationId) => {
    if (activeConversationId.value === conversationId) return;

    activeConversationId.value = conversationId;

    // Fetch messages if not already in store
    if (!messagesByConversation.value[conversationId]) {
      fetchMessages(conversationId);
    }

    // Fetch members if not already loaded
    fetchMembers(conversationId);

    // Send WS message.read for latest message
    const msgs = messagesByConversation.value[conversationId] || [];
    if (msgs.length > 0) {
      const latestMsg = msgs[msgs.length - 1];
      markAsRead(conversationId, latestMsg.id);
    }
  };

  // ─── Fetch Messages (GET /conversations/{id}/messages) ─
  const fetchMessages = (conversationId, cursor = null) => {
    if (!conversationId) return Promise.resolve();

    messagesLoading.value = true;
    const params = { limit: 30 };
    if (cursor) {
      params.cursor = cursor;
    }

    const successHandler = (res) => {
      const newItems = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const current = messagesByConversation.value[conversationId] || [];

      if (cursor) {
        // Prepend older messages
        messagesByConversation.value[conversationId] = [...newItems, ...current];
      } else {
        // Initial load
        messagesByConversation.value[conversationId] = newItems;
      }

      nextCursorByConversation.value[conversationId] = res?.next_cursor ?? null;

      // Mark latest as read
      if (newItems.length > 0) {
        const latest = newItems[newItems.length - 1];
        markAsRead(conversationId, latest.id);
      }
    };

    const failureHandler = (err) => {
      if (err?.status === 403) {
        snackbar.show("You are not an active member of this conversation.", "error");
      }
    };

    const finallyHandler = () => {
      messagesLoading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.conversations.messages(conversationId), {
      params,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Load Older Messages (Pagination) ──────────────────
  const loadOlderMessages = (conversationId) => {
    const cursor = nextCursorByConversation.value[conversationId];
    if (!cursor) return Promise.resolve();
    return fetchMessages(conversationId, cursor);
  };

  // ─── Send Message (WS Preferred, REST Fallback) ────────
  const sendMessage = ({
    conversationId,
    content,
    messageType = "TEXT",
    replyToMessageId = null,
    attachmentId = null,
  }) => {
    if (!conversationId || (!content?.trim() && !attachmentId)) return;

    const payload = {
      event: "message.send",
      conversation_id: conversationId,
      content: content ? content.trim() : "",
      message_type: messageType,
      reply_to_message_id: replyToMessageId || null,
      attachment_id: attachmentId || null,
    };

    // If WebSocket is connected, use preferred WS channel
    if (wsStore.isConnected) {
      const sent = wsStore.send(payload);
      if (sent) return Promise.resolve();
    }

    // REST Fallback if WS offline
    actionLoading.value = true;
    return apiRequest(urls.KEYS.POST, urls.conversations.messages(conversationId), {
      data: {
        content: payload.content,
        message_type: payload.message_type,
        reply_to_message_id: payload.reply_to_message_id,
        attachment_id: payload.attachment_id,
      },
      isTokenRequired: true,
      onSuccess: (createdMsg) => {
        if (createdMsg) {
          handleIncomingMessage({
            conversation_id: conversationId,
            message: createdMsg,
          });
        }
      },
      onFailure: (err) => {
        snackbar.show(err?.message || "Failed to send message", "error");
      },
      onFinally: () => {
        actionLoading.value = false;
      },
    });
  };

  // ─── Send File / Attachment Flow ───────────────────────
  const sendFileMessage = async ({ conversationId, file, caption = "" }) => {
    if (!conversationId || !file) return;

    inFlight.upload = true;
    actionLoading.value = true;

    try {
      // Step 1: POST /api/v1/attachments/upload-url
      const prepRes = await apiRequest(urls.KEYS.POST, urls.attachments.uploadUrl, {
        data: {
          filename: file.name,
          mime_type: file.type || "application/octet-stream",
          size: file.size,
        },
        isTokenRequired: true,
      });

      const attachmentId = prepRes?.attachment_id || prepRes?.id;
      const uploadUrl = prepRes?.upload_url;

      // Step 2: PUT bytes to upload_url or attachments/{id}/upload
      const targetUploadPath = uploadUrl || urls.attachments.upload(attachmentId);
      await fetch(targetUploadPath, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      // Step 3: Send message with message_type: "FILE"
      await sendMessage({
        conversationId,
        content: caption || file.name,
        messageType: "FILE",
        attachmentId,
      });

      snackbar.show("File sent successfully", "success");
    } catch (err) {
      snackbar.show(err?.message || "Failed to upload file attachment", "error");
    } finally {
      inFlight.upload = false;
      actionLoading.value = false;
    }
  };

  // ─── Create Conversation (POST /conversations) ─────────
  const createDirectConversation = (targetUserId) => {
    actionLoading.value = true;

    const payload = {
      type: "DIRECT",
      name: null,
      member_ids: [targetUserId],
    };

    const successHandler = (res) => {
      snackbar.show("Direct chat started", "success");
      fetchConversations(true).then(() => {
        if (res?.id) {
          selectConversation(res.id);
        }
      });
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to start direct conversation", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.conversations.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  const createGroupConversation = ({ name, memberIds }) => {
    actionLoading.value = true;

    const payload = {
      type: "GROUP",
      name: name.trim(),
      member_ids: memberIds,
    };

    const successHandler = (res) => {
      snackbar.show("Group conversation created", "success");
      fetchConversations(true).then(() => {
        if (res?.id) {
          selectConversation(res.id);
        }
      });
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to create group", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.conversations.create, {
      data: payload,
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Rename Conversation (PATCH /conversations/{id}) ───
  const renameConversation = (conversationId, newName) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      snackbar.show("Conversation renamed", "success");
      const target = conversations.value.find((c) => c.id === conversationId);
      if (target) {
        target.name = newName;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to rename conversation", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.conversations.rename(conversationId), {
      data: { name: newName },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Archive Conversation (DELETE /conversations/{id}) ─
  const archiveConversation = (conversationId) => {
    actionLoading.value = true;

    const successHandler = () => {
      snackbar.show("Conversation archived", "info");
      const target = conversations.value.find((c) => c.id === conversationId);
      if (target) {
        target.archived_at = new Date().toISOString();
      }
      // If currently open, switch to first unarchived conversation
      if (activeConversationId.value === conversationId) {
        const remaining = conversations.value.filter(
          (c) => c.id !== conversationId && !c.archived_at
        );
        activeConversationId.value = remaining.length > 0 ? remaining[0].id : null;
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to archive conversation", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.DELETE, urls.conversations.archive(conversationId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Edit Message (PATCH /messages/{id}) ───────────────
  const editMessage = (messageId, conversationId, newContent) => {
    actionLoading.value = true;

    const successHandler = (res) => {
      const msgs = messagesByConversation.value[conversationId] || [];
      const item = msgs.find((m) => m.id === messageId);
      if (item) {
        item.content = newContent;
        item.edited_at = res?.edited_at || new Date().toISOString();
      }
      snackbar.show("Message edited", "success");
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to edit message", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.PATCH, urls.messages.edit(messageId), {
      data: { content: newContent },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Soft Delete Message (DELETE /messages/{id}) ───────
  const deleteMessage = (messageId, conversationId) => {
    actionLoading.value = true;

    const successHandler = () => {
      const msgs = messagesByConversation.value[conversationId] || [];
      const item = msgs.find((m) => m.id === messageId);
      if (item) {
        item.deleted_at = new Date().toISOString();
      }
      snackbar.show("Message deleted", "info");
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to delete message", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.DELETE, urls.messages.delete(messageId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Fetch Members (GET /conversations/{id}/members) ──
  const fetchMembers = (conversationId) => {
    if (!conversationId) return Promise.resolve();

    const successHandler = (res) => {
      membersByConversation.value[conversationId] = Array.isArray(res) ? res : res?.data || [];
    };

    return apiRequest(urls.KEYS.GET, urls.conversations.members(conversationId), {
      isTokenRequired: true,
      onSuccess: successHandler,
    });
  };

  // ─── Add Member (POST /conversations/{id}/members) ────
  const addMember = (conversationId, userId, role = "MEMBER") => {
    actionLoading.value = true;

    const successHandler = () => {
      snackbar.show("Member added", "success");
      fetchMembers(conversationId);
      fetchConversations(true);
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to add member", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.POST, urls.conversations.addMember(conversationId), {
      data: { user_id: userId, role },
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Remove / Leave Member (DELETE .../members/{id}) ──
  const removeMember = (conversationId, userId) => {
    actionLoading.value = true;

    const myId = authStore.currentUser?.id;
    const isLeaving = userId === myId;

    const successHandler = () => {
      snackbar.show(isLeaving ? "You left the conversation" : "Member removed", "info");
      if (isLeaving) {
        conversations.value = conversations.value.filter((c) => c.id !== conversationId);
        activeConversationId.value = conversations.value[0]?.id || null;
      } else {
        fetchMembers(conversationId);
      }
    };

    const failureHandler = (err) => {
      snackbar.show(err?.message || "Failed to remove member", "error");
    };

    const finallyHandler = () => {
      actionLoading.value = false;
    };

    return apiRequest(urls.KEYS.DELETE, urls.conversations.removeMember(conversationId, userId), {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  // ─── Typing Indicators ─────────────────────────────────
  const startTyping = (conversationId) => {
    if (!conversationId) return;
    wsStore.send({
      event: "typing.start",
      conversation_id: conversationId,
    });
  };

  const stopTyping = (conversationId) => {
    if (!conversationId) return;
    wsStore.send({
      event: "typing.stop",
      conversation_id: conversationId,
    });
  };

  // ─── Mark As Read ──────────────────────────────────────
  const markAsRead = (conversationId, messageId) => {
    if (!conversationId || !messageId) return;
    wsStore.send({
      event: "message.read",
      conversation_id: conversationId,
      message_id: messageId,
    });
  };

  // ─── Realtime Inbound Message Handler ──────────────────
  const handleIncomingMessage = (payload) => {
    const convId = payload.conversation_id;
    const msg = payload.message || payload;

    if (!convId || !msg) return;

    if (!messagesByConversation.value[convId]) {
      messagesByConversation.value[convId] = [];
    }

    // Avoid duplicate insertions
    const exists = messagesByConversation.value[convId].some((m) => m.id === msg.id);
    if (!exists) {
      messagesByConversation.value[convId].push(msg);
    }

    // Update conversation preview snippet in list
    const conv = conversations.value.find((c) => c.id === convId);
    if (conv) {
      conv.last_message = msg.content;
      conv.updated_at = msg.created_at || new Date().toISOString();
    }

    // If currently looking at this conversation, send read receipt
    if (activeConversationId.value === convId) {
      markAsRead(convId, msg.id);
    }
  };

  // ─── Setup Shared WebSocket Subscriptions ─────────────
  const setupRealtimeListeners = () => {
    cleanupRealtimeListeners();

    // 1. message.created
    const unsubMsgCreated = wsStore.subscribe("message.created", (payload) => {
      handleIncomingMessage(payload);
    });

    // 2. typing.start / typing.stop
    const unsubTypingStart = wsStore.subscribe("typing.start", (payload) => {
      const convId = payload.conversation_id;
      const userId = payload.user_id;
      const userName = payload.user_name || `User ${userId}`;

      if (!convId || !userId) return;

      if (!typingUsers.value[convId]) {
        typingUsers.value[convId] = new Map();
      }
      typingUsers.value[convId].set(userId, userName);

      // Auto-clear typing indicator after 3 seconds
      const key = `${convId}:${userId}`;
      if (typingTimers.has(key)) {
        clearTimeout(typingTimers.get(key));
      }
      typingTimers.set(
        key,
        setTimeout(() => {
          if (typingUsers.value[convId]) {
            typingUsers.value[convId].delete(userId);
          }
          typingTimers.delete(key);
        }, 3000)
      );
    });

    const unsubTypingStop = wsStore.subscribe("typing.stop", (payload) => {
      const convId = payload.conversation_id;
      const userId = payload.user_id;
      if (convId && userId && typingUsers.value[convId]) {
        typingUsers.value[convId].delete(userId);
      }
    });

    // 3. message.read
    const unsubMsgRead = wsStore.subscribe("message.read", (payload) => {
      const convId = payload.conversation_id;
      const userId = payload.user_id;
      const msgId = payload.message_id;

      if (convId && userId && membersByConversation.value[convId]) {
        const mem = membersByConversation.value[convId].find((m) => m.user_id === userId);
        if (mem) {
          mem.last_read_message_id = msgId;
        }
      }
    });

    // 4. presence.update
    const unsubPresence = wsStore.subscribe("presence.update", (payload) => {
      const userId = payload.user_id;
      const status = payload.status;
      if (status === "online" || status === "ACTIVE") {
        onlineUserIds.value.add(userId);
      } else {
        onlineUserIds.value.delete(userId);
      }
    });

    wsListenersCleanups = [
      unsubMsgCreated,
      unsubTypingStart,
      unsubTypingStop,
      unsubMsgRead,
      unsubPresence,
    ];
  };

  const cleanupRealtimeListeners = () => {
    wsListenersCleanups.forEach((unsub) => unsub());
    wsListenersCleanups = [];
    typingTimers.forEach((timer) => clearTimeout(timer));
    typingTimers.clear();
  };

  return {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    activeMembers,
    activeTypingUsers,
    myMembership,
    isOwnerOrAdmin,
    messagesByConversation,
    nextCursorByConversation,
    typingUsers,
    onlineUserIds,
    availableUsers,
    inFlight,
    isFetched,
    loading,
    actionLoading,
    messagesLoading,
    detailLoading,
    error,
    resetFetchedFlags,
    fetchConversations,
    fetchUsers,
    selectConversation,
    fetchMessages,
    loadOlderMessages,
    sendMessage,
    sendFileMessage,
    createDirectConversation,
    createGroupConversation,
    renameConversation,
    archiveConversation,
    editMessage,
    deleteMessage,
    fetchMembers,
    addMember,
    removeMember,
    startTyping,
    stopTyping,
    markAsRead,
    setupRealtimeListeners,
    cleanupRealtimeListeners,
  };
});
