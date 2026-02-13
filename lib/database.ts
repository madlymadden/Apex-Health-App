import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';
import { eq, and, gte, lte, desc, asc, sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL || 
  'postgresql://username:password@localhost:5432/vitality';

let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDatabase() {
  if (!db) {
    if (!client) {
      client = postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
    }
    db = drizzle(client, { schema });
  }
  return db;
}

// User services
export const userService = {
  async createUser(userData: schema.InsertUser) {
    const db = getDatabase();
    const [user] = await db.insert(schema.users).values(userData).returning();
    return user;
  },

  async getUserById(id: string) {
    const db = getDatabase();
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    return user;
  },

  async getUserByEmail(email: string) {
    const db = getDatabase();
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });
    return user;
  },

  async updateUser(id: string, userData: Partial<schema.InsertUser>) {
    const db = getDatabase();
    const [user] = await db
      .update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return user;
  },

  async deleteUser(id: string) {
    const db = getDatabase();
    await db.delete(schema.users).where(eq(schema.users.id, id));
  },
};

// User goals services
export const userGoalsService = {
  async createGoals(goalsData: schema.InsertUserGoals) {
    const db = getDatabase();
    const [goals] = await db.insert(schema.userGoals).values(goalsData).returning();
    return goals;
  },

  async getGoalsByUserId(userId: string) {
    const db = getDatabase();
    const goals = await db.query.userGoals.findFirst({
      where: eq(schema.userGoals.userId, userId),
    });
    return goals;
  },

  async updateGoals(userId: string, goalsData: Partial<schema.InsertUserGoals>) {
    const db = getDatabase();
    const [goals] = await db
      .update(schema.userGoals)
      .set({ ...goalsData, updatedAt: new Date() })
      .where(eq(schema.userGoals.userId, userId))
      .returning();
    return goals;
  },
};

// Health metrics services
export const healthMetricsService = {
  async createMetrics(metricsData: schema.InsertHealthMetrics) {
    const db = getDatabase();
    const [metrics] = await db.insert(schema.healthMetrics).values(metricsData).returning();
    return metrics;
  },

  async getMetricsByUserId(userId: string, limit = 30) {
    const db = getDatabase();
    const metrics = await db.query.healthMetrics.findMany({
      where: eq(schema.healthMetrics.userId, userId),
      orderBy: [desc(schema.healthMetrics.date)],
      limit,
    });
    return metrics;
  },

  async getMetricsByDateRange(userId: string, startDate: Date, endDate: Date) {
    const db = getDatabase();
    const metrics = await db.query.healthMetrics.findMany({
      where: and(
        eq(schema.healthMetrics.userId, userId),
        gte(schema.healthMetrics.date, startDate),
        lte(schema.healthMetrics.date, endDate)
      ),
      orderBy: [desc(schema.healthMetrics.date)],
    });
    return metrics;
  },

  async getLatestMetrics(userId: string) {
    const db = getDatabase();
    const [metrics] = await db.query.healthMetrics.findMany({
      where: eq(schema.healthMetrics.userId, userId),
      orderBy: [desc(schema.healthMetrics.date)],
      limit: 1,
    });
    return metrics[0] || null;
  },

  async updateMetrics(id: string, metricsData: Partial<schema.InsertHealthMetrics>) {
    const db = getDatabase();
    const [metrics] = await db
      .update(schema.healthMetrics)
      .set(metricsData)
      .where(eq(schema.healthMetrics.id, id))
      .returning();
    return metrics;
  },
};

// Workout services
export const workoutService = {
  async createWorkout(workoutData: schema.InsertWorkout) {
    const db = getDatabase();
    const [workout] = await db.insert(schema.workouts).values(workoutData).returning();
    return workout;
  },

  async getWorkoutsByUserId(userId: string, limit = 50) {
    const db = getDatabase();
    const workouts = await db.query.workouts.findMany({
      where: eq(schema.workouts.userId, userId),
      orderBy: [desc(schema.workouts.date)],
      limit,
    });
    return workouts;
  },

  async getWorkoutById(id: string) {
    const db = getDatabase();
    const workout = await db.query.workouts.findFirst({
      where: eq(schema.workouts.id, id),
      with: {
        exercises: true,
      },
    });
    return workout;
  },

  async updateWorkout(id: string, workoutData: Partial<schema.InsertWorkout>) {
    const db = getDatabase();
    const [workout] = await db
      .update(schema.workouts)
      .set({ ...workoutData, updatedAt: new Date() })
      .where(eq(schema.workouts.id, id))
      .returning();
    return workout;
  },

  async deleteWorkout(id: string) {
    const db = getDatabase();
    await db.delete(schema.workouts).where(eq(schema.workouts.id, id));
  },

  async getWorkoutStats(userId: string, startDate?: Date, endDate?: Date) {
    const db = getDatabase();
    let whereClause = eq(schema.workouts.userId, userId);
    
    if (startDate && endDate) {
      whereClause = and(
        whereClause,
        gte(schema.workouts.date, startDate),
        lte(schema.workouts.date, endDate)
      );
    }

    const stats = await db
      .select({
        totalWorkouts: sql<number>`count(*)`.mapWith(Number),
        totalDuration: sql<number>`sum(${schema.workouts.duration})`.mapWith(Number),
        totalCalories: sql<number>`sum(${schema.workouts.calories})`.mapWith(Number),
        avgHeartRate: sql<number>`avg(${schema.workouts.heartRateAvg})`.mapWith(Number),
      })
      .from(schema.workouts)
      .where(whereClause);

    return stats[0] || {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgHeartRate: 0,
    };
  },
};

// Workout exercises services
export const workoutExerciseService = {
  async createExercise(exerciseData: schema.InsertWorkoutExercise) {
    const db = getDatabase();
    const [exercise] = await db.insert(schema.workoutExercises).values(exerciseData).returning();
    return exercise;
  },

  async getExercisesByWorkoutId(workoutId: string) {
    const db = getDatabase();
    const exercises = await db.query.workoutExercises.findMany({
      where: eq(schema.workoutExercises.workoutId, workoutId),
      orderBy: [asc(schema.workoutExercises.orderIndex)],
    });
    return exercises;
  },

  async updateExercise(id: string, exerciseData: Partial<schema.InsertWorkoutExercise>) {
    const db = getDatabase();
    const [exercise] = await db
      .update(schema.workoutExercises)
      .set(exerciseData)
      .where(eq(schema.workoutExercises.id, id))
      .returning();
    return exercise;
  },

  async deleteExercise(id: string) {
    const db = getDatabase();
    await db.delete(schema.workoutExercises).where(eq(schema.workoutExercises.id, id));
  },
};

// Body measurements services
export const bodyMeasurementsService = {
  async createMeasurement(measurementData: schema.InsertBodyMeasurement) {
    const db = getDatabase();
    const [measurement] = await db.insert(schema.bodyMeasurements).values(measurementData).returning();
    return measurement;
  },

  async getMeasurementsByUserId(userId: string, limit = 50) {
    const db = getDatabase();
    const measurements = await db.query.bodyMeasurements.findMany({
      where: eq(schema.bodyMeasurements.userId, userId),
      orderBy: [desc(schema.bodyMeasurements.date)],
      limit,
    });
    return measurements;
  },

  async getLatestMeasurement(userId: string) {
    const db = getDatabase();
    const [measurement] = await db.query.bodyMeasurements.findMany({
      where: eq(schema.bodyMeasurements.userId, userId),
      orderBy: [desc(schema.bodyMeasurements.date)],
      limit: 1,
    });
    return measurement[0] || null;
  },

  async getMeasurementHistory(userId: string, days = 30) {
    const db = getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const measurements = await db.query.bodyMeasurements.findMany({
      where: and(
        eq(schema.bodyMeasurements.userId, userId),
        gte(schema.bodyMeasurements.date, startDate)
      ),
      orderBy: [asc(schema.bodyMeasurements.date)],
    });
    return measurements;
  },
};

// Connected apps services
export const connectedAppsService = {
  async connectApp(appData: schema.InsertConnectedApp) {
    const db = getDatabase();
    const [app] = await db.insert(schema.connectedApps).values(appData).returning();
    return app;
  },

  async getConnectedAppsByUserId(userId: string) {
    const db = getDatabase();
    const apps = await db.query.connectedApps.findMany({
      where: eq(schema.connectedApps.userId, userId),
      orderBy: [desc(schema.connectedApps.connected), desc(schema.connectedApps.lastSync)],
    });
    return apps;
  },

  async updateApp(id: string, appData: Partial<schema.InsertConnectedApp>) {
    const db = getDatabase();
    const [app] = await db
      .update(schema.connectedApps)
      .set({ ...appData, updatedAt: new Date() })
      .where(eq(schema.connectedApps.id, id))
      .returning();
    return app;
  },

  async disconnectApp(id: string) {
    const db = getDatabase();
    const [app] = await db
      .update(schema.connectedApps)
      .set({ 
        connected: false, 
        accessToken: null, 
        refreshToken: null,
        updatedAt: new Date() 
      })
      .where(eq(schema.connectedApps.id, id))
      .returning();
    return app;
  },

  async updateAppByUserIdAndAppId(userId: string, appId: string, updates: Partial<schema.InsertConnectedApp>) {
    const db = getDatabase();
    const [app] = await db
      .update(schema.connectedApps)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(
        eq(schema.connectedApps.userId, userId),
        eq(schema.connectedApps.appId, appId)
      ))
      .returning();
    return app;
  },
};

// Nutrition entries services
export const nutritionService = {
  async createNutritionEntry(entryData: schema.InsertNutritionEntry) {
    const db = getDatabase();
    const [entry] = await db.insert(schema.nutritionEntries).values(entryData).returning();
    return entry;
  },

  async getNutritionEntriesByUserId(userId: string, limit = 30) {
    const db = getDatabase();
    const entries = await db.query.nutritionEntries.findMany({
      where: eq(schema.nutritionEntries.userId, userId),
      orderBy: [desc(schema.nutritionEntries.date)],
      limit,
    });
    return entries;
  },

  async getNutritionByDateRange(userId: string, startDate: Date, endDate: Date) {
    const db = getDatabase();
    const entries = await db.query.nutritionEntries.findMany({
      where: and(
        eq(schema.nutritionEntries.userId, userId),
        gte(schema.nutritionEntries.date, startDate),
        lte(schema.nutritionEntries.date, endDate)
      ),
      orderBy: [desc(schema.nutritionEntries.date)],
    });
    return entries;
  },

  async getDailyNutritionSummary(userId: string, date: Date) {
    const db = getDatabase();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await db
      .select({
        totalCalories: sql<number>`sum(${schema.nutritionEntries.calories})`.mapWith(Number),
        totalProtein: sql<number>`sum(${schema.nutritionEntries.protein})`.mapWith(Number),
        totalCarbs: sql<number>`sum(${schema.nutritionEntries.carbs})`.mapWith(Number),
        totalFat: sql<number>`sum(${schema.nutritionEntries.fat})`.mapWith(Number),
        totalFiber: sql<number>`sum(${schema.nutritionEntries.fiber})`.mapWith(Number),
        entryCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(schema.nutritionEntries)
      .where(and(
        eq(schema.nutritionEntries.userId, userId),
        gte(schema.nutritionEntries.date, startOfDay),
        lte(schema.nutritionEntries.date, endOfDay)
      ));

    return summary[0] || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      entryCount: 0,
    };
  },
};

// Achievements services
export const achievementsService = {
  async createAchievement(achievementData: schema.InsertAchievement) {
    const db = getDatabase();
    const [achievement] = await db.insert(schema.achievements).values(achievementData).returning();
    return achievement;
  },

  async getAchievementsByUserId(userId: string) {
    const db = getDatabase();
    const achievements = await db.query.achievements.findMany({
      where: eq(schema.achievements.userId, userId),
      orderBy: [desc(schema.achievements.unlockedAt)],
    });
    return achievements;
  },

  async checkAndUnlockAchievements(userId: string) {
    const db = getDatabase();
    // This would contain logic to check various conditions and unlock achievements
    // For now, it's a placeholder for the achievement system
    return [];
  },
};

// Activity logs services
export const activityLogsService = {
  async logActivity(logData: schema.InsertActivityLog) {
    const db = getDatabase();
    const [log] = await db.insert(schema.activityLogs).values(logData).returning();
    return log;
  },

  async getRecentActivities(userId: string, limit = 20) {
    const db = getDatabase();
    const activities = await db.query.activityLogs.findMany({
      where: eq(schema.activityLogs.userId, userId),
      orderBy: [desc(schema.activityLogs.createdAt)],
      limit,
    });
    return activities;
  },
};

// Database health check
export async function checkDatabaseHealth() {
  try {
    const db = getDatabase();
    await db.execute(sql`SELECT 1`);
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Close database connection
export async function closeDatabase() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}
