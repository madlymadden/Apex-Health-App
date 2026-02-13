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
      color: "#FFFFFF",
      trend: randomBetween(-5, 12),
    },
    {
      id: "calories",
      label: "Calories",
      value: Math.round(randomBetween(400, 800) * progressFactor),
      unit: "kcal",
      goal: 650,
      icon: "flame",
      color: "#D94848",
      trend: randomBetween(-3, 15),
    },
    {
      id: "heart",
      label: "Heart Rate",
      value: randomBetween(62, 78),
      unit: "bpm",
      goal: 100,
      icon: "heart",
      color: "#D94848",
      trend: randomBetween(-2, 2),
    },
    {
      id: "active",
      label: "Active Min",
      value: Math.round(randomBetween(20, 60) * progressFactor),
      unit: "min",
      goal: 45,
      icon: "timer",
      color: "#5AC8D4",
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

export interface ConnectedApp {
  id: string;
  name: string;
  icon: string;
  category: "health" | "fitness" | "nutrition" | "wearable";
  connected: boolean;
  lastSync?: string;
  dataTypes: string[];
  description: string;
  accentColor: string;
}

export interface AppleHealthData {
  vitals: { label: string; value: string; unit: string; time: string }[];
  sleep: { date: string; duration: number; quality: "poor" | "fair" | "good" | "excellent"; deep: number; rem: number; light: number; awake: number }[];
  nutrition: { label: string; value: number; unit: string; goal: number }[];
  activity: { date: string; calories: number; steps: number; distance: number; flights: number }[];
}

export interface StravaActivity {
  id: string;
  name: string;
  type: string;
  date: string;
  distance: number;
  duration: number;
  elevation: number;
  avgPace: string;
  avgHR: number;
  calories: number;
  imported: boolean;
}

export interface ImportableWorkout {
  id: string;
  source: string;
  name: string;
  type: string;
  date: string;
  duration: number;
  exercises?: { name: string; sets: number; reps: string; weight: string }[];
  calories?: number;
  imported: boolean;
}

export interface NutritionEntry {
  id: string;
  source: string;
  meal: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
  imported: boolean;
}

export function generateConnectedApps(): ConnectedApp[] {
  return [
    {
      id: "apple-health",
      name: "Apple Health",
      icon: "heart",
      category: "health",
      connected: true,
      lastSync: new Date(Date.now() - 120000).toISOString(),
      dataTypes: ["Steps", "Heart Rate", "Sleep", "Nutrition", "Vitals", "Activity"],
      description: "Comprehensive health data from your iPhone and Apple Watch",
      accentColor: "#FF2D55",
    },
    {
      id: "strava",
      name: "Strava",
      icon: "bicycle",
      category: "fitness",
      connected: true,
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      dataTypes: ["Running", "Cycling", "Swimming", "Hiking"],
      description: "GPS activity tracking for runners and cyclists",
      accentColor: "#FC4C02",
    },
    {
      id: "hevy",
      name: "Hevy",
      icon: "barbell",
      category: "fitness",
      connected: true,
      lastSync: new Date(Date.now() - 7200000).toISOString(),
      dataTypes: ["Strength Training", "Sets", "Reps", "PRs"],
      description: "Strength training workout tracker with exercise history",
      accentColor: "#6C63FF",
    },
    {
      id: "strong",
      name: "Strong",
      icon: "fitness",
      category: "fitness",
      connected: false,
      dataTypes: ["Strength Training", "Body Weight", "Templates"],
      description: "Simple and powerful workout tracker for the gym",
      accentColor: "#2196F3",
    },
    {
      id: "nutrifactor",
      name: "NutriFactor",
      icon: "nutrition",
      category: "nutrition",
      connected: true,
      lastSync: new Date(Date.now() - 5400000).toISOString(),
      dataTypes: ["Meals", "Macros", "Micronutrients", "Water"],
      description: "AI-powered nutrition tracking with barcode scanning",
      accentColor: "#4CAF50",
    },
    {
      id: "sweetgreen",
      name: "Sweetgreen",
      icon: "leaf",
      category: "nutrition",
      connected: true,
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      dataTypes: ["Orders", "Calories", "Ingredients", "Macros"],
      description: "Automatic meal logging from your Sweetgreen orders",
      accentColor: "#2E7D32",
    },
    {
      id: "apple-watch",
      name: "Apple Watch",
      icon: "watch",
      category: "wearable",
      connected: true,
      lastSync: new Date(Date.now() - 60000).toISOString(),
      dataTypes: ["Heart Rate", "ECG", "Blood Oxygen", "Activity"],
      description: "Real-time health monitoring from your wrist",
      accentColor: "#FFFFFF",
    },
    {
      id: "whoop",
      name: "WHOOP",
      icon: "pulse",
      category: "wearable",
      connected: false,
      dataTypes: ["Strain", "Recovery", "Sleep", "HRV"],
      description: "Performance optimization with strain and recovery metrics",
      accentColor: "#00B388",
    },
  ];
}

export function generateAppleHealthData(): AppleHealthData {
  const now = new Date();
  return {
    vitals: [
      { label: "Heart Rate", value: `${randomBetween(62, 78)}`, unit: "bpm", time: `${randomBetween(1, 15)} min ago` },
      { label: "Blood Pressure", value: `${randomBetween(115, 125)}/${randomBetween(72, 82)}`, unit: "mmHg", time: "8:30 AM" },
      { label: "Blood Oxygen", value: `${randomBetween(96, 99)}`, unit: "%", time: `${randomBetween(5, 30)} min ago` },
      { label: "Body Temperature", value: `${(97.5 + Math.random() * 1.5).toFixed(1)}`, unit: "°F", time: "6:45 AM" },
      { label: "Respiratory Rate", value: `${randomBetween(14, 18)}`, unit: "br/min", time: "During sleep" },
      { label: "HRV", value: `${randomBetween(38, 65)}`, unit: "ms", time: "Last night" },
    ],
    sleep: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const total = randomBetween(380, 480);
      const deep = Math.round(total * (0.15 + Math.random() * 0.1));
      const rem = Math.round(total * (0.2 + Math.random() * 0.05));
      const awake = randomBetween(10, 35);
      return {
        date: d.toISOString(),
        duration: total,
        quality: (total > 440 ? "excellent" : total > 400 ? "good" : total > 360 ? "fair" : "poor") as "poor" | "fair" | "good" | "excellent",
        deep,
        rem,
        light: total - deep - rem - awake,
        awake,
      };
    }),
    nutrition: [
      { label: "Calories", value: randomBetween(1400, 2200), unit: "kcal", goal: 2200 },
      { label: "Protein", value: randomBetween(80, 160), unit: "g", goal: 150 },
      { label: "Carbs", value: randomBetween(150, 280), unit: "g", goal: 250 },
      { label: "Fat", value: randomBetween(40, 90), unit: "g", goal: 75 },
      { label: "Fiber", value: randomBetween(15, 35), unit: "g", goal: 30 },
      { label: "Water", value: randomBetween(40, 80), unit: "oz", goal: 64 },
    ],
    activity: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return {
        date: d.toISOString(),
        calories: randomBetween(350, 750),
        steps: randomBetween(5000, 14000),
        distance: +(randomBetween(20, 70) / 10).toFixed(1),
        flights: randomBetween(3, 18),
      };
    }),
  };
}

export function generateStravaActivities(): StravaActivity[] {
  const types = ["Run", "Ride", "Swim", "Hike", "Walk", "Trail Run"];
  const names: Record<string, string[]> = {
    Run: ["Morning Run", "Evening Run", "Tempo Run", "Easy Recovery Run", "Long Run", "Interval Session"],
    Ride: ["Morning Ride", "Hill Climb", "Recovery Spin", "Century Prep", "Commute"],
    Swim: ["Pool Laps", "Open Water Swim", "Drill Session"],
    Hike: ["Trail Hike", "Mountain Loop", "Sunset Hike"],
    Walk: ["Evening Walk", "Lunch Walk"],
    "Trail Run": ["Trail Run", "Mountain Trail", "Forest Loop"],
  };
  const now = new Date();
  return Array.from({ length: 15 }, (_, i) => {
    const type = types[randomBetween(0, types.length - 1)];
    const nameList = names[type] || [type];
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(i * 0.8));
    d.setHours(randomBetween(5, 19), randomBetween(0, 59));
    const duration = type === "Ride" ? randomBetween(40, 120) : type === "Hike" ? randomBetween(60, 180) : randomBetween(20, 75);
    const distance = type === "Ride" ? +(randomBetween(80, 400) / 10).toFixed(1) : type === "Swim" ? +(randomBetween(8, 30) / 10).toFixed(1) : +(randomBetween(20, 100) / 10).toFixed(1);
    const paceMin = Math.floor(duration / distance);
    const paceSec = Math.round(((duration / distance) - paceMin) * 60);
    return {
      id: generateId() + i,
      name: nameList[randomBetween(0, nameList.length - 1)],
      type,
      date: d.toISOString(),
      distance,
      duration,
      elevation: type === "Ride" || type === "Hike" || type === "Trail Run" ? randomBetween(100, 800) : randomBetween(10, 120),
      avgPace: `${paceMin}:${paceSec.toString().padStart(2, "0")}`,
      avgHR: randomBetween(130, 165),
      calories: randomBetween(200, 700),
      imported: i < 3,
    };
  });
}

export function generateImportableWorkouts(): ImportableWorkout[] {
  const now = new Date();
  const exercises = [
    { name: "Bench Press", sets: 4, reps: "8-10", weight: "185 lbs" },
    { name: "Squat", sets: 5, reps: "5", weight: "225 lbs" },
    { name: "Deadlift", sets: 3, reps: "5", weight: "275 lbs" },
    { name: "Overhead Press", sets: 4, reps: "6-8", weight: "115 lbs" },
    { name: "Pull-ups", sets: 4, reps: "8-12", weight: "BW+25" },
    { name: "Barbell Row", sets: 4, reps: "8", weight: "155 lbs" },
    { name: "Romanian Deadlift", sets: 3, reps: "10", weight: "185 lbs" },
    { name: "Incline DB Press", sets: 3, reps: "10", weight: "70 lbs" },
    { name: "Lat Pulldown", sets: 3, reps: "12", weight: "140 lbs" },
    { name: "Leg Press", sets: 4, reps: "10", weight: "360 lbs" },
  ];
  const workoutNames = [
    "Push Day A", "Pull Day A", "Leg Day", "Upper Body", "Lower Body",
    "Full Body", "Push Day B", "Pull Day B", "Arms & Shoulders", "Back & Bis",
  ];
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(i * 0.7));
    d.setHours(randomBetween(6, 19), randomBetween(0, 59));
    const numEx = randomBetween(4, 6);
    const startIdx = randomBetween(0, exercises.length - numEx);
    return {
      id: generateId() + "hw" + i,
      source: i % 3 === 0 ? "Strong" : "Hevy",
      name: workoutNames[i % workoutNames.length],
      type: "Strength Training",
      date: d.toISOString(),
      duration: randomBetween(45, 80),
      exercises: exercises.slice(startIdx, startIdx + numEx),
      calories: randomBetween(250, 500),
      imported: i < 2,
    };
  });
}

export function generateNutritionEntries(): NutritionEntry[] {
  const now = new Date();
  const sweetgreenMeals = [
    { meal: "Harvest Bowl", items: ["Roasted Chicken", "Wild Rice", "Apples", "Sweet Potatoes", "Balsamic Vinaigrette"], cal: 620, p: 42, c: 58, f: 24 },
    { meal: "Kale Caesar", items: ["Baby Kale", "Parmesan", "Tomatoes", "Chicken", "Caesar Dressing"], cal: 480, p: 38, c: 22, f: 28 },
    { meal: "Guacamole Greens", items: ["Mesclun", "Avocado", "Black Beans", "Corn", "Lime Cilantro Jalape\u00f1o"], cal: 540, p: 18, c: 52, f: 32 },
    { meal: "Shroomami", items: ["Warm Wild Rice", "Roasted Mushrooms", "Tofu", "Miso Sesame Ginger"], cal: 490, p: 22, c: 48, f: 26 },
  ];
  const nutriMeals = [
    { meal: "Breakfast", items: ["Greek Yogurt", "Granola", "Blueberries", "Honey"], cal: 380, p: 24, c: 48, f: 12 },
    { meal: "Lunch", items: ["Grilled Chicken Salad", "Quinoa", "Avocado", "Lemon Dressing"], cal: 520, p: 38, c: 42, f: 22 },
    { meal: "Dinner", items: ["Salmon Fillet", "Brown Rice", "Asparagus", "Olive Oil"], cal: 580, p: 44, c: 38, f: 26 },
    { meal: "Snack", items: ["Protein Bar", "Almonds"], cal: 280, p: 22, c: 28, f: 14 },
    { meal: "Post-Workout", items: ["Whey Protein Shake", "Banana", "Peanut Butter"], cal: 420, p: 36, c: 42, f: 16 },
  ];
  const entries: NutritionEntry[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - Math.floor(i / 2));
    const isSweetgreen = i % 3 === 0;
    const source = isSweetgreen ? "Sweetgreen" : "NutriFactor";
    const pool = isSweetgreen ? sweetgreenMeals : nutriMeals;
    const m = pool[randomBetween(0, pool.length - 1)];
    d.setHours(isSweetgreen ? 12 : randomBetween(7, 20), randomBetween(0, 59));
    entries.push({
      id: generateId() + "nt" + i,
      source,
      meal: m.meal,
      date: d.toISOString(),
      calories: m.cal + randomBetween(-30, 30),
      protein: m.p + randomBetween(-5, 5),
      carbs: m.c + randomBetween(-5, 5),
      fat: m.f + randomBetween(-3, 3),
      items: m.items,
      imported: i < 4,
    });
  }
  return entries;
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
