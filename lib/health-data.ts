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
  category: "health" | "fitness" | "nutrition" | "wearable" | "scanner";
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
      id: "apple-workout",
      name: "Apple Workout",
      icon: "fitness",
      category: "fitness",
      connected: true,
      lastSync: new Date(Date.now() - 900000).toISOString(),
      dataTypes: ["Workouts", "Calories", "Heart Rate", "Routes", "Activity Rings"],
      description: "Built-in workout tracking from Apple with GPS routes and heart rate zones",
      accentColor: "#32D74B",
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
      id: "macrofactor",
      name: "MacroFactor",
      icon: "calculator",
      category: "nutrition",
      connected: true,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      dataTypes: ["Macros", "Calories", "Weight Trend", "Expenditure", "Coaching"],
      description: "Science-based macro tracking with adaptive coaching and expenditure algorithm",
      accentColor: "#FF6B35",
    },
    {
      id: "myfitnesspal",
      name: "MyFitnessPal",
      icon: "restaurant",
      category: "nutrition",
      connected: true,
      lastSync: new Date(Date.now() - 4200000).toISOString(),
      dataTypes: ["Meals", "Calories", "Macros", "Barcode Scan", "Recipes"],
      description: "World's largest food database with barcode scanning and meal logging",
      accentColor: "#0070E0",
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
      id: "body-scanner",
      name: "Body Scanner",
      icon: "scan",
      category: "scanner",
      connected: true,
      lastSync: new Date(Date.now() - 172800000).toISOString(),
      dataTypes: ["Weight", "Body Fat", "Muscle Mass", "InBody", "EquiFit"],
      description: "Camera scanner to read weight scales and body composition printouts like InBody or EquiFit",
      accentColor: "#5AC8D4",
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
      id: "garmin",
      name: "Garmin",
      icon: "watch",
      category: "wearable",
      connected: true,
      lastSync: new Date(Date.now() - 300000).toISOString(),
      dataTypes: ["Steps", "Heart Rate", "Sleep", "Body Battery", "VO2 Max", "Activities"],
      description: "Advanced fitness tracking from Garmin wearables with Body Battery and training status",
      accentColor: "#007DC5",
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
    {
      id: "oura",
      name: "Oura Ring",
      icon: "ellipse-outline",
      category: "wearable",
      connected: true,
      lastSync: new Date(Date.now() - 180000).toISOString(),
      dataTypes: ["Readiness", "Sleep", "Activity", "HRV", "Temperature", "SpO2"],
      description: "Sleep and readiness tracking from the Oura Ring with body temperature trends",
      accentColor: "#D4AF37",
    },
    {
      id: "runna",
      name: "Runna",
      icon: "footsteps-outline",
      category: "fitness",
      connected: true,
      lastSync: new Date(Date.now() - 2400000).toISOString(),
      dataTypes: ["Running Plans", "Intervals", "Pace Targets", "Race Prep"],
      description: "Personalized running training plans with structured workouts and race preparation",
      accentColor: "#FF5A5F",
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "distance" | "strength" | "consistency" | "milestone";
  unlocked: boolean;
  unlockedDate?: string;
  progress: number;
  target: number;
  unit: string;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalWorkouts: number;
  totalCalories: number;
  totalMinutes: number;
  avgHeartRate: number;
  personalRecords: { label: string; value: string; previous: string }[];
  dailyActivity: { day: string; calories: number; minutes: number; workouts: number }[];
  topWorkoutType: string;
  consistencyScore: number;
  weekOverWeekChange: number;
  sleepAvg: number;
  stepsAvg: number;
  insights: string[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  frequency: string;
  weeks: number;
  currentWeek: number;
  days: { day: string; workout: string; completed: boolean; exercises?: { name: string; sets: number; reps: string }[] }[];
  category: "strength" | "cardio" | "hybrid" | "flexibility";
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface SleepEntry {
  date: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: number;
  deep: number;
  rem: number;
  light: number;
  awake: number;
  hrAvg: number;
  hrLow: number;
  respiratoryRate: number;
  disturbances: number;
}

export function generateAchievements(): Achievement[] {
  return [
    { id: "a1", title: "First Steps", description: "Complete your first workout", icon: "footsteps", category: "milestone", unlocked: true, unlockedDate: "2024-01-15", progress: 1, target: 1, unit: "workout" },
    { id: "a2", title: "Week Warrior", description: "Work out 5 days in a single week", icon: "calendar", category: "consistency", unlocked: true, unlockedDate: "2024-02-01", progress: 5, target: 5, unit: "days" },
    { id: "a3", title: "Century Club", description: "Complete 100 total workouts", icon: "trophy", category: "milestone", unlocked: true, unlockedDate: "2024-08-20", progress: 100, target: 100, unit: "workouts" },
    { id: "a4", title: "Iron Will", description: "Log 30 consecutive days of activity", icon: "flame", category: "streak", unlocked: true, unlockedDate: "2024-06-12", progress: 30, target: 30, unit: "days" },
    { id: "a5", title: "Calorie Crusher", description: "Burn 50,000 total calories", icon: "flash", category: "milestone", unlocked: true, unlockedDate: "2024-09-15", progress: 50000, target: 50000, unit: "cal" },
    { id: "a6", title: "Marathon Ready", description: "Run a cumulative 26.2 miles in a week", icon: "walk", category: "distance", unlocked: false, progress: 18.4, target: 26.2, unit: "mi" },
    { id: "a7", title: "Heavy Lifter", description: "Log 500 total sets of strength training", icon: "barbell", category: "strength", unlocked: false, progress: 342, target: 500, unit: "sets" },
    { id: "a8", title: "Early Bird", description: "Complete 20 workouts before 7 AM", icon: "sunny", category: "consistency", unlocked: false, progress: 14, target: 20, unit: "workouts" },
    { id: "a9", title: "Perfect Week", description: "Hit all daily goals for 7 consecutive days", icon: "star", category: "consistency", unlocked: false, progress: 4, target: 7, unit: "days" },
    { id: "a10", title: "Endurance Elite", description: "Accumulate 1,000 active minutes in a month", icon: "timer", category: "milestone", unlocked: false, progress: 680, target: 1000, unit: "min" },
    { id: "a11", title: "Step Master", description: "Walk 500,000 total steps", icon: "walk", category: "distance", unlocked: true, unlockedDate: "2024-11-01", progress: 500000, target: 500000, unit: "steps" },
    { id: "a12", title: "Night Owl", description: "Complete 10 workouts after 8 PM", icon: "moon", category: "consistency", unlocked: false, progress: 6, target: 10, unit: "workouts" },
  ];
}

export function generateWeeklyReport(): WeeklyReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    totalWorkouts: randomBetween(4, 7),
    totalCalories: randomBetween(2800, 4500),
    totalMinutes: randomBetween(180, 380),
    avgHeartRate: randomBetween(128, 152),
    personalRecords: [
      { label: "Longest Run", value: "8.2 mi", previous: "7.5 mi" },
      { label: "Max Squat", value: "245 lbs", previous: "225 lbs" },
      { label: "Fastest 5K", value: "22:14", previous: "23:01" },
    ],
    dailyActivity: days.map((day) => ({
      day,
      calories: randomBetween(300, 700),
      minutes: randomBetween(20, 80),
      workouts: randomBetween(0, 2),
    })),
    topWorkoutType: ["Strength Training", "Running", "HIIT Circuit", "Cycling"][randomBetween(0, 3)],
    consistencyScore: randomBetween(72, 96),
    weekOverWeekChange: randomBetween(-8, 18),
    sleepAvg: +(6.5 + Math.random() * 2).toFixed(1),
    stepsAvg: randomBetween(7000, 12000),
    insights: [
      "Your workout consistency improved by 15% compared to last week.",
      "Consider adding more recovery days - your average heart rate is trending higher.",
      "You hit 3 personal records this week. Great progress on strength training.",
      "Sleep quality correlates with your best performance days. Aim for 7.5+ hours.",
    ],
  };
}

export function generateWorkoutPlans(): WorkoutPlan[] {
  return [
    {
      id: "plan1",
      name: "Push Pull Legs",
      description: "Classic 6-day split targeting all major muscle groups with progressive overload",
      frequency: "6x/week",
      weeks: 8,
      currentWeek: 3,
      category: "strength",
      difficulty: "intermediate",
      days: [
        { day: "Monday", workout: "Push A", completed: true, exercises: [
          { name: "Bench Press", sets: 4, reps: "6-8" },
          { name: "Overhead Press", sets: 3, reps: "8-10" },
          { name: "Incline DB Press", sets: 3, reps: "10-12" },
          { name: "Lateral Raises", sets: 3, reps: "12-15" },
          { name: "Tricep Pushdowns", sets: 3, reps: "12-15" },
        ]},
        { day: "Tuesday", workout: "Pull A", completed: true, exercises: [
          { name: "Deadlift", sets: 3, reps: "5" },
          { name: "Barbell Row", sets: 4, reps: "6-8" },
          { name: "Pull-ups", sets: 3, reps: "8-12" },
          { name: "Face Pulls", sets: 3, reps: "15-20" },
          { name: "Barbell Curls", sets: 3, reps: "10-12" },
        ]},
        { day: "Wednesday", workout: "Legs A", completed: true, exercises: [
          { name: "Squat", sets: 4, reps: "6-8" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
          { name: "Leg Press", sets: 3, reps: "10-12" },
          { name: "Leg Curl", sets: 3, reps: "10-12" },
          { name: "Calf Raises", sets: 4, reps: "12-15" },
        ]},
        { day: "Thursday", workout: "Push B", completed: false, exercises: [
          { name: "Overhead Press", sets: 4, reps: "6-8" },
          { name: "Dips", sets: 3, reps: "8-12" },
          { name: "Cable Flyes", sets: 3, reps: "12-15" },
          { name: "Lateral Raises", sets: 4, reps: "12-15" },
          { name: "Overhead Tricep Ext", sets: 3, reps: "10-12" },
        ]},
        { day: "Friday", workout: "Pull B", completed: false, exercises: [
          { name: "Barbell Row", sets: 4, reps: "6-8" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12" },
          { name: "Cable Row", sets: 3, reps: "10-12" },
          { name: "Reverse Flyes", sets: 3, reps: "12-15" },
          { name: "Hammer Curls", sets: 3, reps: "10-12" },
        ]},
        { day: "Saturday", workout: "Legs B", completed: false, exercises: [
          { name: "Front Squat", sets: 4, reps: "6-8" },
          { name: "Hip Thrust", sets: 3, reps: "10-12" },
          { name: "Walking Lunges", sets: 3, reps: "12/leg" },
          { name: "Leg Extension", sets: 3, reps: "12-15" },
          { name: "Calf Raises", sets: 4, reps: "12-15" },
        ]},
      ],
    },
    {
      id: "plan2",
      name: "5K Training",
      description: "8-week progressive running program to improve your 5K time",
      frequency: "4x/week",
      weeks: 8,
      currentWeek: 5,
      category: "cardio",
      difficulty: "beginner",
      days: [
        { day: "Monday", workout: "Easy Run", completed: true, exercises: [{ name: "Easy pace 3 mi", sets: 1, reps: "30 min" }] },
        { day: "Wednesday", workout: "Tempo Run", completed: true, exercises: [{ name: "Warmup 1 mi + Tempo 2 mi + Cooldown 1 mi", sets: 1, reps: "35 min" }] },
        { day: "Friday", workout: "Intervals", completed: false, exercises: [{ name: "8x400m @ 5K pace, 90s rest", sets: 1, reps: "40 min" }] },
        { day: "Sunday", workout: "Long Run", completed: false, exercises: [{ name: "Easy pace 5 mi", sets: 1, reps: "50 min" }] },
      ],
    },
    {
      id: "plan3",
      name: "Morning Mobility",
      description: "Daily 20-minute flexibility and mobility routine",
      frequency: "Daily",
      weeks: 4,
      currentWeek: 2,
      category: "flexibility",
      difficulty: "beginner",
      days: [
        { day: "Daily", workout: "Full Body Mobility", completed: false, exercises: [
          { name: "Cat-Cow Stretch", sets: 2, reps: "10" },
          { name: "World's Greatest Stretch", sets: 2, reps: "5/side" },
          { name: "Hip 90-90s", sets: 2, reps: "8/side" },
          { name: "Thoracic Rotations", sets: 2, reps: "8/side" },
          { name: "Ankle Circles", sets: 2, reps: "10/side" },
        ]},
      ],
    },
  ];
}

export function generateSleepData(): SleepEntry[] {
  const now = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const bedHour = randomBetween(21, 23);
    const bedMin = randomBetween(0, 59);
    const wakeHour = randomBetween(5, 7);
    const wakeMin = randomBetween(0, 59);
    const totalMin = (24 - bedHour + wakeHour) * 60 + (wakeMin - bedMin);
    const deep = Math.round(totalMin * (0.13 + Math.random() * 0.1));
    const rem = Math.round(totalMin * (0.18 + Math.random() * 0.08));
    const awake = randomBetween(8, 30);
    const quality = totalMin > 440 ? randomBetween(80, 96) : totalMin > 380 ? randomBetween(60, 82) : randomBetween(40, 65);

    return {
      date: d.toISOString(),
      bedtime: `${bedHour}:${bedMin.toString().padStart(2, "0")}`,
      wakeTime: `${wakeHour}:${wakeMin.toString().padStart(2, "0")}`,
      duration: totalMin,
      quality,
      deep,
      rem,
      light: totalMin - deep - rem - awake,
      awake,
      hrAvg: randomBetween(52, 62),
      hrLow: randomBetween(44, 54),
      respiratoryRate: +(13 + Math.random() * 4).toFixed(1),
      disturbances: randomBetween(1, 6),
    };
  });
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

export interface EquinoxLocation {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  distance: string;
  tier: "Equinox" | "Equinox+" | "E by Equinox";
  amenities: string[];
  isFavorite: boolean;
}

export interface EquinoxClass {
  id: string;
  name: string;
  category: "strength" | "cardio" | "flexibility" | "mind-body" | "cycle" | "pilates" | "boxing" | "recovery";
  instructor: string;
  time: string;
  duration: number;
  locationId: string;
  spotsLeft: number;
  intensity: "low" | "moderate" | "high" | "max";
  matchScore: number;
  matchReason: string;
  icon: string;
  amenityTags: string[];
}

export interface EquinoxAmenity {
  id: string;
  name: string;
  icon: string;
  available: boolean;
  locationId: string;
}

export type DayType = "workout" | "recovery" | "rest";

export function getUserDayType(): { type: DayType; recoveryScore: number; recentWorkouts: number; restDays: number } {
  const recoveryScore = randomBetween(55, 95);
  const recentWorkouts = randomBetween(2, 5);
  const restDays = randomBetween(0, 2);

  let type: DayType;
  if (recoveryScore >= 80 && restDays >= 1) {
    type = "workout";
  } else if (recoveryScore >= 60) {
    type = "recovery";
  } else {
    type = "rest";
  }

  return { type, recoveryScore, recentWorkouts, restDays };
}

export function generateEquinoxLocations(): EquinoxLocation[] {
  return [
    {
      id: "eq-bk-wburg",
      name: "Equinox Williamsburg",
      neighborhood: "Williamsburg",
      city: "Brooklyn",
      distance: "0.4 mi",
      tier: "Equinox",
      amenities: ["Pool", "Steam", "Sauna", "Eucalyptus Towels", "Kiehl's"],
      isFavorite: true,
    },
    {
      id: "eq-bk-heights",
      name: "Equinox Brooklyn Heights",
      neighborhood: "Brooklyn Heights",
      city: "Brooklyn",
      distance: "1.8 mi",
      tier: "Equinox+",
      amenities: ["Pool", "Steam", "Sauna", "Cold Plunge", "Spa", "Juice Bar", "Eucalyptus Towels"],
      isFavorite: true,
    },
    {
      id: "eq-dumbo",
      name: "Equinox DUMBO",
      neighborhood: "DUMBO",
      city: "Brooklyn",
      distance: "2.1 mi",
      tier: "Equinox",
      amenities: ["Steam", "Sauna", "Eucalyptus Towels", "Kiehl's"],
      isFavorite: false,
    },
    {
      id: "eq-soho",
      name: "Equinox SoHo",
      neighborhood: "SoHo",
      city: "Manhattan",
      distance: "3.4 mi",
      tier: "Equinox+",
      amenities: ["Pool", "Steam", "Sauna", "Cold Plunge", "Spa", "Juice Bar", "Body Lab"],
      isFavorite: false,
    },
    {
      id: "eq-gramercy",
      name: "Equinox Gramercy",
      neighborhood: "Gramercy",
      city: "Manhattan",
      distance: "4.1 mi",
      tier: "Equinox",
      amenities: ["Steam", "Sauna", "Eucalyptus Towels"],
      isFavorite: false,
    },
    {
      id: "eq-hudson-yards",
      name: "Equinox Hudson Yards",
      neighborhood: "Hudson Yards",
      city: "Manhattan",
      distance: "5.2 mi",
      tier: "E by Equinox",
      amenities: ["Pool", "Steam", "Sauna", "Cold Plunge", "Spa", "Juice Bar", "Body Lab", "Rooftop", "Hotel"],
      isFavorite: true,
    },
  ];
}

function getAmenityTagsForClass(cls: { name: string; category: string; intensity: string }): string[] {
  const tags: string[] = [];
  const n = cls.name.toLowerCase();
  if (n.includes("reformer") || cls.category === "pilates") tags.push("REFORMER");
  if (n.includes("yoga") || n.includes("vinyasa") || n.includes("yin")) tags.push("HEATED");
  if (n.includes("yin") || n.includes("regenerate") || n.includes("restore")) tags.push("SOUND BATH");
  if (cls.category === "cycle" || n.includes("ride") || n.includes("pursuit")) tags.push("STADIUM SEATING");
  if (cls.category === "boxing") tags.push("AQUA BAG");
  if (cls.intensity === "max") tags.push("PERFORMANCE");
  if (n.includes("hiit") || n.includes("metcon") || n.includes("tabata")) tags.push("HEART RATE");
  if (n.includes("run") || n.includes("precision")) tags.push("WOODWAY");
  if (n.includes("sculpt")) tags.push("DUMBBELLS");
  if (cls.category === "recovery") tags.push("MEDITATION");
  return tags.slice(0, 3);
}

function getClassesForDayType(dayType: DayType, recoveryScore: number, recentWorkouts: number, restDays: number): EquinoxClass[] {
  const allClasses: Omit<EquinoxClass, "amenityTags">[] = [
    { id: "c1", name: "Precision Run", category: "cardio", instructor: "Marcus T.", time: "6:00 AM", duration: 45, locationId: "eq-bk-wburg", spotsLeft: 4, intensity: "high", matchScore: 0, matchReason: "", icon: "speedometer-outline" },
    { id: "c2", name: "Sculpt", category: "strength", instructor: "Jade W.", time: "7:15 AM", duration: 50, locationId: "eq-bk-wburg", spotsLeft: 8, intensity: "moderate", matchScore: 0, matchReason: "", icon: "barbell-outline" },
    { id: "c3", name: "Vinyasa Flow", category: "mind-body", instructor: "Sara L.", time: "8:30 AM", duration: 60, locationId: "eq-bk-wburg", spotsLeft: 12, intensity: "low", matchScore: 0, matchReason: "", icon: "leaf-outline" },
    { id: "c4", name: "The Pursuit", category: "cycle", instructor: "Derek M.", time: "6:30 AM", duration: 45, locationId: "eq-bk-heights", spotsLeft: 2, intensity: "max", matchScore: 0, matchReason: "", icon: "bicycle-outline" },
    { id: "c5", name: "Pilates Reformer", category: "pilates", instructor: "Nina K.", time: "9:00 AM", duration: 55, locationId: "eq-bk-heights", spotsLeft: 3, intensity: "moderate", matchScore: 0, matchReason: "", icon: "body-outline" },
    { id: "c6", name: "Boxing", category: "boxing", instructor: "Kai R.", time: "12:00 PM", duration: 45, locationId: "eq-bk-wburg", spotsLeft: 6, intensity: "high", matchScore: 0, matchReason: "", icon: "hand-left-outline" },
    { id: "c7", name: "Stretch & Restore", category: "recovery", instructor: "Elena V.", time: "10:00 AM", duration: 30, locationId: "eq-bk-wburg", spotsLeft: 15, intensity: "low", matchScore: 0, matchReason: "", icon: "fitness-outline" },
    { id: "c8", name: "HIIT", category: "cardio", instructor: "Marcus T.", time: "5:30 PM", duration: 40, locationId: "eq-dumbo", spotsLeft: 5, intensity: "max", matchScore: 0, matchReason: "", icon: "flash-outline" },
    { id: "c9", name: "Tabata", category: "cardio", instructor: "Chris P.", time: "7:00 AM", duration: 30, locationId: "eq-soho", spotsLeft: 7, intensity: "high", matchScore: 0, matchReason: "", icon: "timer-outline" },
    { id: "c10", name: "Yin Yoga", category: "mind-body", instructor: "Sara L.", time: "8:00 PM", duration: 60, locationId: "eq-bk-heights", spotsLeft: 18, intensity: "low", matchScore: 0, matchReason: "", icon: "moon-outline" },
    { id: "c11", name: "Barre Burn", category: "pilates", instructor: "Nina K.", time: "11:00 AM", duration: 50, locationId: "eq-soho", spotsLeft: 4, intensity: "moderate", matchScore: 0, matchReason: "", icon: "body-outline" },
    { id: "c12", name: "Metcon3", category: "strength", instructor: "Jade W.", time: "6:00 PM", duration: 45, locationId: "eq-bk-wburg", spotsLeft: 3, intensity: "high", matchScore: 0, matchReason: "", icon: "barbell-outline" },
    { id: "c13", name: "Regenerate", category: "recovery", instructor: "Elena V.", time: "2:00 PM", duration: 45, locationId: "eq-bk-heights", spotsLeft: 20, intensity: "low", matchScore: 0, matchReason: "", icon: "water-outline" },
    { id: "c14", name: "Power Yoga", category: "mind-body", instructor: "Sara L.", time: "7:30 AM", duration: 60, locationId: "eq-hudson-yards", spotsLeft: 10, intensity: "moderate", matchScore: 0, matchReason: "", icon: "leaf-outline" },
    { id: "c15", name: "Athletic Stretch", category: "recovery", instructor: "Elena V.", time: "4:00 PM", duration: 30, locationId: "eq-gramercy", spotsLeft: 14, intensity: "low", matchScore: 0, matchReason: "", icon: "fitness-outline" },
    { id: "c16", name: "Ride", category: "cycle", instructor: "Derek M.", time: "5:45 AM", duration: 45, locationId: "eq-hudson-yards", spotsLeft: 1, intensity: "high", matchScore: 0, matchReason: "", icon: "bicycle-outline" },
  ];

  const recoveryNorm = recoveryScore / 100;
  const workloadPenalty = Math.min(recentWorkouts * 4, 20);
  const restBonus = restDays * 8;

  const scored = allClasses.map((cls) => {
    let score = 40;
    let reasonParts: string[] = [];

    if (dayType === "workout") {
      if (cls.intensity === "max") {
        score += Math.round(recoveryNorm * 35);
        reasonParts.push("recovery is high, perfect for max intensity");
      } else if (cls.intensity === "high") {
        score += Math.round(recoveryNorm * 30);
        reasonParts.push("recovery supports high-intensity training");
      } else if (cls.intensity === "moderate") {
        score += Math.round(recoveryNorm * 18);
        reasonParts.push("solid moderate option on a push day");
      } else {
        score -= 5;
        reasonParts.push("you\u2019re recovered \u2014 consider pushing harder");
      }
      score += restBonus;
      if (restDays >= 2) reasonParts.push(`${restDays} rest days banked`);
    } else if (dayType === "recovery") {
      if (cls.intensity === "low") {
        score += 30 + Math.round((1 - recoveryNorm) * 15);
        reasonParts.push("gentle movement aids recovery");
      } else if (cls.intensity === "moderate") {
        score += 10;
        reasonParts.push("moderate load \u2014 listen to your body");
      } else {
        score -= 15 - Math.round(recoveryNorm * 5);
        reasonParts.push("save intensity for when you\u2019re recovered");
      }
      if (cls.category === "recovery" || cls.category === "mind-body") {
        score += 20;
        reasonParts = ["ideal for your active recovery day"];
      }
      score -= workloadPenalty;
      if (recentWorkouts >= 4) reasonParts.push(`${recentWorkouts} recent sessions \u2014 ease off`);
    } else {
      if (cls.category === "recovery" || cls.category === "mind-body") {
        score += 35;
        reasonParts.push("restorative movement for rest day");
      } else if (cls.intensity === "low") {
        score += 15;
        reasonParts.push("light activity keeps you mobile");
      } else {
        score -= 25;
        reasonParts.push("your body needs rest \u2014 skip high intensity");
      }
      score -= workloadPenalty;
    }

    if (cls.spotsLeft <= 3) { score += 5; reasonParts.push("filling up fast"); }
    if (cls.spotsLeft === 1) { score += 3; reasonParts.push("last spot"); }

    if (cls.duration <= 30) score += 3;
    if (cls.duration >= 60 && dayType !== "workout") score -= 3;

    const finalScore = Math.min(Math.max(Math.round(score), 10), 98);
    const reason = `${finalScore}% match \u2014 ${reasonParts[0] || "based on your current state"}`;
    const amenityTags = getAmenityTagsForClass(cls);

    return { ...cls, matchScore: finalScore, matchReason: reason, amenityTags } as EquinoxClass;
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}

export function generateEquinoxRecommendations(): {
  dayType: DayType;
  recoveryScore: number;
  recentWorkouts: number;
  restDays: number;
  classes: EquinoxClass[];
  locations: EquinoxLocation[];
} {
  const userDay = getUserDayType();
  const classes = getClassesForDayType(userDay.type, userDay.recoveryScore, userDay.recentWorkouts, userDay.restDays);
  const locations = generateEquinoxLocations();

  return {
    ...userDay,
    classes,
    locations,
  };
}
