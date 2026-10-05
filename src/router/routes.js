import DefaultLayout from "@/layouts/default.vue";
import AuthLayout from "@/layouts/auth.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/chat" },
      { path: "dashboard", redirect: "/chat" },
      {
        path: "chat",
        name: "Chat",
        component: () => import("@/pages/chat/index.vue"),
        meta: { title: "Chat", requiresAuth: true },
      },
      {
        path: "chat/:conversationId",
        name: "ChatThread",
        component: () => import("@/pages/chat/index.vue"),
        meta: { title: "Chat Thread", requiresAuth: true },
      },
      {
        path: "tasks",
        name: "Tasks",
        component: () => import("@/pages/tasks/index.vue"),
        meta: {
          title: "Tasks",
          requiresAuth: true,
          requiredPermission: "task.view",
        },
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/pages/notifications/index.vue"),
        meta: {
          title: "Notifications",
          requiresAuth: true,
          requiredPermission: "notification.view",
        },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/pages/profile/index.vue"),
        meta: { title: "Profile", requiresAuth: true },
      },
      {
        path: "forbidden",
        name: "Forbidden",
        component: () => import("@/pages/common/Forbidden.vue"),
        meta: { title: "Access Restricted", requiresAuth: true },
      },

      // ── HRMS nested ──────────────────────────────────────
      {
        path: "hrms",
        component: () => import("@/pages/hrms/layout.vue"),
        meta: {
          title: "HRMS",
          requiresAuth: true,
          requiredPermission: "employee.view",
        },
        children: [
          { path: "", redirect: "/hrms/me" },
          {
            path: "me",
            name: "HrmsMe",
            component: () => import("@/pages/hrms/me/index.vue"),
            meta: { title: "My Profile", requiredPermission: "employee.view" },
          },
          {
            path: "employees",
            name: "HrmsEmployees",
            component: () => import("@/pages/hrms/employees/index.vue"),
            meta: { title: "Employees", requiredPermission: "employee.view" },
          },
          {
            path: "employees/:employeeId",
            name: "HrmsEmployeeDetail",
            component: () => import("@/pages/hrms/employees/detail.vue"),
            meta: { title: "Employee", requiredPermission: "employee.view" },
          },
          {
            path: "org/departments",
            name: "HrmsDepartments",
            component: () => import("@/pages/hrms/org/departments.vue"),
            meta: { title: "Departments", requiredPermission: "department.view" },
          },
          {
            path: "org/designations",
            name: "HrmsDesignations",
            component: () => import("@/pages/hrms/org/designations.vue"),
            meta: { title: "Designations", requiredPermission: "designation.view" },
          },
          {
            path: "org/work-locations",
            name: "HrmsWorkLocations",
            component: () => import("@/pages/hrms/org/work-locations.vue"),
            meta: { title: "Work Locations", requiredPermission: "work_location.view" },
          },
          {
            path: "holidays",
            name: "HrmsHolidays",
            component: () => import("@/pages/hrms/holidays/index.vue"),
            meta: { title: "Holidays", requiredPermission: "holiday.view" },
          },
          {
            path: "attendance",
            name: "HrmsAttendance",
            component: () => import("@/pages/hrms/attendance/index.vue"),
            meta: { title: "Attendance", requiredPermission: "attendance.view" },
          },
          {
            path: "leave",
            name: "HrmsLeave",
            component: () => import("@/pages/hrms/leave/index.vue"),
            meta: { title: "Leave", requiredPermission: "leave_request.view" },
          },
          {
            path: "calendar",
            name: "HrmsCalendar",
            component: () => import("@/pages/hrms/calendar/index.vue"),
            meta: { title: "Calendar", requiredPermission: "attendance.view" },
          },
        ],
      },

      // ── Admin ────────────────────────────────────────────
      {
        path: "admin/users",
        name: "AdminUsers",
        component: () => import("@/pages/admin/users/index.vue"),
        meta: {
          title: "Users Management",
          requiresAuth: true,
          requiredPermission: "user.view",
        },
      },
      {
        path: "admin/roles",
        name: "AdminRoles",
        component: () => import("@/pages/admin/roles/index.vue"),
        meta: {
          title: "Roles & Permissions",
          requiresAuth: true,
          requiredPermission: "role.assign",
        },
      },
      {
        path: "admin/audit",
        name: "AdminAudit",
        component: () => import("@/pages/admin/audit/index.vue"),
        meta: {
          title: "Audit Trail",
          requiresAuth: true,
          requiredPermission: "audit.view",
        },
      },
      {
        path: "admin/notifications/broadcast",
        name: "AdminBroadcast",
        component: () => import("@/pages/admin/notifications/broadcast.vue"),
        meta: {
          title: "Broadcast",
          requiresAuth: true,
          requiredPermission: "notification.broadcast",
        },
      },
    ],
  },

  {
    path: "/login",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Login",
        component: () => import("@/pages/auth/Login.vue"),
        meta: { requiresAuth: false, title: "Sign In" },
      },
    ],
  },
  {
    path: "/signup",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Signup",
        component: () => import("@/pages/auth/Signup.vue"),
        meta: { requiresAuth: false, title: "Create Account" },
      },
    ],
  },
  { path: "/auth", redirect: "/login" },
  { path: "/:pathMatch(.*)*", redirect: "/chat" },
];

export default routes;
