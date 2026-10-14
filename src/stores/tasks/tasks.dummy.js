/**
 * DUMMY DATA FOR TASKS MODULE
 *
 * To remove dummy data and switch back to live API:
 * Simply DELETE or RENAME this file!
 * No code changes needed in any other files.
 */

export const dummyUsers = [
  { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com", role: "Super Admin" },
  { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com", role: "Lead Engineer" },
  { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com", role: "DevOps Engineer" },
  { id: 4, name: "Elena Rostova", email: "elena.rostova@example.com", role: "HR Operations" },
  { id: 5, name: "David Kim", email: "david.kim@example.com", role: "Frontend Developer" },
];

export let dummyTasks = [
  {
    id: 101,
    title: "Implement SSO & OAuth2 Google Login",
    description: "Set up Google Workspace single sign-on provider with automatic employee profile mapping and session validation.",
    status: "PENDING",
    priority: "HIGH",
    created_by: 1,
    created_by_name: "Alex Rivera",
    creator: { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com" },
    assigned_to: 2,
    assigned_to_name: "Sarah Chen",
    assignee: { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com" },
    created_at: "2026-10-10T09:00:00Z",
    start_date: "2026-10-12",
    due_date: "2026-10-25",
    completed_at: null,
  },
  {
    id: 102,
    title: "Fix PostgreSQL connection pool exhaustion",
    description: "Investigate connection leaks in celery background worker tasks and tune pool size for high concurrency spikes.",
    status: "UPCOMING",
    priority: "HIGH",
    created_by: 2,
    created_by_name: "Sarah Chen",
    creator: { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com" },
    assigned_to: 3,
    assigned_to_name: "Marcus Vance",
    assignee: { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com" },
    created_at: "2026-10-11T14:30:00Z",
    start_date: "2026-10-15",
    due_date: "2026-10-30",
    completed_at: null,
  },
  {
    id: 103,
    title: "Q4 Employee Attendance & Timesheet Audit",
    description: "Cross-reference biometric check-ins with remote work requests and flag anomalies for manager approval.",
    status: "PICK_LATER",
    priority: "MEDIUM",
    created_by: 1,
    created_by_name: "Alex Rivera",
    creator: { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com" },
    assigned_to: 4,
    assigned_to_name: "Elena Rostova",
    assignee: { id: 4, name: "Elena Rostova", email: "elena.rostova@example.com" },
    created_at: "2026-10-08T11:15:00Z",
    start_date: "2026-10-18",
    due_date: "2026-11-05",
    completed_at: null,
  },
  {
    id: 104,
    title: "Overdue Security Compliance Review (ISO 27001)",
    description: "Annual access control review for AWS production environment and database encryption key rotation policy.",
    status: "PENDING",
    priority: "HIGH",
    created_by: 3,
    created_by_name: "Marcus Vance",
    creator: { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com" },
    assigned_to: 1,
    assigned_to_name: "Alex Rivera",
    assignee: { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com" },
    created_at: "2026-09-20T08:00:00Z",
    start_date: "2026-09-22",
    due_date: "2026-10-05",
    completed_at: null,
  },
  {
    id: 105,
    title: "Stitch UI Design System alignment for Dark Mode",
    description: "Verify contrast ratios, quiet work color palettes, and component borders across all dashboard views.",
    status: "COMPLETED",
    priority: "LOW",
    created_by: 2,
    created_by_name: "Sarah Chen",
    creator: { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com" },
    assigned_to: 2,
    assigned_to_name: "Sarah Chen",
    assignee: { id: 2, name: "Sarah Chen", email: "sarah.chen@example.com" },
    created_at: "2026-10-02T10:00:00Z",
    start_date: "2026-10-03",
    due_date: "2026-10-12",
    completed_at: "2026-10-12T17:45:00Z",
  },
  {
    id: 106,
    title: "WebSocket heartbeat & auto-reconnect fallback",
    description: "Add ping/pong frame validation and exponential backoff timer for mobile browser network switches.",
    status: "UPCOMING",
    priority: "MEDIUM",
    created_by: 3,
    created_by_name: "Marcus Vance",
    creator: { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com" },
    assigned_to: 5,
    assigned_to_name: "David Kim",
    assignee: { id: 5, name: "David Kim", email: "david.kim@example.com" },
    created_at: "2026-10-12T16:20:00Z",
    start_date: "2026-10-16",
    due_date: "2026-10-28",
    completed_at: null,
  },
  {
    id: 107,
    title: "Automate Monthly Payroll Payslip PDF Generation",
    description: "Integrate background PDF templating engine with tax deduction calculations and email delivery queue.",
    status: "PENDING",
    priority: "MEDIUM",
    created_by: 4,
    created_by_name: "Elena Rostova",
    creator: { id: 4, name: "Elena Rostova", email: "elena.rostova@example.com" },
    assigned_to: 4,
    assigned_to_name: "Elena Rostova",
    assignee: { id: 4, name: "Elena Rostova", email: "elena.rostova@example.com" },
    created_at: "2026-10-13T12:00:00Z",
    start_date: "2026-10-14",
    due_date: "2026-10-31",
    completed_at: null,
  },
  {
    id: 108,
    title: "Configure Dev Tunnel proxy for staging webhooks",
    description: "Route incoming GitHub and Slack webhook events through local forwarder for real-time integration tests.",
    status: "COMPLETED",
    priority: "LOW",
    created_by: 1,
    created_by_name: "Alex Rivera",
    creator: { id: 1, name: "Alex Rivera", email: "alex.rivera@example.com" },
    assigned_to: 3,
    assigned_to_name: "Marcus Vance",
    assignee: { id: 3, name: "Marcus Vance", email: "marcus.vance@example.com" },
    created_at: "2026-10-05T09:15:00Z",
    start_date: "2026-10-06",
    due_date: "2026-10-09",
    completed_at: "2026-10-09T15:20:00Z",
  },
];

export const getTasks = (query = {}) => {
  let list = [...dummyTasks];

  if (query.status) {
    list = list.filter((t) => t.status === query.status);
  }
  if (query.priority) {
    list = list.filter((t) => t.priority === query.priority);
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.creator?.name?.toLowerCase().includes(q) ||
        t.assignee?.name?.toLowerCase().includes(q)
    );
  }
  if (query.from_date) {
    list = list.filter((t) => (t.due_date || t.created_at) >= query.from_date);
  }
  if (query.to_date) {
    list = list.filter((t) => (t.due_date || t.created_at) <= query.to_date);
  }

  const total = list.length;
  const offset = Number(query.offset) || 0;
  const limit = Number(query.limit) || 50;
  const paginated = list.slice(offset, offset + limit);

  return {
    items: paginated,
    pagination: {
      limit,
      offset,
      total,
      has_more: offset + limit < total,
    },
  };
};

export const getSummary = () => {
  const today = new Date().toISOString().slice(0, 10);
  const total = dummyTasks.length;
  const pending = dummyTasks.filter((t) => t.status === "PENDING").length;
  const upcoming = dummyTasks.filter((t) => t.status === "UPCOMING").length;
  const pickLater = dummyTasks.filter((t) => t.status === "PICK_LATER").length;
  const completed = dummyTasks.filter((t) => t.status === "COMPLETED").length;
  const overdue = dummyTasks.filter(
    (t) => t.due_date && t.due_date < today && t.status !== "COMPLETED"
  ).length;

  return {
    total,
    status: {
      pending,
      upcoming,
      pick_later: pickLater,
      completed,
    },
    overdue,
  };
};

export const createTask = (payload) => {
  const creator = dummyUsers.find((u) => u.id === Number(payload.created_by)) || dummyUsers[0];
  const assignee = dummyUsers.find((u) => u.id === Number(payload.assigned_to)) || creator;

  const newTask = {
    id: Date.now(),
    title: payload.title || "Untitled Task",
    description: payload.description || "",
    status: payload.status || "PENDING",
    priority: payload.priority || "MEDIUM",
    created_by: creator.id,
    created_by_name: creator.name,
    creator,
    assigned_to: assignee.id,
    assigned_to_name: assignee.name,
    assignee,
    created_at: new Date().toISOString(),
    start_date: payload.start_date || "",
    due_date: payload.due_date || "",
    completed_at: payload.status === "COMPLETED" ? new Date().toISOString() : null,
  };

  dummyTasks.unshift(newTask);
  return newTask;
};

export const updateTask = (taskId, payload) => {
  const index = dummyTasks.findIndex((t) => t.id === taskId);
  if (index === -1) return null;

  const current = dummyTasks[index];
  let assignee = current.assignee;
  if (payload.assigned_to) {
    assignee = dummyUsers.find((u) => u.id === Number(payload.assigned_to)) || assignee;
  }

  const updated = {
    ...current,
    ...payload,
    assignee,
    assigned_to: assignee?.id ?? current.assigned_to,
    assigned_to_name: assignee?.name ?? current.assigned_to_name,
    completed_at:
      payload.status === "COMPLETED"
        ? (current.completed_at || new Date().toISOString())
        : (payload.status ? null : current.completed_at),
  };

  dummyTasks[index] = updated;
  return updated;
};

export const deleteTask = (taskId) => {
  dummyTasks = dummyTasks.filter((t) => t.id !== taskId);
  return true;
};

export default {
  dummyTasks,
  dummyUsers,
  getTasks,
  getSummary,
  createTask,
  updateTask,
  deleteTask,
};
