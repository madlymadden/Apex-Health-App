import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MetricRing } from "@/components/MetricRing";
import { useHealth } from "@/lib/health-context";
import { formatNumber, type HealthMetric } from "@/lib/health-data";

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: 5, height: 5, borderRadius: 2.5, backgroundColor: color },
        style,
      ]}
    />
  );
}

function AnimatedCounter({ value, fontSize = 96 }: { value: number; fontSize?: number }) {
  const animValue = useSharedValue(0);
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;
    const duration = 800;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <Text
      style={[
        styles.heroNumber,
        { fontSize, lineHeight: fontSize },
      ]}
    >
      {displayValue}
    </Text>
  );
}

function LiveHeartRate() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.liveHeart, style]}>
      <Ionicons name="heart" size={10} color={Colors.red} />
    </Animated.View>
  );
}

function HeroMetric({ metric }: { metric: HealthMetric }) {
  const progress = Math.min(metric.value / metric.goal, 1);

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push({ pathname: "/metric/[id]", params: { id: metric.id } });
      }}
      style={({ pressed }) => [
        styles.heroMetric,
        pressed && { opacity: 0.6 },
      ]}
    >
      <MetricRing
        progress={progress}
        size={56}
        strokeWidth={3}
        color={metric.color}
        bgColor="rgba(255,255,255,0.04)"
      />
      <View style={styles.heroMetricOverlay}>
        <Text style={[styles.heroMetricValue, { color: metric.color }]}>
          {Math.round(progress * 100)}
        </Text>
      </View>
    </Pressable>
  );
}

function MetricRow({ metric }: { metric: HealthMetric }) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/metric/[id]", params: { id: metric.id } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.metricRow,
        pressed && { opacity: 0.5 },
      ]}
    >
      <View style={styles.metricRowLeft}>
        <Text style={styles.metricRowLabel}>{metric.label.toUpperCase()}</Text>
        <View style={styles.metricRowValueRow}>
          <Text style={styles.metricRowValue}>
            {metric.id === "steps"
              ? formatNumber(metric.value)
              : metric.value.toString()}
          </Text>
          {metric.unit ? (
            <Text style={styles.metricRowUnit}>{metric.unit}</Text>
          ) : null}
          {metric.id === "heart" && <LiveHeartRate />}
        </View>
      </View>

      <View style={styles.metricRowRight}>
        <View style={styles.trendContainer}>
          <Ionicons
            name={metric.trend >= 0 ? "arrow-up" : "arrow-down"}
            size={10}
            color={metric.trend >= 0 ? Colors.green : Colors.red}
          />
          <Text
            style={[
              styles.trendText,
              { color: metric.trend >= 0 ? Colors.green : Colors.red },
            ]}
          >
            {Math.abs(metric.trend)}%
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      </View>
    </Pressable>
  );
}

function StreakCalendar() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push({
      day: d.toLocaleDateString("en-US", { weekday: "narrow" }),
      active: Math.random() > 0.2,
      isToday: i === 0,
    });
  }

  return (
    <View style={styles.streakSection}>
      <View style={styles.streakHeader}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <Text style={styles.streakCount}>5 / 7</Text>
      </View>
      <View style={styles.streakRow}>
        {days.map((d, i) => (
          <View key={i} style={styles.streakDay}>
            <Text style={[styles.streakDayLabel, d.isToday && { color: Colors.white }]}>
              {d.day}
            </Text>
            <View
              style={[
                styles.streakDot,
                d.active
                  ? { backgroundColor: Colors.white }
                  : { backgroundColor: "rgba(255,255,255,0.08)" },
                d.isToday && d.active && { backgroundColor: Colors.teal },
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { metrics, refreshMetrics, workouts, isLoading } = useHealth();
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimeout(() => {
      refreshMetrics();
      setRefreshing(false);
    }, 800);
  }, [refreshMetrics]);

  const dateString = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const overallProgress = metrics.length
    ? Math.round(
        (metrics.reduce(
          (sum, m) => sum + Math.min(m.value / m.goal, 1),
          0
        ) /
          metrics.length) *
          100
      )
    : 0;

  const todayWorkouts = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Animated.View entering={FadeIn.duration(600)} style={styles.loadingContent}>
          <Text style={styles.loadingText}>V</Text>
          <View style={styles.loadingDivider} />
          <Text style={styles.loadingSubtext}>LOADING</Text>
        </Animated.View>
      </View>
    );
  }

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
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.liveIndicator}>
                <PulsingDot color={Colors.green} />
                <Text style={styles.liveLabel}>LIVE</Text>
              </View>
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <Pressable
              style={styles.notifButton}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Ionicons name="notifications-outline" size={20} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.heroSection}>
            <AnimatedCounter value={overallProgress} />
            <Text style={styles.heroLabel}>DAILY SCORE</Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroRingsRow}>
              {metrics.map((m) => (
                <HeroMetric key={m.id} metric={m} />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <StreakCalendar />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>TODAY'S METRICS</Text>

          {metrics.map((metric) => (
            <React.Fragment key={metric.id}>
              <MetricRow metric={metric} />
              <View style={styles.rowDivider} />
            </React.Fragment>
          ))}

          {todayWorkouts.length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.todayWorkoutsHeader}>
                <Text style={styles.sectionLabel}>TODAY'S SESSIONS</Text>
                <Text style={styles.todayWorkoutCount}>
                  {todayWorkouts.length}
                </Text>
              </View>
              {todayWorkouts.map((w) => (
                <Pressable
                  key={w.id}
                  onPress={() => router.push({ pathname: "/workout/[id]", params: { id: w.id } })}
                  style={({ pressed }) => [
                    styles.todayWorkoutRow,
                    pressed && { opacity: 0.5 },
                  ]}
                >
                  <View style={styles.todayWorkoutLeft}>
                    <View
                      style={[
                        styles.todayWorkoutDot,
                        {
                          backgroundColor:
                            w.intensity === "high"
                              ? Colors.red
                              : w.intensity === "moderate"
                              ? Colors.white
                              : Colors.muted,
                        },
                      ]}
                    />
                    <Text style={styles.todayWorkoutType}>{w.type}</Text>
                  </View>
                  <Text style={styles.todayWorkoutDuration}>{w.duration}m</Text>
                </Pressable>
              ))}
            </>
          )}

          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <View style={styles.insightDot} />
              <Text style={styles.insightLabel}>INSIGHT</Text>
            </View>
            <Text style={styles.insightText}>
              {overallProgress >= 80
                ? "Outstanding day. You're exceeding targets across all metrics. Keep this momentum going."
                : overallProgress >= 50
                ? "Good progress today. You're on track to hit your daily goals. Stay consistent."
                : "Your day is just getting started. A quick workout could boost your score significantly."}
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
  loadingContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingContent: {
    alignItems: "center" as const,
    gap: 16,
  },
  loadingText: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  loadingDivider: {
    width: 24,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  loadingSubtext: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 40,
  },
  headerLeft: {
    gap: 8,
  },
  liveIndicator: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  liveLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.green,
    letterSpacing: 3,
  },
  dateText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  notifButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroSection: {
    alignItems: "center" as const,
    marginBottom: 40,
  },
  heroNumber: {
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -4,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginTop: 8,
  },
  heroDivider: {
    width: 40,
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  heroRingsRow: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    gap: 24,
  },
  heroMetric: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroMetricOverlay: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroMetricValue: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    letterSpacing: -0.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 20,
  },
  streakSection: {
    marginBottom: 28,
  },
  streakHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  streakCount: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
  },
  streakRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 8,
  },
  streakDay: {
    alignItems: "center" as const,
    gap: 10,
  },
  streakDayLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  streakDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  liveHeart: {
    marginLeft: 6,
  },
  metricRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 18,
  },
  metricRowLeft: {
    gap: 4,
  },
  metricRowLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  metricRowValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  metricRowValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  metricRowUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  metricRowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  trendContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  todayWorkoutsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  todayWorkoutCount: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
    marginBottom: 20,
  },
  todayWorkoutRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
  },
  todayWorkoutLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  todayWorkoutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  todayWorkoutType: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  todayWorkoutDuration: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  insightSection: {
    marginTop: 36,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    paddingTop: 24,
  },
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
