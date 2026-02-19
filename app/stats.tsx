import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import Colors from "@/constants/colors";

const PERIODS = ["WEEK", "MONTH", "YEAR", "ALL"] as const;

const OVERVIEW = [
  { label: "WORKOUTS", value: "24" },
  { label: "HOURS", value: "18.5" },
  { label: "AVG MIN", value: "46" },
  { label: "CALORIES", value: "9,240" },
];

const WEEKLY_THIS = [65, 80, 45, 90, 70, 55, 40];
const WEEKLY_LAST = [50, 60, 70, 55, 45, 80, 35];
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const WORKOUT_TYPES = [
  { label: "Strength", pct: 42, color: Colors.white },
  { label: "Running", pct: 28, color: Colors.teal },
  { label: "HIIT", pct: 18, color: Colors.gold },
  { label: "Yoga", pct: 12, color: Colors.muted },
];

const MONTHLY_VOLUME = [
  { label: "WK 1", value: 320 },
  { label: "WK 2", value: 480 },
  { label: "WK 3", value: 410 },
  { label: "WK 4", value: 530 },
];

const HEATMAP_DATA = [
  [3, 2, 0, 1, 3, 2, 0],
  [1, 3, 2, 0, 1, 3, 1],
  [2, 0, 3, 2, 1, 0, 2],
  [3, 1, 2, 3, 0, 2, 1],
];
const HEATMAP_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const TRENDS = [
  { label: "AVG HEART RATE", value: "68 bpm", change: -3, good: true },
  { label: "WEIGHT", value: "172 lbs", change: -1.2, good: true },
  { label: "SLEEP QUALITY", value: "87%", change: 5, good: true },
];

function getHeatColor(level: number) {
  if (level === 0) return Colors.charcoal;
  if (level === 1) return "rgba(90, 200, 212, 0.25)";
  if (level === 2) return "rgba(90, 200, 212, 0.55)";
  return Colors.teal;
}

function WeeklyComparisonChart() {
  const chartW = Dimensions.get("window").width - 48;
  const barGroupW = chartW / 7;
  const barW = 8;
  const chartH = 100;
  const max = Math.max(...WEEKLY_THIS, ...WEEKLY_LAST);

  return (
    <View>
      <Text style={styles.sectionLabel}>WEEKLY COMPARISON</Text>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.white }]} />
          <Text style={styles.legendText}>This week</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.muted }]} />
          <Text style={styles.legendText}>Last week</Text>
        </View>
      </View>
      <Svg width={chartW} height={chartH + 20}>
        {DAYS.map((day, i) => {
          const x = i * barGroupW + barGroupW / 2;
          const hThis = (WEEKLY_THIS[i] / max) * chartH;
          const hLast = (WEEKLY_LAST[i] / max) * chartH;
          return (
            <React.Fragment key={i}>
              <Rect
                x={x - barW - 1}
                y={chartH - hLast}
                width={barW}
                height={hLast}
                fill={Colors.muted}
                rx={2}
              />
              <Rect
                x={x + 1}
                y={chartH - hThis}
                width={barW}
                height={hThis}
                fill={Colors.white}
                rx={2}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={[styles.dayLabelsRow, { width: chartW }]}>
        {DAYS.map((d, i) => (
          <Text key={i} style={[styles.dayLabel, { width: barGroupW }]}>
            {d}
          </Text>
        ))}
      </View>
    </View>
  );
}

function MonthlyVolumeChart() {
  const chartW = Dimensions.get("window").width - 48;
  const barW = 36;
  const chartH = 90;
  const max = Math.max(...MONTHLY_VOLUME.map((w) => w.value));
  const gap = (chartW - barW * 4) / 5;

  return (
    <View>
      <Text style={styles.sectionLabel}>MONTHLY VOLUME</Text>
      <Svg width={chartW} height={chartH}>
        {MONTHLY_VOLUME.map((week, i) => {
          const h = (week.value / max) * chartH;
          const x = gap + i * (barW + gap);
          return (
            <Rect
              key={i}
              x={x}
              y={chartH - h}
              width={barW}
              height={h}
              fill={Colors.teal}
              rx={3}
              opacity={0.4 + (i / 3) * 0.6}
            />
          );
        })}
      </Svg>
      <View style={[styles.monthLabelsRow, { width: chartW }]}>
        {MONTHLY_VOLUME.map((w, i) => {
          const x = gap + i * (barW + gap);
          return (
            <Text
              key={i}
              style={[
                styles.dayLabel,
                { position: "absolute" as const, left: x, width: barW, textAlign: "center" as const },
              ]}
            >
              {w.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

function PerformanceGauge({ score }: { score: number }) {
  const size = 140;
  const strokeW = 6;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = 135;
  const sweepAngle = 270;
  const endAngle = startAngle + sweepAngle;
  const filledAngle = startAngle + (score / 100) * sweepAngle;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const arcPath = (start: number, end: number) => {
    const s = toRad(start);
    const e = toRad(end);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <View style={{ alignItems: "center" as const }}>
      <Svg width={size} height={size}>
        <Path
          d={arcPath(startAngle, endAngle)}
          stroke={Colors.charcoal}
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={arcPath(startAngle, filledAngle)}
          stroke={Colors.teal}
          strokeWidth={strokeW}
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeScore}>{score}</Text>
        <Text style={styles.gaugeLabel}>PERFORMANCE</Text>
      </View>
    </View>
  );
}

function HeatmapCell({ level }: { level: number }) {
  return (
    <View
      style={[
        styles.heatCell,
        { backgroundColor: getHeatColor(level) },
      ]}
    />
  );
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>("WEEK");

  const handleBack = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handlePeriod = (p: (typeof PERIODS)[number]) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActivePeriod(p);
  };

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
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>ANALYTICS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <Pressable
                key={p}
                onPress={() => handlePeriod(p)}
                style={[
                  styles.periodTab,
                  activePeriod === p && styles.periodTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.periodText,
                    activePeriod === p && styles.periodTextActive,
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.overviewRow}>
            {OVERVIEW.map((item, i) => (
              <Animated.View
                key={item.label}
                entering={FadeInDown.delay(80 * i).duration(300)}
                style={styles.overviewCard}
              >
                <Text style={styles.overviewValue}>{item.value}</Text>
                <Text style={styles.overviewLabel}>{item.label}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <WeeklyComparisonChart />
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <Text style={styles.sectionLabel}>WORKOUT DISTRIBUTION</Text>
            {WORKOUT_TYPES.map((type, i) => (
              <View key={type.label} style={styles.distRow}>
                <View style={styles.distLabelRow}>
                  <Text style={styles.distLabel}>{type.label}</Text>
                  <Text style={styles.distPct}>{type.pct}%</Text>
                </View>
                <View style={styles.distBarBg}>
                  <View
                    style={[
                      styles.distBarFill,
                      {
                        width: `${type.pct}%` as any,
                        backgroundColor: type.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(400).duration(400)}>
            <MonthlyVolumeChart />
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(500).duration(400)}>
            <Text style={styles.sectionLabel}>CONSISTENCY</Text>
            <View style={styles.heatmapHeader}>
              {HEATMAP_DAYS.map((d, i) => (
                <Text key={i} style={styles.heatmapDayLabel}>
                  {d}
                </Text>
              ))}
            </View>
            {HEATMAP_DATA.map((week, wi) => (
              <View key={wi} style={styles.heatRow}>
                {week.map((level, di) => (
                  <HeatmapCell key={`${wi}-${di}`} level={level} />
                ))}
              </View>
            ))}
            <View style={styles.heatLegendRow}>
              <Text style={styles.heatLegendText}>Less</Text>
              {[0, 1, 2, 3].map((l) => (
                <View
                  key={l}
                  style={[styles.heatLegendCell, { backgroundColor: getHeatColor(l) }]}
                />
              ))}
              <Text style={styles.heatLegendText}>More</Text>
            </View>
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <Text style={styles.sectionLabel}>TRENDS</Text>
            {TRENDS.map((trend, i) => (
              <View key={trend.label}>
                <View style={styles.trendRow}>
                  <View>
                    <Text style={styles.trendLabel}>{trend.label}</Text>
                    <Text style={styles.trendValue}>{trend.value}</Text>
                  </View>
                  <View style={styles.trendChange}>
                    <Ionicons
                      name={trend.change < 0 ? "arrow-down" : "arrow-up"}
                      size={12}
                      color={trend.good ? Colors.green : Colors.red}
                    />
                    <Text
                      style={[
                        styles.trendChangeText,
                        { color: trend.good ? Colors.green : Colors.red },
                      ]}
                    >
                      {Math.abs(trend.change)}
                      {trend.label === "WEIGHT" ? " lbs" : trend.label === "SLEEP QUALITY" ? "%" : " bpm"}
                    </Text>
                  </View>
                </View>
                {i < TRENDS.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))}
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <Text style={styles.sectionLabel}>PERFORMANCE INDEX</Text>
            <PerformanceGauge score={78} />
          </Animated.View>

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.delay(800).duration(400)}>
            <View style={styles.calloutRow}>
              <View style={styles.calloutCard}>
                <Ionicons name="trophy-outline" size={18} color={Colors.gold} />
                <Text style={styles.calloutTitle}>BEST DAY</Text>
                <Text style={styles.calloutValue}>Wednesday</Text>
                <Text style={styles.calloutSub}>847 cal burned</Text>
              </View>
              <View style={styles.calloutCard}>
                <Ionicons name="time-outline" size={18} color={Colors.teal} />
                <Text style={styles.calloutTitle}>PEAK HOURS</Text>
                <Text style={styles.calloutValue}>6 – 8 AM</Text>
                <Text style={styles.calloutSub}>Most active period</Text>
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepBlack },
  scrollContent: { paddingHorizontal: 24 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
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
  periodRow: {
    flexDirection: "row" as const,
    gap: 6,
    marginBottom: 4,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center" as const,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  periodTabActive: {
    borderColor: Colors.white,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  periodText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  periodTextActive: {
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 28 },
  overviewRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    minWidth: "45%" as any,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
  },
  overviewValue: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  overviewLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 20,
  },
  chartLegend: {
    flexDirection: "row" as const,
    gap: 16,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
  },
  dayLabelsRow: {
    flexDirection: "row" as const,
    marginTop: 6,
  },
  dayLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    textAlign: "center" as const,
    letterSpacing: 1,
  },
  distRow: { marginBottom: 14 },
  distLabelRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 6,
  },
  distLabel: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.2,
  },
  distPct: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  distBarBg: {
    height: 4,
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
  },
  distBarFill: {
    height: 4,
    borderRadius: 2,
  },
  monthLabelsRow: {
    flexDirection: "row" as const,
    marginTop: 8,
    position: "relative" as const,
    height: 16,
  },
  heatmapHeader: {
    flexDirection: "row" as const,
    marginBottom: 6,
  },
  heatmapDayLabel: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    textAlign: "center" as const,
    letterSpacing: 1,
  },
  heatRow: {
    flexDirection: "row" as const,
    gap: 4,
    marginBottom: 4,
  },
  heatCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 3,
  },
  heatLegendRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    gap: 4,
    marginTop: 10,
  },
  heatLegendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  heatLegendText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  trendRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
  },
  trendLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  trendChange: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  trendChangeText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    letterSpacing: 0.2,
  },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  gaugeCenter: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  gaugeScore: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  gaugeLabel: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  calloutRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  calloutCard: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
  },
  calloutTitle: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  calloutValue: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  calloutSub: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.2,
  },
});
