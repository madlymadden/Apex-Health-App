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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
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
      <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const progress = Math.min(metric.value / metric.goal, 1);
  const avgValue = weeklyData.length
    ? Math.round(weeklyData.reduce((s, d) => s + d.value, 0) / weeklyData.length)
    : 0;
  const maxValue = weeklyData.length ? Math.max(...weeklyData.map((d) => d.value)) : 0;
  const minValue = weeklyData.length ? Math.min(...weeklyData.map((d) => d.value)) : 0;

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
            <Ionicons name="chevron-down" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.headerTitle}>{metric.label}</Text>
          <View style={{ width: 36 }} />
        </View>

        <Animated.View entering={FadeIn.duration(600)} style={styles.heroSection}>
          <LinearGradient
            colors={[`${metric.color}20`, `${metric.color}05`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MetricRing
            progress={progress}
            size={160}
            strokeWidth={10}
            color={metric.color}
          />
          <View style={styles.heroOverlay}>
            <Text style={[styles.heroValue, { color: metric.color }]}>
              {metric.id === "steps" ? formatNumber(metric.value) : metric.value}
            </Text>
            {metric.unit ? (
              <Text style={styles.heroUnit}>{metric.unit}</Text>
            ) : null}
          </View>

          <View style={styles.heroFooter}>
            <View style={styles.trendPill}>
              <Ionicons
                name={metric.trend >= 0 ? "trending-up" : "trending-down"}
                size={14}
                color={metric.trend >= 0 ? Colors.greenAccent : Colors.redAccent}
              />
              <Text
                style={[
                  styles.trendPillText,
                  {
                    color:
                      metric.trend >= 0 ? Colors.greenAccent : Colors.redAccent,
                  },
                ]}
              >
                {Math.abs(metric.trend)}% vs last week
              </Text>
            </View>
            <Text style={styles.goalSubtext}>
              {metric.id === "heart"
                ? "Resting average"
                : `Goal: ${formatNumber(metric.goal)} ${metric.unit}`}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.chartSection}
        >
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Weekly Overview</Text>
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
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.statsGrid}
        >
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Average</Text>
            <Text style={[styles.statItemValue, { color: metric.color }]}>
              {metric.id === "steps" ? formatNumber(avgValue) : avgValue}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Best</Text>
            <Text style={[styles.statItemValue, { color: Colors.greenAccent }]}>
              {metric.id === "steps" ? formatNumber(maxValue) : maxValue}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statItemLabel}>Lowest</Text>
            <Text style={[styles.statItemValue, { color: Colors.lightGray }]}>
              {metric.id === "steps" ? formatNumber(minValue) : minValue}
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.insightSection}
        >
          <LinearGradient
            colors={[`${metric.color}12`, `${metric.color}03`]}
            style={StyleSheet.absoluteFill}
          />
          <Ionicons name="analytics" size={20} color={metric.color} />
          <View style={styles.insightContent}>
            <Text style={[styles.insightTitle, { color: metric.color }]}>
              Insight
            </Text>
            <Text style={styles.insightText}>
              {metric.id === "steps"
                ? "You're most active on weekdays, averaging 20% more steps than weekends. Try a longer weekend walk to balance your activity."
                : metric.id === "calories"
                ? "Your calorie burn peaks mid-week with your strength training sessions. Maintain this pattern for consistent results."
                : metric.id === "heart"
                ? "Your resting heart rate has been trending downward, indicating improved cardiovascular fitness. Great progress."
                : "You've been hitting your active minutes goal consistently. Consider increasing your target to 60 minutes for the next challenge."}
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
    paddingHorizontal: 20,
  },
  loadingText: {
    color: Colors.lightGray,
    fontFamily: "Outfit_400Regular",
    textAlign: "center" as const,
    marginTop: 100,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.charcoal,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  heroSection: {
    backgroundColor: Colors.charcoal,
    borderRadius: 24,
    padding: 28,
    alignItems: "center" as const,
    marginBottom: 16,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  heroOverlay: {
    position: "absolute" as const,
    top: 28,
    left: 0,
    right: 0,
    height: 160,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroValue: {
    fontSize: 42,
    fontFamily: "Outfit_700Bold",
    letterSpacing: -1,
  },
  heroUnit: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: -2,
  },
  heroFooter: {
    alignItems: "center" as const,
    gap: 6,
    marginTop: 20,
  },
  trendPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trendPillText: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
  },
  goalSubtext: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
  },
  chartSection: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  chartHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.white,
  },
  timeToggle: {
    flexDirection: "row" as const,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 2,
  },
  timeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeButtonActive: {
    backgroundColor: Colors.gold,
  },
  timeButtonText: {
    fontSize: 12,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.lightGray,
  },
  timeButtonTextActive: {
    color: Colors.black,
  },
  statsGrid: {
    flexDirection: "row" as const,
    backgroundColor: Colors.charcoal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
  },
  statItemLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
    color: Colors.lightGray,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  statItemValue: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignSelf: "center" as const,
  },
  insightSection: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 14,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
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
