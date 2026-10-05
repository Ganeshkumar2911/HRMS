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

  // ── Chat Module ──────────────────────────────────────────
  conversations: {
    list: "conversations",
    create: "conversations",
    detail: (id) => `conversations/${id}`,
    rename: (id) => `conversations/${id}`,
    archive: (id) => `conversations/${id}`,
    members: (id) => `conversations/${id}/members`,
    addMember: (id) => `conversations/${id}/members`,
    removeMember: (convId, userId) => `conversations/${convId}/members/${userId}`,
    messages: (id) => `conversations/${id}/messages`,
  },

  messages: {
    detail: (id) => `messages/${id}`,
    edit: (id) => `messages/${id}`,
    delete: (id) => `messages/${id}`,
  },

  attachments: {
    uploadUrl: "attachments/upload-url",
    upload: (id) => `attachments/${id}/upload`,
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

  // ── Audit Module ─────────────────────────────────────────
  audit: {
    list: "audit",
  },
};

export default urls;