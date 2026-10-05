# Vue — Notifications

**API:** [`docs/notifications/frontend.md`](../../../docs/notifications/frontend.md)

| Item | Value |
|---|---|
| Inbox | `pages/notifications/index.vue` (`notification.view`) |
| Broadcast | `pages/admin/notifications/broadcast.vue` (`notification.broadcast`) |
| Store | `stores/notifications/notifications.js` |
| URLs | `notifications.*` |

Bell on TopBar. `MESSAGE` + `data.conversation_id` → `/chat/:id`. Same WS: `notification.created`.
