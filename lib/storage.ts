import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  generateDailyMetrics,
  generateWorkoutHistory,
  generateBodyMetrics,
  type WorkoutEntry,
  type BodyMetric,
} from "./health-data";

const KEYS = {
  WORKOUTS: "@vitality_workouts",
  BODY_METRICS: "@vitality_body_metrics",
  GOALS: "@vitality_goals",
  ONBOARDING_DONE: "@vitality_onboarding_done",
  USER_PROFILE: "@vitality_user_profile",
};

export interface UserGoals {
  steps: number;
  calories: number;
  activeMinutes: number;
  weeklyWorkouts: number;
}

export interface UserProfile {
  name: string;
  memberSince: string;
  units: "imperial" | "metric";
}

const DEFAULT_GOALS: UserGoals = {
  steps: 10000,
  calories: 650,
  activeMinutes: 45,
  weeklyWorkouts: 5,
};

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex Morgan",
  memberSince: "2023",
  units: "imperial",
};

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUTS);
    if (data) return JSON.parse(data);
    const initial = generateWorkoutHistory();
    await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(initial));
    return initial;
  } catch {
    return generateWorkoutHistory();
  }
}

export async function saveWorkout(workout: WorkoutEntry): Promise<void> {
  const workouts = await getWorkouts();
  workouts.unshift(workout);
  await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  const filtered = workouts.filter((w) => w.id !== id);
  await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(filtered));
}

export async function getBodyMetrics(): Promise<BodyMetric[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BODY_METRICS);
    if (data) return JSON.parse(data);
    const initial = generateBodyMetrics();
    await AsyncStorage.setItem(KEYS.BODY_METRICS, JSON.stringify(initial));
    return initial;
  } catch {
    return generateBodyMetrics();
  }
}

export async function getGoals(): Promise<UserGoals> {
  try {
    const data = await AsyncStorage.getItem(KEYS.GOALS);
    if (data) return JSON.parse(data);
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
    return DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

export async function saveGoals(goals: UserGoals): Promise<void> {
  await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (data) return JSON.parse(data);
    await AsyncStorage.setItem(
      KEYS.USER_PROFILE,
      JSON.stringify(DEFAULT_PROFILE)
    );
    return DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function isOnboardingDone(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
    return data === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}
