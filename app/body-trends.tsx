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
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import Colors from "@/constants/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 44 };

type MetricKey = "weight" | "bodyFat" | "muscle";

interface MetricData {
  label: string;
  unit: string;
  data: number[];
  goal: number;
  goalLabel: string;
  color: string;
  changePositive: "down" | "up";
}

const METRICS: Record<MetricKey, MetricData> = {
  weight: {
    label: "WEIGHT",
    unit: "lbs",
    data: [178, 177.2, 176.8, 176, 175.5, 175, 174.2, 173.8, 173.5, 173, 172.4, 172],
    goal: 168,
    goalLabel: "168 lbs",
    color: Colors.teal,
    changePositive: "down",
  },
  bodyFat: {
    label: "BODY FAT",
    unit: "%",
    data: [20.5, 20.2, 19.9, 19.6, 19.2, 18.9, 18.7, 18.5, 18.3, 18.1, 17.9, 17.8],
    goal: 15,
    goalLabel: "15%",
    color: Colors.gold,
    changePositive: "down",
  },
  muscle: {
    label: "MUSCLE",
    unit: "lbs",
    data: [140, 140.4, 140.8, 141.2, 141.8, 142.1, 142.6, 143, 143.4, 143.9, 144.5, 145],
    goal: 150,
    goalLabel: "150 lbs",
    color: Colors.green,
    changePositive: "up",
  },
};

const TABS: { key: MetricKey; label: string }[] = [
  { key: "weight", label: "WEIGHT" },
  { key: "bodyFat", label: "BODY FAT" },
  { key: "muscle", label: "MUSCLE" },
];

const MONTH_LABELS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const MEASUREMENT_LOG: Record<MetricKey, { date: string; value: number; change: number }[]> = {
  weight: [
    { date: "Feb 10", value: 172.0, change: -0.4 },
    { date: "Feb 3", value: 172.4, change: -0.6 },
    { date: "Jan 27", value: 173.0, change: -0.5 },
    { date: "Jan 20", value: 173.5, change: -0.3 },
    { date: "Jan 13", value: 173.8, change: -0.4 },
  ],
  bodyFat: [
    { date: "Feb 10", value: 17.8, change: -0.1 },
    { date: "Feb 3", value: 17.9, change: -0.2 },
    { date: "Jan 27", value: 18.1, change: -0.2 },
    { date: "Jan 20", value: 18.3, change: -0.2 },
    { date: "Jan 13", value: 18.5, change: -0.2 },
  ],
  muscle: [
    { date: "Feb 10", value: 145.0, change: 0.5 },
    { date: "Feb 3", value: 144.5, change: 0.6 },
    { date: "Jan 27", value: 143.9, change: 0.5 },
    { date: "Jan 20", value: 143.4, change: 0.4 },
    { date: "Jan 13", value: 143.0, change: 0.4 },
  ],
};

const MILESTONES: Record<MetricKey, { label: string; date: string }[]> = {
  weight: [
    { label: "Reached 175 lbs", date: "Jan 6" },
    { label: "Lost first 3 lbs", date: "Dec 16" },
    { label: "Started tracking", date: "Nov 25" },
  ],
  bodyFat: [
    { label: "Hit 18% BF", date: "Jan 20" },
    { label: "Below 19%", date: "Jan 6" },
    { label: "Started tracking", date: "Nov 25" },
  ],
  muscle: [
    { label: "Reached 145 lbs", date: "Feb 10" },
    { label: "Gained 3 lbs muscle", date: "Jan 13" },
    { label: "Started tracking", date: "Nov 25" },
  ],
};

function buildPath(data: number[], chartW: number, chartH: number): string {
  const drawW = chartW - CHART_PADDING.left - CHART_PADDING.right;
  const drawH = chartH - CHART_PADDING.top - CHART_PADDING.bottom;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data
    .map((val, i) => {
      const x = CHART_PADDING.left + (i / (data.length - 1)) * drawW;
      const y = CHART_PADDING.top + drawH - ((val - min) / range) * drawH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function getPoints(data: number[], chartW: number, chartH: number) {
  const drawW = chartW - CHART_PADDING.left - CHART_PADDING.right;
  const drawH = chartH - CHART_PADDING.top - CHART_PADDING.bottom;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  return data.map((val, i) => ({
    x: CHART_PADDING.left + (i / (data.length - 1)) * drawW,
    y: CHART_PADDING.top + drawH - ((val - min) / range) * drawH,
    value: val,
  }));
}

export default function BodyTrendsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [activeTab, setActiveTab] = useState<MetricKey>("weight");

  const metric = METRICS[activeTab];
  const data = metric.data;
  const current = data[data.length - 1];
  const starting = data[0];
  const change = current - starting;
  const rate = change / 12;
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);

  const progressStart = starting;
  const progressGoal = metric.goal;
  const progressCurrent = current;
  const totalDistance = Math.abs(progressGoal - progressStart);
  const coveredDistance = Math.abs(progressCurrent - progressStart);
  const progressPct = Math.min(1, totalDistance > 0 ? coveredDistance / totalDistance : 0);

  const path = buildPath(data, CHART_WIDTH, CHART_HEIGHT);
  const points = getPoints(data, CHART_WIDTH, CHART_HEIGHT);

  const drawW = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const drawH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const gridLines = 4;

  const isChangeGood =
    metric.changePositive === "down" ? change < 0 : change > 0;
  const changeColor = isChangeGood ? Colors.green : Colors.red;

  const formatVal = (v: number) =>
    activeTab === "bodyFat" ? v.toFixed(1) : v.toFixed(1);
  const formatChange = (v: number) => {
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(1)} ${metric.unit}`;
  };

  const log = MEASUREMENT_LOG[activeTab];
  const milestones = MILESTONES[activeTab];

  const handleTabPress = (key: MetricKey) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(key);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>BODY TRENDS</Text>
            <View style={{ width: 36 }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.tabActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <View style={styles.chartContainer}>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              <Defs>
                <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={metric.color} stopOpacity="0.4" />
                  <Stop offset="1" stopColor={metric.color} stopOpacity="1" />
                </LinearGradient>
              </Defs>

              {Array.from({ length: gridLines + 1 }).map((_, i) => {
                const y = CHART_PADDING.top + (i / gridLines) * drawH;
                const val = maxVal - (i / gridLines) * (maxVal - minVal);
                return (
                  <React.Fragment key={`grid-${i}`}>
                    <Line
                      x1={CHART_PADDING.left}
                      y1={y}
                      x2={CHART_WIDTH - CHART_PADDING.right}
                      y2={y}
                      stroke={Colors.border}
                      strokeWidth={0.5}
                    />
                    <SvgText
                      x={CHART_PADDING.left - 8}
                      y={y + 3}
                      fill={Colors.muted}
                      fontSize={9}
                      fontFamily="Outfit_300Light"
                      textAnchor="end"
                    >
                      {activeTab === "bodyFat" ? val.toFixed(1) : Math.round(val)}
                    </SvgText>
                  </React.Fragment>
                );
              })}

              {[0, 3, 6, 9, 11].map((i) => {
                const x = CHART_PADDING.left + (i / (data.length - 1)) * drawW;
                return (
                  <SvgText
                    key={`xlabel-${i}`}
                    x={x}
                    y={CHART_HEIGHT - 6}
                    fill={Colors.muted}
                    fontSize={9}
                    fontFamily="Outfit_300Light"
                    textAnchor="middle"
                  >
                    {MONTH_LABELS[i]}
                  </SvgText>
                );
              })}

              <Path
                d={path}
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((pt, i) => (
                <Circle
                  key={`dot-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === points.length - 1 ? 4 : 2.5}
                  fill={i === points.length - 1 ? metric.color : Colors.deepBlack}
                  stroke={metric.color}
                  strokeWidth={i === points.length - 1 ? 0 : 1.5}
                />
              ))}

              {(() => {
                const minIdx = data.indexOf(minVal);
                const maxIdx = data.indexOf(maxVal);
                const minPt = points[minIdx];
                const maxPt = points[maxIdx];
                return (
                  <>
                    <SvgText
                      x={maxPt.x}
                      y={maxPt.y - 10}
                      fill={Colors.lightText}
                      fontSize={9}
                      fontFamily="Outfit_300Light"
                      textAnchor="middle"
                    >
                      {formatVal(maxVal)}
                    </SvgText>
                    <SvgText
                      x={minPt.x}
                      y={minPt.y + 14}
                      fill={Colors.lightText}
                      fontSize={9}
                      fontFamily="Outfit_300Light"
                      textAnchor="middle"
                    >
                      {formatVal(minVal)}
                    </SvgText>
                  </>
                );
              })()}
            </Svg>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <View style={styles.heroDisplay}>
            <Text style={styles.heroLabel}>{metric.label}</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValue}>{formatVal(current)}</Text>
              <Text style={styles.heroUnit}>{metric.unit}</Text>
            </View>
            <View style={[styles.changeBadge, { backgroundColor: changeColor + "18" }]}>
              <Ionicons
                name={change < 0 ? "arrow-down" : "arrow-up"}
                size={12}
                color={changeColor}
              />
              <Text style={[styles.changeText, { color: changeColor }]}>
                {formatChange(change)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(600).delay(400)}>
          <Text style={styles.sectionLabel}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STARTING</Text>
              <Text style={styles.statValue}>
                {formatVal(starting)}{" "}
                <Text style={styles.statUnit}>{metric.unit}</Text>
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>CURRENT</Text>
              <Text style={styles.statValue}>
                {formatVal(current)}{" "}
                <Text style={styles.statUnit}>{metric.unit}</Text>
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>CHANGE</Text>
              <Text style={[styles.statValue, { color: changeColor }]}>
                {formatChange(change)}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>RATE / WEEK</Text>
              <Text style={[styles.statValue, { color: changeColor }]}>
                {formatChange(rate)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <Text style={styles.sectionLabel}>GOAL</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>Target: {metric.goalLabel}</Text>
              <Text style={styles.goalPct}>{Math.round(progressPct * 100)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.round(progressPct * 100)}%`,
                    backgroundColor: metric.color,
                  },
                ]}
              />
            </View>
            <View style={styles.goalFooter}>
              <Text style={styles.goalFooterText}>
                {formatVal(starting)} {metric.unit}
              </Text>
              <Text style={styles.goalFooterText}>{metric.goalLabel}</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <Text style={styles.sectionLabel}>MEASUREMENT LOG</Text>
          {log.map((entry, i) => (
            <React.Fragment key={`log-${i}`}>
              <View style={styles.logRow}>
                <Text style={styles.logDate}>{entry.date}</Text>
                <Text style={styles.logValue}>
                  {formatVal(entry.value)} {metric.unit}
                </Text>
                <View style={styles.logChangeWrap}>
                  <Ionicons
                    name={entry.change < 0 ? "arrow-down" : "arrow-up"}
                    size={10}
                    color={
                      (metric.changePositive === "down" && entry.change < 0) ||
                      (metric.changePositive === "up" && entry.change > 0)
                        ? Colors.green
                        : Colors.red
                    }
                  />
                  <Text
                    style={[
                      styles.logChange,
                      {
                        color:
                          (metric.changePositive === "down" && entry.change < 0) ||
                          (metric.changePositive === "up" && entry.change > 0)
                            ? Colors.green
                            : Colors.red,
                      },
                    ]}
                  >
                    {entry.change > 0 ? "+" : ""}
                    {entry.change.toFixed(1)}
                  </Text>
                </View>
              </View>
              {i < log.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(600).delay(700)}>
          <Text style={styles.sectionLabel}>MILESTONES</Text>
          {milestones.map((ms, i) => (
            <View key={`ms-${i}`} style={styles.milestoneRow}>
              <View style={styles.timelineCol}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: i === 0 ? metric.color : Colors.border },
                  ]}
                />
                {i < milestones.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneLabel}>{ms.label}</Text>
                <Text style={styles.milestoneDate}>{ms.date}</Text>
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
    marginBottom: 28,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 3,
  },
  tabRow: {
    flexDirection: "row" as const,
    gap: 6,
    marginBottom: 28,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center" as const,
    borderRadius: 8,
    backgroundColor: Colors.charcoal,
  },
  tabActive: {
    backgroundColor: Colors.surface,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tabText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  chartContainer: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 8,
    marginBottom: 28,
    alignItems: "center" as const,
  },
  heroDisplay: {
    alignItems: "center" as const,
    marginBottom: 28,
    gap: 6,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  heroValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 6,
  },
  heroValue: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  heroUnit: {
    fontSize: 16,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  changeBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.3,
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
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48 - 10) / 2,
    backgroundColor: Colors.charcoal,
    borderRadius: 10,
    padding: 16,
    gap: 8,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  goalCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 20,
    marginBottom: 28,
    gap: 14,
  },
  goalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  goalTitle: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
  },
  goalPct: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },
  goalFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  goalFooterText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  logRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
  },
  logDate: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
  },
  logValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    textAlign: "center" as const,
  },
  logChangeWrap: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "flex-end" as const,
    gap: 3,
  },
  logChange: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  milestoneRow: {
    flexDirection: "row" as const,
    minHeight: 52,
  },
  timelineCol: {
    width: 24,
    alignItems: "center" as const,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  milestoneContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
    gap: 3,
  },
  milestoneLabel: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
  },
  milestoneDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
});
