import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";
import { formatDuration, getRelativeDate } from "@/lib/health-data";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { workouts, removeWorkout } = useHealth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const workout = workouts.find((w) => w.id === id);

  const handleDelete = () => {
    if (Platform.OS === "web") {
      if (confirm("Delete this workout?")) {
        removeWorkout(id!);
        router.back();
      }
      return;
    }
    Alert.alert("Delete Workout", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await removeWorkout(id!);
          router.back();
        },
      },
    ]);
  };

  if (!workout) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Workout not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const intensityColor =
    workout.intensity === "high"
      ? Colors.red
      : workout.intensity === "moderate"
      ? Colors.white
      : Colors.muted;

  const date = new Date(workout.date);
  const fullDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const zones = [
    { label: "WARM UP", range: "90-110", pct: 15 },
    { label: "FAT BURN", range: "110-130", pct: 25 },
    { label: "CARDIO", range: "130-150", pct: workout.intensity === "high" ? 35 : 40 },
    { label: "PEAK", range: "150-170", pct: workout.intensity === "high" ? 25 : 10 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-down" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>WORKOUT</Text>
            <Pressable onPress={handleDelete} style={styles.backButton}>
              <Ionicons name="trash-outline" size={18} color={Colors.muted} />
            </Pressable>
          </View>

          <View style={styles.heroSection}>
            <View style={[styles.intensityDot, { backgroundColor: intensityColor }]} />
            <Text style={styles.workoutType}>{workout.type}</Text>
            <Text style={styles.workoutDate}>{fullDate}</Text>
            <Text style={styles.workoutTime}>{time}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>DURATION</Text>
                <Text style={styles.statValue}>{formatDuration(workout.duration)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>CALORIES</Text>
                <Text style={styles.statValue}>{workout.calories}</Text>
                <Text style={styles.statUnit}>kcal</Text>
              </View>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>AVG HEART RATE</Text>
                <Text style={styles.statValue}>{workout.heartRateAvg}</Text>
                <Text style={styles.statUnit}>bpm</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>INTENSITY</Text>
                <Text style={[styles.statValue, { color: intensityColor }]}>
                  {workout.intensity.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>HEART RATE ZONES</Text>
          {zones.map((zone, i) => (
            <View key={zone.label} style={styles.zoneRow}>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneLabel}>{zone.label}</Text>
                <Text style={styles.zoneRange}>{zone.range} bpm</Text>
              </View>
              <View style={styles.zoneBarContainer}>
                <View
                  style={[
                    styles.zoneBar,
                    {
                      width: `${zone.pct}%`,
                      backgroundColor:
                        i === 3 ? Colors.red : i === 2 ? Colors.teal : "rgba(255,255,255,0.15)",
                    },
                  ]}
                />
              </View>
              <Text style={styles.zonePct}>{zone.pct}%</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <View style={styles.insightDot} />
              <Text style={styles.insightLabel}>SESSION NOTE</Text>
            </View>
            <Text style={styles.insightText}>
              {workout.intensity === "high"
                ? `Strong ${workout.type.toLowerCase()} session. You maintained an elevated heart rate of ${workout.heartRateAvg} bpm for ${workout.duration} minutes, burning ${workout.calories} calories. Great effort.`
                : workout.intensity === "moderate"
                ? `Solid ${workout.type.toLowerCase()} session with balanced intensity. ${workout.duration} minutes of steady work at ${workout.heartRateAvg} bpm average.`
                : `Recovery-focused ${workout.type.toLowerCase()} session. ${workout.duration} minutes at a controlled ${workout.heartRateAvg} bpm helps improve flexibility and reduce stress.`}
            </Text>
          </View>
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
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 36,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  heroSection: {
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  workoutType: {
    fontSize: 32,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  workoutDate: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.3,
  },
  workoutTime: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  statsGrid: {
    gap: 0,
  },
  statsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 6,
    paddingVertical: 16,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: -2,
  },
  statDivider: {
    width: 0.5,
    height: 40,
    backgroundColor: Colors.border,
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 20,
  },
  zoneRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 14,
  },
  zoneInfo: {
    width: 80,
  },
  zoneLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 0.5,
  },
  zoneRange: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  zoneBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  zoneBar: {
    height: 4,
  },
  zonePct: {
    width: 30,
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    textAlign: "right" as const,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  backLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backLinkText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  insightSection: {},
  insightHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  insightDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.teal,
  },
  insightLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.teal,
    letterSpacing: 3,
  },
  insightText: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
