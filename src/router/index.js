import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import authToken from "@/common/authToken";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  // Update document title
  if (to.meta?.title) {
    document.title = `${to.meta.title} — HRMS Platform`;
  }

  const hasToken = authToken.hasToken();
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth);

  // Protected route accessed without auth
  if (requiresAuth && !hasToken) {
    return {
      name: "Login",
      query: { redirect: to.fullPath },
    };
  }

  // Already authenticated user trying to access login/signup
  if (hasToken && (to.name === "Login" || to.name === "Signup")) {
    return "/chat";
  }

  return true;
});

export default router;