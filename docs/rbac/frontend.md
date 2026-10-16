# Frontend — RBAC (Roles, Permissions & Scopes)

**Target app:** HRMS Platform (Vue 3 + Pinia + Vue Router)  
**Base APIs:** `users/me/permissions`, `permissions`, `roles`, `users/{id}/permission-overrides`  
**Stores:** `src/stores/rbac/permissions.js`, `src/stores/rbac/roles.js`, `src/stores/rbac/myPermissions.js`  
**Page:** `src/pages/admin/roles/index.vue` (Gated by `role.assign`)

---

## 1. Overview & Core Philosophy

The HRMS platform adopts a **Flat Code + Scope-Aware RBAC model**:
- **No Dynamic Resource/Action Matrix:** Unlike legacy systems with separate relational tables for `resources`, `actions`, and `permission_mappings`, all permissions are represented by concise dot-notation string codes (e.g. `employee.view`, `attendance.punch`, `role.assign`).
- **Hierarchical Scope Awareness:** Permissions that govern domain records carry a visibility scope (`SELF`, `TEAM`, `ALL`), defining data ownership and tenancy boundaries.
- **Client Performance & Rehydration:** Permissions are bootstrapped via `GET users/me/permissions` on login and cached in `localStorage` (`user_permissions`) for instant navigation guard checks without blocking page hydration.

---

## 2. Permission Codes & Catalog

### Catalog Endpoint: `GET permissions`
Returns the flat registry of available permissions:
```json
[
  { "code": "employee.view", "scope_aware": true, "description": "View employee records" },
  { "code": "attendance.settings.manage", "scope_aware": false, "description": "Manage geofence & attendance rules" },
  { "code": "role.assign", "scope_aware": false, "description": "Assign and configure system roles" }
]
```

### Scope-Aware vs Global Permissions

#### A. Scope-Aware Permissions (`scope_aware: true`)
Require a scope designation (`SELF`, `TEAM`, or `ALL`) during role creation and user overrides.
Prefixes include:
- `employee.*` (`employee.view`, `employee.create`, `employee.update`, `employee.delete`)
- `attendance.*` (`attendance.view`, `attendance.punch`, `attendance.mark`, `attendance.correct`)
- `leave_request.*` (`leave_request.view`, `leave_request.create`, `leave_request.approve`, `leave_request.reject`, `leave_request.cancel`)
- `leave_balance.*` (`leave_balance.view`, `leave_balance.adjust`)

*(Exception: `attendance.settings.manage` is an organization-wide setting and is registered with `scope_aware: false`).*

#### B. Global / Boolean Permissions (`scope_aware: false`)
Binary permissions that apply across the entire organization:
- `role.create`, `role.update`, `role.delete`, `role.assign`
- `user.view`, `user.create`, `user.update`, `user.deactivate`
- `audit.view`
- `notification.view`, `notification.broadcast`
- `task.view`, `task.create`, `task.update`, `task.delete`
- `attendance.settings.manage`

---

## 3. Scope Hierarchy & Resolution Logic

### Scope Weights
```js
const SCOPE_WEIGHTS = {
  ALL: 3,   // Organization-wide visibility
  TEAM: 2,  // Department / direct-report visibility
  SELF: 1,  // Personal record only
};
```

### Effective Scope Calculation: `scopeOf(code)`
When a user is assigned multiple roles or overrides, `scopeOf(code)` returns the **highest weighted scope**:
```js
// If Role A grants 'employee.view' (SELF) and Role B grants 'employee.view' (TEAM):
scopeOf('employee.view'); // Returns 'TEAM'
```

### Permission Evaluation: `can(code)`
Evaluates permission grants against three patterns:
1. **Superadmin Wildcard (`*`):** Grants access to all actions and pages.
2. **Subsystem Wildcard (`prefix.*`):** e.g., granting `employee.*` satisfies `employee.view`, `employee.create`, etc.
3. **Exact Code Match:** e.g., `attendance.punch` matches `attendance.punch`.

---

## 4. API Contracts

### A. Bootstrap User Permissions
- **Endpoint:** `GET users/me/permissions`
- **Response Format:**
  ```json
  {
    "user_id": "usr_10293",
    "is_system": false,
    "permissions": [
      { "code": "attendance.view", "scope": "SELF", "source": "ROLE" },
      { "code": "attendance.punch", "scope": "SELF", "source": "ROLE" },
      { "code": "leave_request.view", "scope": "TEAM", "source": "ROLE" },
      { "code": "task.view", "scope": null, "source": "ROLE" }
    ]
  }
  ```
  *Note:* If the user holds a system role (`RoleOut.is_system: true`), all codes are returned with `source: "SYSTEM"`.

### B. Roles CRUD
- **List:** `GET roles`
- **Create:** `POST roles`
  ```json
  {
    "name": "HR Operations Specialist",
    "description": "Manages attendance and leave requests for teams",
    "permission_assignments": [
      { "code": "attendance.view", "scope": "TEAM" },
      { "code": "attendance.mark", "scope": "TEAM" },
      { "code": "attendance.correct", "scope": "ALL" },
      { "code": "attendance.settings.manage", "scope": null },
      { "code": "leave_request.approve", "scope": "TEAM" }
    ]
  }
  ```
- **Update:** `PATCH roles/{id}`
- **Delete:** `DELETE roles/{id}`
- **System Role Protection:**
  - Roles with `is_system: true` (e.g. `Super Admin`) cannot be deleted or renamed.
  - Delete and rename action buttons are hidden or disabled in the UI.

### C. User Overrides
- **Set Overrides:** `PUT users/{id}/permission-overrides`
- **Clear Overrides:** `DELETE users/{id}/permission-overrides`
- **Override Formula:**
  $$\text{Effective Permissions} = (\text{Role Grants} \cup \text{User Override Grants}) \setminus \text{User Override Denies}$$

---

## 5. Frontend Architecture & Pinia Stores

### 1. `stores/rbac/permissions.js` (`usePermissionsStore`)
Primary store managing current user credentials and checks:
- `permissions`: Active array of `{ code, scope, source }`.
- `can(code)`: Checks if the user holds permission (supports `*` and prefix wildcards).
- `scopeOf(code)`: Returns the highest effective scope string (`'ALL' | 'TEAM' | 'SELF' | null`).
- `canAccessArea(areaKey)`: High-level area checks (`hrms`, `tasks`, `admin_roles`, `admin_users`, etc.).
- `fetchMyPermissions(force)`: Loads permissions from API with in-flight request deduplication.
- `ensurePermissionsLoaded()`: Reuses memory/storage state or triggers load.

### 2. `stores/rbac/roles.js` (`useRolesStore`)
Admin role management store:
- `fetchRoles(force)`: Retrieves all system and custom roles.
- `createRole(payload)`, `updateRole(id, payload)`, `deleteRole(id)`.
- `isScopeAwareCode(code)`: Helper that checks if a permission code requires the scope dropdown.

### 3. `stores/rbac/myPermissions.js`
- Backward-compatibility re-export for `usePermissionsStore`.

---

## 6. Route Navigation & UI Gating

### Route Meta Guards (`src/router/index.js`)
Routes specify required permissions via `meta.requiredPermission`:
```js
{
  path: "/admin/roles",
  name: "AdminRoles",
  component: () => import("@/pages/admin/roles/index.vue"),
  meta: { requiresAuth: true, requiredPermission: "role.assign" },
}
```
If a logged-in user lacks the permission:
- Navigation is redirected to `{ name: "Forbidden", query: { from: to.fullPath } }`.

### Navigation Item Visibility
Inner navigation items (e.g., HRMS sub-navigation in `src/pages/hrms/layout.vue`) dynamically display items only when `permissions.can(gate)` is true:
- **Attendance Punch:** Visible when `attendance.punch` is granted.
- **Attendance Settings:** Visible when `attendance.settings.manage` is granted.
- **Roles & Permissions:** Visible when `role.assign` is granted.
