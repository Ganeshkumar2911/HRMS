export const SYSTEM_MODULES = [
  {
    key: "employee",
    label: "Employees & Directory",
    permissions: [
      { code: "employee.view", label: "View Employee Directory & Profiles", scope_aware: true },
      { code: "employee.create", label: "Create New Employees", scope_aware: true },
      { code: "employee.update", label: "Edit Employee Details", scope_aware: true },
      { code: "employee.delete", label: "Delete / Deactivate Employees", scope_aware: true },
    ],
  },
  {
    key: "attendance",
    label: "Attendance & Geofence",
    permissions: [
      { code: "attendance.view", label: "View Attendance Calendar & Records", scope_aware: true },
      { code: "attendance.punch", label: "Punch In / Out (Geofence)", scope_aware: true },
      { code: "attendance.mark", label: "Mark Attendance (WFH / On-Duty)", scope_aware: true },
      { code: "attendance.correct", label: "Correct Locked Attendance", scope_aware: true },
      { code: "attendance.settings.manage", label: "Manage Office Geofence & Settings", scope_aware: false },
      { code: "attendance_correction.create", label: "Submit Correction Petition", scope_aware: true },
    ],
  },
  {
    key: "leave",
    label: "Leave & Quota Management",
    permissions: [
      { code: "leave_request.view", label: "View Leave Applications", scope_aware: true },
      { code: "leave_request.create", label: "Apply For Leave", scope_aware: true },
      { code: "leave_request.approve", label: "Approve / Reject Leave", scope_aware: true },
      { code: "leave_request.cancel", label: "Cancel Leave Applications", scope_aware: true },
      { code: "leave_balance.view", label: "View Leave Balances & Quotas", scope_aware: true },
      { code: "leave_balance.adjust", label: "Adjust Leave Quotas", scope_aware: true },
    ],
  },
  {
    key: "tasks",
    label: "Tasks & Workflow",
    permissions: [
      { code: "task.view", label: "View Assigned Tasks", scope_aware: false },
      { code: "task.create", label: "Create Tasks", scope_aware: false },
      { code: "task.update", label: "Update Tasks & Status", scope_aware: false },
      { code: "task.delete", label: "Delete Tasks", scope_aware: false },
    ],
  },
  {
    key: "notifications",
    label: "Notifications & Alerts",
    permissions: [
      { code: "notification.view", label: "View Notifications", scope_aware: false },
      { code: "notification.broadcast", label: "Broadcast Org-wide Announcements", scope_aware: false },
    ],
  },
  {
    key: "admin",
    label: "Admin & Roles Security",
    permissions: [
      { code: "role.assign", label: "Assign & Manage Roles", scope_aware: false },
      { code: "role.create", label: "Create Roles", scope_aware: false },
      { code: "role.update", label: "Edit Role Permissions", scope_aware: false },
      { code: "role.delete", label: "Delete Roles", scope_aware: false },
      { code: "user.view", label: "View User Accounts", scope_aware: false },
      { code: "user.create", label: "Create Users", scope_aware: false },
      { code: "user.update", label: "Update User Status", scope_aware: false },
      { code: "user.deactivate", label: "Deactivate User Accounts", scope_aware: false },
      { code: "permission.override", label: "Set User Permission Overrides", scope_aware: false },
    ],
  },
  {
    key: "audit",
    label: "Audit & Logs",
    permissions: [
      { code: "audit.view", label: "Inspect System Audit Logs", scope_aware: false },
    ],
  },
];
