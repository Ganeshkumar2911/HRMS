# Vue — App shell

**API contracts:** [`docs/architecture/frontend.md`](../../../docs/architecture/frontend.md)

## Layout

- Auth: `layouts/auth.vue` — login/signup
- App: `layouts/default.vue` — `TopBar` + padded `<main>`
- Theme: `src/style.css` + `utils/theme.js` (Material Symbols)

## Session bootstrap

`auth.initSession()` (from default layout):

1. `GET users/me`
2. `GET users/me/permissions` → permissions store
3. Connect `WS /ws?token=`
4. Optional `GET hrms/employees/me/profile`

Env: `VITE_API_URL` (see `.env.example`). Base path `/api/v1/`.

## Guards

`router/index.js`: token required; `meta.requiredPermission` checked via `can()`. Fail → `/forbidden`.

## Stores

| Store | Path |
|---|---|
| Auth | `stores/auth/auth.js` |
| Permissions | `stores/rbac/permissions.js` |
| WS | `stores/ws/ws.js` |
| Notifications (badge) | `stores/notifications/notifications.js` |

## Nav gating (`TopBar`)

| Area | `canAccessArea` |
|---|---|
| Chat | always |
| Tasks | `task.view` |
| HRMS | `employee.view` |
| Admin users/roles/audit/broadcast | respective perms |
