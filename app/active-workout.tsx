import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type WorkoutMode = "STRENGTH" | "CARDIO" | "HIIT";

interface Exercise {
  id: string;
  name: string;
  icon: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

const STRENGTH_EXERCISES: Exercise[] = [
  { id: "1", name: "Bench Press", icon: "barbell", sets: 4, reps: "8-10", restSeconds: 90 },
  { id: "2", name: "Incline Dumbbell Press", icon: "fitness", sets: 3, reps: "10-12", restSeconds: 60 },
  { id: "3", name: "Cable Flyes", icon: "pulse", sets: 3, reps: "12-15", restSeconds: 60 },
  { id: "4", name: "Overhead Press", icon: "arrow-up", sets: 4, reps: "6-8", restSeconds: 90 },
  { id: "5", name: "Lateral Raises", icon: "expand", sets: 3, reps: "15", restSeconds: 45 },
  { id: "6", name: "Tricep Pushdown", icon: "trending-down", sets: 3, reps: "12", restSeconds: 45 },
];

const CARDIO_EXERCISES: Exercise[] = [
  { id: "1", name: "Treadmill Sprint", icon: "walk", sets: 6, reps: "30s", restSeconds: 60 },
  { id: "2", name: "Rowing Machine", icon: "boat", sets: 4, reps: "500m", restSeconds: 90 },
  { id: "3", name: "Jump Rope", icon: "flash", sets: 5, reps: "60s", restSeconds: 30 },
  { id: "4", name: "Cycling Intervals", icon: "bicycle", sets: 4, reps: "2min", restSeconds: 60 },
  { id: "5", name: "Stair Climber", icon: "trending-up", sets: 3, reps: "3min", restSeconds: 45 },
];

const HIIT_EXERCISES: Exercise[] = [
  { id: "1", name: "Burpees", icon: "flash", sets: 4, reps: "45s", restSeconds: 15 },
  { id: "2", name: "Mountain Climbers", icon: "trending-up", sets: 4, reps: "40s", restSeconds: 20 },
  { id: "3", name: "Box Jumps", icon: "arrow-up", sets: 3, reps: "30s", restSeconds: 15 },
  { id: "4", name: "Battle Ropes", icon: "pulse", sets: 4, reps: "30s", restSeconds: 15 },
  { id: "5", name: "Kettlebell Swings", icon: "fitness", sets: 4, reps: "20", restSeconds: 20 },
  { id: "6", name: "Sled Push", icon: "arrow-forward", sets: 3, reps: "30m", restSeconds: 30 },
];

const EXERCISES_MAP: Record<WorkoutMode, Exercise[]> = {
  STRENGTH: STRENGTH_EXERCISES,
  CARDIO: CARDIO_EXERCISES,
  HIIT: HIIT_EXERCISES,
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.3, { duration: 800 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.heartDot, animStyle]} />
  );
}

function TimerPulse({ children }: { children: React.ReactNode }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.02, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

function RestTimerCircle({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.circleContainer}>
      <View style={styles.svgCircle}>
        <View
          style={[
            styles.circleTrack,
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: "rgba(255,255,255,0.08)",
            },
          ]}
        />
        <View
          style={[
            styles.circleProgress,
            {
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: Colors.white,
              borderTopColor: progress > 0.25 ? Colors.white : "transparent",
              borderRightColor: progress > 0.5 ? Colors.white : "transparent",
              borderBottomColor: progress > 0.75 ? Colors.white : "transparent",
              borderLeftColor: progress > 0 ? Colors.white : "transparent",
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [mode, setMode] = useState<WorkoutMode | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [totalSetsCompleted, setTotalSetsCompleted] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [restDuration, setRestDuration] = useState(0);
  const [heartRate, setHeartRate] = useState(128);
  const [calories, setCalories] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const exercises = mode ? EXERCISES_MAP[mode] : [];
  const currentExercise = exercises[currentExerciseIndex];

  useEffect(() => {
    if (!mode) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setCalories((prev) => prev + (mode === "HIIT" ? 0.22 : mode === "CARDIO" ? 0.18 : 0.12));
      setHeartRate((prev) => {
        const base = mode === "HIIT" ? 155 : mode === "CARDIO" ? 145 : 128;
        const variance = Math.floor(Math.random() * 8) - 4;
        return Math.min(190, Math.max(100, base + variance));
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  useEffect(() => {
    if (!isResting || restTimeLeft <= 0) return;
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          if (restTimerRef.current) clearInterval(restTimerRef.current);
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting]);

  const handleSelectMode = useCallback((m: WorkoutMode) => {
    setMode(m);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const handleCompleteSet = useCallback(() => {
    if (!currentExercise || isResting) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const exerciseId = currentExercise.id;
    const done = (completedSets[exerciseId] || 0) + 1;
    setCompletedSets((prev) => ({ ...prev, [exerciseId]: done }));
    setTotalSetsCompleted((prev) => prev + 1);

    if (done >= currentExercise.sets) {
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRestDuration(currentExercise.restSeconds);
        setRestTimeLeft(currentExercise.restSeconds);
        setIsResting(true);
      }
    } else {
      setCurrentSet(done + 1);
      setRestDuration(currentExercise.restSeconds);
      setRestTimeLeft(currentExercise.restSeconds);
      setIsResting(true);
    }
  }, [currentExercise, isResting, completedSets, currentExerciseIndex, exercises.length]);

  const handleSkipRest = useCallback(() => {
    setIsResting(false);
    setRestTimeLeft(0);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
  }, []);

  const handleFinish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.back();
  }, []);

  const isLastSetOfLastExercise =
    currentExercise &&
    currentExerciseIndex === exercises.length - 1 &&
    currentSet >= currentExercise.sets;

  const totalSetsInWorkout = exercises.reduce((sum, ex) => sum + ex.sets, 0);

  if (!mode) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.modeSelectContainer,
            { paddingTop: insets.top + webTopInset + 20, paddingBottom: insets.bottom + 20 },
          ]}
        >
          <Animated.View entering={FadeIn.duration(400)}>
            <Pressable onPress={() => router.back()} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>

            <Text style={styles.modeTitle}>SELECT MODE</Text>
            <Text style={styles.modeSubtitle}>Choose your workout type</Text>

            <View style={styles.modeList}>
              {(["STRENGTH", "CARDIO", "HIIT"] as WorkoutMode[]).map((m, i) => {
                const icons: Record<WorkoutMode, string> = {
                  STRENGTH: "barbell",
                  CARDIO: "heart",
                  HIIT: "flash",
                };
                const descriptions: Record<WorkoutMode, string> = {
                  STRENGTH: `${STRENGTH_EXERCISES.length} exercises \u00B7 ${STRENGTH_EXERCISES.reduce((s, e) => s + e.sets, 0)} sets`,
                  CARDIO: `${CARDIO_EXERCISES.length} exercises \u00B7 ${CARDIO_EXERCISES.reduce((s, e) => s + e.sets, 0)} sets`,
                  HIIT: `${HIIT_EXERCISES.length} exercises \u00B7 ${HIIT_EXERCISES.reduce((s, e) => s + e.sets, 0)} sets`,
                };
                return (
                  <Animated.View key={m} entering={FadeInDown.delay(i * 100).duration(400)}>
                    <Pressable
                      style={styles.modeCard}
                      onPress={() => handleSelectMode(m)}
                    >
                      <View style={styles.modeCardLeft}>
                        <Ionicons name={icons[m] as any} size={22} color={Colors.white} />
                        <View>
                          <Text style={styles.modeCardLabel}>{m}</Text>
                          <Text style={styles.modeCardDesc}>{descriptions[m]}</Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isResting && (
        <View style={styles.restOverlay}>
          <Pressable onPress={handleSkipRest} style={styles.restOverlayTouchable}>
            <Animated.View entering={FadeIn.duration(300)} style={styles.restContent}>
              <Text style={styles.restLabel}>REST</Text>
              <RestTimerCircle progress={restDuration > 0 ? (restDuration - restTimeLeft) / restDuration : 0} />
              <Text style={styles.restTime}>{formatTime(restTimeLeft)}</Text>
              <Text style={styles.restSkip}>TAP TO SKIP</Text>
            </Animated.View>
          </Pressable>
        </View>
      )}

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
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable onPress={handleFinish} style={styles.headerBtn}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Text style={styles.headerTitle}>{mode}</Text>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: "/smart-scanner", params: { context: "workout" } });
                }}
                hitSlop={12}
              >
                <Ionicons name="scan-outline" size={18} color={Colors.muted} />
              </Pressable>
            </View>
            <View style={styles.heartRateContainer}>
              <PulsingDot />
              <Text style={styles.heartRateText}>{heartRate}</Text>
              <Text style={styles.heartRateUnit}>BPM</Text>
            </View>
          </View>

          <View style={styles.timerSection}>
            <TimerPulse>
              <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
            </TimerPulse>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
              <Text style={styles.statLabel}>ELAPSED</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(calories)}</Text>
              <Text style={styles.statLabel}>KCAL</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalSetsCompleted}/{totalSetsInWorkout}
              </Text>
              <Text style={styles.statLabel}>SETS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.currentExerciseSection}>
            <Text style={styles.sectionLabel}>CURRENT EXERCISE</Text>
            {currentExercise && (
              <View style={styles.currentCard}>
                <View style={styles.currentCardHeader}>
                  <Ionicons
                    name={currentExercise.icon as any}
                    size={20}
                    color={Colors.white}
                  />
                  <Text style={styles.currentName}>{currentExercise.name}</Text>
                </View>
                <Text style={styles.currentSetInfo}>
                  Set {currentSet} of {currentExercise.sets} \u00B7 {currentExercise.reps} reps
                </Text>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.actionButton, isResting && styles.actionButtonDisabled]}
            onPress={
              isLastSetOfLastExercise
                ? handleFinish
                : handleCompleteSet
            }
            disabled={isResting}
          >
            <Text style={styles.actionButtonText}>
              {isLastSetOfLastExercise
                ? "FINISH WORKOUT"
                : currentExercise &&
                  (completedSets[currentExercise.id] || 0) + 1 >= currentExercise.sets
                ? "NEXT EXERCISE"
                : "NEXT SET"}
            </Text>
            <Ionicons
              name={
                isLastSetOfLastExercise
                  ? "checkmark-done"
                  : "chevron-forward"
              }
              size={18}
              color={Colors.deepBlack}
            />
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>EXERCISE QUEUE</Text>
          {exercises.map((exercise, index) => {
            const done = completedSets[exercise.id] || 0;
            const isCurrent = index === currentExerciseIndex;
            const isCompleted = done >= exercise.sets;
            const isPast = index < currentExerciseIndex;

            return (
              <Animated.View
                key={exercise.id}
                entering={FadeInDown.delay(index * 60).duration(300)}
              >
                <View
                  style={[
                    styles.exerciseRow,
                    isCurrent && styles.exerciseRowActive,
                  ]}
                >
                  <View style={styles.exerciseRowLeft}>
                    <View
                      style={[
                        styles.exerciseIndexDot,
                        isPast || isCompleted
                          ? styles.exerciseIndexDotDone
                          : isCurrent
                          ? styles.exerciseIndexDotActive
                          : {},
                      ]}
                    >
                      {isPast || isCompleted ? (
                        <Ionicons name="checkmark" size={10} color={Colors.deepBlack} />
                      ) : (
                        <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                      )}
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.exerciseName,
                          (isPast || isCompleted) && styles.exerciseNameDone,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <Text style={styles.exerciseMeta}>
                        {exercise.sets} sets \u00B7 {exercise.reps}
                        {isCurrent ? ` \u00B7 ${done}/${exercise.sets} done` : ""}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.exerciseRowRight}>
                    {Array.from({ length: exercise.sets }).map((_, si) => (
                      <View
                        key={si}
                        style={[
                          styles.setDot,
                          si < done ? styles.setDotFilled : {},
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </Animated.View>
            );
          })}
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
  modeSelectContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 32,
  },
  modeTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 8,
  },
  modeSubtitle: {
    fontSize: 22,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 40,
  },
  modeList: {
    gap: 12,
  },
  modeCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  modeCardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
  },
  modeCardLabel: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 2,
  },
  modeCardDesc: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  heartRateContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  heartDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.red,
  },
  heartRateText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  heartRateUnit: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  timerSection: {
    alignItems: "center" as const,
    marginBottom: 28,
  },
  timerText: {
    fontSize: 56,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  statsBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 14,
  },
  currentExerciseSection: {
    marginBottom: 20,
  },
  currentCard: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
    gap: 8,
  },
  currentCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  currentName: {
    fontSize: 18,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  currentSetInfo: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
    paddingLeft: 32,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    marginBottom: 4,
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.deepBlack,
    letterSpacing: 2,
  },
  exerciseRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  exerciseRowActive: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderLeftWidth: 2,
    borderLeftColor: Colors.white,
  },
  exerciseRowLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  exerciseIndexDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  exerciseIndexDotActive: {
    borderColor: Colors.white,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  exerciseIndexDotDone: {
    borderColor: Colors.white,
    backgroundColor: Colors.white,
  },
  exerciseIndexText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  exerciseName: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  exerciseNameDone: {
    color: Colors.muted,
  },
  exerciseMeta: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  exerciseRowRight: {
    flexDirection: "row" as const,
    gap: 4,
  },
  setDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  setDotFilled: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,13,0.94)",
    zIndex: 100,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  restOverlayTouchable: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: "100%" as any,
  },
  restContent: {
    alignItems: "center" as const,
    gap: 20,
  },
  restLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  circleContainer: {
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  svgCircle: {
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  circleTrack: {
    position: "absolute" as const,
  },
  circleProgress: {
    position: "absolute" as const,
  },
  restTime: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  restSkip: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 8,
  },
});
