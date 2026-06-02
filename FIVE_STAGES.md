# MediHub — 5-Stage App

The app is now focused on five stages. Lab tests, packages and PayHere payments
were **hidden from the app UI** (their backend code is kept intact so they can be
re-enabled later).

## Test credentials

| Where           | Login                                   |
| --------------- | --------------------------------------- |
| Mobile app      | mobile `0752977591` · password `medihub123` |
| Admin web panel | `admin@medihub.lk` · password `medihub123`  |

Admin panel: <http://localhost:8000/admin>  (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

---

## Stage 1 — Login (mobile number + password)

- **Sign in:** `POST /api/v1/auth/login` `{ phone, password }`.
- **Self sign-up:** `POST /api/v1/auth/register` `{ phone, name, password, ... }` — no OTP needed.
- App screens: `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`.
- **OTP-ready:** the OTP service, `request-otp` / `verify-otp` endpoints and
  `authApi.requestOtp/verifyOtp` are all still in place. When the SMS gateway is
  wired (`OtpService` + Notify.lk), `register` already accepts an optional
  `otp_id` + `code`, so you can switch on OTP without a rewrite.

## Stage 2 — Basic details for BMI (optional)

- New patient fields `height_cm`, `weight_kg`; `bmi` is computed and returned by the API.
- Captured optionally right after sign-up (`app/(auth)/health.tsx`), editable any
  time at **Profile → Health details & BMI** (`app/profile/health.tsx`), and shown
  as a stat on the home screen.
- **Admin** can also set height/weight per patient from the admin panel.

## Stage 3 — EMR (medical reports)

- Patients see all their reports in the **Reports** tab (`app/(tabs)/packages.tsx`).
- **New reports:** admin searches a patient by mobile number and uploads a
  PDF/JPG/PNG from the patient page in the admin panel. It appears instantly in
  the patient's app.
- **Old records:** `LegacyEmrService` merges historical records pulled from the
  previous EMR by phone number. It is a **no-op until configured** — set
  `EMR_API_BASE_URL` and `EMR_API_KEY` in `.env`, then adjust the field mapping in
  `LegacyEmrService::normalize()` to match the real legacy schema. Legacy items are
  tagged with a "Previous record" badge in the app.

## Stage 4 — Opening-hours banner

- Clinic hours **8:00 AM – 9:00 PM, every day**, served from `GET /api/v1/app/config`
  (`opening_hours`), including a server-computed `is_open_now`.
- Rendered as a banner on the home screen (`OpeningHoursBanner`) with a live
  Open / Closed pill.

## Stage 5 — Specialist doctors + appointment booking

- **Doctors** tab lists specialists (`app/(tabs)/book.tsx`); tap one to pick a
  date/time (`app/doctor/[slug].tsx`).
- On booking the request is **saved to the backend** (status `pending`, visible in
  the admin **Appointments** page) **and** WhatsApp opens pre-filled to
  **0752977591** (`+94752977591`) with the patient + appointment details.
- The number comes from `app/config.appointment_whatsapp` (falls back to the
  hard-coded number if config hasn't loaded).
- **My Appointments** tab (`app/(tabs)/passbook.tsx`) shows the patient's requests
  and their status.

---

## Admin web panel (Laravel + Blade)

Routes under `/admin` (`routes/web.php`), session-protected by the `admin`
middleware:

- **Dashboard** — counts + recent appointment requests.
- **Patients** — search by mobile/name/passbook, create, edit details + BMI,
  reset password, activate/deactivate.
- **Reports** — upload / remove report files per patient.
- **Appointments** — list + change status (pending → confirmed → completed…).

## Running locally

```bash
# backend
cd backend
php artisan migrate:fresh --seed   # creates admin + test patient
php artisan storage:link           # so uploaded reports are downloadable
php artisan serve --host=0.0.0.0 --port=8000

# mobile
cd ../mobile
# set EXPO_PUBLIC_API_URL in .env to http://<LAN-IP>:8000/api/v1
npx expo start
```

## Quality gates (all passing)

- Backend: `pint` ✓, `phpstan --memory-limit=1G` ✓ (no errors), `pest` ✓ (12 tests).
- Mobile: `tsc --noEmit` ✓.
