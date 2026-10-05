import { defineStore } from "pinia";
import { ref, computed } from "vue";
import apiRequest from "@/api/request";
import urls from "@/api/urls";

const SCOPE_WEIGHTS = {
  ALL: 3,
  TEAM: 2,
  SELF: 1,
};

// Seeded role presets for temporary navigation heuristics until backend bootstrap exists
export const ROLE_PRESETS = {
  Admin: [
    { code: "user.view", scope: null },
    { code: "user.create", scope: null },
    { code: "user.update", scope: null },
    { code: "role.view", scope: null },
    { code: "role.assign", scope: null },
    { code: "audit.view", scope: null },
    { code: "employee.view", scope: "ALL" },
    { code: "employee.create", scope: "ALL" },
    { code: "employee.update", scope: "ALL" },
    { code: "attendance.view", scope: "ALL" },
    { code: "leave_request.view", scope: "ALL" },
    { code: "leave_request.approve", scope: "ALL" },
    { code: "leave_balance.view", scope: "ALL" },
    { code: "department.view", scope: null },
    { code: "task.view", scope: null },
    { code: "task.create", scope: null },
    { code: "task.assign", scope: null },
  ],
  HR_ADMIN: [
    { code: "user.view", scope: null },
    { code: "employee.view", scope: "ALL" },
    { code: "employee.create", scope: "ALL" },
    { code: "employee.update", scope: "ALL" },
    { code: "attendance.view", scope: "ALL" },
    { code: "leave_request.view", scope: "ALL" },
    { code: "leave_request.approve", scope: "ALL" },
    { code: "leave_balance.view", scope: "ALL" },
    { code: "department.view", scope: null },
    { code: "task.view", scope: null },
    { code: "task.create", scope: null },
    { code: "task.assign", scope: null },
  ],
  MANAGER: [
    { code: "employee.view", scope: "TEAM" },
    { code: "attendance.view", scope: "TEAM" },
    { code: "leave_request.view", scope: "TEAM" },
    { code: "leave_request.approve", scope: "TEAM" },
    { code: "leave_balance.view", scope: "TEAM" },
    { code: "department.view", scope: null },
    { code: "task.view", scope: null },
    { code: "task.create", scope: null },
    { code: "task.assign", scope: null },
  ],
  EMPLOYEE: [
    { code: "employee.view", scope: "SELF" },
    { code: "attendance.view", scope: "SELF" },
    { code: "leave_request.view", scope: "SELF" },
    { code: "leave_request.create", scope: "SELF" },
    { code: "leave_balance.view", scope: "SELF" },
    { code: "task.view", scope: null },
    { code: "task.create", scope: null },
  ],
};

export const usePermissionsStore = defineStore("permissions", () => {
  // ─── 1. Primary State ──────────────────────────────────
  const activeRole = ref(localStorage.getItem("user_role") || "Admin");
  const permissions = ref(
    JSON.parse(localStorage.getItem("user_permissions") || "null") ||
      ROLE_PRESETS[activeRole.value] ||
      ROLE_PRESETS.Admin
  );

  // ─── 2. In-Flight Tracking ─────────────────────────────
  const inFlight = {
    permissions: false,
  };

  // ─── 3. isFetched Tracking ─────────────────────────────
  const isFetched = ref({
    permissions: false,
  });

  // ─── 4. Loading & Error Flags ──────────────────────────
  const loading = ref(false);
  const error = ref(null);

  // ─── 5. Reset Helper ───────────────────────────────────
  const resetFetchedFlags = () => {
    isFetched.value = {
      permissions: false,
    };
  };

  // ─── Permission Check: can(code) ───────────────────────
  /**
   * Evaluates if current user holds the given permission code.
   * e.g. can('employee.view'), can('role.assign')
   */
  const can = (code) => {
    if (!code) return true;
    if (activeRole.value === "Admin") return true;

    return permissions.value.some((p) => {
      if (p.code === "*" || p.code === code) return true;
      // Handle prefix wildcards e.g. 'task.*'
      if (p.code.endsWith(".*")) {
        const prefix = p.code.slice(0, -2);
        return code.startsWith(`${prefix}.`);
      }
      return false;
    });
  };

  // ─── Scope Resolver: scopeOf(code) ─────────────────────
  /**
   * Returns the resolved widest scope for a resource action.
   * Widest scope wins: ALL > TEAM > SELF > null
   */
  const scopeOf = (code) => {
    if (activeRole.value === "Admin") return "ALL";

    let highestScope = null;
    let highestWeight = 0;

    const matches = permissions.value.filter((p) => {
      if (p.code === code) return true;
      const resource = code.split(".")[0];
      if (p.code.startsWith(`${resource}.`)) return true;
      return false;
    });

    for (const item of matches) {
      if (!item.scope) continue;
      const weight = SCOPE_WEIGHTS[item.scope] || 0;
      if (weight > highestWeight) {
        highestWeight = weight;
        highestScope = item.scope;
      }
    }

    return highestScope;
  };

  // ─── Task Ownership Rule ───────────────────────────────
  /**
   * Task visibility rule from specification:
   * created_by = me OR assigned_to = me
   */
  const canViewTask = (task, currentUserId) => {
    if (!task || !currentUserId) return false;
    return task.created_by === currentUserId || task.assigned_to === currentUserId;
  };

  // ─── Area Visibility Helpers ───────────────────────────
  const canAccessArea = (areaKey) => {
    switch (areaKey) {
      case "chat":
      case "tasks":
      case "notifications":
        return true; // Any active authenticated user

      case "hrms":
        return can("employee.view");

      case "admin_users":
        return can("user.view") || can("user.manage");

      case "admin_roles":
        return can("role.view") || can("role.assign");

      case "admin_audit":
        return can("audit.view");

      default:
        return true;
    }
  };

  // ─── Mutation Helpers (For dev switching & bootstrap) ──
  const setRole = (roleName) => {
    if (!ROLE_PRESETS[roleName]) return;
    activeRole.value = roleName;
    localStorage.setItem("user_role", roleName);
    permissions.value = [...ROLE_PRESETS[roleName]];
    localStorage.setItem("user_permissions", JSON.stringify(permissions.value));
  };

  const setCustomPermissions = (list) => {
    if (Array.isArray(list)) {
      permissions.value = list;
      localStorage.setItem("user_permissions", JSON.stringify(list));
    }
  };

  // ─── Fetch Permissions (For future bootstrap API) ──────
  const fetchMyPermissions = (force = false) => {
    if (inFlight.permissions) return Promise.resolve(permissions.value);
    if (isFetched.value.permissions && !force) return Promise.resolve(permissions.value);

    inFlight.permissions = true;
    loading.value = true;

    const successHandler = (res) => {
      if (Array.isArray(res?.permissions)) {
        permissions.value = res.permissions;
        localStorage.setItem("user_permissions", JSON.stringify(res.permissions));
      }
      isFetched.value.permissions = true;
    };

    const failureHandler = () => {
      // Graceful fallback to role heuristic
      isFetched.value.permissions = true;
    };

    const finallyHandler = () => {
      inFlight.permissions = false;
      loading.value = false;
    };

    return apiRequest(urls.KEYS.GET, urls.roles.permissions, {
      isTokenRequired: true,
      onSuccess: successHandler,
      onFailure: failureHandler,
      onFinally: finallyHandler,
    });
  };

  return {
    permissions,
    activeRole,
    inFlight,
    isFetched,
    loading,
    error,
    resetFetchedFlags,
    can,
    scopeOf,
    canViewTask,
    canAccessArea,
    setRole,
    setCustomPermissions,
    fetchMyPermissions,
  };
});
