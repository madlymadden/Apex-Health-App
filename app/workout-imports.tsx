import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";
import {
  generateImportableWorkouts,
  getRelativeDate,
  formatDuration,
  type ImportableWorkout,
} from "@/lib/health-data";

function WorkoutCard({ workout, index, onImport }: { workout: ImportableWorkout; index: number; onImport: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const sourceColor = workout.source === "Hevy" ? "#6C63FF" : "#2196F3";

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <Pressable
        onPress={() => {
          setExpanded(!expanded);
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={({ pressed }) => [styles.workoutCard, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <View style={[styles.sourceBadge, { borderColor: sourceColor }]}>
              <Text style={[styles.sourceText, { color: sourceColor }]}>{workout.source.toUpperCase()}</Text>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{workout.name}</Text>
              <Text style={styles.cardDate}>{getRelativeDate(workout.date)}</Text>
            </View>
          </View>
          {workout.imported ? (
            <View style={styles.importedBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.green} />
              <Text style={styles.importedLabel}>SYNCED</Text>
            </View>
          ) : (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onImport(workout.id);
              }}
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="download-outline" size={12} color={Colors.white} />
              <Text style={styles.importBtnText}>IMPORT</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.cardStats}>
          <View style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{formatDuration(workout.duration)}</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{workout.calories}</Text>
            <Text style={styles.cardStatUnit}>cal</Text>
          </View>
          <View style={styles.cardStatDivider} />
          <View style={styles.cardStat}>
            <Text style={styles.cardStatValue}>{workout.exercises?.length || 0}</Text>
            <Text style={styles.cardStatUnit}>exercises</Text>
          </View>
        </View>

        {expanded && workout.exercises && (
          <View style={styles.exerciseList}>
            <View style={styles.exerciseDivider} />
            {workout.exercises.map((ex, i) => (
              <View key={i} style={styles.exerciseRow}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseDetail}>
                  {ex.sets} x {ex.reps} @ {ex.weight}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.expandHint}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={Colors.muted}
          />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function WorkoutImportsScreen() {
  const insets = useSafeAreaInsets();
  const { addWorkout } = useHealth();
  const [workouts, setWorkouts] = useState<ImportableWorkout[]>([]);
  const [filter, setFilter] = useState<"all" | "hevy" | "strong">("all");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setWorkouts(generateImportableWorkouts());
  }, []);

  const handleImport = async (id: string) => {
    const workout = workouts.find((w) => w.id === id);
    if (!workout) return;

    const workoutId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await addWorkout({
      id: workoutId,
      type: "Strength Training",
      icon: "barbell",
      duration: workout.duration,
      calories: workout.calories || 300,
      date: workout.date,
      intensity: workout.duration > 60 ? "high" : "moderate",
      heartRateAvg: workout.duration > 60 ? 145 : 130,
    });

    setWorkouts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, imported: true } : w))
    );
  };

  const filtered = filter === "all" ? workouts : workouts.filter((w) => w.source.toLowerCase() === filter);
  const imported = workouts.filter((w) => w.imported).length;

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
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>WORKOUT IMPORTS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{workouts.length}</Text>
              <Text style={styles.summaryLabel}>AVAILABLE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{imported}</Text>
              <Text style={styles.summaryLabel}>IMPORTED</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {new Set(workouts.map((w) => w.source)).size}
              </Text>
              <Text style={styles.summaryLabel}>SOURCES</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.filterRow}>
            {(["all", "hevy", "strong"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFilter(f);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {filtered.map((workout, i) => (
            <WorkoutCard key={workout.id} workout={workout} index={i} onImport={handleImport} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="barbell-outline" size={28} color={Colors.border} />
              <Text style={styles.emptyText}>No workouts from this source</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepBlack },
  scrollContent: { paddingHorizontal: 24 },
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 32 },
  backButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  headerTitle: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  summaryRow: { flexDirection: "row" as const, justifyContent: "space-around" as const, alignItems: "center" as const, marginBottom: 8 },
  summaryItem: { flex: 1, alignItems: "center" as const, gap: 6 },
  summaryValue: { fontSize: 28, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  summaryDivider: { width: 0.5, height: 32, backgroundColor: Colors.border },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  filterRow: { flexDirection: "row" as const, gap: 2, marginBottom: 20 },
  filterButton: { flex: 1, paddingVertical: 10, alignItems: "center" as const },
  filterButtonActive: { borderBottomWidth: 1, borderBottomColor: Colors.white },
  filterText: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  filterTextActive: { color: Colors.white },
  workoutCard: { marginBottom: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  cardHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 12 },
  cardLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 },
  sourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderWidth: 0.5 },
  sourceText: { fontSize: 7, fontFamily: "Outfit_300Light", letterSpacing: 1.5 },
  cardInfo: { gap: 2, flex: 1 },
  cardName: { fontSize: 16, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  cardDate: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  importedBadge: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
  importedLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.green, letterSpacing: 1.5 },
  importBtn: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 0.5, borderColor: Colors.white },
  importBtnText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: 1.5 },
  cardStats: { flexDirection: "row" as const, gap: 16, alignItems: "center" as const },
  cardStat: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 2 },
  cardStatValue: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.lightText },
  cardStatUnit: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  cardStatDivider: { width: 0.5, height: 12, backgroundColor: "rgba(255,255,255,0.1)" },
  exerciseList: { marginTop: 12 },
  exerciseDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 10 },
  exerciseRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 8 },
  exerciseName: { fontSize: 13, fontFamily: "Outfit_400Regular", color: Colors.offWhite, letterSpacing: 0.1 },
  exerciseDetail: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.3 },
  expandHint: { alignItems: "center" as const, marginTop: 8 },
  emptyState: { alignItems: "center" as const, paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.muted },
});
