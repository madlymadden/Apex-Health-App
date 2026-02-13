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
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MetricRing } from "@/components/MetricRing";
import { BarChart } from "@/components/BarChart";
import {
  generateDailyMetrics,
  generateWeeklyData,
  formatNumber,
  type HealthMetric,
  type WeeklyData,
} from "@/lib/health-data";

export default function MetricDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [metric, setMetric] = useState<HealthMetric | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    const metrics = generateDailyMetrics();
    const found = metrics.find((m) => m.id === id);
    if (found) setMetric(found);
    if (id) setWeeklyData(generateWeeklyData(id));
  }, [id]);

  if (!metric) {
    return (
      <View
        style={[styles.container, { paddingTop: insets.top + webTopInset }]}
      />
    );
  }

  const progress = Math.min(metric.value / metric.goal, 1);
  const avgValue = weeklyData.length
    ? Math.round(
        weeklyData.reduce((s, d) => s + d.value, 0) / weeklyData.length
      )
    : 0;
  const maxValue = weeklyData.length
    ? Math.max(...weeklyData.map((d) => d.value))
    : 0;
  const minValue = weeklyData.length
    ? Math.min(...weeklyData.map((d) => d.value))
    : 0;

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
            <Text style={styles.headerTitle}>
              {metric.label.toUpperCase()}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.heroSection}>
            <MetricRing
              progress={progress}
              size={180}
              strokeWidth={4}
              color={metric.color}
              bgColor="rgba(255,255,255,0.03)"
            />
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroValue, { color: Colors.white }]}>
                {metric.id === "steps"
                  ? formatNumber(metric.value)
                  : metric.value}
              </Text>
              {metric.unit ? (
                <Text style={styles.heroUnit}>{metric.unit}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.heroMeta}>
            <View style={styles.trendPill}>
              <Ionicons
                name={metric.trend >= 0 ? "arrow-up" : "arrow-down"}
                size={11}
                color={
                  metric.trend >= 0 ? Colors.green : Colors.red
                }
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      metric.trend >= 0 ? Colors.green : Colors.red,
                  },
                ]}
              >
                {Math.abs(metric.trend)}% vs last week
              </Text>
            </View>
            <Text style={styles.goalText}>
              {metric.id === "heart"
                ? "Resting average"
                : `Goal: ${formatNumber(metric.goal)} ${metric.unit}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.chartSection}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartLabel}>WEEKLY OVERVIEW</Text>
              <View style={styles.timeToggle}>
                {(["week", "month"] as const).map((range) => (
                  <Pressable
                    key={range}
                    onPress={() => {
                      setTimeRange(range);
                      if (Platform.OS !== "web") {
                        Haptics.selectionAsync();
                      }
                      if (id) setWeeklyData(generateWeeklyData(id));
                    }}
                    style={[
                      styles.timeButton,
                      timeRange === range && styles.timeButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeButtonText,
                        timeRange === range && styles.timeButtonTextActive,
                      ]}
                    >
                      {range === "week" ? "7D" : "30D"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <BarChart
              data={weeklyData}
              color={metric.color}
              goal={metric.id !== "heart" ? metric.goal : undefined}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AVERAGE</Text>
              <Text style={styles.statValue}>
                {metric.id === "steps" ? formatNumber(avgValue) : avgValue}
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>BEST</Text>
              <Text style={[styles.statValue, { color: Colors.green }]}>
                {metric.id === "steps" ? formatNumber(maxValue) : maxValue}
              </Text>
            </View>
            <View style={styles.statsDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>LOWEST</Text>
              <Text style={styles.statValue}>
                {metric.id === "steps" ? formatNumber(minValue) : minValue}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.insightSection}>
            <View style={styles.insightHeader}>
              <View style={styles.insightDot} />
              <Text style={styles.insightLabel}>INSIGHT</Text>
            </View>
            <Text style={styles.insightText}>
              {metric.id === "steps"
                ? "You're most active on weekdays, averaging 20% more steps than weekends. Try a longer weekend walk to balance your activity."
                : metric.id === "calories"
                ? "Your calorie burn peaks mid-week with your strength training sessions. Maintain this pattern for consistent results."
                : metric.id === "heart"
                ? "Your resting heart rate has been trending downward, indicating improved cardiovascular fitness."
                : "You've been hitting your active minutes goal consistently. Consider increasing your target for the next challenge."}
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
    marginBottom: 32,
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
    justifyContent: "center" as const,
    marginBottom: 24,
  },
  heroOverlay: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroValue: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    letterSpacing: -2,
  },
  heroUnit: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: -2,
    letterSpacing: 1,
  },
  heroMeta: {
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 32,
  },
  trendPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
  },
  trendText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    letterSpacing: 0.5,
  },
  goalText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  chartSection: {},
  chartHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  timeToggle: {
    flexDirection: "row" as const,
    gap: 2,
  },
  timeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timeButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
  },
  timeButtonText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  timeButtonTextActive: {
    color: Colors.white,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 6,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statsDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
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
