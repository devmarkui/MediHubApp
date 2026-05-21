# MediHub

Production mobile healthcare app for **MediHub Clinic & Laboratory (Pvt) Ltd** (Wellampitiya, Sri Lanka), built by **Mark UI (Pvt) Ltd**.

A patient app built on the **Health Passbook** concept — every visit, lab test, payment, and package usage becomes a chronological entry the patient can browse, share, and download.

Ships to Apple App Store and Google Play.

## Monorepo

- `mobile/` — Expo SDK 52 + React Native 0.76 + TypeScript (Expo Go compatible)
- `backend/` — Laravel 11 + PHP 8.3 + Sanctum (SQLite locally, MySQL on Railway in production)

## Local development

Both phone and Mac must be on the same Wi-Fi network.

```bash
# Terminal 1 — backend
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — mobile
cd mobile
npx expo start
```

Scan the QR code with **Expo Go**.
- iPhone: open Camera, tap banner
- Android: open Expo Go app → Scan QR

Default test patient: phone `+94771234567`. OTP is logged to `backend/storage/logs/laravel.log` with marker `[OTP] phone={x} code={y}`.

### Environment

Detect your Mac LAN IP with `ipconfig getifaddr en0` and write it into:

- `mobile/.env` → `EXPO_PUBLIC_API_URL=http://<IP>:8000/api/v1`
- `backend/.env` → `APP_URL=http://<IP>:8000`

See `mobile/.env.example` and `backend/.env.example` for the full template.

## Quality gates

```bash
# Backend
cd backend
composer pint
./vendor/bin/phpstan analyse
./vendor/bin/pest --coverage

# Mobile
cd mobile
npx tsc --noEmit
npx expo-doctor
```

## Store deployment

When ready for App Store + Play Store:

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform all --profile production
eas submit --platform ios
eas submit --platform android
```

Requirements:
- Apple Developer Program ($99/yr) for iOS
- Google Play Developer ($25 one-time) for Android
- EAS Build is free for 30 builds/month

## Documents

- `DECISIONS.md` — defaults chosen for points not explicitly specified
- `PROGRESS.md` — running build log / resume marker
- `KNOWN_ISSUES.md` — defects found during verification
