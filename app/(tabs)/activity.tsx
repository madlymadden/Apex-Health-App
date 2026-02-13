import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  generateWorkoutHistory,
  formatDuration,
  getRelativeDate,
  type WorkoutEntry,
} from "@/lib/health-data";

function WorkoutRow({ workout }: { workout: WorkoutEntry }) {
  const intensityColor =
    workout.intensity === "high"
      ? Colors.red
      : workout.intensity === "moderate"
      ? Colors.white
      : Colors.muted;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.workoutRow,
        pressed && { opacity: 0.5 },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
    >
      <View style={styles.workoutLeft}>
        <View style={[styles.intensityDot, { backgroundColor: intensityColor }]} />
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutType}>{workout.type}</Text>
          <Text style={styles.workoutDate}>{getRelativeDate(workout.date)}</Text>
        </View>
      </View>

      <View style={styles.workoutStats}>
        <View style={styles.workoutStat}>
          <Text style={styles.workoutStatValue}>
            {formatDuration(workout.duration)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.workoutStat}>
          <Text style={styles.workoutStatValue}>{workout.calories}</Text>
          <Text style={styles.workoutStatUnit}>cal</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.workoutStat}>
          <Text style={styles.workoutStatValue}>{workout.heartRateAvg}</Text>
          <Text style={styles.workoutStatUnit}>bpm</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setWorkouts(generateWorkoutHistory());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimeout(() => {
      setWorkouts(generateWorkoutHistory());
      setRefreshing(false);
    }, 800);
  }, []);

  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgHR = workouts.length
    ? Math.round(
        workouts.reduce((sum, w) => sum + w.heartRateAvg, 0) / workouts.length
      )
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 20,
            paddingBottom: 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.white}
          />
        }
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={styles.screenTitle}>Activity</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>TOTAL CAL</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {formatDuration(totalMinutes)}
              </Text>
              <Text style={styles.summaryLabel}>DURATION</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{avgHR}</Text>
              <Text style={styles.summaryLabel}>AVG HR</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RECENT</Text>
            <Text style={styles.sessionCount}>
              {workouts.length} SESSIONS
            </Text>
          </View>

          {workouts.map((workout, index) => (
            <React.Fragment key={workout.id}>
              <WorkoutRow workout={workout} />
              {index < workouts.length - 1 && (
                <View style={styles.rowDivider} />
              )}
            </React.Fragment>
          ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 36,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 32,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 6,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  summaryDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  sessionCount: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  workoutRow: {
    paddingVertical: 18,
  },
  workoutLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 14,
  },
  intensityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 17,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  workoutDate: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 3,
    letterSpacing: 0.5,
  },
  workoutStats: {
    flexDirection: "row" as const,
    paddingLeft: 18,
    gap: 20,
    alignItems: "center" as const,
  },
  workoutStat: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 3,
  },
  workoutStatValue: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
  },
  workoutStatUnit: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 0.5,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
