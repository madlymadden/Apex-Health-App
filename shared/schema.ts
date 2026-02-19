import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  calories: integer("calories").notNull(),
  intensity: text("intensity").notNull().default("moderate"),
  heartRateAvg: integer("heart_rate_avg"),
  notes: text("notes"),
  exercises: jsonb("exercises"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bodyMeasurements = pgTable("body_measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  weight: real("weight"),
  bodyFat: real("body_fat"),
  muscleMass: real("muscle_mass"),
  restingHr: integer("resting_hr"),
  vo2Max: real("vo2_max"),
  sleepAvg: real("sleep_avg"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  steps: integer("steps").default(10000),
  calories: integer("calories").default(650),
  activeMinutes: integer("active_minutes").default(45),
  weeklyWorkouts: integer("weekly_workouts").default(5),
  weightTarget: real("weight_target"),
  bodyFatTarget: real("body_fat_target"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hydrationLogs = pgTable("hydration_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  glasses: integer("glasses").default(0),
  goal: integer("goal").default(8),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sleepEntries = pgTable("sleep_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: text("date").notNull(),
  bedtime: text("bedtime"),
  wakeTime: text("wake_time"),
  duration: integer("duration"),
  quality: integer("quality"),
  deep: integer("deep"),
  rem: integer("rem"),
  light: integer("light"),
  awake: integer("awake"),
  hrAvg: integer("hr_avg"),
  hrLow: integer("hr_low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionEntries = pgTable("nutrition_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  meal: text("meal").notNull(),
  date: text("date").notNull(),
  calories: integer("calories"),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  items: jsonb("items"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  priority: text("priority").default("normal"),
  read: boolean("read").default(false),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).unique(),
  theme: text("theme").default("dark"),
  units: text("units").default("imperial"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  hapticFeedback: boolean("haptic_feedback").default(true),
  weekStartDay: text("week_start_day").default("monday"),
  restDayReminders: boolean("rest_day_reminders").default(true),
  workoutReminders: boolean("workout_reminders").default(true),
  socialSharing: boolean("social_sharing").default(false),
  dataSharing: boolean("data_sharing").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({ id: true, createdAt: true });
export const insertBodyMeasurementSchema = createInsertSchema(bodyMeasurements).omit({ id: true, createdAt: true });
export const insertGoalsSchema = createInsertSchema(goals).omit({ id: true, updatedAt: true });
export const insertSleepEntrySchema = createInsertSchema(sleepEntries).omit({ id: true, createdAt: true });
export const insertNutritionEntrySchema = createInsertSchema(nutritionEntries).omit({ id: true, createdAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertBodyMeasurement = z.infer<typeof insertBodyMeasurementSchema>;
export type BodyMeasurement = typeof bodyMeasurements.$inferSelect;
export type Goals = typeof goals.$inferSelect;
export type InsertGoals = z.infer<typeof insertGoalsSchema>;
export type SleepEntry = typeof sleepEntries.$inferSelect;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;
export type AiInsight = typeof aiInsights.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type UserPreference = typeof userPreferences.$inferSelect;
