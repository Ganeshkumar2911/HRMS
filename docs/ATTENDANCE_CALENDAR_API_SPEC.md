# Attendance Calendar Grid — Backend API Architecture & Specification

> **Purpose**: Redesign the Attendance Calendar Grid into a two-level drill-down:
> 1. **Level 1 (Employee Attendance List)**: Paginated list of employees with their monthly attendance summary & mini calendar-wise status breakdown.
> 2. **Level 2 (Employee Monthly Calendar Detail)**: Day-by-day calendar view for a selected employee and month.

---

## 1. Level 1 — Employee Monthly Attendance Summary List

**Endpoint**: `GET /api/v1/hrms/attendance/summary/employees`

### Query Parameters
| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `month` | `integer` | Yes | `1`–`12` (defaults to current month) |
| `year` | `integer` | Yes | 4-digit year (e.g. `2026`) |
| `q` | `string` | No | Search by employee name, email, or `employee_code` |
| `department_id` | `integer` | No | Filter by department |
| `work_location_id` | `integer` | No | Filter by work location |
| `limit` | `integer` | No | Default `50` |
| `offset` | `integer` | No | Default `0` |

### Response (`200 OK`)
```json
{
  "month": 10,
  "year": 2026,
  "working_days": 22,
  "items": [
    {
      "employee_id": 1,
      "employee": {
        "id": 1,
        "employee_code": "EMP-ADMIN",
        "user": {
          "id": 1,
          "name": "Super Admin",
          "email": "superadmin@test.com"
        },
        "department": { "id": 1, "name": "Engineering" },
        "designation": { "id": 1, "name": "Tech Lead" },
        "work_location": { "id": 1, "name": "Bengaluru HQ" }
      },
      "summary": {
        "present": 18,
        "absent": 1,
        "half_day": 2,
        "leave": 1,
        "holiday": 0,
        "weekend": 8,
        "total_worked_minutes": 9240
      },
      "daily_strip": [
        { "date": "2026-10-01", "status": "PRESENT" },
        { "date": "2026-10-02", "status": "HALF_DAY" }
      ]
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 2,
    "has_more": false
  }
}
```
> **Note**: `daily_strip` is optional/lightweight (date + status only) for rendering a compact calendar strip per employee row.

---

## 2. Level 2 — Employee Monthly Calendar Detail

**Endpoint**: `GET /api/v1/hrms/attendance/employees/{employee_id}/calendar`

### Query Parameters
| Param | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `month` | `integer` | Yes | `1`–`12` |
| `year` | `integer` | Yes | 4-digit year (e.g. `2026`) |

### Response (`200 OK`)
```json
{
  "employee": {
    "id": 1,
    "employee_code": "EMP-ADMIN",
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@test.com"
    },
    "department": { "id": 1, "name": "Engineering" },
    "designation": { "id": 1, "name": "Tech Lead" },
    "work_location": { "id": 1, "name": "Bengaluru HQ" }
  },
  "month": 10,
  "year": 2026,
  "summary": {
    "present": 18,
    "absent": 1,
    "half_day": 2,
    "leave": 1,
    "holiday": 1,
    "total_worked_minutes": 9240
  },
  "days": [
    {
      "date": "2026-10-01",
      "day_of_week": "THURSDAY",
      "is_weekend": false,
      "is_holiday": false,
      "holiday_name": null,
      "attendance_id": 101,
      "status": "PRESENT",
      "source": "BIOMETRIC",
      "check_in_at": "2026-10-01T09:12:00",
      "check_out_at": "2026-10-01T18:20:00",
      "worked_minutes": 548,
      "reason": null,
      "remarks": null,
      "leave_type": null
    },
    {
      "date": "2026-10-02",
      "day_of_week": "FRIDAY",
      "is_weekend": false,
      "is_holiday": true,
      "holiday_name": "Gandhi Jayanti",
      "attendance_id": null,
      "status": "HOLIDAY",
      "source": null,
      "check_in_at": null,
      "check_out_at": null,
      "worked_minutes": null,
      "reason": null,
      "remarks": null,
      "leave_type": null
    }
  ]
}
```

---

## 3. Permissions & Scope Rules
- Respect existing `attendance.view` scope (`ALL`, `TEAM`, `SELF`).
- For `TEAM` scope, return only employees reporting to the current user.
- For `SELF` scope, return only the current user's employee record.
