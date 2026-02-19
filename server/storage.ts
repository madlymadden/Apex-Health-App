import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users, workouts, bodyMeasurements, goals, hydrationLogs,
  sleepEntries, nutritionEntries, aiInsights, notifications, userPreferences,
  type User, type InsertUser, type Workout, type InsertWorkout,
  type BodyMeasurement, type InsertBodyMeasurement, type Goals, type InsertGoals,
  type SleepEntry, type NutritionEntry, type AiInsight, type Notification, type UserPreference,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getWorkouts(userId?: string): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  deleteWorkout(id: string): Promise<void>;

  getBodyMeasurements(userId?: string): Promise<BodyMeasurement[]>;
  createBodyMeasurement(measurement: InsertBodyMeasurement): Promise<BodyMeasurement>;

  getGoals(userId?: string): Promise<Goals | undefined>;
  upsertGoals(goalsData: InsertGoals): Promise<Goals>;

  getHydration(userId: string | undefined, date: string): Promise<any>;
  logHydration(userId: string | undefined, date: string, glasses: number): Promise<any>;

  getSleepEntries(userId?: string): Promise<SleepEntry[]>;
  createSleepEntry(entry: any): Promise<SleepEntry>;

  getNutritionEntries(userId?: string): Promise<NutritionEntry[]>;
  createNutritionEntry(entry: any): Promise<NutritionEntry>;

  getInsights(userId?: string): Promise<AiInsight[]>;
  createInsight(insight: any): Promise<AiInsight>;
  markInsightRead(id: string): Promise<void>;

  getNotifications(userId?: string): Promise<Notification[]>;
  createNotification(notification: any): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;

  getPreferences(userId?: string): Promise<UserPreference | undefined>;
  upsertPreferences(userId: string | undefined, prefs: any): Promise<UserPreference>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getWorkouts(userId?: string): Promise<Workout[]> {
    if (userId) {
      return db.select().from(workouts).where(eq(workouts.userId, userId)).orderBy(desc(workouts.createdAt)).limit(50);
    }
    return db.select().from(workouts).orderBy(desc(workouts.createdAt)).limit(50);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const [created] = await db.insert(workouts).values(workout).returning();
    return created;
  }

  async deleteWorkout(id: string): Promise<void> {
    await db.delete(workouts).where(eq(workouts.id, id));
  }

  async getBodyMeasurements(userId?: string): Promise<BodyMeasurement[]> {
    if (userId) {
      return db.select().from(bodyMeasurements).where(eq(bodyMeasurements.userId, userId)).orderBy(desc(bodyMeasurements.createdAt));
    }
    return db.select().from(bodyMeasurements).orderBy(desc(bodyMeasurements.createdAt));
  }

  async createBodyMeasurement(measurement: InsertBodyMeasurement): Promise<BodyMeasurement> {
    const [created] = await db.insert(bodyMeasurements).values(measurement).returning();
    return created;
  }

  async getGoals(userId?: string): Promise<Goals | undefined> {
    if (userId) {
      const [result] = await db.select().from(goals).where(eq(goals.userId, userId));
      return result;
    }
    const [result] = await db.select().from(goals);
    return result;
  }

  async upsertGoals(goalsData: InsertGoals): Promise<Goals> {
    if (goalsData.userId) {
      const existing = await this.getGoals(goalsData.userId);
      if (existing) {
        const [updated] = await db.update(goals).set({ ...goalsData, updatedAt: new Date() }).where(eq(goals.id, existing.id)).returning();
        return updated;
      }
    }
    const [created] = await db.insert(goals).values(goalsData).returning();
    return created;
  }

  async getHydration(userId: string | undefined, date: string): Promise<any> {
    if (userId) {
      const [result] = await db.select().from(hydrationLogs).where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, date)));
      return result || { glasses: 0, goal: 8, date };
    }
    const [result] = await db.select().from(hydrationLogs).where(eq(hydrationLogs.date, date));
    return result || { glasses: 0, goal: 8, date };
  }

  async logHydration(userId: string | undefined, date: string, glasses: number): Promise<any> {
    if (userId) {
      const [existing] = await db.select().from(hydrationLogs).where(and(eq(hydrationLogs.userId, userId), eq(hydrationLogs.date, date)));
      if (existing) {
        const [updated] = await db.update(hydrationLogs).set({ glasses }).where(eq(hydrationLogs.id, existing.id)).returning();
        return updated;
      }
      const [created] = await db.insert(hydrationLogs).values({ userId, date, glasses }).returning();
      return created;
    }
    const [existing] = await db.select().from(hydrationLogs).where(eq(hydrationLogs.date, date));
    if (existing) {
      const [updated] = await db.update(hydrationLogs).set({ glasses }).where(eq(hydrationLogs.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(hydrationLogs).values({ date, glasses }).returning();
    return created;
  }

  async getSleepEntries(userId?: string): Promise<SleepEntry[]> {
    if (userId) {
      return db.select().from(sleepEntries).where(eq(sleepEntries.userId, userId)).orderBy(desc(sleepEntries.createdAt)).limit(30);
    }
    return db.select().from(sleepEntries).orderBy(desc(sleepEntries.createdAt)).limit(30);
  }

  async createSleepEntry(entry: any): Promise<SleepEntry> {
    const [created] = await db.insert(sleepEntries).values(entry).returning();
    return created;
  }

  async getNutritionEntries(userId?: string): Promise<NutritionEntry[]> {
    if (userId) {
      return db.select().from(nutritionEntries).where(eq(nutritionEntries.userId, userId)).orderBy(desc(nutritionEntries.createdAt)).limit(50);
    }
    return db.select().from(nutritionEntries).orderBy(desc(nutritionEntries.createdAt)).limit(50);
  }

  async createNutritionEntry(entry: any): Promise<NutritionEntry> {
    const [created] = await db.insert(nutritionEntries).values(entry).returning();
    return created;
  }

  async getInsights(userId?: string): Promise<AiInsight[]> {
    if (userId) {
      return db.select().from(aiInsights).where(eq(aiInsights.userId, userId)).orderBy(desc(aiInsights.createdAt)).limit(20);
    }
    return db.select().from(aiInsights).orderBy(desc(aiInsights.createdAt)).limit(20);
  }

  async createInsight(insight: any): Promise<AiInsight> {
    const [created] = await db.insert(aiInsights).values(insight).returning();
    return created;
  }

  async markInsightRead(id: string): Promise<void> {
    await db.update(aiInsights).set({ read: true }).where(eq(aiInsights.id, id));
  }

  async getNotifications(userId?: string): Promise<Notification[]> {
    if (userId) {
      return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(30);
    }
    return db.select().from(notifications).orderBy(desc(notifications.createdAt)).limit(30);
  }

  async createNotification(notification: any): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
  }

  async getPreferences(userId?: string): Promise<UserPreference | undefined> {
    if (userId) {
      const [result] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
      return result;
    }
    const [result] = await db.select().from(userPreferences);
    return result;
  }

  async upsertPreferences(userId: string | undefined, prefs: any): Promise<UserPreference> {
    if (userId) {
      const existing = await this.getPreferences(userId);
      if (existing) {
        const [updated] = await db.update(userPreferences).set({ ...prefs, updatedAt: new Date() }).where(eq(userPreferences.id, existing.id)).returning();
        return updated;
      }
      const [created] = await db.insert(userPreferences).values({ userId, ...prefs }).returning();
      return created;
    }
    const [created] = await db.insert(userPreferences).values(prefs).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
