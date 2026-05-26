# SCOPE — `feat/profile-packages`

This branch is owned by **the Profile & Packages contributor**. Any change pushed here must touch only the files listed below. Anything outside this list should be opened as a separate branch off `main`.

## In-scope files

### Mobile — Profile

- `mobile/app/(tabs)/profile.tsx`
- `mobile/app/profile/edit.tsx`
- `mobile/app/profile/family.tsx`
- `mobile/app/profile/language.tsx`
- `mobile/app/profile/about.tsx`
- `mobile/src/api/patients.ts`

### Mobile — Packages

- `mobile/app/(tabs)/packages.tsx`
- `mobile/app/packages/[code].tsx`
- `mobile/src/api/packages.ts`

### Backend — Profile

- `backend/app/Http/Controllers/Api/V1/PatientController.php`
- `backend/app/Http/Controllers/Api/V1/FamilyController.php`
- `backend/app/Http/Requests/UpdatePatientRequest.php`
- `backend/app/Http/Requests/UploadAvatarRequest.php`
- `backend/app/Http/Requests/UpdatePushTokenRequest.php`
- `backend/app/Http/Requests/FamilyMemberRequest.php`
- `backend/app/Http/Resources/PatientResource.php`

### Backend — Packages

- `backend/app/Http/Controllers/Api/V1/PackageController.php`
- `backend/app/Http/Controllers/Api/V1/PackagePurchaseController.php`
- `backend/app/Http/Requests/CreatePackagePurchaseRequest.php`
- `backend/app/Http/Resources/PackageResource.php`
- `backend/app/Http/Resources/PackagePurchaseResource.php`
- `backend/app/Models/Package.php`
- `backend/app/Models/PackagePurchase.php`

### Translations (only these key namespaces)

- `mobile/assets/translations/en.json` — keys under `profile.*` and `packages.*`
- `mobile/assets/translations/si.json` — same
- `mobile/assets/translations/ta.json` — same

### Tests they may add or modify

- `backend/tests/Feature/PackagesTest.php` (new — package purchase, listing)
- `backend/tests/Feature/ProfileTest.php` (new — patient/family CRUD)

## Out of scope (do NOT modify on this branch)

- Anything in `mobile/app/(auth)/`, `mobile/app/(tabs)/home.tsx`, `mobile/app/(tabs)/passbook.tsx`, `mobile/app/(tabs)/book.tsx`
- Anything under `mobile/app/doctor/`, `mobile/app/appointments/`, `mobile/app/lab-tests/`, `mobile/app/lab-orders/`, `mobile/app/reports/`, `mobile/app/payment/`, `mobile/app/notifications.tsx`
- `mobile/app/_layout.tsx`, `mobile/app/index.tsx`
- `mobile/src/components/` (UI primitives, passbook, home)
- `mobile/src/stores/` (authStore, cartStore, uiStore)
- `mobile/src/theme/`, `mobile/src/utils/`, `mobile/src/types/` — unless adding a brand-new type/util specific to profile/packages
- Migrations, observers, serial counters
- `bootstrap/app.php`, `routes/api.php` (route additions only via review)
- `.env*`, `app.json`, `eas.json`, `composer.json`, `package.json` (dep changes only via review)

## Workflow

1. Clone the repo and check out this branch:
   ```bash
   git clone https://github.com/devmarkui/MediHubApp.git
   cd MediHubApp
   git checkout feat/profile-packages
   ```
2. Install + boot like main (`composer install`, `npm install`, copy and edit `.env`).
3. Work in a sub-branch off this one if you like:
   ```bash
   git checkout -b feat/profile-packages-edit-screen
   ```
4. Commit using conventional prefixes — `feat(profile):`, `feat(packages):`, `fix(profile):`, `refactor(packages):`, etc.
5. Open a Pull Request **into `feat/profile-packages`** (not `main`).
6. When the feature is complete, the project lead merges `feat/profile-packages` → `main` via PR.

## Definition of done before merge

- `cd backend && composer pint --test && ./vendor/bin/phpstan analyse && ./vendor/bin/pest` — all green
- `cd mobile && npx tsc --noEmit && npx expo-doctor` — all green
- Manual UX check on Expo Go for each touched screen
- New strings added to all three translation files (`en.json`, `si.json`, `ta.json`)
- No `console.log`, no `any` without an inline justification comment
