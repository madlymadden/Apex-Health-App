# Madden - Equinox-Inspired Health Tracking App

## Overview

Madden is a premium health and fitness tracking mobile application built with Expo (React Native) and an Express.js backend. The app features a dark minimalist UI inspired by the Equinox fitness app aesthetic — deep black backgrounds, light-weight typography (Outfit 300), generous negative space, hairline dividers, and an editorial luxury feel. Health metrics are displayed through animated rings, bar charts, and sparkline charts. It uses a tab-based navigation with Dashboard, Activity, Body, and Profile screens, plus 37+ screens covering every aspect of health, fitness, nutrition, and lifestyle tracking. Pervasive haptic feedback is integrated across all screens for tactile interactions on scroll, tap, toggle, sort, and filter actions.

## User Preferences

Preferred communication style: Simple, everyday language.
Design aesthetic: Equinox app-inspired dark luxury minimalism — sharp edges, light font weights, generous whitespace, all-caps labels with wide letter-spacing, thin hairline dividers, monochrome palette with minimal color accents (gold, teal, green for specific states).

## System Architecture

### Frontend (Expo / React Native)

- **Framework**: Expo SDK 54 with React Native, new architecture enabled and React Compiler experiment
- **Routing**: Expo Router v6 with file-based routing. Tab layout at `app/(tabs)/` with four tabs (Dashboard, Activity, Body, Profile). 33+ modal/stack routes for features
- **State Management**: TanStack React Query for server state; local `useState`/`useEffect` for UI state
- **Styling**: React Native `StyleSheet` throughout. Dark theme with Equinox-inspired luxury aesthetic — deep black (#0D0D0D) backgrounds, white text, thin 0.5px dividers, muted gray (#666) secondary text. Color constants in `constants/colors.ts`
- **Fonts**: Outfit font family (Light 300 as primary weight, Regular 400 for emphasis) via `@expo-google-fonts/outfit`
- **Animations**: `react-native-reanimated` for animated progress rings, bar chart entries, pulsing dots, breathing circles, fade-in transitions
- **Charts/Visualizations**: Custom SVG components — `MetricRing` (circular progress), `BarChart` (weekly bars), `MiniChart` (sparkline), muscle heatmaps, body trend charts using `react-native-svg`
- **Platform Support**: iOS, Android, and Web with platform-specific haptics, tab bar styling (blur on iOS, solid on others), and web insets

### Backend (Express.js)

- **Runtime**: Node.js with TypeScript via `tsx`
- **Server**: Express with custom CORS middleware for Replit domains
- **API Pattern**: Routes in `server/routes.ts` prefixed with `/api`
- **Static Serving**: Serves Expo web build and landing page template

### Data Layer

- **Database**: PostgreSQL with Drizzle ORM. 10 tables: users, workouts, body_measurements, goals, hydration_logs, sleep_entries, nutrition_entries, ai_insights, notifications, user_preferences
- **Database Storage**: `server/storage.ts` — DatabaseStorage class with full CRUD via Drizzle ORM. All entities have proper query limits and ordering
- **Database Connection**: `server/db.ts` — Pool connection via `drizzle-orm/node-postgres`
- **Schema**: `shared/schema.ts` — 10 tables with foreign keys to users, insert schemas via drizzle-zod, TypeScript types exported
- **API Routes**: `server/routes.ts` — RESTful endpoints for all health data types plus AI-powered insights generation using OpenAI gpt-4o-mini
- **Mock Data**: `lib/health-data.ts` generates randomized health metrics, workout history, body metrics, weekly chart data, Apple Health data (vitals, sleep, nutrition, activity), Strava activities, importable workouts (Hevy/Strong), nutrition entries (NutriFactor/Sweetgreen), and connected app definitions
- **Local Persistence**: AsyncStorage via `lib/storage.ts` for workouts, goals, profile, onboarding state, and hydration (frontend cache)
- **Health Context**: `lib/health-context.tsx` provides HealthProvider with metrics, workouts, goals, profile, and CRUD operations

### Key Files — Core Tabs
- `app/(tabs)/index.tsx` — Dashboard with hero score, metric rings, metric rows, streak calendar, animated counters, live heart rate, hydration tracker, 22-card quick access grid
- `app/(tabs)/activity.tsx` — Workout history with intensity dots, stats, START WORKOUT button
- `app/(tabs)/body.tsx` — Body composition metrics with trend charts, VIEW TRENDS link, BODY TOOLS section (Muscle Map, Body Trends, Progress Photos, Smart Scanner), + button for measurement logging
- `app/(tabs)/profile.tsx` — User profile with stats, organized sections (Training, Wellness, Insights, Social, Connected Apps, Preferences). Goals consolidated into single link to dedicated edit-goals screen

### Key Files — Fitness & Training
- `app/active-workout.tsx` — Live workout timer with exercise tracking, rest timer, set logging
- `app/training-calendar.tsx` — Monthly calendar with color-coded workout days, day detail drill-down
- `app/exercise-library.tsx` — 28+ exercises with muscle group filtering, search, expandable details
- `app/workout-plans.tsx` — 3 structured workout programs with day-by-day tracking
- `app/run-tracker.tsx` — Run/cardio tracking with GPS-style route, pace charts, splits
- `app/personal-records.tsx` — 15 PRs with history timeline and category breakdown
- `app/heart-rate-zones.tsx` — 5-zone heart rate analysis with time-in-zone charts

### Key Files — Health & Wellness
- `app/nutrition-tracker.tsx` — Daily calorie/macro tracking with meal timeline
- `app/sleep-analysis.tsx` — Sleep score with animated SVG ring (120px), proportional stage breakdown bars, vital signs card, 14-night expandable history, weekly trend chart
- `app/recovery.tsx` — Recovery score with animated SVG ring (140px), SpringPress interactions, double-ring breathing exercise with session counter and phase-transition haptics, weekly chart
- `app/meditation.tsx` — Mindfulness with breathing animation, focus timer, mood check
- `app/fasting-timer.tsx` — Intermittent fasting with circular countdown, protocol selector
- `app/supplement-tracker.tsx` — Daily supplement checklist with time-based sections, adherence chart
- `app/body-trends.tsx` — Historical body measurement charts with gradient SVG

### Key Files — Lifestyle & Social
- `app/habit-tracker.tsx` — Daily habits with toggles, weekly heatmap, streaks
- `app/social-feed.tsx` — Community activity feed with likes, comments, friend posts
- `app/challenges.tsx` — Active challenges, leaderboards, progress tracking
- `app/achievements.tsx` — 12 unlockable badges with progress bars, category filtering
- `app/workout-music.tsx` — Vibe selector with genre-matched playlists, now playing
- `app/progress-gallery.tsx` — Progress photo timeline with compare mode
- `app/body-heatmap.tsx` — Muscle fatigue/soreness map with front/back toggle

### Key Files — Reports & Analytics
- `app/weekly-report.tsx` — Weekly consistency score, daily breakdown, AI insights
- `app/stats.tsx` — Deep analytics with heatmap, gauge, trend charts

### Key Files — Equinox Classes
- `app/equinox-classes.tsx` — Equinox class recommendation engine with algorithm analyzing recovery score, recent workouts, and rest days to suggest classes (PUSH DAY/ACTIVE RECOVERY/REST DAY). Features location selector with 6 NYC clubs, favorites filter, category pills, class cards with match % scores and BOOK buttons, amenity tags

### Key Files — Integrations & Settings
- `app/connected-apps.tsx` — 12 integration tiles (Apple Health, Strava, Oura Ring, Runna, etc.)
- `app/apple-health.tsx` — Apple Health detail with 4 tabs
- `app/strava.tsx` — Strava integration with activity import
- `app/oura-ring.tsx` — Oura Ring integration with readiness score, sleep score, activity stats, 7-day trends, sync toggles (gold accent #D4AF37)
- `app/runna.tsx` — Runna running app with active training plan, weekly schedule, performance stats, recent runs, coaching toggles (coral accent #FF5A5F)
- `app/workout-imports.tsx` — Hevy/Strong workout import
- `app/nutrition-sync.tsx` — NutriFactor/Sweetgreen nutrition import
- `app/settings.tsx` — Comprehensive preferences with custom animated toggles
- `app/search.tsx` — Global search overlay with fuzzy matching across 30+ screens, recent searches, quick actions
- `app/notifications.tsx` — In-app notification center with achievement unlocks, streak alerts, AI insights, milestone celebrations
- `app/onboarding.tsx` — Premium 4-step onboarding flow with goal setting, body metrics input, animated rings

### Key Files — Shared Components
- `components/MetricRing.tsx` — Animated SVG circular progress
- `components/BarChart.tsx` — Animated weekly bar chart
- `components/MiniChart.tsx` — SVG sparkline chart
- `lib/health-data.ts` — Health data generation utilities
- `lib/health-context.tsx` — React context for health state management
- `lib/storage.ts` — AsyncStorage persistence layer
- `constants/colors.ts` — Theme color constants (deepBlack, charcoal, surface, elevated, border, muted, white, gold, green, teal, red)

### Build & Development

- **Dev**: Two workflows — `Start Frontend` (Expo dev server on 8081) and `Start Backend` (Express on 5000)
- **Fonts**: Loaded in root `_layout.tsx` before rendering
