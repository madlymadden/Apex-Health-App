import React, { useState, useCallback, useEffect, useRef } from "react";
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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";

const recoveryScore = 74;
const sleepQuality = 85;
const hrvValue = 48;
const hrvTrend = "up" as const;
const muscleSoreness = 3;
const stressLevel = "Low" as const;
const hydrationGlasses = 6;
const hydrationGoal = 8;

const weeklyScores = [
  { day: "Mon", score: 82 },
  { day: "Tue", score: 68 },
  { day: "Wed", score: 75 },
  { day: "Thu", score: 90 },
  { day: "Fri", score: 64 },
  { day: "Sat", score: 78 },
  { day: "Sun", score: 74 },
];

const breathingExercises = [
  { name: "BOX BREATHING", pattern: "4-4-4-4", phases: [4, 4, 4, 4], labels: ["INHALE", "HOLD", "EXHALE", "HOLD"] },
  { name: "4-7-8 RELAXATION", pattern: "4-7-8", phases: [4, 7, 8, 0], labels: ["INHALE", "HOLD", "EXHALE"] },
];

function getScoreColor(score: number) {
  if (score >= 80) return Colors.green;
  if (score >= 60) return Colors.gold;
  return Colors.red;
}

function getReadiness(score: number) {
  if (score >= 80) return { label: "Ready to Train", color: Colors.green };
  if (score >= 60) return { label: "Light Activity", color: Colors.gold };
  return { label: "Rest Day", color: Colors.red };
}

function getRecommendations(score: number) {
  if (score >= 80) return [
    "You are well recovered. Push harder in today's session.",
    "Consider a high-intensity or strength-focused workout.",
    "Stay hydrated and maintain your sleep routine.",
  ];
  if (score >= 60) return [
    "Moderate recovery. Focus on technique over intensity.",
    "Include extra warm-up and cool-down time.",
    "Prioritize sleep tonight to improve recovery.",
  ];
  return [
    "Low recovery detected. Consider an active rest day.",
    "Focus on mobility work, stretching, and foam rolling.",
    "Aim for 8+ hours of sleep and reduce caffeine intake.",
  ];
}

function ScoreRing({ score }: { score: number }) {
  const color = getScoreColor(score);
  const radius = 64;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;
  const size = (radius + strokeWidth) * 2;

  const opacity = useSharedValue(0);
  const displayScore = useSharedValue(0);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    displayScore.value = withTiming(score, { duration: 1200, easing: Easing.out(Easing.cubic) });
    let frame: number;
    let start: number | null = null;
    const duration = 1200;
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.scoreRingContainer}>
      <View style={[styles.scoreRingWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size} style={{ position: "absolute" }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <Animated.View style={[styles.scoreRingInner, fadeStyle]}>
          <Text style={[styles.scoreValue, { color }]}>{animatedScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </Animated.View>
      </View>
      <Text style={styles.scoreLabel}>RECOVERY SCORE</Text>
    </View>
  );
}

function FactorBar({ value, max }: { value: number; max: number }) {
  const pct = (value / max) * 100;
  const color = getScoreColor(pct);
  return (
    <View style={styles.factorBarTrack}>
      <View style={[styles.factorBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function SorenessDots({ level }: { level: number }) {
  return (
    <View style={styles.dotsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i <= level ? Colors.gold : Colors.border },
          ]}
        />
      ))}
    </View>
  );
}

function StressIndicator({ level }: { level: string }) {
  const color = level === "Low" ? Colors.green : level === "Medium" ? Colors.gold : Colors.red;
  return (
    <View style={[styles.stressChip, { borderColor: color }]}>
      <Text style={[styles.stressChipText, { color }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

function SpringPress({
  children, onPress, onLongPress, hapticStyle, style, scaleDown = 0.96, disabled
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  style?: any;
  scaleDown?: number;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
        if (Platform.OS !== "web") Haptics.impactAsync(hapticStyle || Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={style}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

function BreathingCircle({
  exercise,
  onStop,
}: {
  exercise: typeof breathingExercises[0];
  onStop: () => void;
}) {
  const scale = useSharedValue(0.4);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.phases[0]);
  const [rounds, setRounds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const timeRef = useRef(exercise.phases[0]);
  const roundRef = useRef(0);

  useEffect(() => {
    const inhaleTime = exercise.phases[0] * 1000;
    const holdTime1 = exercise.phases[1] * 1000;
    const exhaleTime = exercise.phases[2] * 1000;
    const holdTime2 = exercise.phases.length > 3 ? exercise.phases[3] * 1000 : 0;

    const sequence = [];
    sequence.push(withTiming(1, { duration: inhaleTime, easing: Easing.inOut(Easing.ease) }));
    if (holdTime1 > 0) {
      sequence.push(withTiming(1, { duration: holdTime1 }));
    }
    sequence.push(withTiming(0.4, { duration: exhaleTime, easing: Easing.inOut(Easing.ease) }));
    if (holdTime2 > 0) {
      sequence.push(withTiming(0.4, { duration: holdTime2 }));
    }

    scale.value = withRepeat(
      withSequence(...sequence),
      -1,
      false
    );

    phaseRef.current = 0;
    timeRef.current = exercise.phases[0];
    roundRef.current = 0;
    setPhaseIndex(0);
    setTimeLeft(exercise.phases[0]);
    setRounds(0);

    timerRef.current = setInterval(() => {
      timeRef.current -= 1;
      if (timeRef.current <= 0) {
        let nextPhase = phaseRef.current + 1;
        if (nextPhase >= exercise.phases.length) nextPhase = 0;
        while (exercise.phases[nextPhase] === 0) {
          nextPhase = (nextPhase + 1) % exercise.phases.length;
        }
        if (nextPhase === 0) {
          roundRef.current += 1;
          setRounds(roundRef.current);
        }
        phaseRef.current = nextPhase;
        timeRef.current = exercise.phases[nextPhase];
        setPhaseIndex(nextPhase);
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setTimeLeft(timeRef.current);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exercise]);

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const phaseLabel = exercise.labels[phaseIndex] || "";

  return (
    <View style={styles.breathingActive}>
      <View style={styles.breathingDoubleRing}>
        <View style={styles.breathingOuterRing} />
        <Animated.View style={[styles.breathingCircle, animatedCircle]}>
          <View style={styles.breathingCircleInner} />
        </Animated.View>
      </View>
      <Text style={styles.breathingPhase}>{phaseLabel}</Text>
      <Text style={styles.breathingTimer}>{timeLeft}</Text>
      <Text style={styles.breathingRounds}>
        {rounds > 0 ? `${rounds} ${rounds === 1 ? "ROUND" : "ROUNDS"} COMPLETED` : "STARTING"}
      </Text>
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onStop();
        }}
        style={styles.breathingStopBtn}
      >
        <Ionicons name="stop-circle-outline" size={28} color={Colors.red} />
      </Pressable>
    </View>
  );
}

function WeeklyBarItem({ item, index }: { item: typeof weeklyScores[0]; index: number }) {
  const height = (item.score / 100) * 80;
  const color = getScoreColor(item.score);
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(300)}
      style={styles.chartColumn}
    >
      <SpringPress scaleDown={0.93}>
        <View style={{ alignItems: "center" as const, gap: 6 }}>
          <Text style={styles.chartValue}>{item.score}</Text>
          <View style={styles.chartBarWrap}>
            <View style={[styles.chartBar, { height, backgroundColor: color }]} />
          </View>
          <Text style={styles.chartDay}>{item.day}</Text>
        </View>
      </SpringPress>
    </Animated.View>
  );
}

function WeeklyChart({ scores }: { scores: typeof weeklyScores }) {
  return (
    <View style={styles.chartContainer}>
      {scores.map((item, i) => (
        <WeeklyBarItem key={item.day} item={item} index={i} />
      ))}
    </View>
  );
}

export default function RecoveryScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [activeExercise, setActiveExercise] = useState<number | null>(null);
  const readiness = getReadiness(recoveryScore);
  const recommendations = getRecommendations(recoveryScore);

  const handleStartBreathing = useCallback((index: number) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveExercise(index);
  }, []);

  const handleStopBreathing = useCallback(() => {
    setActiveExercise(null);
  }, []);

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
        onMomentumScrollEnd={() => {
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
            <Text style={styles.headerTitle}>RECOVERY</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScoreRing score={recoveryScore} />

          <View style={styles.readinessContainer}>
            <View style={[styles.readinessDot, { backgroundColor: readiness.color }]} />
            <Text style={[styles.readinessText, { color: readiness.color }]}>
              {readiness.label.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>RECOVERY FACTORS</Text>

          <Animated.View entering={FadeInDown.delay(80).duration(300)}>
            <SpringPress scaleDown={0.97}>
              <View style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Ionicons name="moon-outline" size={16} color={Colors.lightText} />
                  <Text style={styles.factorName}>Sleep Quality</Text>
                </View>
                <View style={styles.factorRight}>
                  <FactorBar value={sleepQuality} max={100} />
                  <Text style={styles.factorValue}>{sleepQuality}/100</Text>
                </View>
              </View>
            </SpringPress>
          </Animated.View>
          <View style={styles.factorDivider} />

          <Animated.View entering={FadeInDown.delay(120).duration(300)}>
            <SpringPress scaleDown={0.97}>
              <View style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Ionicons name="pulse-outline" size={16} color={Colors.lightText} />
                  <Text style={styles.factorName}>HRV Status</Text>
                </View>
                <View style={styles.factorRight}>
                  <Ionicons
                    name={hrvTrend === "up" ? "trending-up" : "trending-down"}
                    size={14}
                    color={hrvTrend === "up" ? Colors.green : Colors.red}
                  />
                  <Text style={styles.factorValue}>{hrvValue}ms</Text>
                </View>
              </View>
            </SpringPress>
          </Animated.View>
          <View style={styles.factorDivider} />

          <Animated.View entering={FadeInDown.delay(160).duration(300)}>
            <SpringPress scaleDown={0.97}>
              <View style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Ionicons name="body-outline" size={16} color={Colors.lightText} />
                  <Text style={styles.factorName}>Muscle Soreness</Text>
                </View>
                <View style={styles.factorRight}>
                  <SorenessDots level={muscleSoreness} />
                  <Text style={styles.factorValue}>{muscleSoreness}/5</Text>
                </View>
              </View>
            </SpringPress>
          </Animated.View>
          <View style={styles.factorDivider} />

          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <SpringPress scaleDown={0.97}>
              <View style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Ionicons name="leaf-outline" size={16} color={Colors.lightText} />
                  <Text style={styles.factorName}>Stress Level</Text>
                </View>
                <View style={styles.factorRight}>
                  <StressIndicator level={stressLevel} />
                </View>
              </View>
            </SpringPress>
          </Animated.View>
          <View style={styles.factorDivider} />

          <Animated.View entering={FadeInDown.delay(240).duration(300)}>
            <SpringPress scaleDown={0.97}>
              <View style={styles.factorRow}>
                <View style={styles.factorLeft}>
                  <Ionicons name="water-outline" size={16} color={Colors.lightText} />
                  <Text style={styles.factorName}>Hydration</Text>
                </View>
                <View style={styles.factorRight}>
                  <View style={styles.glassesRow}>
                    {Array.from({ length: hydrationGoal }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < hydrationGlasses ? "water" : "water-outline"}
                        size={12}
                        color={i < hydrationGlasses ? Colors.teal : Colors.border}
                      />
                    ))}
                  </View>
                  <Text style={styles.factorValue}>{hydrationGlasses}/{hydrationGoal}</Text>
                </View>
              </View>
            </SpringPress>
          </Animated.View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>BREATHING EXERCISES</Text>

          {activeExercise !== null ? (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.breathingActiveLabel}>
                {breathingExercises[activeExercise].name}
              </Text>
              <BreathingCircle
                exercise={breathingExercises[activeExercise]}
                onStop={handleStopBreathing}
              />
            </Animated.View>
          ) : (
            breathingExercises.map((ex, i) => (
              <Animated.View key={ex.name} entering={FadeInDown.delay(i * 60).duration(300)}>
                <SpringPress scaleDown={0.96} onPress={() => handleStartBreathing(i)}>
                  <View style={styles.breathingCard}>
                    <View style={styles.breathingCardLeft}>
                      <Text style={styles.breathingCardName}>{ex.name}</Text>
                      <Text style={styles.breathingCardPattern}>{ex.pattern} pattern</Text>
                    </View>
                    <View style={styles.breathingStartBtn}>
                      <Ionicons name="play-circle-outline" size={28} color={Colors.teal} />
                    </View>
                  </View>
                </SpringPress>
                {i < breathingExercises.length - 1 && <View style={styles.factorDivider} />}
              </Animated.View>
            ))
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>RECOMMENDATIONS</Text>
          {recommendations.map((tip, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(300)}>
              <SpringPress scaleDown={0.98}>
                <View style={styles.tipRow}>
                  <View style={[styles.tipDot, { backgroundColor: getScoreColor(recoveryScore) }]} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              </SpringPress>
              {i < recommendations.length - 1 && <View style={styles.factorDivider} />}
            </Animated.View>
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>WEEKLY TREND</Text>
          <WeeklyChart scores={weeklyScores} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D0D" },
  scrollContent: { paddingHorizontal: 24 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 28,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  scoreRingContainer: { alignItems: "center" as const, gap: 14, marginBottom: 16 },
  scoreRingWrapper: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  scoreRingInner: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: 2,
    position: "absolute" as const,
  },
  scoreValue: { fontSize: 44, fontFamily: "Outfit_300Light", letterSpacing: -2 },
  scoreMax: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.muted, marginTop: 14 },
  scoreLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 4 },
  readinessContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    marginTop: 4,
  },
  readinessDot: { width: 6, height: 6, borderRadius: 3 },
  readinessText: { fontSize: 10, fontFamily: "Outfit_400Regular", letterSpacing: 2 },
  divider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 28 },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 16,
  },
  factorRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
  },
  factorLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  factorName: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
    letterSpacing: 0.2,
  },
  factorRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  factorValue: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    minWidth: 45,
    textAlign: "right" as const,
  },
  factorDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  factorBarTrack: {
    width: 60,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  factorBarFill: { height: 4, borderRadius: 2 },
  dotsRow: { flexDirection: "row" as const, gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  stressChip: {
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stressChipText: { fontSize: 9, fontFamily: "Outfit_400Regular", letterSpacing: 2 },
  glassesRow: { flexDirection: "row" as const, gap: 3 },
  breathingCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  breathingCardLeft: { gap: 4 },
  breathingCardName: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 1,
  },
  breathingCardPattern: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  breathingStartBtn: { padding: 4 },
  breathingActiveLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.teal,
    letterSpacing: 2,
    textAlign: "center" as const,
    marginBottom: 20,
  },
  breathingActive: { alignItems: "center" as const, gap: 16, paddingVertical: 20 },
  breathingDoubleRing: {
    width: 160,
    height: 160,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  breathingOuterRing: {
    position: "absolute" as const,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 0.5,
    borderColor: "rgba(90,200,212,0.2)",
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(90,200,212,0.12)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  breathingCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.teal,
    backgroundColor: "rgba(90,200,212,0.06)",
  },
  breathingRounds: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  breathingPhase: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 3,
  },
  breathingTimer: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
  },
  breathingStopBtn: { padding: 8 },
  tipRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    paddingVertical: 12,
  },
  tipDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 6 },
  tipText: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    lineHeight: 20,
    letterSpacing: 0.2,
    flex: 1,
  },
  chartContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    height: 130,
    paddingTop: 10,
  },
  chartColumn: { alignItems: "center" as const, gap: 6, flex: 1 },
  chartValue: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
  },
  chartBarWrap: {
    height: 80,
    width: 14,
    justifyContent: "flex-end" as const,
  },
  chartBar: {
    width: 14,
    borderRadius: 3,
    minHeight: 4,
  },
  chartDay: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
});
