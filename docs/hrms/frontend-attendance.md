# Frontend — HRMS Attendance

**Backend:** [Attendance](attendance.md)  
**Base:** `/api/v1/hrms/attendance`  
**Shell:** [HRMS frontend](frontend.md)

## Purpose

Daily attendance status calendar, geo punch in/out, and admin attendance settings (Leaflet map geofence).

## Screens and navigation

| Screen | Logical route | Gate |
|---|---|---|
| Month calendar | `/hrms/attendance` | `attendance.view` |
| Punch in/out | `/hrms/attendance/punch` | `attendance.punch` |
| Attendance settings | `/hrms/attendance/settings` | `attendance.settings.manage` |
| Mark day | action on cell | `attendance.mark` |
| Correction | modal on locked row | `attendance.correct` |

Related read: [Unified calendar](frontend-calendar.md) (`GET /hrms/calendar`).

## Statuses and sources

Statuses:

`PRESENT` · `ABSENT` · `HALF_DAY` · `LEAVE` · `WFH` · `HOLIDAY` · `WEEK_OFF` · `ON_DUTY` · `UNMARKED`

Sources: `ADMIN` · `LEAVE` · `HOLIDAY` · `WEEK_OFF` · `SYSTEM` · `PUNCH`

### Calendar generation (display)

1. Existing `attendance_records` row → use it (show check-in/out times and worked minutes when present).
2. Else holiday → `HOLIDAY`.
3. Else week off → `WEEK_OFF`.
4. Else if location attendance enabled and working day ≤ today → **`ABSENT`**.
5. Else → **`UNMARKED`**.

## Primary flows

### Attendance settings (admin)

1. Open `/hrms/attendance/settings`.
2. Set office name; click map (Leaflet + OSM) or enter lat/lng / use current device location.
3. Choose radius presets (25 / 100 / 250 / 500 m), max GPS accuracy, geofence mode (`CONSERVATIVE` vs `DISTANCE_ONLY`), selfie + punch-out geofence flags, full/half day minutes, timezone, enable switch.
4. `PUT /attendance/settings`.
5. Note: conservative mode can reject near-edge GPS; HR mark/correct is the exception path.

### Punch

1. Open `/hrms/attendance/punch`; browser requests geolocation (`enableHighAccuracy`).
2. If selfie required, open camera and capture JPEG.
3. Punch In / Out → multipart `POST /attendance/check-in` or `/check-out` with `latitude`, `longitude`, `accuracy_meters`, optional `selfie`.
4. Show clear errors: permission denied, outside geofence / retry, accuracy too poor / retry, already punched, non-working day.
5. Disable double-submit in UI; backend row lock is authoritative.
6. `GET /attendance/my` for today / open check-in state.

### View month / mark / correction

Same as before: calendar mark and HR correction for exceptions (`WFH`, `ON_DUTY`, false geofence rejects).

## Permission gating

| Code | UI |
|---|---|
| `attendance.view` | Calendar, settings read, my punch status |
| `attendance.punch` | Punch page |
| `attendance.settings.manage` | Settings page |
| `attendance.mark` | Mark / bulk |
| `attendance.correct` | Instant correction |

## API mapping

Paths under `/api/v1/hrms`.

| Call | Notes |
|---|---|
| `GET /attendance/settings` | Punch-relevant config |
| `PUT /attendance/settings` | Admin update |
| `GET /attendance/my` | Today + open_check_in + recent |
| `POST /attendance/check-in` | multipart |
| `POST /attendance/check-out` | multipart |
| `GET /attendance/calendar` | Month cells may include `check_in_at`, `check_out_at`, `worked_minutes`, `attendance_id` |
| `GET /attendance/selfies/{id}/{kind}` | Authenticated image download |

## Edge cases

- Location permission denied → explain how to enable; do not fake coordinates.
- Conservative geofence near boundary → retry message; escalate to HR correction if persistent.
- Already punched / concurrent double-tap → 409; UI should disable button while in flight.
- GPS spoofing is possible; product copy should not claim tamper-proof attendance.
