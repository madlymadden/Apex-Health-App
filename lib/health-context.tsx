import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getBodyMetrics,
  getGoals,
  saveGoals,
  getUserProfile,
  saveUserProfile,
  getHydration,
  addWater,
  type UserGoals,
  type UserProfile,
  type HydrationData,
} from "./storage";
import {
  generateDailyMetrics,
  type WorkoutEntry,
  type BodyMetric,
  type HealthMetric,
} from "./health-data";

interface HealthContextValue {
  metrics: HealthMetric[];
  workouts: WorkoutEntry[];
  bodyMetrics: BodyMetric[];
  goals: UserGoals;
  profile: UserProfile;
  hydration: HydrationData;
  isLoading: boolean;
  refreshMetrics: () => void;
  addWorkout: (workout: WorkoutEntry) => Promise<void>;
  removeWorkout: (id: string) => Promise<void>;
  updateGoals: (goals: UserGoals) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  refreshWorkouts: () => Promise<void>;
  logWater: (amount?: number) => Promise<void>;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [goals, setGoals] = useState<UserGoals>({
    steps: 10000,
    calories: 650,
    activeMinutes: 45,
    weeklyWorkouts: 5,
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: "Madden Partin",
    memberSince: "2023",
    units: "imperial",
  });
  const [hydration, setHydration] = useState<HydrationData>({
    date: new Date().toDateString(),
    glasses: 0,
    goal: 8,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [w, b, g, p, h] = await Promise.all([
          getWorkouts(),
          getBodyMetrics(),
          getGoals(),
          getUserProfile(),
          getHydration(),
        ]);
        setWorkouts(w);
        setBodyMetrics(b);
        setGoals(g);
        setProfile(p);
        setHydration(h);
        setMetrics(generateDailyMetrics());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshMetrics = useCallback(() => {
    setMetrics(generateDailyMetrics());
  }, []);

  const addWorkout = useCallback(async (workout: WorkoutEntry) => {
    await saveWorkout(workout);
    setWorkouts((prev) => [workout, ...prev]);
  }, []);

  const removeWorkout = useCallback(async (id: string) => {
    await deleteWorkout(id);
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateGoals = useCallback(async (newGoals: UserGoals) => {
    await saveGoals(newGoals);
    setGoals(newGoals);
  }, []);

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    await saveUserProfile(newProfile);
    setProfile(newProfile);
  }, []);

  const refreshWorkouts = useCallback(async () => {
    const w = await getWorkouts();
    setWorkouts(w);
  }, []);

  const logWater = useCallback(async (amount: number = 1) => {
    const updated = await addWater(amount);
    setHydration(updated);
  }, []);

  const value = useMemo(
    () => ({
      metrics,
      workouts,
      bodyMetrics,
      goals,
      profile,
      hydration,
      isLoading,
      refreshMetrics,
      addWorkout,
      removeWorkout,
      updateGoals,
      updateProfile,
      refreshWorkouts,
      logWater,
    }),
    [
      metrics,
      workouts,
      bodyMetrics,
      goals,
      profile,
      hydration,
      isLoading,
      refreshMetrics,
      addWorkout,
      removeWorkout,
      updateGoals,
      updateProfile,
      refreshWorkouts,
      logWater,
    ]
  );

  return (
    <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}
