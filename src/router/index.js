import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import authToken from "@/common/authToken";
import { usePermissionsStore } from "@/stores/rbac/permissions";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} — HRMS Platform`;
  }

  const hasToken = authToken.hasToken();
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);

  if (requiresAuth && !hasToken) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }

  if (hasToken && (to.name === "Login" || to.name === "Signup")) {
    return "/chat";
  }

  const requiredPermission = to.matched
    .map((record) => record.meta?.requiredPermission)
    .filter(Boolean)
    .at(-1);

  if (hasToken && requiredPermission) {
    const permissionsStore = usePermissionsStore();
    await permissionsStore.ensurePermissionsLoaded();

    if (!permissionsStore.can(requiredPermission)) {
      // One retry covers token-refresh / init-session races.
      await permissionsStore.fetchMyPermissions(true).catch(() => {});
    }

    if (!permissionsStore.can(requiredPermission)) {
      return {
        name: "Forbidden",
        query: { from: to.fullPath },
      };
    }
  }

  return true;
});

export default router;
