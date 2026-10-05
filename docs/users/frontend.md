# Vue — Users

**API:** [`docs/users/frontend.md`](../../../docs/users/frontend.md)

| Item | Value |
|---|---|
| Admin | `pages/admin/users/index.vue` (`user.view`) |
| Profile | `pages/profile/index.vue` |
| Store | `stores/users/users.js` |
| URLs | `users.list/create/detail/update/deactivate`, `users.assignRole` |

REST paths are `users` (not `admin/users`). Deactivate = DELETE → 204. Role assign: `POST users/{id}/roles`.
