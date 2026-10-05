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
    myPermissions: "users/me/permissions",
    list: "users",
    search: "users/search",
    create: "users",
    detail: (id) => `users/${id}`,
    update: (id) => `users/${id}`,
    deactivate: (id) => `users/${id}`,
    assignRole: (id) => `users/${id}/roles`,
    unassignRole: (userId, roleId) => `users/${userId}/roles/${roleId}`,
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
    employeeCreate: "hrms/employees",
    employeeDetail: (id) => `hrms/employees/${id}`,
    employeeUpdate: (id) => `hrms/employees/${id}`,
    employeeHistory: (id) => `hrms/employees/${id}/history`,
    employeeAddresses: (id) => `hrms/employees/${id}/addresses`,
    employeeEmergencyContacts: (id) => `hrms/employees/${id}/emergency-contacts`,

    departments: "hrms/departments",
    departmentDetail: (id) => `hrms/departments/${id}`,
    designations: "hrms/designations",
    designationDetail: (id) => `hrms/designations/${id}`,
    workLocations: "hrms/work-locations",
    workLocationDetail: (id) => `hrms/work-locations/${id}`,

    holidays: "hrms/holidays",
    holidayDetail: (id) => `hrms/holidays/${id}`,
    workWeekPolicies: "hrms/work-week-policies",
    workWeekPolicyDetail: (id) => `hrms/work-week-policies/${id}`,

    attendance: "hrms/attendance",
    attendanceCalendar: "hrms/attendance/calendar",
    attendanceMark: "hrms/attendance/mark",
    attendanceBulkMark: "hrms/attendance/bulk-mark",
    attendanceCorrection: (id) => `hrms/attendance/${id}/correction`,

    leaveTypes: "hrms/leave/types",
    leaveTypeDetail: (id) => `hrms/leave/types/${id}`,
    leavePolicies: "hrms/leave/policies",
    leaveBalances: "hrms/leave/balances",
    leaveBalanceAdjust: "hrms/leave/balances/adjust",
    leaveRequests: "hrms/leave/requests",
    leaveRequestDetail: (id) => `hrms/leave/requests/${id}`,
    leaveRequestApprove: (id) => `hrms/leave/requests/${id}/approve`,
    leaveRequestReject: (id) => `hrms/leave/requests/${id}/reject`,
    leaveRequestCancel: (id) => `hrms/leave/requests/${id}/cancel`,

    calendar: "hrms/calendar",
  },

  // ── RBAC / Roles Module ──────────────────────────────────
  roles: {
    list: "roles",
    create: "roles",
    update: (id) => `roles/${id}`,
    delete: (id) => `roles/${id}`,
  },

  // ── Tasks Module ─────────────────────────────────────────
  tasks: {
    list: "tasks",
    summary: "tasks/summary",
    create: "tasks",
    detail: (id) => `tasks/${id}`,
    update: (id) => `tasks/${id}`,
    delete: (id) => `tasks/${id}`,
  },

  // ── Notifications Module ─────────────────────────────────
  notifications: {
    list: "notifications",
    unreadCount: "notifications/unread-count",
    markRead: (id) => `notifications/${id}/read`,
    markAllRead: "notifications/read-all",
    broadcast: "notifications/broadcast",
  },

  // ── Audit Module ─────────────────────────────────────────
  audit: {
    list: "audit-logs",
    detail: (id) => `audit-logs/${id}`,
    entity: (entityType, entityId) => `audit-logs/entity/${entityType}/${entityId}`,
    actor: (userId) => `audit-logs/actor/${userId}`,
  },
};

export default urls;
