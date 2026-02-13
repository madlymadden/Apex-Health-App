import React from "react";
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
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { MiniChart } from "@/components/MiniChart";
import { useHealth } from "@/lib/health-context";
import { type BodyMetric } from "@/lib/health-data";

function BodyMetricRow({ metric }: { metric: BodyMetric }) {
  const isPositive =
    metric.label === "Weight" || metric.label === "Body Fat" || metric.label === "Resting HR"
      ? metric.trend === "down"
      : metric.trend === "up";
  const trendColor = isPositive
    ? Colors.green
    : metric.trend === "stable"
    ? Colors.muted
    : Colors.red;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.bodyRow,
        pressed && { opacity: 0.5 },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push({ pathname: "/body/[id]", params: { id: metric.label.toLowerCase() } });
      }}
    >
      <View style={styles.bodyRowLeft}>
        <Text style={styles.bodyLabel}>{metric.label.toUpperCase()}</Text>
        <View style={styles.bodyValueRow}>
          <Text style={styles.bodyValue}>{metric.value}</Text>
          <Text style={styles.bodyUnit}>{metric.unit}</Text>
        </View>
      </View>

      <View style={styles.bodyRowRight}>
        <MiniChart
          data={metric.history}
          width={72}
          height={32}
          color={trendColor}
        />
        <View style={styles.trendBadge}>
          <Ionicons
            name={
              metric.trend === "up"
                ? "arrow-up"
                : metric.trend === "down"
                ? "arrow-down"
                : "remove"
            }
            size={10}
            color={trendColor}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const { bodyMetrics } = useHealth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const weight = bodyMetrics.find((m) => m.label === "Weight");
  const bodyFat = bodyMetrics.find((m) => m.label === "Body Fat");

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
          <Text style={styles.screenTitle}>Body</Text>

          {weight && bodyFat && (
            <View style={styles.heroSection}>
              <View style={styles.heroRow}>
                <View style={styles.heroItem}>
                  <Text style={styles.heroLabel}>WEIGHT</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{weight.value}</Text>
                    <Text style={styles.heroUnit}>{weight.unit}</Text>
                  </View>
                  <MiniChart
                    data={weight.history}
                    width={100}
                    height={36}
                    color={Colors.white}
                  />
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroItem}>
                  <Text style={styles.heroLabel}>BODY FAT</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{bodyFat.value}</Text>
                    <Text style={styles.heroUnit}>{bodyFat.unit}</Text>
                  </View>
                  <MiniChart
                    data={bodyFat.history}
                    width={100}
                    height={36}
                    color={Colors.white}
                  />
                </View>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressDot} />
                <Text style={styles.progressText}>
                  Down 3.8 lbs and 2.8% body fat over 7 weeks
                </Text>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>ALL METRICS</Text>

          {bodyMetrics.map((metric, index) => (
            <React.Fragment key={metric.label}>
              <BodyMetricRow metric={metric} />
              {index < bodyMetrics.length - 1 && (
                <View style={styles.rowDivider} />
              )}
            </React.Fragment>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 36,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  heroItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 10,
  },
  heroDivider: {
    width: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  heroLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  heroValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  heroValue: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1.5,
  },
  heroUnit: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  progressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.green,
  },
  progressText: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    flex: 1,
    letterSpacing: 0.2,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  bodyRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 18,
  },
  bodyRowLeft: {
    gap: 4,
  },
  bodyLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  bodyValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  bodyValue: {
    fontSize: 26,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  bodyUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  bodyRowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  trendBadge: {
    width: 20,
    height: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
