import React, { useState, useCallback } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MiniChart } from "@/components/MiniChart";
import { BarChart } from "@/components/BarChart";
import { useHealth } from "@/lib/health-context";
import { generateWeeklyData, type BodyMetric } from "@/lib/health-data";

function InsightCard({ 
  title, 
  value, 
  trend, 
  unit 
}: { 
  title: string; 
  value: string; 
  trend: "up" | "down" | "stable"; 
  unit: string; 
}) {
  const isPositive = trend === "up" ? false : trend === "down" ? true : null;
  const trendColor = isPositive === true ? Colors.green : isPositive === false ? Colors.red : Colors.muted;

  return (
    <View style={styles.insightCard}>
      <Text style={styles.insightTitle}>{title.toUpperCase()}</Text>
      <View style={styles.insightValueRow}>
        <Text style={styles.insightValue}>{value}</Text>
        <Text style={styles.insightUnit}>{unit}</Text>
      </View>
      <View style={styles.insightTrendRow}>
        <Ionicons
          name={
            trend === "up"
              ? "arrow-up"
              : trend === "down"
              ? "arrow-down"
              : "remove"
          }
          size={12}
          color={trendColor}
        />
        <Text style={[styles.insightTrend, { color: trendColor }]}>
          {trend === "stable" ? "Stable" : isPositive ? "Improving" : "Attention"}
        </Text>
      </View>
    </View>
  );
}

export default function BodyMetricDetailScreen() {
  const insets = useSafeAreaInsets();
  const healthData = useHealth();
  const { bodyMetrics } = healthData;
  const { id } = useLocalSearchParams<{ id: string }>();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const metric = bodyMetrics.find((m: BodyMetric) => m.label.toLowerCase() === id?.toLowerCase());

  if (!metric) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <Text style={styles.errorText}>Metric not found</Text>
      </View>
    );
  }

  const weeklyData = generateWeeklyData(metric.label.toLowerCase().replace(" ", ""));
  const isPositiveTrend = metric.trend === "down" && 
    (metric.label === "Weight" || metric.label === "Body Fat" || metric.label === "Resting HR");

  const handleBack = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

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
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={handleBack}>
              <Ionicons name="chevron-down" size={24} color={Colors.white} />
            </Pressable>
            <Text style={styles.screenTitle}>{metric.label.toUpperCase()}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{metric.value}</Text>
              <Text style={styles.heroUnit}>{metric.unit}</Text>
            </View>
            
            <View style={styles.trendBadge}>
              <Ionicons
                name={
                  metric.trend === "up"
                    ? "arrow-up"
                    : metric.trend === "down"
                    ? "arrow-down"
                    : "remove"
                }
                size={16}
                color={isPositiveTrend ? Colors.green : metric.trend === "stable" ? Colors.muted : Colors.red}
              />
              <Text style={[
                styles.trendText,
                { color: isPositiveTrend ? Colors.green : metric.trend === "stable" ? Colors.muted : Colors.red }
              ]}>
                {metric.trend === "stable" ? "Stable" : isPositiveTrend ? "Improving" : "Attention"}
              </Text>
            </View>

            <View style={styles.chartContainer}>
              <MiniChart
                data={metric.history}
                width={280}
                height={120}
                color={isPositiveTrend ? Colors.green : metric.trend === "stable" ? Colors.muted : Colors.red}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>WEEKLY BREAKDOWN</Text>
          <View style={styles.weeklyChartContainer}>
            <BarChart
              data={weeklyData}
              width={320}
              height={180}
              color={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>INSIGHTS</Text>
          <View style={styles.insightsGrid}>
            <InsightCard
              title="7-Day Avg"
              value={metric.value}
              trend={metric.trend}
              unit={metric.unit}
            />
            <InsightCard
              title="Best This Week"
              value={metric.history ? Math.min(...metric.history).toFixed(1) : metric.value}
              trend={isPositiveTrend ? "down" : "up"}
              unit={metric.unit}
            />
            <InsightCard
              title="Monthly Change"
              value={metric.history && metric.history.length > 4 
                ? (parseFloat(metric.value) - metric.history[metric.history.length - 1]).toFixed(1)
                : "0.0"
              }
              trend={metric.trend}
              unit={metric.unit}
            />
            <InsightCard
              title="Goal Progress"
              value={isPositiveTrend ? "On Track" : "Needs Work"}
              trend={isPositiveTrend ? "down" : "up"}
              unit=""
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.recommendationSection}>
            <View style={styles.recommendationHeader}>
              <Ionicons name="bulb-outline" size={16} color={Colors.teal} />
              <Text style={styles.recommendationLabel}>RECOMMENDATION</Text>
            </View>
            <Text style={styles.recommendationText}>
              {metric.label === "Weight" && isPositiveTrend
                ? "Great progress! Your weight is trending down. Continue with your current nutrition and exercise routine."
                : metric.label === "Weight" && !isPositiveTrend
                ? "Your weight is trending up. Consider reviewing your caloric intake and increasing physical activity."
                : metric.label === "Body Fat" && isPositiveTrend
                ? "Excellent! Your body composition is improving. Keep up the strength training and balanced nutrition."
                : metric.label === "Body Fat" && !isPositiveTrend
                ? "Body fat is increasing. Focus on resistance training and monitor your macronutrient balance."
                : metric.label === "Muscle Mass" && metric.trend === "up"
                ? "Muscle mass is increasing! Your strength training is effective. Ensure adequate protein intake."
                : metric.label === "Resting HR" && isPositiveTrend
                ? "Your cardiovascular fitness is improving. Resting heart rate is decreasing, which is excellent."
                : metric.label === "VO2 Max" && metric.trend === "up"
                ? "Great improvement in aerobic capacity. Your endurance training is paying off."
                : "Continue monitoring this metric regularly and consult with healthcare provider if concerned."
              }
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
  centerContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  screenTitle: {
    fontSize: 20,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: "center" as const,
    marginBottom: 32,
  },
  heroValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 8,
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 72,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -3,
  },
  heroUnit: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  trendBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 24,
  },
  trendText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
  },
  chartContainer: {
    alignItems: "center" as const,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 20,
  },
  weeklyChartContainer: {
    alignItems: "center" as const,
    marginBottom: 8,
  },
  insightsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  insightCard: {
    width: "48%",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  insightTitle: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  insightValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  insightUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  insightTrendRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  insightTrend: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
  },
  recommendationSection: {
    backgroundColor: "rgba(0,184,148,0.08)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 0.5,
    borderColor: "rgba(0,184,148,0.2)",
  },
  recommendationHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  recommendationLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.teal,
    letterSpacing: 3,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
});
