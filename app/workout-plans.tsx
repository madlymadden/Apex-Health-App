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
import {
  generateWorkoutPlans,
  type WorkoutPlan,
} from "@/lib/health-data";

function PlanCard({ plan, index }: { plan: WorkoutPlan; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const completed = plan.days.filter((d) => d.completed).length;
  const progress = completed / plan.days.length;
  const categoryColors: Record<string, string> = {
    strength: "#6C63FF",
    cardio: "#FC4C02",
    hybrid: Colors.teal,
    flexibility: Colors.green,
  };
  const accentColor = categoryColors[plan.category] || Colors.white;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <Pressable
        onPress={() => {
          setExpanded(!expanded);
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={({ pressed }) => [styles.planCard, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <View style={styles.planTitleRow}>
              <View style={[styles.categoryDot, { backgroundColor: accentColor }]} />
              <Text style={styles.planName}>{plan.name}</Text>
            </View>
            <Text style={styles.planDesc}>{plan.description}</Text>
          </View>
        </View>

        <View style={styles.planMeta}>
          <View style={styles.planMetaItem}>
            <Text style={styles.planMetaValue}>{plan.frequency}</Text>
          </View>
          <View style={styles.planMetaDivider} />
          <View style={styles.planMetaItem}>
            <Text style={styles.planMetaValue}>Week {plan.currentWeek}/{plan.weeks}</Text>
          </View>
          <View style={styles.planMetaDivider} />
          <View style={styles.planMetaItem}>
            <Text style={[styles.planMetaValue, { textTransform: "capitalize" as const }]}>{plan.difficulty}</Text>
          </View>
        </View>

        <View style={styles.planProgressSection}>
          <View style={styles.planProgressBg}>
            <View style={[styles.planProgressFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
          </View>
          <Text style={styles.planProgressText}>{completed}/{plan.days.length} this week</Text>
        </View>

        {expanded && (
          <View style={styles.daysList}>
            <View style={styles.daysListDivider} />
            {plan.days.map((day, i) => (
              <View key={i} style={styles.dayRow}>
                <View style={styles.dayLeft}>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation?.();
                      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    <Ionicons
                      name={day.completed ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={day.completed ? Colors.green : Colors.border}
                    />
                  </Pressable>
                  <View>
                    <Text style={[styles.dayName, day.completed && styles.dayCompleted]}>{day.day}</Text>
                    <Text style={styles.dayWorkout}>{day.workout}</Text>
                  </View>
                </View>
                {day.exercises && (
                  <Text style={styles.dayExerciseCount}>{day.exercises.length} exercises</Text>
                )}
              </View>
            ))}

            {expanded && plan.days.some((d) => d.exercises && d.exercises.length > 0) && (
              <View style={styles.exercisePreview}>
                <View style={styles.exercisePreviewDivider} />
                <Text style={styles.exercisePreviewLabel}>NEXT WORKOUT</Text>
                {(() => {
                  const nextDay = plan.days.find((d) => !d.completed && d.exercises);
                  if (!nextDay?.exercises) return null;
                  return nextDay.exercises.map((ex, i) => (
                    <View key={i} style={styles.exerciseRow}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseDetail}>{ex.sets} x {ex.reps}</Text>
                    </View>
                  ));
                })()}
              </View>
            )}
          </View>
        )}

        <View style={styles.expandHint}>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={14} color={Colors.muted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function WorkoutPlansScreen() {
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setPlans(generateWorkoutPlans());
  }, []);

  const activePlans = plans.filter((p) => p.currentWeek <= p.weeks);

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
            <Text style={styles.headerTitle}>WORKOUT PLANS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activePlans.length}</Text>
              <Text style={styles.summaryLabel}>ACTIVE</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{plans.length}</Text>
              <Text style={styles.summaryLabel}>TOTAL</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>YOUR PLANS</Text>

          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
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
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 28 },
  sectionLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3, marginBottom: 16 },
  planCard: { borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 18, marginBottom: 12 },
  planHeader: { marginBottom: 14 },
  planInfo: { gap: 6 },
  planTitleRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  planName: { fontSize: 18, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.3 },
  planDesc: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted, lineHeight: 18, letterSpacing: 0.2 },
  planMeta: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12, marginBottom: 14 },
  planMetaItem: {},
  planMetaDivider: { width: 0.5, height: 10, backgroundColor: Colors.border },
  planMetaValue: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 0.5 },
  planProgressSection: { gap: 6 },
  planProgressBg: { height: 3, backgroundColor: "rgba(255,255,255,0.06)" },
  planProgressFill: { height: 3 },
  planProgressText: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5, textAlign: "right" as const },
  daysList: { marginTop: 12 },
  daysListDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 10 },
  dayRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 10 },
  dayLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  dayName: { fontSize: 13, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.1 },
  dayCompleted: { color: Colors.muted, textDecorationLine: "line-through" as const },
  dayWorkout: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, marginTop: 1, letterSpacing: 0.3 },
  dayExerciseCount: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  exercisePreview: { marginTop: 8 },
  exercisePreviewDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 10 },
  exercisePreviewLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2, marginBottom: 8 },
  exerciseRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 6 },
  exerciseName: { fontSize: 13, fontFamily: "Outfit_300Light", color: Colors.offWhite, letterSpacing: 0.1 },
  exerciseDetail: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.3 },
  expandHint: { alignItems: "center" as const, marginTop: 8 },
});
