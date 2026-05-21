# DECISIONS.md

Defaults chosen for things not explicitly specified in the build prompt.

## Tooling versions

- **PHP 8.5** used locally (system has 8.5; Laravel 11 supports >=8.2). Composer constraint left at `^8.2` so Railway production runner remains compatible.
- **Node 26** used locally. Mobile `engines` left unpinned to track Expo SDK defaults.

## Backend

- **SQLite WAL mode** enabled for local dev to reduce write-lock contention during seeders/tests.
- **Sanctum personal access tokens** (not SPA cookies) — issued on OTP verify, stored client-side in `expo-secure-store`. Tokens have no expiry (revoke on `/auth/logout`).
- **OTP storage**: codes are hashed with `Hash::make` in `otp_verifications.code` so log leaks do not directly leak active codes. The local `[OTP]` log line still prints the plain code for development convenience (local env only).
- **OTP rate limit**: implemented via Laravel `RateLimiter`. 1 request per minute per phone, 5 verify attempts per OTP record (spec says 3 — we honour 3).
- **Serial number generation** runs inside `Observer::creating` with `Model::withoutEvents` + a `serial_counters` table row-locked for the current year+prefix, ensuring no duplicates under concurrency.
- **PayHere notify endpoint** is exempt from CSRF (it is an API route under `api/v1` so CSRF does not apply, but we additionally verify `md5sig` before mutating state).
- **B2 signed URLs**: when `B2_KEY_ID` is unset (local dev), `/reports/{id}/download-url` returns a temporary `storage::url()` pointing at a placeholder PDF served from `storage/app/public/reports/`. Spec says 15-min signed B2 URL — same shape, local fallback only.

## Mobile

- **Expo SDK 52** uses React Native 0.76 New Architecture by default. We **opt out** of New Architecture in `app.json` (`"newArchEnabled": false`) for Expo Go reliability across all dev devices. This can be flipped on at EAS Build time.
- **Path alias**: `@/*` resolves to `mobile/src/*` via `tsconfig.json` + `babel.config.js` (`module-resolver`).
- **Reanimated**: babel plugin added last in plugin list per Reanimated docs.
- **Auth guard**: implemented in `app/_layout.tsx` via a `useEffect` that watches `useAuthStore.token` and uses `router.replace`. Hydration from SecureStore is awaited before the first route decision (splash kept up until hydrated).
- **Onboarding** is shown only on the very first launch (flag in `AsyncStorage`). After that, unauthenticated users land directly on `(auth)/phone`.
- **Phone input**: fixed `+94` prefix label, separate 9-digit input that accepts only digits (leading `0` stripped). Combined to `+947XXXXXXXX` before send.
- **OTP input**: six independent `TextInput`s with `onChangeText` auto-focus to next. Last input triggers auto-submit. Resend after 60s countdown.
- **i18n key namespaces**: `common.*`, `auth.*`, `home.*`, `passbook.*`, `book.*`, `lab.*`, `reports.*`, `packages.*`, `payment.*`, `profile.*`, `errors.*`, `notifications.*`.
- **Money formatter**: `Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 })` since LKR coins are out of practical use. Decimal kept in DB; only the display rounds.
- **Time formatting**: `format(d, 'd MMM yyyy · h:mm a', { timeZone: 'Asia/Colombo' })` via `date-fns-tz/formatInTimeZone`.
- **Skeleton component**: simple animated `Animated.View` opacity loop (0.4 → 1) — avoids the extra `moti` / `react-native-skeleton-placeholder` dep.
- **Logger**: `info` is a no-op in production, `warn`/`error` route to `Sentry.captureException` / `Sentry.captureMessage` when DSN present.
- **PayHere WebView**: deep-link URLs `medihub://payment/success?...` and `medihub://payment/cancel?...` are intercepted via `onShouldStartLoadWithRequest` and the WebView is closed; the screen then re-fetches `/payments/{id}` to confirm status (don't trust the deep link alone).

## Quality gates

- **Larastan level 6** — config in `phpstan.neon`.
- **Pint preset**: `laravel` (default).
- **Pest coverage** target ≥70%. We enable Xdebug coverage driver in CI only; locally `--coverage` warns if Xdebug is missing.
- **TypeScript strict**: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: false` (RN ecosystem mostly uses optional-as-undefined).

## App identity

- **Bundle identifier**: `lk.markui.medihub` (both iOS + Android).
- **Scheme**: `medihub`.
- **Version**: `1.0.0`, build number `1`.
- **Timezone**: `Asia/Colombo` everywhere (backend `APP_TIMEZONE`, mobile `date-fns-tz`).
- **Currency**: LKR, hardcoded.

## Out of scope (deferred)

- Real PayHere account / merchant credentials — `PAYHERE_*` env vars left blank, sandbox mode wired but un-tested without a sandbox account.
- Real Backblaze B2 bucket — `B2_*` env vars left blank, local fallback in place (see above).
- Notify.lk SMS gateway — `NOTIFY_LK_API_KEY` blank, OTP is log-only in `local` (as required by spec).
- Sentry DSN — blank in `.env.example`; integration scaffolded behind `EXPO_PUBLIC_SENTRY_DSN` / `SENTRY_LARAVEL_DSN` presence checks.
- FCM service account JSON — not committed. `kreait/laravel-firebase` is installed but `services.fcm` left unconfigured; `expo-notifications` handles local-only reminders in Expo Go.
- App store screenshots — placeholder paths created in `mobile/assets/store/`; final assets must be generated from a device build.
