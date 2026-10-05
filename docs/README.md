# Frontend documentation (Vue)

Implementation maps for the Vue 3 app in `frontend/`. API contracts stay in the repo-root [`docs/`](../../docs/README.md).

```text
frontend/docs/
├── README.md
├── Rules.md                 # engineering standards (do not rewrite casually)
├── app-shell/frontend.md
├── auth/frontend.md
├── chat/frontend.md
├── notifications/frontend.md
├── tasks/frontend.md
├── users/frontend.md
├── rbac/frontend.md
├── audit/frontend.md
└── hrms/
    ├── frontend.md
    ├── frontend-organization.md
    ├── frontend-employees.md
    ├── frontend-holidays.md
    ├── frontend-attendance.md
    ├── frontend-leave.md
    └── frontend-calendar.md
```

## Index

| Module | Doc | Covers |
|---|---|---|
| — | [Rules.md](./Rules.md) | Store patterns, theme, common components |
| App shell | [app-shell/frontend.md](./app-shell/frontend.md) | TopBar, session, WS, guards, env |
| Auth | [auth/frontend.md](./auth/frontend.md) | Login / signup / refresh / logout |
| Chat | [chat/frontend.md](./chat/frontend.md) | Conversations, messages, attachments, WS |
| Notifications | [notifications/frontend.md](./notifications/frontend.md) | Inbox, badge, broadcast |
| Tasks | [tasks/frontend.md](./tasks/frontend.md) | List, summary KPIs, PATCH rules |
| Users | [users/frontend.md](./users/frontend.md) | Admin users + profile |
| RBAC | [rbac/frontend.md](./rbac/frontend.md) | Roles, scopes, assign |
| Audit | [audit/frontend.md](./audit/frontend.md) | Audit browser |
| HRMS shell | [hrms/frontend.md](./hrms/frontend.md) | Inner nav + scope UX |
| Organization | [hrms/frontend-organization.md](./hrms/frontend-organization.md) | Dept / designation / location |
| Employees | [hrms/frontend-employees.md](./hrms/frontend-employees.md) | Directory + profile |
| Holidays | [hrms/frontend-holidays.md](./hrms/frontend-holidays.md) | Holidays + work week |
| Attendance | [hrms/frontend-attendance.md](./hrms/frontend-attendance.md) | Calendar mark / correct |
| Leave | [hrms/frontend-leave.md](./hrms/frontend-leave.md) | Types, balances, requests, approvals |
| Calendar | [hrms/frontend-calendar.md](./hrms/frontend-calendar.md) | Unified month calendar |

## Local run

```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm install
npm run dev            # http://localhost:3000
```

Seeded admin: `superadmin@test.com` / `star@123` (backend seed).
