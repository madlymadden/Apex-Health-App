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
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MiniChart } from "@/components/MiniChart";
import { generateBodyMetrics, type BodyMetric } from "@/lib/health-data";

function BodyMetricCard({
  metric,
  index,
}: {
  metric: BodyMetric;
  index: number;
}) {
  const trendIcon =
    metric.trend === "up"
      ? "trending-up"
      : metric.trend === "down"
      ? "trending-down"
      : "remove";
  const trendColor =
    metric.label === "Weight" || metric.label === "Body Fat" || metric.label === "Resting HR"
      ? metric.trend === "down"
        ? Colors.greenAccent
        : metric.trend === "up"
        ? Colors.redAccent
        : Colors.lightGray
      : metric.trend === "up"
      ? Colors.greenAccent
      : metric.trend === "down"
      ? Colors.redAccent
      : Colors.lightGray;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.bodyCard,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <View style={styles.bodyCardLeft}>
          <Text style={styles.bodyLabel}>{metric.label}</Text>
          <View style={styles.bodyValueRow}>
            <Text style={styles.bodyValue}>{metric.value}</Text>
            <Text style={styles.bodyUnit}>{metric.unit}</Text>
          </View>
          <View style={styles.trendBadge}>
            <Ionicons name={trendIcon as any} size={12} color={trendColor} />
            <Text style={[styles.trendLabel, { color: trendColor }]}>
              {metric.trend === "up"
                ? "Improving"
                : metric.trend === "down"
                ? metric.label === "Weight" || metric.label === "Body Fat" || metric.label === "Resting HR"
                  ? "Improving"
                  : "Declining"
                : "Stable"}
            </Text>
          </View>
        </View>

        <View style={styles.bodyCardRight}>
          <MiniChart
            data={metric.history}
            width={100}
            height={50}
            color={trendColor}
          />
          <Text style={styles.chartLabel}>7-week trend</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setMetrics(generateBodyMetrics());
  }, []);

  const weight = metrics.find((m) => m.label === "Weight");
  const bodyFat = metrics.find((m) => m.label === "Body Fat");

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
      >
        <Text style={styles.screenTitle}>Body</Text>

        {weight && bodyFat && (
          <View style={styles.highlightCard}>
            <LinearGradient
              colors={["rgba(201,169,110,0.15)", "rgba(201,169,110,0.03)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.highlightRow}>
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Weight</Text>
                <View style={styles.highlightValueRow}>
                  <Text style={styles.highlightValue}>{weight.value}</Text>
                  <Text style={styles.highlightUnit}>{weight.unit}</Text>
                </View>
                <MiniChart
                  data={weight.history}
                  width={120}
                  height={40}
                  color={Colors.gold}
                />
              </View>
              <View style={styles.highlightDivider} />
              <View style={styles.highlightItem}>
                <Text style={styles.highlightLabel}>Body Fat</Text>
                <View style={styles.highlightValueRow}>
                  <Text style={styles.highlightValue}>{bodyFat.value}</Text>
                  <Text style={styles.highlightUnit}>{bodyFat.unit}</Text>
                </View>
                <MiniChart
                  data={bodyFat.history}
                  width={120}
                  height={40}
                  color={Colors.goldLight}
                />
              </View>
            </View>

            <View style={styles.progressNote}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.greenAccent} />
              <Text style={styles.progressNoteText}>
                Down 3.8 lbs and 2.8% body fat in 7 weeks
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>All Metrics</Text>

        {metrics.map((metric, index) => (
          <BodyMetricCard key={metric.label} metric={metric} index={index} />
        ))}
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
  screenTitle: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  highlightCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.15)",
  },
  highlightRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  highlightItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 8,
  },
  highlightDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 12,
  },
  highlightLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
    color: Colors.lightGray,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  highlightValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  highlightValue: {
    fontSize: 28,
    fontFamily: "Outfit_700Bold",
    color: Colors.gold,
  },
  highlightUnit: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.goldDim,
  },
  progressNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  progressNoteText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  bodyCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  bodyCardLeft: {
    flex: 1,
  },
  bodyLabel: {
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    color: Colors.lightGray,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  bodyValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
    marginBottom: 6,
  },
  bodyValue: {
    fontSize: 24,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
  },
  bodyUnit: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
  },
  trendBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  trendLabel: {
    fontSize: 11,
    fontFamily: "Outfit_500Medium",
  },
  bodyCardRight: {
    alignItems: "flex-end" as const,
    gap: 4,
  },
  chartLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    letterSpacing: 0.3,
  },
});
