# Vue — Tasks

**API:** [`docs/tasks/frontend.md`](../../../docs/tasks/frontend.md)

| Item | Value |
|---|---|
| Page | `pages/tasks/index.vue` (`task.view`) |
| Store | `stores/tasks/tasks.js` |
| URLs | `tasks.list/summary/create/detail/update/delete` |

KPIs only from `GET tasks/summary`. List uses offset `limit`/`offset` (array response). PATCH sends changed fields only. Ownership: creator or assignee.
