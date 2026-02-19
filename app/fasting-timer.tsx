import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";

const PROTOCOLS = [
  { label: "16:8", fastHours: 16, eatHours: 8 },
  { label: "18:6", fastHours: 18, eatHours: 6 },
  { label: "20:4", fastHours: 20, eatHours: 4 },
  { label: "OMAD", fastHours: 23, eatHours: 1 },
];

const RECENT_FASTS = [
  { date: "Feb 12", protocol: "16:8", duration: "16h 12m", completed: true },
  { date: "Feb 11", protocol: "16:8", duration: "16h 04m", completed: true },
  { date: "Feb 10", protocol: "18:6", duration: "14h 30m", completed: false },
  { date: "Feb 9", protocol: "16:8", duration: "16h 22m", completed: true },
  { date: "Feb 8", protocol: "20:4", duration: "20h 01m", completed: true },
];

const STATS = {
  currentStreak: 3,
  longestStreak: 14,
  totalFasts: 47,
  avgDuration: 16.4,
};

const RING_RADIUS = 200 / 2;
const STROKE_WIDTH = 3;
const CENTER = RING_RADIUS + STROKE_WIDTH;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function FastingTimerScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [selectedProtocol, setSelectedProtocol] = useState(0);
  const [isFasting, setIsFasting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ringProgress = useSharedValue(0);

  const protocol = PROTOCOLS[selectedProtocol];
  const targetSeconds = protocol.fastHours * 3600;
  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);
  const progress = Math.min(elapsedSeconds / targetSeconds, 1);

  useEffect(() => {
    ringProgress.value = withTiming(progress, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    if (isFasting) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isFasting]);

  const handleStartFast = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isFasting) {
      setIsFasting(false);
      setElapsedSeconds(0);
    } else {
      setElapsedSeconds(0);
      setIsFasting(true);
    }
  };

  const handleProtocolSelect = (index: number) => {
    if (isFasting) return;
    Haptics.selectionAsync();
    setSelectedProtocol(index);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.title}>Fasting</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.timerContainer}>
          <Svg
            width={CENTER * 2}
            height={CENTER * 2}
            viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
          >
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              stroke={Colors.charcoal}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              stroke={Colors.white}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${CENTER}, ${CENTER}`}
            />
          </Svg>
          <View style={styles.timerCenter}>
            <Text style={styles.timerText}>
              {isFasting ? formatTime(remainingSeconds) : formatTime(targetSeconds)}
            </Text>
            <Text style={styles.timerLabel}>
              {isFasting ? "REMAINING" : "TARGET"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.stateRow}>
          <View
            style={[
              styles.stateDot,
              { backgroundColor: isFasting ? Colors.green : Colors.white },
            ]}
          />
          <Text style={styles.stateText}>
            {isFasting ? "FASTING" : "EATING WINDOW"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.protocolRow}>
          {PROTOCOLS.map((p, i) => (
            <Pressable
              key={p.label}
              onPress={() => handleProtocolSelect(i)}
              style={[
                styles.protocolPill,
                selectedProtocol === i && styles.protocolPillActive,
              ]}
            >
              <Text
                style={[
                  styles.protocolText,
                  selectedProtocol === i && styles.protocolTextActive,
                ]}
              >
                {p.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250)} style={styles.buttonContainer}>
          <Pressable style={styles.mainButton} onPress={handleStartFast}>
            <Text style={styles.mainButtonText}>
              {isFasting ? "BREAK FAST" : "START FAST"}
            </Text>
          </Pressable>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionLabel}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{STATS.currentStreak}</Text>
              <Text style={styles.statLabel}>CURRENT STREAK</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{STATS.longestStreak}</Text>
              <Text style={styles.statLabel}>LONGEST STREAK</Text>
              <Text style={styles.statUnit}>days</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{STATS.totalFasts}</Text>
              <Text style={styles.statLabel}>TOTAL FASTS</Text>
              <Text style={styles.statUnit}>completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{STATS.avgDuration}h</Text>
              <Text style={styles.statLabel}>AVG DURATION</Text>
              <Text style={styles.statUnit}>per fast</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionLabel}>RECENT FASTS</Text>
          {RECENT_FASTS.map((fast, index) => (
            <View key={index} style={styles.historyRow}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyDate}>{fast.date}</Text>
                <Text style={styles.historyProtocol}>{fast.protocol}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyDuration}>{fast.duration}</Text>
                <Ionicons
                  name={fast.completed ? "checkmark" : "close"}
                  size={16}
                  color={fast.completed ? Colors.green : Colors.red}
                />
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
  },
  timerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  timerCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    fontFamily: "Outfit_300Light",
    fontSize: 48,
    color: Colors.white,
  },
  timerLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: 4,
  },
  stateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  stateDot: {
    width: 8,
    height: 8,
  },
  stateText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 3,
  },
  protocolRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  protocolPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.charcoal,
  },
  protocolPillActive: {
    backgroundColor: Colors.white,
  },
  protocolText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: Colors.muted,
    letterSpacing: 1,
  },
  protocolTextActive: {
    color: Colors.deepBlack,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  mainButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mainButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.deepBlack,
    letterSpacing: 3,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 1,
    marginBottom: 32,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.charcoal,
    padding: 20,
    marginBottom: 1,
  },
  statValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 28,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  statUnit: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  historyDate: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.white,
    width: 50,
  },
  historyProtocol: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.muted,
    letterSpacing: 1,
  },
  historyRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  historyDuration: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.white,
  },
});
