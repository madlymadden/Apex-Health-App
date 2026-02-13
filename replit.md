# Vitality - Equinox-Inspired Health Tracking App

## Overview

Vitality is a premium health and fitness tracking mobile application built with Expo (React Native) and an Express.js backend. The app features a dark minimalist UI inspired by the Equinox fitness app aesthetic — deep black backgrounds, light-weight typography (Outfit 300), generous negative space, hairline dividers, and an editorial luxury feel. Health metrics are displayed through animated rings, bar charts, and sparkline charts. It uses a tab-based navigation with Dashboard, Activity, Body, and Profile screens, plus a modal detail view for individual metrics.

## User Preferences

Preferred communication style: Simple, everyday language.
Design aesthetic: Equinox app-inspired dark luxury minimalism — sharp edges, light font weights, generous whitespace, all-caps labels with wide letter-spacing, thin hairline dividers, monochrome palette with minimal color accents.

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native, new architecture enabled and React Compiler experiment
- **Routing**: Expo Router v6 with file-based routing. Tab layout at `app/(tabs)/` with four tabs (Dashboard, Activity, Body, Profile). Modal route at `app/metric/[id]` for metric details
- **State Management**: TanStack React Query for server state; local `useState`/`useEffect` for UI state
- **Styling**: React Native `StyleSheet` throughout. Dark theme with Equinox-inspired luxury aesthetic — deep black (#0D0D0D) backgrounds, white text, thin 0.5px dividers, muted gray (#666) secondary text. Color constants in `constants/colors.ts`
- **Fonts**: Outfit font family (Light 300 as primary weight, Regular 400 for emphasis) via `@expo-google-fonts/outfit`
- **Animations**: `react-native-reanimated` for animated progress rings, bar chart entries, pulsing dots, and fade-in transitions
- **Charts/Visualizations**: Custom SVG components — `MetricRing` (circular progress), `BarChart` (weekly bars), `MiniChart` (sparkline) using `react-native-svg`
- **Platform Support**: iOS, Android, and Web with platform-specific haptics, tab bar styling (blur on iOS, solid on others), and web insets

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript via `tsx`
- **Server**: Express with custom CORS middleware for Replit domains
- **API Pattern**: Routes in `server/routes.ts` prefixed with `/api`
- **Static Serving**: Serves Expo web build and landing page template

### Data Layer

- **Mock Data**: `lib/health-data.ts` generates randomized health metrics, workout history, body metrics, weekly chart data, Apple Health data (vitals, sleep, nutrition, activity), Strava activities, importable workouts (Hevy/Strong), nutrition entries (NutriFactor/Sweetgreen), and connected app definitions
- **Persistence**: AsyncStorage via `lib/storage.ts` for workouts, goals, profile, and onboarding state
- **Health Context**: `lib/health-context.tsx` provides HealthProvider with metrics, workouts, goals, profile, and CRUD operations
- **ORM**: Drizzle ORM with PostgreSQL dialect ready for real data
- **Schema**: `shared/schema.ts` — users table with UUID, username, password

### Key Files

- `app/(tabs)/index.tsx` — Dashboard with hero score, metric rings, metric rows, streak calendar, animated counters, live heart rate
- `app/(tabs)/activity.tsx` — Workout history with intensity dots and stats
- `app/(tabs)/body.tsx` — Body composition metrics with trend charts
- `app/(tabs)/profile.tsx` — User profile, goals, connected apps links, preferences
- `app/metric/[id].tsx` — Modal detail view with ring, bar chart, stats, insight
- `app/add-workout.tsx` — Add workout modal with 8 workout types and stats
- `app/workout/[id].tsx` — Workout detail modal with heart rate zones, notes, delete
- `app/edit-goals.tsx` — Editable goals modal
- `app/onboarding.tsx` — 3-page first-launch onboarding
- `app/connected-apps.tsx` — Connected Apps hub with 8 integration tiles (Apple Health, Strava, Hevy, Strong, NutriFactor, Sweetgreen, Apple Watch, WHOOP)
- `app/apple-health.tsx` — Apple Health detail with 4 tabs: vitals (6 real-time readings), sleep (7-night visualization), nutrition (macro tracking), activity (7-day stats)
- `app/strava.tsx` — Strava integration with activity import, sync, and detailed activity cards
- `app/workout-imports.tsx` — Workout import from Hevy/Strong with expandable exercise lists, source filtering
- `app/nutrition-sync.tsx` — Nutrition import from NutriFactor/Sweetgreen with meal cards, macro breakdowns, ingredient chips
- `components/MetricRing.tsx` — Animated SVG circular progress
- `components/BarChart.tsx` — Animated weekly bar chart
- `components/MiniChart.tsx` — SVG sparkline chart
- `lib/health-data.ts` — Health data generation utilities and integration data types
- `lib/health-context.tsx` — React context for health state management
- `lib/storage.ts` — AsyncStorage persistence layer
- `constants/colors.ts` — Theme color constants

### Build & Development

- **Dev**: Two workflows — `Start Frontend` (Expo dev server on 8081) and `Start Backend` (Express on 5000)
- **Fonts**: Loaded in root `_layout.tsx` before rendering
