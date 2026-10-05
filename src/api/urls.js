const urls = {
  KEYS: {
    GET: "get",
    POST: "post",
    PUT: "put",
    DELETE: "delete",
    PATCH: "patch",
  },

  // ── Auth Module ──────────────────────────────────────────
  auth: {
    login: "auth/login",
    signup: "auth/signup",
    refresh: "auth/refresh",
    logout: "auth/logout",
  },

  // ── Users Module ─────────────────────────────────────────
  users: {
    me: "users/me",
    list: "admin/users",
    detail: (id) => `admin/users/${id}`,
  },

  // ── HRMS Module ──────────────────────────────────────────
  hrms: {
    employeeProfile: "hrms/employees/me/profile",
    employees: "hrms/employees",
    employeeDetail: (id) => `hrms/employees/${id}`,
    departments: "hrms/departments",
    attendance: "hrms/attendance",
    leaveRequests: "hrms/leave-requests",
    leaveBalances: "hrms/leave-balances",
  },

  // ── RBAC / Roles Module ──────────────────────────────────
  roles: {
    list: "roles",
    detail: (id) => `roles/${id}`,
    create: "roles",
    update: (id) => `roles/${id}`,
    assign: "roles/assign",
    permissions: "roles/permissions",
  },

  // ── Tasks Module ─────────────────────────────────────────
  tasks: {
    list: "tasks",
    summary: "tasks/summary",
    create: "tasks",
    detail: (id) => `tasks/${id}`,
    update: (id) => `tasks/${id}`,
  },

  // ── Notifications Module ─────────────────────────────────
  notifications: {
    list: "notifications",
    unreadCount: "notifications/unread-count",
    markRead: (id) => `notifications/${id}/read`,
    markAllRead: "notifications/read-all",
  },

  // ── Chat Module ──────────────────────────────────────────
  chat: {
    conversations: "chat/conversations",
    messages: (conversationId) => `chat/conversations/${conversationId}/messages`,
    createConversation: "chat/conversations",
  },

  // ── Audit Module ─────────────────────────────────────────
  audit: {
    list: "audit",
  },
};

export default urls;