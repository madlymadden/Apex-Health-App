import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const HABITS = [
  { name: "Morning Workout", icon: "fitness-outline" as const, streak: 12 },
  { name: "10K Steps", icon: "walk-outline" as const, streak: 8 },
  { name: "Drink 3L Water", icon: "water-outline" as const, streak: 15 },
  { name: "8 Hours Sleep", icon: "moon-outline" as const, streak: 5 },
  { name: "Meditate 10min", icon: "leaf-outline" as const, streak: 23 },
  { name: "Protein Goal", icon: "nutrition-outline" as const, streak: 3 },
  { name: "Stretch/Mobility", icon: "body-outline" as const, streak: 9 },
  { name: "No Sugar", icon: "close-circle-outline" as const, streak: 7 },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HEATMAP_DATA = [75, 100, 50, 25, 100, 0, 75];

function getHeatmapColor(pct: number) {
  if (pct === 0) return Colors.charcoal;
  if (pct <= 25) return "#333333";
  if (pct <= 50) return "#666666";
  if (pct <= 75) return "#999999";
  return Colors.white;
}

export default function HabitTrackerScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [completed, setCompleted] = useState<boolean[]>([
    true, true, true, false, true, true, false, false,
  ]);

  const completedCount = completed.filter(Boolean).length;

  const toggleHabit = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCompleted((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: (insets.top || webTopInset) + 16,
          paddingBottom: (insets.bottom || webBottomInset) + 40,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>

          <Text style={styles.title}>Habits</Text>

          <Text style={styles.dateLabel}>THURSDAY, FEB 13</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.scoreSection}>
          <Text style={styles.scoreText}>
            {completedCount}/8{" "}
            <Text style={styles.scoreLabel}>COMPLETED</Text>
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(completedCount / 8) * 100}%` },
              ]}
            />
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionLabel}>TODAY'S HABITS</Text>
          {HABITS.map((habit, i) => (
            <Pressable
              key={habit.name}
              style={styles.habitRow}
              onPress={() => toggleHabit(i)}
            >
              <View style={styles.habitLeft}>
                <Ionicons
                  name={habit.icon}
                  size={20}
                  color={completed[i] ? Colors.white : Colors.muted}
                />
                <View style={styles.habitInfo}>
                  <Text
                    style={[
                      styles.habitName,
                      completed[i] && styles.habitNameCompleted,
                    ]}
                  >
                    {habit.name}
                  </Text>
                  <Text style={styles.streakText}>
                    {habit.streak} DAY STREAK
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleCircle,
                  completed[i] && styles.toggleCircleCompleted,
                ]}
              >
                {completed[i] && (
                  <Ionicons name="checkmark" size={16} color={Colors.deepBlack} />
                )}
              </View>
            </Pressable>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionLabel}>WEEKLY HEATMAP</Text>
          <View style={styles.heatmapRow}>
            {DAYS.map((day, i) => (
              <View key={day} style={styles.heatmapItem}>
                <View
                  style={[
                    styles.heatmapCell,
                    { backgroundColor: getHeatmapColor(HEATMAP_DATA[i]) },
                  ]}
                />
                <Text style={styles.heatmapDay}>{day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionLabel}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            {[
              { label: "BEST STREAK", value: "23 days" },
              { label: "CURRENT STREAK", value: "12 days" },
              { label: "COMPLETION RATE", value: "78%" },
              { label: "TOTAL COMPLETED", value: "1,847" },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Pressable
            style={styles.addButton}
            onPress={() =>
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            }
          >
            <Ionicons name="add" size={18} color={Colors.white} />
            <Text style={styles.addButtonText}>ADD HABIT</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
    marginTop: 20,
    marginBottom: 4,
  },
  dateLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 24,
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreText: {
    fontFamily: "Outfit_300Light",
    fontSize: 28,
    color: Colors.white,
    marginBottom: 10,
  },
  scoreLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 3,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.charcoal,
    width: "100%",
  },
  progressBarFill: {
    height: 4,
    backgroundColor: Colors.white,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitInfo: {
    marginLeft: 14,
  },
  habitName: {
    fontFamily: "Outfit_300Light",
    fontSize: 16,
    color: Colors.muted,
  },
  habitNameCompleted: {
    color: Colors.white,
  },
  streakText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  toggleCircle: {
    width: 28,
    height: 28,
    borderWidth: 1.5,
    borderColor: Colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCircleCompleted: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  heatmapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heatmapItem: {
    alignItems: "center",
  },
  heatmapCell: {
    width: 38,
    height: 38,
    marginBottom: 6,
  },
  heatmapDay: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 1,
  },
  statCard: {
    width: "49%",
    backgroundColor: Colors.charcoal,
    padding: 20,
    marginBottom: 1,
  },
  statValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 24,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.charcoal,
    paddingVertical: 16,
    marginTop: 24,
  },
  addButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 3,
    marginLeft: 8,
  },
});
