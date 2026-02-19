import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

type Intensity = "high" | "moderate" | "light";

interface WorkoutEntry {
  type: string;
  duration: number;
  calories: number;
  intensity: Intensity;
}

const WORKOUT_TYPES = [
  { type: "Strength Training", minDur: 30, maxDur: 75, calPerMin: 8 },
  { type: "HIIT", minDur: 20, maxDur: 45, calPerMin: 12 },
  { type: "Running", minDur: 20, maxDur: 60, calPerMin: 10 },
  { type: "Cycling", minDur: 30, maxDur: 90, calPerMin: 7 },
  { type: "Yoga", minDur: 30, maxDur: 60, calPerMin: 4 },
  { type: "Swimming", minDur: 25, maxDur: 60, calPerMin: 9 },
  { type: "Pilates", minDur: 30, maxDur: 50, calPerMin: 5 },
  { type: "Boxing", minDur: 30, maxDur: 60, calPerMin: 11 },
];

const INTENSITIES: Intensity[] = ["high", "moderate", "light"];
const MONTH_NAMES = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateMonthData(year: number, month: number): Record<number, WorkoutEntry[]> {
  const rand = seededRandom(year * 100 + month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data: Record<number, WorkoutEntry[]> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    if (rand() < 0.55) {
      const count = rand() < 0.2 ? 2 : 1;
      const entries: WorkoutEntry[] = [];
      for (let i = 0; i < count; i++) {
        const wt = WORKOUT_TYPES[Math.floor(rand() * WORKOUT_TYPES.length)];
        const duration = Math.floor(rand() * (wt.maxDur - wt.minDur) + wt.minDur);
        const calories = Math.floor(duration * wt.calPerMin * (0.8 + rand() * 0.4));
        const intensity = INTENSITIES[Math.floor(rand() * INTENSITIES.length)];
        entries.push({ type: wt.type, duration, calories, intensity });
      }
      data[d] = entries;
    }
  }
  return data;
}

function intensityColor(intensity: Intensity): string {
  switch (intensity) {
    case "high": return Colors.green;
    case "moderate": return Colors.white;
    case "light": return Colors.muted;
  }
}

function intensityLabel(intensity: Intensity): string {
  switch (intensity) {
    case "high": return "HIGH";
    case "moderate": return "MODERATE";
    case "light": return "LIGHT";
  }
}

export default function TrainingCalendarScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date(2026, 1, 13);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const workoutData = useMemo(() => generateMonthData(currentYear, currentMonth), [currentYear, currentMonth]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const isToday = (day: number) =>
    currentYear === today.getFullYear() && currentMonth === today.getMonth() && day === today.getDate();

  const triggerHaptic = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goToPrevMonth = () => {
    triggerHaptic();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    triggerHaptic();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  const selectDay = (day: number) => {
    triggerHaptic();
    setSelectedDay(day);
  };

  const selectedWorkouts = selectedDay ? workoutData[selectedDay] || [] : [];

  const stats = useMemo(() => {
    let sessions = 0;
    let totalMinutes = 0;
    let intensitySum = 0;
    Object.values(workoutData).forEach((entries) => {
      entries.forEach((e) => {
        sessions++;
        totalMinutes += e.duration;
        intensitySum += e.intensity === "high" ? 3 : e.intensity === "moderate" ? 2 : 1;
      });
    });
    const avgIntensity = sessions > 0 ? intensitySum / sessions : 0;
    let avgLabel = "—";
    if (avgIntensity >= 2.5) avgLabel = "HIGH";
    else if (avgIntensity >= 1.5) avgLabel = "MODERATE";
    else if (sessions > 0) avgLabel = "LIGHT";
    return { sessions, totalMinutes, avgLabel };
  }, [workoutData]);

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <Animated.View entering={FadeIn.duration(800)} style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 20 }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}>
        <View style={styles.header}>
          <Pressable onPress={() => { triggerHaptic(); router.back(); }} hitSlop={12}>
            <Ionicons name="chevron-back" size={20} color={Colors.white} />
          </Pressable>
        </View>

        <Text style={styles.title}>Calendar</Text>

        <View style={styles.monthNav}>
          <Pressable onPress={goToPrevMonth} hitSlop={12}>
            <Ionicons name="chevron-back" size={18} color={Colors.white} />
          </Pressable>
          <Text style={styles.monthLabel}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
          <Pressable onPress={goToNextMonth} hitSlop={12}>
            <Ionicons name="chevron-forward" size={18} color={Colors.white} />
          </Pressable>
        </View>

        <View style={styles.dayHeaders}>
          {DAY_HEADERS.map((d, i) => (
            <Text key={i} style={styles.dayHeaderText}>{d}</Text>
          ))}
        </View>

        <View style={styles.divider} />

        <View style={styles.calendarGrid}>
          {calendarCells.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }
            const hasWorkout = !!workoutData[day];
            const topIntensity = hasWorkout
              ? workoutData[day].reduce((best, e) =>
                  (e.intensity === "high" ? 3 : e.intensity === "moderate" ? 2 : 1) >
                  (best === "high" ? 3 : best === "moderate" ? 2 : 1) ? e.intensity : best,
                workoutData[day][0].intensity)
              : null;
            const isTodayCell = isToday(day);
            const isSelected = selectedDay === day;

            return (
              <Pressable
                key={`day-${day}`}
                style={[
                  styles.dayCell,
                  isTodayCell && styles.todayCell,
                  isSelected && styles.selectedCell,
                ]}
                onPress={() => selectDay(day)}
              >
                <Text style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                  isTodayCell && !isSelected && styles.dayNumberToday,
                ]}>{day}</Text>
                {hasWorkout && topIntensity && (
                  <View style={[styles.dot, { backgroundColor: intensityColor(topIntensity) }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        <View style={styles.selectedSection}>
          <Text style={styles.sectionLabel}>SELECTED DAY</Text>
          {selectedDay ? (
            selectedWorkouts.length > 0 ? (
              selectedWorkouts.map((w, i) => (
                <Animated.View key={i} entering={FadeInDown.delay(i * 100).duration(400)} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={[styles.intensityDot, { backgroundColor: intensityColor(w.intensity) }]} />
                    <Text style={styles.workoutType}>{w.type}</Text>
                    <Text style={styles.intensityTag}>{intensityLabel(w.intensity)}</Text>
                  </View>
                  <View style={styles.workoutStats}>
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{w.duration}</Text>
                      <Text style={styles.workoutStatLabel}>MIN</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.workoutStat}>
                      <Text style={styles.workoutStatValue}>{w.calories}</Text>
                      <Text style={styles.workoutStatLabel}>KCAL</Text>
                    </View>
                  </View>
                </Animated.View>
              ))
            ) : (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.restCard}>
                <Ionicons name="moon-outline" size={20} color={Colors.muted} />
                <Text style={styles.restText}>Rest Day</Text>
              </Animated.View>
            )
          ) : (
            <Text style={styles.noSelectionText}>Tap a day to view workouts</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.monthlyStats}>
          <Text style={styles.sectionLabel}>MONTHLY OVERVIEW</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statBlockValue}>{stats.sessions}</Text>
              <Text style={styles.statBlockLabel}>SESSIONS</Text>
            </View>
            <View style={styles.statVertDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statBlockValue}>{stats.totalMinutes}</Text>
              <Text style={styles.statBlockLabel}>MINUTES</Text>
            </View>
            <View style={styles.statVertDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statBlockValue}>{stats.avgLabel}</Text>
              <Text style={styles.statBlockLabel}>AVG INTENSITY</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
    marginBottom: 32,
  },
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  monthLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeaderText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 2,
    width: `${100 / 7}%` as unknown as number,
    textAlign: "center",
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%` as unknown as number,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: Colors.white,
  },
  selectedCell: {
    backgroundColor: Colors.surface,
  },
  dayNumber: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.white,
  },
  dayNumberSelected: {
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  dayNumberToday: {
    color: Colors.white,
  },
  dot: {
    width: 4,
    height: 4,
    marginTop: 3,
  },
  selectedSection: {
    marginTop: 8,
  },
  sectionLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: Colors.charcoal,
    padding: 16,
    marginBottom: 8,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  intensityDot: {
    width: 6,
    height: 6,
    marginRight: 10,
  },
  workoutType: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: Colors.white,
    flex: 1,
  },
  intensityTag: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
  },
  workoutStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
  },
  workoutStat: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  workoutStatValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 22,
    color: Colors.white,
  },
  workoutStatLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
  },
  restCard: {
    backgroundColor: Colors.charcoal,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  restText: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.muted,
  },
  noSelectionText: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    paddingVertical: 24,
  },
  monthlyStats: {
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.charcoal,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBlock: {
    alignItems: "center",
    flex: 1,
  },
  statBlockValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 20,
    color: Colors.white,
    marginBottom: 4,
  },
  statBlockLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
  },
  statVertDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },
});
