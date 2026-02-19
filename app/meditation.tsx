import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from "react-native-reanimated";
import Colors from "@/constants/colors";

const SESSION_TYPES = ["BREATHE", "FOCUS", "BODY SCAN", "CALM"];
const DURATIONS = [3, 5, 10, 15, 20];

const STATS = [
  { label: "TOTAL SESSIONS", value: "47" },
  { label: "TOTAL MINUTES", value: "312" },
  { label: "CURRENT STREAK", value: "8 days" },
  { label: "LONGEST STREAK", value: "21 days" },
];

const RECENT_SESSIONS = [
  { type: "BREATHE", duration: 10, date: "Feb 12, 2026", mood: 5 },
  { type: "FOCUS", duration: 15, date: "Feb 11, 2026", mood: 4 },
  { type: "BODY SCAN", duration: 20, date: "Feb 10, 2026", mood: 4 },
  { type: "CALM", duration: 5, date: "Feb 9, 2026", mood: 3 },
  { type: "BREATHE", duration: 10, date: "Feb 8, 2026", mood: 5 },
];

const MOOD_LABELS = ["STRESSED", "LOW", "NEUTRAL", "GOOD", "GREAT"];

const PHASE_DURATION = 4000;

export default function MeditationScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const [sessionType, setSessionType] = useState(0);
  const [durationIndex, setDurationIndex] = useState(2);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(DURATIONS[2] * 60);
  const [phase, setPhase] = useState<"INHALE" | "HOLD" | "EXHALE">("INHALE");
  const [moodRating, setMoodRating] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const breathScale = useSharedValue(0.6);

  const breathStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  useEffect(() => {
    if (isActive && !isPaused) {
      breathScale.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: PHASE_DURATION, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: PHASE_DURATION, easing: Easing.linear }),
          withTiming(0.6, { duration: PHASE_DURATION, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      let phaseIndex = 0;
      const phases: ("INHALE" | "HOLD" | "EXHALE")[] = ["INHALE", "HOLD", "EXHALE"];
      setPhase(phases[0]);
      phaseRef.current = setInterval(() => {
        phaseIndex = (phaseIndex + 1) % 3;
        setPhase(phases[phaseIndex]);
      }, PHASE_DURATION);
    } else {
      breathScale.value = withTiming(0.6, { duration: 600 });
      if (phaseRef.current) clearInterval(phaseRef.current);
    }
    return () => {
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTimeRemaining(DURATIONS[durationIndex] * 60);
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(DURATIONS[durationIndex] * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (phaseRef.current) clearInterval(phaseRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectDuration = (index: number) => {
    if (isActive) return;
    Haptics.selectionAsync();
    setDurationIndex(index);
    setTimeRemaining(DURATIONS[index] * 60);
  };

  const selectSessionType = (index: number) => {
    if (isActive) return;
    Haptics.selectionAsync();
    setSessionType(index);
  };

  const selectMood = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMoodRating(index);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomInset + 40 }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </Pressable>
          </View>
          <Text style={styles.title}>Mindfulness</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionLabel}>SESSION TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {SESSION_TYPES.map((type, i) => (
              <Pressable
                key={type}
                onPress={() => selectSessionType(i)}
                style={[styles.pill, sessionType === i && styles.pillActive]}
              >
                <Text style={[styles.pillText, sessionType === i && styles.pillTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <Text style={styles.sectionLabel}>DURATION</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
            {DURATIONS.map((d, i) => (
              <Pressable
                key={d}
                onPress={() => selectDuration(i)}
                style={[styles.pill, durationIndex === i && styles.pillActive]}
              >
                <Text style={[styles.pillText, durationIndex === i && styles.pillTextActive]}>
                  {d} MIN
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.circleContainer}>
          <Animated.View style={[styles.breathCircle, breathStyle]}>
            <Text style={styles.phaseText}>{isActive ? phase : "READY"}</Text>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.controlsContainer}>
          {!isActive ? (
            <Pressable onPress={handleStart} style={styles.startButton}>
              <Text style={styles.startButtonText}>START</Text>
            </Pressable>
          ) : (
            <View style={styles.activeControls}>
              <Pressable onPress={handlePause} style={styles.pauseButton}>
                <Text style={styles.pauseButtonText}>{isPaused ? "RESUME" : "PAUSE"}</Text>
              </Pressable>
              <Pressable onPress={handleStop} style={styles.stopButton}>
                <Text style={styles.stopButtonText}>STOP</Text>
              </Pressable>
            </View>
          )}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionLabel}>YOUR STATS</Text>
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(350).duration(400)}>
          <Text style={styles.sectionLabel}>MOOD CHECK</Text>
          <View style={styles.moodRow}>
            {MOOD_LABELS.map((label, i) => (
              <Pressable key={label} onPress={() => selectMood(i)} style={styles.moodItem}>
                <View
                  style={[
                    styles.moodCircle,
                    moodRating === i && styles.moodCircleActive,
                  ]}
                />
                <Text style={[styles.moodLabel, moodRating === i && styles.moodLabelActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>
          {RECENT_SESSIONS.map((session, i) => (
            <View key={i} style={styles.sessionRow}>
              <View style={styles.sessionLeft}>
                <Text style={styles.sessionType}>{session.type}</Text>
                <Text style={styles.sessionMeta}>
                  {session.duration} min — {session.date}
                </Text>
              </View>
              <View style={styles.moodDots}>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <View
                    key={dot}
                    style={[
                      styles.dot,
                      dot <= session.mood ? styles.dotFilled : styles.dotEmpty,
                    ]}
                  />
                ))}
              </View>
            </View>
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
    paddingHorizontal: SPACING.screenPadding,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  pillRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.charcoal,
    marginRight: 8,
    borderRadius: 0,
  },
  pillActive: {
    backgroundColor: Colors.white,
  },
  pillText: {
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
  },
  pillTextActive: {
    color: Colors.deepBlack,
  },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 260,
    marginVertical: 16,
  },
  breathCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.teal,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(90, 200, 212, 0.06)",
  },
  phaseText: {
    fontSize: 12,
    letterSpacing: 3,
    color: Colors.teal,
    fontFamily: "Outfit_400Regular",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 40,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
  },
  controlsContainer: {
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 0,
  },
  startButtonText: {
    fontSize: 13,
    letterSpacing: 3,
    color: Colors.deepBlack,
    fontFamily: "Outfit_400Regular",
  },
  activeControls: {
    flexDirection: "row",
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 0,
  },
  pauseButtonText: {
    fontSize: 13,
    letterSpacing: 3,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  stopButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 0,
  },
  stopButtonText: {
    fontSize: 13,
    letterSpacing: 3,
    color: Colors.red,
    fontFamily: "Outfit_400Regular",
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "47%",
    backgroundColor: Colors.charcoal,
    padding: 16,
    borderRadius: 0,
  },
  statValue: {
    fontSize: 28,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  moodItem: {
    alignItems: "center",
    gap: 8,
  },
  moodCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "transparent",
  },
  moodCircleActive: {
    borderColor: Colors.teal,
    backgroundColor: "rgba(90, 200, 212, 0.15)",
  },
  moodLabel: {
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
  },
  moodLabelActive: {
    color: Colors.teal,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionType: {
    fontSize: 13,
    letterSpacing: 2,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
    marginBottom: 4,
  },
  sessionMeta: {
    fontSize: 11,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  moodDots: {
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotFilled: {
    backgroundColor: Colors.teal,
  },
  dotEmpty: {
    backgroundColor: Colors.border,
  },
});
