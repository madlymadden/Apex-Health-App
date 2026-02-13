import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User as DbUser,
} from '../shared/schema';

const STORAGE_KEYS = {
  users: 'native_db_users',
  activityLogs: 'native_db_activity_logs',
  connectedApps: 'native_db_connected_apps',
} as const;

type StoredUser = DbUser;

type WorkoutStatsSummary = {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgHeartRate: number;
};

async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op for demo resilience
  }
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const userService = {
  async createUser(userData: { email: string; passwordHash: string; name: string }) {
    const users = await loadJson<StoredUser[]>(STORAGE_KEYS.users, []);

    const user: StoredUser = {
      id: makeId('user'),
      email: userData.email,
      passwordHash: userData.passwordHash,
      name: userData.name,
      avatar: null,
      gender: null,
      dateOfBirth: null,
      height: null,
      units: 'imperial',
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(user);
    await saveJson(STORAGE_KEYS.users, users);
    return user;
  },

  async getUserById(id: string) {
    const users = await loadJson<StoredUser[]>(STORAGE_KEYS.users, []);
    return users.find((u) => u.id === id) ?? null;
  },

  async getUserByEmail(email: string) {
    const users = await loadJson<StoredUser[]>(STORAGE_KEYS.users, []);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async updateUser(id: string, userData: Partial<{ email: string; passwordHash: string; name: string; avatar: string | null }>) {
    const users = await loadJson<StoredUser[]>(STORAGE_KEYS.users, []);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...userData,
      updatedAt: new Date(),
    };

    await saveJson(STORAGE_KEYS.users, users);
    return users[idx];
  },
};

export const activityLogsService = {
  async logActivity(logData: Record<string, unknown>) {
    const logs = await loadJson<any[]>(STORAGE_KEYS.activityLogs, []);
    const log = {
      id: makeId('log'),
      ...logData,
      createdAt: new Date(),
    };
    logs.push(log);
    await saveJson(STORAGE_KEYS.activityLogs, logs);
    return log;
  },
};

export const connectedAppsService = {
  async connectApp(appData: Record<string, unknown>) {
    const apps = await loadJson<any[]>(STORAGE_KEYS.connectedApps, []);
    const app = {
      id: makeId('app'),
      ...appData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    apps.push(app);
    await saveJson(STORAGE_KEYS.connectedApps, apps);
    return app;
  },

  async getConnectedAppsByUserId(userId: string) {
    const apps = await loadJson<any[]>(STORAGE_KEYS.connectedApps, []);
    return apps.filter((app) => app.userId === userId);
  },

  async updateAppByUserIdAndAppId(userId: string, appId: string, updates: Record<string, unknown>) {
    const apps = await loadJson<any[]>(STORAGE_KEYS.connectedApps, []);
    const idx = apps.findIndex((app) => app.userId === userId && app.appId === appId);

    if (idx === -1) return null;

    apps[idx] = {
      ...apps[idx],
      ...updates,
      updatedAt: new Date(),
    };

    await saveJson(STORAGE_KEYS.connectedApps, apps);
    return apps[idx];
  },
};

export const healthMetricsService = {
  async getMetricsByUserId(_userId: string, _limit = 30) {
    return [] as any[];
  },

  async getMetricsByDateRange(_userId: string, _startDate: Date, _endDate: Date) {
    return [] as any[];
  },
};

export const workoutService = {
  async getWorkoutsByUserId(_userId: string, _limit = 50) {
    return [] as any[];
  },

  async getWorkoutStats(_userId: string, _startDate?: Date, _endDate?: Date): Promise<WorkoutStatsSummary> {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgHeartRate: 0,
    };
  },
};

export const bodyMeasurementsService = {
  async getMeasurementsByUserId(_userId: string, _limit = 50) {
    return [] as any[];
  },
};

export const nutritionService = {
  async getNutritionEntriesByUserId(_userId: string, _limit = 30) {
    return [] as any[];
  },

  async getNutritionByDateRange(_userId: string, _startDate: Date, _endDate: Date) {
    return [] as any[];
  },
};
