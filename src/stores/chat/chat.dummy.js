/**
 * DUMMY DATA FOR CHAT MODULE
 *
 * To remove dummy data and switch back to live API / WebSocket:
 * Simply DELETE or RENAME this file!
 * No code changes needed in any other files.
 */

export const dummyUsers = [
  { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com", role: "Super Admin" },
  { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com", role: "Engineering Lead" },
  { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com", role: "DevOps Engineer" },
  { id: 4, name: "Elena Rostova", email: "elena.rostova@example.com", role: "HR Operations" },
  { id: 5, name: "David Kim", email: "david.kim@example.com", role: "Frontend Developer" },
  { id: 6, name: "Rachel Green", email: "rachel.green@example.com", role: "Product Designer" },
];

export const dummyOnlineUserIds = {
  2: true,
  3: true,
  5: true,
};

export let dummyConversations = [
  {
    id: 1,
    type: "DIRECT",
    name: null,
    last_message: "Perfect, let's demo it in tomorrow's standup 👍",
    created_at: "2026-10-15T23:40:00Z",
    updated_at: "2026-10-15T23:55:00Z",
    archived_at: null,
    members: [
      { id: 101, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "MEMBER", last_read_message_id: 1005 },
      { id: 102, user_id: 2, user_name: "Sarah Chen", user_email: "sarah.chen@example.com", role: "MEMBER", last_read_message_id: 1005 },
    ],
  },
  {
    id: 2,
    type: "GROUP",
    name: "Engineering Core",
    last_message: "Marcus: Understood, proxy tunnels are confirmed active.",
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-15T23:10:00Z",
    archived_at: null,
    members: [
      { id: 201, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "OWNER", last_read_message_id: 2004 },
      { id: 202, user_id: 2, user_name: "Sarah Chen", user_email: "sarah.chen@example.com", role: "ADMIN", last_read_message_id: 2004 },
      { id: 203, user_id: 3, user_name: "Marcus Vance", user_email: "marcus.vance@example.com", role: "MEMBER", last_read_message_id: 2004 },
      { id: 204, user_id: 5, user_name: "David Kim", user_email: "david.kim@example.com", role: "MEMBER", last_read_message_id: 2004 },
    ],
  },
  {
    id: 3,
    type: "DIRECT",
    name: null,
    last_message: "Thanks! Deploying to canary now.",
    created_at: "2026-10-08T11:00:00Z",
    updated_at: "2026-10-15T20:40:00Z",
    archived_at: null,
    members: [
      { id: 301, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "MEMBER", last_read_message_id: 3003 },
      { id: 302, user_id: 3, user_name: "Marcus Vance", user_email: "marcus.vance@example.com", role: "MEMBER", last_read_message_id: 3003 },
    ],
  },
  {
    id: 4,
    type: "GROUP",
    name: "Product & Design",
    last_message: "Looks fantastic, contrast ratio meets WCAG AAA standards.",
    created_at: "2026-10-05T09:30:00Z",
    updated_at: "2026-10-13T16:50:00Z",
    archived_at: null,
    members: [
      { id: 401, user_id: 6, user_name: "Rachel Green", user_email: "rachel.green@example.com", role: "OWNER", last_read_message_id: 4002 },
      { id: 402, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "ADMIN", last_read_message_id: 4002 },
      { id: 403, user_id: 2, user_name: "Sarah Chen", user_email: "sarah.chen@example.com", role: "MEMBER", last_read_message_id: 4002 },
    ],
  },
  {
    id: 5,
    type: "GROUP",
    name: "General Announcements",
    last_message: "David: Submitted mine! Have a great week everyone.",
    created_at: "2026-09-01T08:00:00Z",
    updated_at: "2026-10-12T11:15:00Z",
    archived_at: null,
    members: [
      { id: 501, user_id: 4, user_name: "Elena Rostova", user_email: "elena.rostova@example.com", role: "OWNER", last_read_message_id: 5002 },
      { id: 502, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "MEMBER", last_read_message_id: 5002 },
      { id: 503, user_id: 2, user_name: "Sarah Chen", user_email: "sarah.chen@example.com", role: "MEMBER", last_read_message_id: 5002 },
      { id: 504, user_id: 3, user_name: "Marcus Vance", user_email: "marcus.vance@example.com", role: "MEMBER", last_read_message_id: 5002 },
      { id: 505, user_id: 5, user_name: "David Kim", user_email: "david.kim@example.com", role: "MEMBER", last_read_message_id: 5002 },
      { id: 506, user_id: 6, user_name: "Rachel Green", user_email: "rachel.green@example.com", role: "MEMBER", last_read_message_id: 5002 },
    ],
  },
  {
    id: 6,
    type: "GROUP",
    name: "Hackathon 2026",
    last_message: "Sarah: Top 3 finish! 🎉",
    created_at: "2026-09-10T10:00:00Z",
    updated_at: "2026-09-15T12:00:00Z",
    archived_at: "2026-09-15T12:00:00Z",
    members: [
      { id: 601, user_id: 1, user_name: "Alex Rivera", user_email: "alex.rivera@example.com", role: "OWNER", last_read_message_id: 6002 },
      { id: 602, user_id: 2, user_name: "Sarah Chen", user_email: "sarah.chen@example.com", role: "MEMBER", last_read_message_id: 6002 },
      { id: 603, user_id: 5, user_name: "David Kim", user_email: "david.kim@example.com", role: "MEMBER", last_read_message_id: 6002 },
    ],
  },
];

export let dummyMessages = {
  1: [
    {
      id: 1001,
      conversation_id: 1,
      sender_id: 2,
      sender_name: "Sarah Chen",
      content: "Hey Alex! Did you get a chance to look over the new Stitch task design specs?",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-15T23:40:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 1002,
      conversation_id: 1,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Yes, I just reviewed them. The quiet-work theme and date picker presets look really clean.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-15T23:44:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 1003,
      conversation_id: 1,
      sender_id: 2,
      sender_name: "Sarah Chen",
      content: "Awesome! I'm tuning the API pagination endpoints right now. Let me know if you run into any latency.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-15T23:48:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 1004,
      conversation_id: 1,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Will do! Everything is working smoothly on my end.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-15T23:52:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 1005,
      conversation_id: 1,
      sender_id: 2,
      sender_name: "Sarah Chen",
      content: "Perfect, let's demo it in tomorrow's standup 👍",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-15T23:55:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
  2: [
    {
      id: 2001,
      conversation_id: 2,
      sender_id: 3,
      sender_name: "Marcus Vance",
      content: "Heads up team: staging cluster database migration is scheduled for 7:00 PM UTC tonight.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T17:15:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 2002,
      conversation_id: 2,
      sender_id: 5,
      sender_name: "David Kim",
      content: "Thanks for the reminder Marcus. I'll merge the frontend auth fix before then.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T17:20:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 2003,
      conversation_id: 2,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Sounds good. Make sure dev tunnels are kept open for webhook testing.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T17:32:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 2004,
      conversation_id: 2,
      sender_id: 3,
      sender_name: "Marcus Vance",
      content: "Understood, proxy tunnels are confirmed active.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T17:40:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
  3: [
    {
      id: 3001,
      conversation_id: 3,
      sender_id: 3,
      sender_name: "Marcus Vance",
      content: "Alex, could you approve the PR for Celery worker autoscaling?",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T15:00:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 3002,
      conversation_id: 3,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Checked it and approved. Nice catch on the thread pool limits.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T15:05:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 3003,
      conversation_id: 3,
      sender_id: 3,
      sender_name: "Marcus Vance",
      content: "Thanks! Deploying to canary now.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-14T15:10:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
  4: [
    {
      id: 4001,
      conversation_id: 4,
      sender_id: 6,
      sender_name: "Rachel Green",
      content: "Uploaded the revised Figma design tokens for dark mode contrast.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-13T16:30:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 4002,
      conversation_id: 4,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Looks fantastic, contrast ratio meets WCAG AAA standards.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-13T16:50:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
  5: [
    {
      id: 5001,
      conversation_id: 5,
      sender_id: 4,
      sender_name: "Elena Rostova",
      content: "Reminder: Please complete your quarterly self-evaluations by Friday EOD.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-12T11:00:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 5002,
      conversation_id: 5,
      sender_id: 5,
      sender_name: "David Kim",
      content: "Submitted mine! Have a great week everyone.",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-10-12T11:15:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
  6: [
    {
      id: 6001,
      conversation_id: 6,
      sender_id: 1,
      sender_name: "Alex Rivera",
      content: "Great work everyone on the AI assistant prototype!",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-09-15T11:45:00Z",
      edited_at: null,
      deleted_at: null,
    },
    {
      id: 6002,
      conversation_id: 6,
      sender_id: 2,
      sender_name: "Sarah Chen",
      content: "Top 3 finish! 🎉",
      message_type: "TEXT",
      attachment_id: null,
      created_at: "2026-09-15T12:00:00Z",
      edited_at: null,
      deleted_at: null,
    },
  ],
};

// ─── Helper Functions ─────────────────────────────────────────────

export const getConversations = () => {
  return [...dummyConversations];
};

export const getUsers = () => {
  return [...dummyUsers];
};

export const searchUsers = (query = "", limit = 20) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return dummyUsers
    .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    .slice(0, limit);
};

export const getMessages = (conversationId) => {
  return [...(dummyMessages[conversationId] || [])];
};

export const getMembers = (conversationId) => {
  const conv = dummyConversations.find((c) => String(c.id) === String(conversationId));
  return conv ? [...(conv.members || [])] : [];
};

export const sendMessage = ({ conversationId, content, messageType = "TEXT", attachmentId = null, currentUserId = 1, currentUserName = "Alex Rivera" }) => {
  const convId = Number(conversationId);
  if (!dummyMessages[convId]) {
    dummyMessages[convId] = [];
  }

  const newMsg = {
    id: Date.now(),
    conversation_id: convId,
    sender_id: currentUserId,
    sender_name: currentUserName,
    content: content || "",
    message_type: messageType,
    attachment_id: attachmentId,
    created_at: new Date().toISOString(),
    edited_at: null,
    deleted_at: null,
  };

  dummyMessages[convId].push(newMsg);

  // Update conversation preview and timestamp
  const convIndex = dummyConversations.findIndex((c) => c.id === convId);
  if (convIndex >= 0) {
    const conv = dummyConversations[convIndex];
    conv.last_message = content || (messageType === "FILE" ? "Sent a file" : "New message");
    conv.updated_at = newMsg.created_at;
    // Move to front
    dummyConversations.splice(convIndex, 1);
    dummyConversations.unshift(conv);
  }

  return newMsg;
};

export const createDirect = (targetUserId, currentUserId = 1, currentUserName = "Alex Rivera", currentUserEmail = "alex.rivera@example.com") => {
  const target = dummyUsers.find((u) => u.id === Number(targetUserId)) || {
    id: Number(targetUserId),
    name: `User ${targetUserId}`,
    email: `user${targetUserId}@example.com`,
  };

  // Check if existing
  const existing = dummyConversations.find(
    (c) => c.type === "DIRECT" && c.members?.some((m) => m.user_id === target.id)
  );
  if (existing) return existing;

  const newConv = {
    id: Date.now(),
    type: "DIRECT",
    name: null,
    last_message: "Started conversation",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    members: [
      { id: Date.now() + 1, user_id: currentUserId, user_name: currentUserName, user_email: currentUserEmail, role: "MEMBER", last_read_message_id: null },
      { id: Date.now() + 2, user_id: target.id, user_name: target.name, user_email: target.email, role: "MEMBER", last_read_message_id: null },
    ],
  };

  dummyConversations.unshift(newConv);
  dummyMessages[newConv.id] = [
    {
      id: Date.now() + 10,
      conversation_id: newConv.id,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content: `Hey ${target.name.split(" ")[0]}!`,
      message_type: "TEXT",
      attachment_id: null,
      created_at: new Date().toISOString(),
      edited_at: null,
      deleted_at: null,
    },
  ];
  newConv.last_message = dummyMessages[newConv.id][0].content;

  return newConv;
};

export const createGroup = ({ name, memberIds }, currentUserId = 1, currentUserName = "Alex Rivera", currentUserEmail = "alex.rivera@example.com") => {
  const members = [
    { id: Date.now() + 1, user_id: currentUserId, user_name: currentUserName, user_email: currentUserEmail, role: "OWNER", last_read_message_id: null },
  ];

  (memberIds || []).forEach((id, idx) => {
    if (Number(id) === currentUserId) return;
    const u = dummyUsers.find((user) => user.id === Number(id));
    members.push({
      id: Date.now() + 10 + idx,
      user_id: Number(id),
      user_name: u?.name || `User ${id}`,
      user_email: u?.email || `user${id}@example.com`,
      role: "MEMBER",
      last_read_message_id: null,
    });
  });

  const newConv = {
    id: Date.now(),
    type: "GROUP",
    name: name || "New Group Channel",
    last_message: `${currentUserName} created the group.`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    archived_at: null,
    members,
  };

  dummyConversations.unshift(newConv);
  dummyMessages[newConv.id] = [
    {
      id: Date.now() + 50,
      conversation_id: newConv.id,
      sender_id: currentUserId,
      sender_name: currentUserName,
      content: `Welcome to ${newConv.name}!`,
      message_type: "TEXT",
      attachment_id: null,
      created_at: new Date().toISOString(),
      edited_at: null,
      deleted_at: null,
    },
  ];

  return newConv;
};

export const renameConversation = (conversationId, newName) => {
  const conv = dummyConversations.find((c) => String(c.id) === String(conversationId));
  if (conv) {
    conv.name = newName;
  }
  return conv;
};

export const archiveConversation = (conversationId) => {
  const conv = dummyConversations.find((c) => String(c.id) === String(conversationId));
  if (conv) {
    conv.archived_at = new Date().toISOString();
  }
  return conv;
};

export const editMessage = (messageId, conversationId, newContent) => {
  const msgs = dummyMessages[conversationId] || [];
  const msg = msgs.find((m) => m.id === messageId);
  if (msg) {
    msg.content = newContent;
    msg.edited_at = new Date().toISOString();
  }
  return msg;
};

export const deleteMessage = (messageId, conversationId) => {
  const msgs = dummyMessages[conversationId] || [];
  const msg = msgs.find((m) => m.id === messageId);
  if (msg) {
    msg.deleted_at = new Date().toISOString();
  }
  return msg;
};

export const addMember = (conversationId, userId, role = "MEMBER") => {
  const conv = dummyConversations.find((c) => String(c.id) === String(conversationId));
  if (!conv) return null;

  const u = dummyUsers.find((user) => user.id === Number(userId));
  const newMember = {
    id: Date.now(),
    user_id: Number(userId),
    user_name: u?.name || `User ${userId}`,
    user_email: u?.email || `user${userId}@example.com`,
    role,
    last_read_message_id: null,
  };

  if (!conv.members) conv.members = [];
  conv.members.push(newMember);
  return newMember;
};

export const removeMember = (conversationId, userId) => {
  const conv = dummyConversations.find((c) => String(c.id) === String(conversationId));
  if (conv && conv.members) {
    conv.members = conv.members.filter((m) => m.user_id !== Number(userId));
  }
  return true;
};

export default {
  dummyUsers,
  dummyOnlineUserIds,
  dummyConversations,
  dummyMessages,
  getConversations,
  getUsers,
  searchUsers,
  getMessages,
  getMembers,
  sendMessage,
  createDirect,
  createGroup,
  renameConversation,
  archiveConversation,
  editMessage,
  deleteMessage,
  addMember,
  removeMember,
};
