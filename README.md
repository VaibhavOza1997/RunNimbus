# Run Nimbus

A production-grade React Native mobile game that teaches cloud engineering through story-based scenarios called **Sagas**.

---

## Project Overview

Players take on the role of a cloud engineer solving real-world deployment puzzles. Each Saga is a multi-step scenario (e.g., "Deploy Your First Blog") with interactive terminals, UI consoles, and embedded coding challenges. Cloudy — a bobblehead cloud mascot — reacts to progress with Reanimated animations.

---

## Prerequisites

- **Node.js** ≥ 18 (see `engines` in `package.json`)
- **Expo CLI**: `npm install -g expo-cli` or use `npx expo`
- **iOS**: macOS + Xcode, or use Expo Go
- **Android**: Android Studio with emulator, or use Expo Go

---

## Installation & Setup

```bash
git clone <repo>
cd run-nimbus
npm install
cp .env.example .env
# Edit .env with real values (see Environment Variables section)
npx expo start
```

---

## Environment Variables

All environment config is injected at build time via `app.config.ts`. **Never hardcode secrets.**

| Variable | Purpose | Notes |
|---|---|---|
| `APP_ENV` | `development` / `production` | Controls logger and debug behavior |
| `ADMOB_*` | AdMob app and unit IDs | TODO: [ADS] — stub until AdMob SDK integrated |
| `SUPABASE_URL` | Supabase project URL | TODO: [SUPABASE] — not used until backend added |
| `SUPABASE_ANON_KEY` | Supabase anon key | Stored in SecureStore at runtime — never baked into bundle |
| `REVENUECAT_*` | RevenueCat SDK keys | TODO: [IAP] — stub until RevenueCat integrated |

Reference `.env.example` for all required keys. In CI/CD, configure these as **EAS Secrets**.

---

## Running Locally

```bash
npx expo start           # Expo Dev Client / Expo Go
npx expo start --ios     # iOS simulator (macOS only)
npx expo start --android # Android emulator
npm run type-check       # TypeScript — must pass with zero errors
npm run lint             # ESLint
npm test                 # Jest unit tests
```

---

## Project Architecture

```
src/
├── components/         # Presentational only — no business logic
│   ├── ui/             # NimbusTerminal, NimbusConsole, SignalsBar, GCPAnnotation
│   └── cloudy/         # Cloudy SVG avatar with Reanimated animations
├── config/             # env.ts (validated at startup), pricing.ts
├── navigation/         # RootTabNavigator + PlayStackNavigator
├── screens/            # One folder per domain (Home, Saga, Challenge, Profile, Social)
├── services/           # Business logic, all via Repository pattern
│   ├── api/            # apiClient.ts — future network layer stub
│   ├── auth/           # Stub auth, Supabase-ready
│   ├── avatar/         # Cloudy state (skins, accessories)
│   ├── saga/           # Saga engine + all saga data
│   ├── signals/        # 5-slot signals system with 8h timers
│   ├── monetization/   # Tier state, ad engine, IAP stubs
│   └── social/         # Feed and leaderboard stubs
├── theme/              # Colors, Spacing, Radius, Typography — typed constants
└── utils/              # storage.ts, logger.ts, validation.ts
```

---

## Service Layer & Repository Pattern

Every data service exports an **interface** + a **local implementation** + a **Supabase stub**:

```ts
export interface ISagaRepository { ... }
export class LocalSagaRepository implements ISagaRepository { ... }
export class SupabaseSagaRepository implements ISagaRepository { /* TODO stubs */ }
export const sagaRepository: ISagaRepository = new LocalSagaRepository();
```

To swap to Supabase: change the final `export const` line. Zero component changes required.

Repositories implemented: `saga`, `auth`, `signals`, `social`, `avatar`.

---

## Security Notes

### Storage split — strictly enforced

| Data type | Store | Why |
|---|---|---|
| Saga progress, step completion | `AsyncStorage` via `storage.ts` | Non-sensitive, can be cleared |
| Auth tokens (future) | `SecureStore` via `storage.ts` | OS keychain — survives reinstall |
| Subscription tier | `SecureStore` | Financial data |
| Ad unit IDs | `app.config.ts` env vars | Never hardcoded |
| Supabase anon key (future) | `SecureStore` at runtime | Never baked into bundle |

**Rule**: components never import `AsyncStorage` or `SecureStore` directly — only through `src/utils/storage.ts`.

### Input validation

All user inputs (challenge answers) pass through `sanitizeChallengeInput()` in `src/utils/validation.ts` before processing. Max lengths enforced. Dangerous characters stripped.

### Logger

`src/utils/logger.ts` strips `debug/info/warn` logs in production builds. Only `error()` passes through, with a TODO hook for Sentry.

### No eval, no dynamic code execution

ESLint rules `no-eval` and `no-implied-eval` are set to `error`.

---

## Pre-release Checklist

- [ ] `npm audit` — zero high/critical vulnerabilities
- [ ] `npm run type-check` — zero TypeScript errors
- [ ] `npm run lint` — zero ESLint errors
- [ ] Search codebase for hardcoded secrets: `grep -r "sk_" src/` etc.
- [ ] Verify `.env` is in `.gitignore` and not staged
- [ ] Confirm `app.config.ts` is in `.gitignore`
- [ ] All `TODO: [IAP]` stubs reviewed before enabling purchases
- [ ] All `TODO: [ADS]` stubs reviewed before enabling ads
- [ ] Supabase anon key stored in SecureStore — never in AsyncStorage or bundle
- [ ] Receipt validation via Supabase Edge Function before crediting purchases
- [ ] EAS Secrets populated for all env vars
- [ ] RevenueCat receipt validation enabled server-side

---

## Future Backend: Supabase Migration Guide

1. Provision a Supabase project at [supabase.com](https://supabase.com)
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` as EAS Secrets
3. In `src/services/auth/authRepository.ts`, implement `SupabaseAuthRepository` and swap the export
4. In `src/services/saga/sagaRepository.ts`, implement `SupabaseSagaRepository` and swap the export
5. Repeat for `social`, `signals` (server-side timer validation)
6. Store anon key in SecureStore via `secureSet()` on first launch — never bake into bundle
7. Add `@supabase/supabase-js` and inject client via dependency injection into each repository

---

## Monetization: RevenueCat Integration Points

All purchase functions in `src/services/monetization/monetizationStore.ts` are stubs marked `TODO: [IAP]`.

Integration steps:
1. Create a RevenueCat project and configure iOS/Android entitlements
2. `npm install react-native-purchases`
3. Replace `purchaseMonthly` and `purchaseAnnual` stubs with RevenueCat SDK calls
4. Implement `restorePurchases` via `Purchases.restorePurchases()`
5. Validate receipts server-side via a Supabase Edge Function — **never trust client-side purchase state**
6. Set `REVENUECAT_IOS_KEY` and `REVENUECAT_ANDROID_KEY` as EAS Secrets
