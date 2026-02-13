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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MetricRing } from "@/components/MetricRing";
import {
  generateDailyMetrics,
  formatNumber,
  type HealthMetric,
} from "@/lib/health-data";

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }, style]}
    />
  );
}

function MetricCard({ metric, index }: { metric: HealthMetric; index: number }) {
  const progress = Math.min(metric.value / metric.goal, 1);

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: "/metric/[id]", params: { id: metric.id } });
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.metricCard,
          pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        ]}
      >
        <View style={styles.metricHeader}>
          <View style={styles.metricLabelRow}>
            <Ionicons
              name={metric.icon as any}
              size={14}
              color={metric.color}
            />
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
          {metric.id === "heart" && <PulsingDot color={metric.color} />}
        </View>

        <View style={styles.metricCenter}>
          <MetricRing
            progress={progress}
            size={80}
            strokeWidth={6}
            color={metric.color}
          />
          <View style={styles.metricValueOverlay}>
            <Text style={[styles.metricValue, { color: metric.color }]}>
              {metric.id === "steps"
                ? formatNumber(metric.value)
                : metric.value}
            </Text>
            {metric.unit ? (
              <Text style={styles.metricUnit}>{metric.unit}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metricFooter}>
          <View style={styles.trendRow}>
            <Ionicons
              name={metric.trend >= 0 ? "trending-up" : "trending-down"}
              size={12}
              color={metric.trend >= 0 ? Colors.greenAccent : Colors.redAccent}
            />
            <Text
              style={[
                styles.trendText,
                {
                  color:
                    metric.trend >= 0 ? Colors.greenAccent : Colors.redAccent,
                },
              ]}
            >
              {Math.abs(metric.trend)}%
            </Text>
          </View>
          <Text style={styles.goalText}>
            {metric.id === "heart"
              ? "resting"
              : `/ ${formatNumber(metric.goal)}`}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setMetrics(generateDailyMetrics());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimeout(() => {
      setMetrics(generateDailyMetrics());
      setRefreshing(false);
    }, 800);
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.dateText}>{dateString}</Text>
          </View>
          <View style={styles.liveBadge}>
            <PulsingDot color={Colors.greenAccent} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <LinearGradient
            colors={["rgba(201,169,110,0.15)", "rgba(201,169,110,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.summaryTitle}>Today's Progress</Text>
          <View style={styles.summaryRow}>
            {metrics.map((m) => {
              const pct = Math.min(Math.round((m.value / m.goal) * 100), 100);
              return (
                <View key={m.id} style={styles.summaryItem}>
                  <MetricRing
                    progress={m.value / m.goal}
                    size={44}
                    strokeWidth={4}
                    color={m.color}
                  />
                  <Text style={styles.summaryPct}>{pct}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </View>

        <View style={styles.insightCard}>
          <LinearGradient
            colors={["rgba(90,200,250,0.1)", "rgba(90,200,250,0.02)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="sparkles" size={18} color={Colors.blueAccent} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Daily Insight</Text>
            <Text style={styles.insightText}>
              Your resting heart rate has improved 4% this week. Keep up the
              consistent training.
            </Text>
          </View>
        </View>
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
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  liveBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(76, 217, 100, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  liveText: {
    fontSize: 10,
    fontFamily: "Outfit_700Bold",
    color: Colors.greenAccent,
    letterSpacing: 1.5,
  },
  summaryCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.15)",
  },
  summaryTitle: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
  },
  summaryItem: {
    alignItems: "center" as const,
    gap: 6,
  },
  summaryPct: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.offWhite,
  },
  metricsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: "48%" as any,
    flexBasis: "47%" as any,
    flexGrow: 1,
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  metricHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  metricLabelRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    color: Colors.lightGray,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  metricCenter: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
  },
  metricValueOverlay: {
    position: "absolute" as const,
    alignItems: "center" as const,
  },
  metricValue: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -0.5,
  },
  metricUnit: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: -2,
  },
  metricFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  trendRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  trendText: {
    fontSize: 11,
    fontFamily: "Outfit_600SemiBold",
  },
  goalText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
  },
  insightCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 14,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(90,200,250,0.1)",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.blueAccent,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    lineHeight: 20,
  },
});
