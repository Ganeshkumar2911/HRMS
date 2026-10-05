import DefaultLayout from "@/layouts/default.vue";
import AuthLayout from "@/layouts/auth.vue";

const routes = [
  // ── Protected Shell Routes ────────────────────────────────
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        redirect: "/chat",
      },
      {
        path: "dashboard",
        redirect: "/chat",
      },
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
        meta: { title: "Tasks", requiresAuth: true },
      },
      {
        path: "notifications",
        name: "Notifications",
        component: () => import("@/pages/notifications/index.vue"),
        meta: { title: "Notifications", requiresAuth: true },
      },
      {
        path: "hrms",
        name: "HRMS",
        component: () => import("@/pages/hrms/index.vue"),
        meta: {
          title: "HRMS",
          requiresAuth: true,
          requiredPermission: "employee.view",
        },
      },
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
    ],
  },

  // ── Unauthenticated Auth Routes ───────────────────────────
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
  {
    path: "/auth",
    redirect: "/login",
  },

  // ── Fallback 404 Route ────────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    redirect: "/chat",
  },
];

export default routes;
