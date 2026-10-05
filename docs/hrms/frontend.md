# Vue — HRMS shell

**API:** [`docs/hrms/frontend.md`](../../../docs/hrms/frontend.md)

| Item | Value |
|---|---|
| Layout | `pages/hrms/layout.vue` (inner horizontal nav) |
| Store | `stores/hrms/hrms.js` |
| Shared state | `hrmsMonth`, `hrmsYear`, `selectedEmployeeId` |

Nav items gated by `can()`. SELF hides employee pickers. Empty `[]` ≠ 403. No HRMS WebSocket.
