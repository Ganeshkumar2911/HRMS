# Vue — RBAC

**API:** [`docs/rbac/frontend.md`](../../../docs/rbac/frontend.md)

| Item | Value |
|---|---|
| Page | `pages/admin/roles/index.vue` (`role.assign` to list) |
| Store | `stores/rbac/roles.js` |
| Bootstrap | `GET users/me/permissions` → `stores/rbac/permissions.js` |

Create/update with `permission_assignments: [{ code, scope }]`. Scope picker only for `employee.*`, `attendance.*`, `leave_request.*`, `leave_balance.*`.
