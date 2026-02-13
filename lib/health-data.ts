export interface HealthMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  goal: number;
  icon: string;
  color: string;
  trend: number;
}

export interface WorkoutEntry {
  id: string;
  type: string;
  icon: string;
  duration: number;
  calories: number;
  date: string;
  intensity: "low" | "moderate" | "high";
  heartRateAvg: number;
}

export interface WeeklyData {
  day: string;
  value: number;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function generateDailyMetrics(): HealthMetric[] {
  const hour = new Date().getHours();
  const progressFactor = Math.min(hour / 18, 1);

  return [
    {
      id: "steps",
      label: "Steps",
      value: Math.round(randomBetween(6000, 12000) * progressFactor),
      unit: "",
      goal: 10000,
      icon: "walk",
      color: "#C9A96E",
      trend: randomBetween(-5, 12),
    },
    {
      id: "calories",
      label: "Calories",
      value: Math.round(randomBetween(400, 800) * progressFactor),
      unit: "kcal",
      goal: 650,
      icon: "flame",
      color: "#E8453C",
      trend: randomBetween(-3, 15),
    },
    {
      id: "heart",
      label: "Heart Rate",
      value: randomBetween(62, 78),
      unit: "bpm",
      goal: 100,
      icon: "heart",
      color: "#FF6B6B",
      trend: randomBetween(-2, 2),
    },
    {
      id: "active",
      label: "Active Min",
      value: Math.round(randomBetween(20, 60) * progressFactor),
      unit: "min",
      goal: 45,
      icon: "timer",
      color: "#5AC8FA",
      trend: randomBetween(0, 20),
    },
  ];
}

const workoutTypes = [
  { type: "Strength Training", icon: "barbell", intensity: "high" as const },
  { type: "HIIT Circuit", icon: "flash", intensity: "high" as const },
  { type: "Yoga Flow", icon: "leaf", intensity: "low" as const },
  { type: "Cycling", icon: "bicycle", intensity: "moderate" as const },
  { type: "Running", icon: "walk", intensity: "high" as const },
  { type: "Swimming", icon: "water", intensity: "moderate" as const },
  { type: "Pilates", icon: "body", intensity: "moderate" as const },
  { type: "Boxing", icon: "fitness", intensity: "high" as const },
];

export function generateWorkoutHistory(): WorkoutEntry[] {
  const workouts: WorkoutEntry[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const daysAgo = Math.floor(i / 2);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(randomBetween(6, 20), randomBetween(0, 59));

    const wt = workoutTypes[randomBetween(0, workoutTypes.length - 1)];
    workouts.push({
      id: generateId() + i,
      type: wt.type,
      icon: wt.icon,
      duration: randomBetween(25, 75),
      calories: randomBetween(180, 550),
      date: date.toISOString(),
      intensity: wt.intensity,
      heartRateAvg: wt.intensity === "high" ? randomBetween(140, 165) : wt.intensity === "moderate" ? randomBetween(120, 140) : randomBetween(90, 115),
    });
  }

  return workouts;
}

export function generateWeeklyData(metricId: string): WeeklyData[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const ranges: Record<string, [number, number]> = {
    steps: [4000, 14000],
    calories: [300, 850],
    heart: [58, 82],
    active: [15, 70],
  };

  const [min, max] = ranges[metricId] || [0, 100];

  return days.map((day) => ({
    day,
    value: randomBetween(min, max),
  }));
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function getRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h = hours % 12 || 12;
    const m = minutes.toString().padStart(2, "0");
    return `Today, ${h}:${m} ${ampm}`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export interface BodyMetric {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  history: number[];
}

export function generateBodyMetrics(): BodyMetric[] {
  return [
    {
      label: "Weight",
      value: "172.4",
      unit: "lbs",
      trend: "down",
      history: [176.2, 175.8, 175.1, 174.3, 173.8, 173.0, 172.4],
    },
    {
      label: "Body Fat",
      value: "18.2",
      unit: "%",
      trend: "down",
      history: [21.0, 20.4, 19.8, 19.5, 19.0, 18.6, 18.2],
    },
    {
      label: "Muscle Mass",
      value: "141.0",
      unit: "lbs",
      trend: "up",
      history: [136.5, 137.2, 138.0, 138.8, 139.5, 140.2, 141.0],
    },
    {
      label: "Resting HR",
      value: "64",
      unit: "bpm",
      trend: "down",
      history: [72, 70, 68, 67, 66, 65, 64],
    },
    {
      label: "VO2 Max",
      value: "44.2",
      unit: "ml/kg",
      trend: "up",
      history: [38.5, 39.8, 40.5, 41.8, 42.6, 43.4, 44.2],
    },
    {
      label: "Sleep Avg",
      value: "7.4",
      unit: "hrs",
      trend: "stable",
      history: [7.1, 7.3, 7.0, 7.5, 7.2, 7.6, 7.4],
    },
  ];
}
