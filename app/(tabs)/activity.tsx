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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  generateWorkoutHistory,
  formatDuration,
  getRelativeDate,
  type WorkoutEntry,
} from "@/lib/health-data";

function WorkoutCard({
  workout,
  index,
}: {
  workout: WorkoutEntry;
  index: number;
}) {
  const intensityColor =
    workout.intensity === "high"
      ? Colors.redAccent
      : workout.intensity === "moderate"
      ? Colors.gold
      : Colors.greenAccent;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.workoutCard,
          pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <View style={styles.workoutLeft}>
          <View
            style={[
              styles.workoutIconBg,
              { backgroundColor: `${intensityColor}15` },
            ]}
          >
            <Ionicons
              name={workout.icon as any}
              size={20}
              color={intensityColor}
            />
          </View>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutType}>{workout.type}</Text>
            <Text style={styles.workoutDate}>
              {getRelativeDate(workout.date)}
            </Text>
          </View>
        </View>

        <View style={styles.workoutRight}>
          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatValue}>
              {formatDuration(workout.duration)}
            </Text>
            <Text style={styles.workoutStatLabel}>Duration</Text>
          </View>
          <View style={styles.workoutDivider} />
          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatValue}>{workout.calories}</Text>
            <Text style={styles.workoutStatLabel}>kcal</Text>
          </View>
          <View style={styles.workoutDivider} />
          <View style={styles.workoutStat}>
            <View style={styles.hrRow}>
              <Ionicons name="heart" size={10} color={Colors.redAccent} />
              <Text style={styles.workoutStatValue}>
                {workout.heartRateAvg}
              </Text>
            </View>
            <Text style={styles.workoutStatLabel}>avg bpm</Text>
          </View>
        </View>

        <View
          style={[
            styles.intensityBar,
            { backgroundColor: intensityColor },
          ]}
        />
      </Pressable>
    </Animated.View>
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
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.gold}
          />
        }
      >
        <Text style={styles.screenTitle}>Activity</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(232,69,60,0.12)", "rgba(232,69,60,0.02)"]}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="flame" size={18} color={Colors.redAccent} />
            <Text style={[styles.statValue, { color: Colors.redAccent }]}>
              {totalCalories.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Cal</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(201,169,110,0.12)", "rgba(201,169,110,0.02)"]}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="time" size={18} color={Colors.gold} />
            <Text style={[styles.statValue, { color: Colors.gold }]}>
              {formatDuration(totalMinutes)}
            </Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={["rgba(90,200,250,0.12)", "rgba(90,200,250,0.02)"]}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name="heart" size={18} color={Colors.blueAccent} />
            <Text style={[styles.statValue, { color: Colors.blueAccent }]}>
              {avgHR}
            </Text>
            <Text style={styles.statLabel}>Avg HR</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <Text style={styles.workoutCount}>{workouts.length} sessions</Text>
        </View>

        {workouts.map((workout, index) => (
          <WorkoutCard key={workout.id} workout={workout} index={index} />
        ))}
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
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    borderRadius: 16,
    padding: 14,
    alignItems: "center" as const,
    gap: 6,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Outfit_700Bold",
  },
  statLabel: {
    fontSize: 10,
    fontFamily: "Outfit_500Medium",
    color: Colors.lightGray,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  workoutCount: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
  },
  workoutCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  workoutLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 14,
  },
  workoutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.white,
  },
  workoutDate: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: 2,
  },
  workoutRight: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  workoutStat: {
    alignItems: "center" as const,
    flex: 1,
  },
  workoutStatValue: {
    fontSize: 15,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.offWhite,
  },
  workoutStatLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  workoutDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  hrRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  intensityBar: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
});
