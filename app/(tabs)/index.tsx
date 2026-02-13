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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
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

function MetricRow({
  metric,
}: {
  metric: HealthMetric;
}) {
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
            <Text style={styles.heroNumber}>{overallProgress}</Text>
            <Text style={styles.heroLabel}>DAILY SCORE</Text>
            <View style={styles.heroDivider} />
            <View style={styles.heroRingsRow}>
              {metrics.map((m) => (
                <HeroMetric key={m.id} metric={m} />
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>TODAY'S METRICS</Text>

          {metrics.map((metric) => (
            <React.Fragment key={metric.id}>
              <MetricRow metric={metric} />
              <View style={styles.rowDivider} />
            </React.Fragment>
          ))}

          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <View style={styles.insightDot} />
              <Text style={styles.insightLabel}>INSIGHT</Text>
            </View>
            <Text style={styles.insightText}>
              Your resting heart rate has improved 4% this week. Consistent
              training is showing measurable cardiovascular gains.
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
    fontSize: 96,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -4,
    lineHeight: 96,
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
