# Vue — RBAC

**Full API / UX guide:** [`docs/rbac/frontend.md`](../../../docs/rbac/frontend.md)  
(roles, overrides, request/response, effective formula, scope rules)

| Item | Value |
|---|---|
| Page | `pages/admin/roles/index.vue` (`role.assign` to list) |
| Stores | `stores/rbac/roles.js`, `stores/rbac/permissions.js`, `stores/rbac/myPermissions.js` |
| Bootstrap | `GET users/me/permissions` → gate nav / actions with `can(code)` / `scopeOf(code)` |
| Catalog | `GET permissions` (`permission.override`) — flat `code` + `scope_aware` (no resource/action APIs) |

Create/update roles with `permission_assignments: [{ code, scope }]`. Scope picker only when catalog says `scope_aware` (HRMS: `employee.*`, `attendance.*`, `leave_request.*`, `leave_balance.*`, …).

`RoleOut.is_system`: Admin is `true`. Holders get every code from bootstrap (`source: SYSTEM`). Do not offer delete/rename for system roles.

User overrides: `PUT/DELETE users/{id}/permission-overrides` — see full guide.
