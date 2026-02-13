import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, decimal, boolean, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
const intensityEnum = pgEnum('intensity', ['low', 'moderate', 'high']);
const trendEnum = pgEnum('trend', ['up', 'down', 'stable']);
const connectedAppCategoryEnum = pgEnum('connected_app_category', ['health', 'fitness', 'nutrition', 'wearable']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  gender: genderEnum('gender'),
  dateOfBirth: timestamp('date_of_birth'),
  height: decimal('height', { precision: 5, scale: 2 }), // in cm
  units: text('units').default('imperial').notNull(), // 'imperial' or 'metric'
  timezone: text('timezone').default('UTC'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User goals
export const userGoals = pgTable('user_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  steps: integer('steps').default(10000).notNull(),
  calories: integer('calories').default(2000).notNull(),
  activeMinutes: integer('active_minutes').default(30).notNull(),
  weeklyWorkouts: integer('weekly_workouts').default(5).notNull(),
  sleepHours: decimal('sleep_hours', { precision: 3, scale: 1 }).default('8.0'),
  waterIntake: integer('water_intake').default(64), // in oz
  weight: decimal('weight', { precision: 5, scale: 2 }), // target weight in lbs
  bodyFat: decimal('body_fat', { precision: 5, scale: 2 }), // target body fat percentage
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Health metrics
export const healthMetrics = pgTable('health_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  steps: integer('steps').default(0),
  calories: integer('calories').default(0),
  activeMinutes: integer('active_minutes').default(0),
  heartRateAvg: integer('heart_rate_avg'),
  heartRateMax: integer('heart_rate_max'),
  heartRateResting: integer('heart_rate_resting'),
  sleepHours: decimal('sleep_hours', { precision: 3, scale: 1 }),
  sleepQuality: integer('sleep_quality'), // 1-5 scale
  waterIntake: integer('water_intake'), // in oz
  weight: decimal('weight', { precision: 5, scale: 2 }), // in lbs
  bodyFat: decimal('body_fat', { precision: 5, scale: 2 }), // percentage
  muscleMass: decimal('muscle_mass', { precision: 5, scale: 2 }), // in lbs
  vo2Max: decimal('vo2_max', { precision: 5, scale: 2 }),
  bloodPressureSystolic: integer('blood_pressure_systolic'),
  bloodPressureDiastolic: integer('blood_pressure_diastolic'),
  bodyTemperature: decimal('body_temperature', { precision: 3, scale: 1 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Workouts
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  icon: text('icon').notNull(),
  duration: integer('duration').notNull(), // in minutes
  calories: integer('calories').default(0),
  distance: decimal('distance', { precision: 6, scale: 3 }), // in miles
  elevation: integer('elevation'), // in feet
  intensity: intensityEnum('intensity').notNull(),
  heartRateAvg: integer('heart_rate_avg'),
  heartRateMax: integer('heart_rate_max'),
  notes: text('notes'),
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workout exercises (for strength training)
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  sets: integer('sets').notNull(),
  reps: text('reps').notNull(), // could be "8-10" or "12"
  weight: text('weight'), // could be "135 lbs" or "BW"
  duration: integer('duration'), // for timed exercises
  restTime: integer('rest_time'), // in seconds
  notes: text('notes'),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Connected apps
export const connectedApps = pgTable('connected_apps', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  appId: text('app_id').notNull(), // e.g., 'apple-health', 'strava'
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  category: connectedAppCategoryEnum('category').notNull(),
  connected: boolean('connected').default(false).notNull(),
  lastSync: timestamp('last_sync'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  dataTypes: text('data_types').array(), // array of data types synced
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Nutrition entries
export const nutritionEntries = pgTable('nutrition_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  meal: text('meal').notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  name: text('name').notNull(),
  calories: integer('calories').notNull(),
  protein: decimal('protein', { precision: 5, scale: 2 }), // in grams
  carbs: decimal('carbs', { precision: 5, scale: 2 }), // in grams
  fat: decimal('fat', { precision: 5, scale: 2 }), // in grams
  fiber: decimal('fiber', { precision: 5, scale: 2 }), // in grams
  sugar: decimal('sugar', { precision: 5, scale: 2 }), // in grams
  sodium: integer('sodium'), // in mg
  source: text('source'), // e.g., 'manual', 'nutrifactor', 'sweetgreen'
  items: text('items').array(), // array of food items
  date: timestamp('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Body measurements
export const bodyMeasurements = pgTable('body_measurements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  weight: decimal('weight', { precision: 5, scale: 2 }), // in lbs
  bodyFat: decimal('body_fat', { precision: 5, scale: 2 }), // percentage
  muscleMass: decimal('muscle_mass', { precision: 5, scale: 2 }), // in lbs
  leanMass: decimal('lean_mass', { precision: 5, scale: 2 }), // in lbs
  boneMass: decimal('bone_mass', { precision: 5, scale: 2 }), // in lbs
  waterPercentage: decimal('water_percentage', { precision: 5, scale: 2 }), // percentage
  visceralFat: integer('visceral_fat'), // rating 1-59
  bmi: decimal('bmi', { precision: 4, scale: 1 }),
  waist: decimal('waist', { precision: 5, scale: 2 }), // in inches
  chest: decimal('chest', { precision: 5, scale: 2 }), // in inches
  arms: decimal('arms', { precision: 5, scale: 2 }), // in inches
  thighs: decimal('thighs', { precision: 5, scale: 2 }), // in inches
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Achievements
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'steps', 'workout_streak', 'weight_loss', etc.
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  value: integer('value'), // numeric value associated with achievement
  targetValue: integer('target_value'), // target to reach
  unlockedAt: timestamp('unlocked_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User preferences
export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('dark').notNull(), // 'dark', 'light', 'auto'
  notifications: boolean('notifications').default(true).notNull(),
  reminderTime: text('reminder_time').default('09:00'), // HH:MM format
  reminderDays: text('reminder_days').array().default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
  autoSync: boolean('auto_sync').default(true).notNull(),
  dataRetention: integer('data_retention').default(365), // days to keep data
  privacy: text('privacy').default('private').notNull(), // 'private', 'friends', 'public'
  units: text('units').default('imperial').notNull(), // 'imperial' or 'metric'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity logs (for tracking user actions)
export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'login', 'workout_completed', 'goal_updated', etc.
  entityType: text('entity_type'), // 'workout', 'goal', 'metric', etc.
  entityId: uuid('entity_id'), // ID of the related entity
  metadata: text('metadata'), // JSON string with additional data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  passwordHash: z.string().min(6),
  name: z.string().min(2),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertUserGoalsSchema = createInsertSchema(userGoals).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertHealthMetricsSchema = createInsertSchema(healthMetrics).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({ 
  id: true, 
  workoutId: true, 
  createdAt: true 
});

export const insertConnectedAppSchema = createInsertSchema(connectedApps).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurements).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

export const insertUserPreferenceSchema = createInsertSchema(userPreferences).omit({ 
  id: true, 
  userId: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ 
  id: true, 
  userId: true, 
  createdAt: true 
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserGoals = z.infer<typeof insertUserGoalsSchema>;
export type InsertHealthMetrics = z.infer<typeof insertHealthMetricsSchema>;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type InsertConnectedApp = z.infer<typeof insertConnectedAppSchema>;
export type InsertNutritionEntry = z.infer<typeof insertNutritionEntrySchema>;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserPreference = z.infer<typeof insertUserPreferenceSchema>;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type User = typeof users.$inferSelect;
export type UserGoal = typeof userGoals.$inferSelect;
export type HealthMetric = typeof healthMetrics.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type ConnectedApp = typeof connectedApps.$inferSelect;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
