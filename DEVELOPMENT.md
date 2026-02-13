# Apex Health App - Development Guide

## Overview

Vitality is a premium health and fitness tracking mobile application built with Expo (React Native) and Express.js backend. The app features a dark minimalist UI inspired by the Equinox fitness app aesthetic.

## Architecture

### Frontend (Expo / React Native)
- **Framework**: Expo SDK 54 with React Native
- **Routing**: Expo Router v6 with file-based routing
- **State Management**: TanStack React Query + React Context
- **Styling**: React Native StyleSheet with dark theme
- **Fonts**: Outfit font family (Light 300, Regular 400)
- **Animations**: react-native-reanimated
- **Charts**: Custom SVG components

### Backend (Express.js)
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **API**: RESTful endpoints prefixed with `/api`

## Key Features Implemented

### ✅ Completed Features
- **Dashboard**: Animated metrics rings, daily score, streak calendar
- **Activity Tracking**: Workout history with intensity indicators
- **Body Composition**: Metrics with trend charts and detail views
- **Profile Management**: Goals, connected apps, preferences
- **Health Context**: Centralized state management
- **Data Persistence**: AsyncStorage for local data
- **Modal Navigation**: Metric and workout detail views
- **Connected Apps**: Integration framework for health services

### 🆕 Recent Improvements
- **Body Metrics Detail Views**: Full-screen modal with charts and insights
- **Enhanced Profile Settings**: Interactive units conversion
- **API Endpoints**: Basic RESTful routes for health data
- **Navigation Improvements**: Better modal transitions

## File Structure

```
app/
├── (tabs)/           # Main tab navigation
│   ├── index.tsx     # Dashboard screen
│   ├── activity.tsx  # Activity tracking
│   ├── body.tsx      # Body composition
│   └── profile.tsx   # User profile
├── metric/[id].tsx   # Metric detail modal
├── body/[id].tsx     # Body metric detail modal
├── workout/[id].tsx  # Workout detail modal
├── add-workout.tsx   # Add workout modal
└── _layout.tsx       # Root layout

components/
├── MetricRing.tsx    # Circular progress component
├── BarChart.tsx      # Weekly bar chart
├── MiniChart.tsx     # Sparkline chart
└── ErrorBoundary.tsx # Error handling

lib/
├── health-context.tsx # React context for health data
├── health-data.ts     # Data generation utilities
├── storage.ts         # AsyncStorage persistence
└── query-client.ts    # React Query configuration

server/
├── index.ts          # Express server setup
├── routes.ts         # API routes
└── storage.ts        # Server-side storage

constants/
└── colors.ts         # Theme color constants
```

## Development Commands

### Frontend
```bash
# Start Expo development server
npm run expo:dev
# or
npx expo start

# Build for production
npm run expo:static:build

# Lint code
npm run lint
npm run lint:fix
```

### Backend
```bash
# Start development server
npm run server:dev

# Build for production
npm run server:build

# Run production server
npm run server:prod
```

### Database
```bash
# Push schema changes
npm run db:push
```

## API Endpoints

### Health Data
- `GET /api/metrics` - Get daily health metrics
- `GET /api/workouts` - Get workout history
- `GET /api/body-metrics` - Get body composition data
- `GET /api/health` - Health check endpoint

## Data Models

### HealthMetric
```typescript
{
  id: string;
  label: string;
  value: number;
  unit: string;
  goal: number;
  icon: string;
  color: string;
  trend: number;
}
```

### WorkoutEntry
```typescript
{
  id: string;
  type: string;
  icon: string;
  duration: number;
  calories: number;
  date: string;
  intensity: "low" | "moderate" | "high";
  heartRateAvg: number;
}
```

### BodyMetric
```typescript
{
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  history: number[];
}
```

## UI Guidelines

### Design Principles
- **Dark Theme**: Deep black backgrounds (#0D0D0D)
- **Typography**: Outfit font, light weights (300-400)
- **Minimalism**: Generous whitespace, hairline dividers
- **Color Palette**: Monochrome with minimal accent colors
- **Animations**: Subtle transitions and micro-interactions

### Component Patterns
- Use `StyleSheet.create` for performance
- Implement haptic feedback on pressable elements
- Add loading states and error boundaries
- Follow platform-specific patterns (iOS vs Android)

## Next Development Steps

### High Priority
1. **Real Backend Integration**: Connect to PostgreSQL database
2. **User Authentication**: Implement login/signup flow
3. **Data Synchronization**: Real-time sync with connected apps
4. **Push Notifications**: Goal reminders and achievements

### Medium Priority
1. **Enhanced Charts**: More detailed analytics views
2. **Social Features**: Workout sharing and challenges
3. **Apple Health Integration**: Actual HealthKit connectivity
4. **Export Features**: Data export to CSV/JSON

### Low Priority
1. **Theme Customization**: Light mode option
2. **Widget Support**: Home screen widgets
3. **Apple Watch App**: Companion watch app
4. **Advanced Analytics**: ML-powered insights

## Troubleshooting

### Common Issues
- **Font Loading**: Ensure Outfit fonts are loaded before rendering
- **Animation Performance**: Use `useNativeDriver` when possible
- **Memory Management**: Clean up animations and listeners
- **Platform Differences**: Test on iOS, Android, and web

### Debug Commands
```bash
# Clear Expo cache
npx expo start -c

# Reset development server
npx expo start --reset-cache

# Check for issues
npx expo doctor
```

## Contributing

1. Follow existing code style and patterns
2. Add proper TypeScript types
3. Include error handling and loading states
4. Test on multiple platforms
5. Update documentation for new features

## Performance Optimization

- Use `React.memo` for expensive components
- Implement virtual lists for large datasets
- Optimize image loading and caching
- Minimize re-renders with proper dependency arrays
- Use native drivers for animations when possible
