# Vue — Chat

**API:** [`docs/chat/frontend.md`](../../../docs/chat/frontend.md)

| Item | Value |
|---|---|
| Page | `pages/chat/index.vue` + `components/` |
| Store | `stores/chat/chat.js` |
| URLs | `conversations.*`, `messages.*`, `attachments.*`, `users.list` |
| Authz | Membership (not RBAC). User picker needs `user.view`. |

WS events: `message.created/updated/deleted`, typing, read, `presence.heartbeat`. Attachments: `upload-url` then `PUT` multipart.
