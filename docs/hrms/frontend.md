# Frontend — HRMS shell

**Backend:** [HRMS overview](overview.md)  
**Mount:** `/api/v1/hrms`  
**Shared shell:** [Architecture frontend](../architecture/frontend.md)

## Purpose

Navigation, role-flavored IA, and shared HRMS rules (identity, scope empty states, domain order). Subdomain implementation lives in sibling guides.

## Domain order

```text
Organization → Employees → Holidays / work week
        → Attendance + Leave → Calendar
```

Salary / payroll / payslips are **not** in current phases — do not ship those screens.

## Screens and navigation

Suggested HRMS nav (show only if user `can` relevant permission):

| Nav item | Logical route | Guide | Typical roles |
|---|---|---|---|
| My profile | `/hrms/me` | [Employees](frontend-employees.md) | EMPLOYEE+ |
| Employees | `/hrms/employees` | [Employees](frontend-employees.md) | MANAGER (TEAM), HR (ALL) |
| Organization | `/hrms/org/*` | [Organization](frontend-organization.md) | HR_ADMIN, Admin |
| Holidays & work week | `/hrms/holidays` | [Holidays](frontend-holidays.md) | HR_ADMIN, Admin |
| Attendance | `/hrms/attendance` | [Attendance](frontend-attendance.md) | scoped view; mark = HR |
| Punch | `/hrms/attendance/punch` | [Attendance](frontend-attendance.md) | `attendance.punch` |
| Att. settings | `/hrms/attendance/settings` | [Attendance](frontend-attendance.md) | `attendance.settings.manage` |
| Leave | `/hrms/leave` | [Leave](frontend-leave.md) | all (different actions) |
| Calendar | `/hrms/calendar` | [Calendar](frontend-calendar.md) | `attendance.view` |

### Role-flavored defaults

| Persona | Default landing | Emphasize |
|---|---|---|
| EMPLOYEE (SELF) | My profile / Punch / My leave | Punch in/out, balances, own attendance calendar |
| MANAGER (TEAM) | Team leave approvals, team calendar | Approve/reject, team attendance view, own punch |
| HR_ADMIN / Admin (ALL) | Employees + org / attendance settings | Geofence settings, mark/correct, policies |

## Permission & scope UX

Use shell permission store when available. For scoped modules:

| Scope | UI behavior |
|---|---|
| `SELF` | Hide employee pickers; bind to `/employees/me/profile` |
| `TEAM` | Show direct-report picker / team lists only |
| `ALL` | Full employee search/filters |
| none / missing | Empty state: “No access” — do not fake data |

Empty list with `200` and `[]` ≠ error; distinguish from `403`.

User without an `employees` row: HRMS self-service may 404/403 on `/employees/me/profile` — show “No employee profile linked” and point Admin/HR to create one ([Employees](frontend-employees.md)).

## Shared client state

| Key | Notes |
|---|---|
| `current_employee` | From `/hrms/employees/me/profile` |
| `selected_employee_id` | For TEAM/ALL screens |
| `hrms_month` / `hrms_year` | Shared by attendance + calendar |

## Realtime

None for HRMS. Approvals/leave updates are REST pull (or future SYSTEM notifications).

## Edge cases and non-goals

- When location attendance is **off**, **UNMARKED** remains a real state — not “present by default”.
- When location attendance is **on**, working days without a qualifying punch synthesize **ABSENT** until full-day minutes are met via punch (see [Attendance frontend](frontend-attendance.md)).
- Punch uses browser geolocation + optional selfie; GPS is not tamper-proof. No face recognition in v1.
- Approvals have **no** public CRUD UI — embed step awareness in [Leave](frontend-leave.md).
- Do not write chat tables from HRMS screens.

## Related guides

| Guide | File |
|---|---|
| Organization | [frontend-organization.md](frontend-organization.md) |
| Employees | [frontend-employees.md](frontend-employees.md) |
| Holidays | [frontend-holidays.md](frontend-holidays.md) |
| Attendance | [frontend-attendance.md](frontend-attendance.md) |
| Leave (+ approvals UX) | [frontend-leave.md](frontend-leave.md) |
| Calendar | [frontend-calendar.md](frontend-calendar.md) |
| Backend overview | [overview.md](overview.md) |
