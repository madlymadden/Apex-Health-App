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
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Svg, {
  Path,
  Circle,
  Line,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  Polyline,
  G,
} from "react-native-svg";
import Colors from "@/constants/colors";

const AVG_PACE_SECONDS = 8 * 60 + 8;

const SPLITS = [
  { mile: 1, pace: "8:22", seconds: 502 },
  { mile: 2, pace: "8:15", seconds: 495 },
  { mile: 3, pace: "7:58", seconds: 478 },
  { mile: 4, pace: "8:02", seconds: 482 },
  { mile: 5, pace: "7:49", seconds: 469 },
];

const HR_ZONES = [
  { zone: "Zone 1", label: "RECOVERY", range: "< 120", minutes: 3, color: "#4A90D9" },
  { zone: "Zone 2", label: "EASY", range: "120-140", minutes: 8, color: "#4CD964" },
  { zone: "Zone 3", label: "AEROBIC", range: "140-155", minutes: 16, color: "#F5A623" },
  { zone: "Zone 4", label: "THRESHOLD", range: "155-170", minutes: 12, color: "#D94848" },
  { zone: "Zone 5", label: "MAX", range: "170+", minutes: 3, color: "#9B59B6" },
];

const ELEVATION_POINTS = [
  { x: 0, y: 120 }, { x: 0.3, y: 135 }, { x: 0.6, y: 142 },
  { x: 1.0, y: 155 }, { x: 1.3, y: 148 }, { x: 1.6, y: 160 },
  { x: 2.0, y: 172 }, { x: 2.3, y: 165 }, { x: 2.6, y: 158 },
  { x: 3.0, y: 145 }, { x: 3.3, y: 138 }, { x: 3.6, y: 150 },
  { x: 4.0, y: 162 }, { x: 4.3, y: 170 }, { x: 4.6, y: 155 },
  { x: 5.0, y: 140 }, { x: 5.2, y: 128 },
];

const RUN_HISTORY = [
  { date: "Feb 11", distance: "5.2 mi", pace: "8:08 /mi", trend: "down" as const },
  { date: "Feb 9", distance: "3.8 mi", pace: "8:22 /mi", trend: "up" as const },
  { date: "Feb 7", distance: "6.1 mi", pace: "8:31 /mi", trend: "up" as const },
  { date: "Feb 4", distance: "4.5 mi", pace: "8:15 /mi", trend: "down" as const },
  { date: "Feb 2", distance: "5.0 mi", pace: "8:45 /mi", trend: "up" as const },
];

const MONTHLY_STATS = {
  totalMiles: 62.4,
  totalRuns: 14,
  avgPace: "8:18",
  bestPace: "7:42",
};

const GOAL_MILES = 100;
const CURRENT_MILES = 62.4;

function SplitRow({ split, index }: { split: typeof SPLITS[0]; index: number }) {
  const isFaster = split.seconds < AVG_PACE_SECONDS;
  const color = isFaster ? Colors.green : Colors.red;
  const maxSeconds = 520;
  const minSeconds = 450;
  const barWidth = ((split.seconds - minSeconds) / (maxSeconds - minSeconds)) * 100;

  return (
    <Animated.View entering={FadeInDown.delay(300 + index * 60).duration(300)}>
      <View style={styles.splitRow}>
        <View style={styles.splitLeft}>
          <Text style={styles.splitMile}>MILE {split.mile}</Text>
          <Text style={[styles.splitPace, { color }]}>{split.pace}</Text>
        </View>
        <View style={styles.splitBarContainer}>
          <View style={[styles.splitBar, { width: `${barWidth}%`, backgroundColor: color }]} />
        </View>
        <Ionicons
          name={isFaster ? "arrow-down" : "arrow-up"}
          size={12}
          color={color}
        />
      </View>
    </Animated.View>
  );
}

export default function RunTrackerScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const totalHRMinutes = HR_ZONES.reduce((s, z) => s + z.minutes, 0);

  const chartW = 300;
  const chartH = 80;
  const minElev = 110;
  const maxElev = 180;
  const elevRange = maxElev - minElev;
  const maxDist = 5.2;

  const elevPolyline = ELEVATION_POINTS.map(
    (p) =>
      `${(p.x / maxDist) * chartW},${chartH - ((p.y - minElev) / elevRange) * chartH}`
  ).join(" ");

  const elevAreaPath =
    `M0,${chartH} ` +
    ELEVATION_POINTS.map(
      (p) =>
        `L${(p.x / maxDist) * chartW},${chartH - ((p.y - minElev) / elevRange) * chartH}`
    ).join(" ") +
    ` L${chartW},${chartH} Z`;

  const progressPercent = (CURRENT_MILES / GOAL_MILES) * 100;

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
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>RUN TRACKER</Text>
            <View style={{ width: 32 }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <Text style={styles.sectionLabel}>LAST RUN</Text>
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroStat}>
                <Text style={styles.heroValue}>5.2</Text>
                <Text style={styles.heroUnit}>MI</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroValue}>42:18</Text>
                <Text style={styles.heroUnit}>DURATION</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroValue}>8:08</Text>
                <Text style={styles.heroUnit}>/MI</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroValue}>487</Text>
                <Text style={styles.heroUnit}>CAL</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(160).duration(400)}>
          <Text style={styles.sectionLabel}>ROUTE</Text>
          <View style={styles.routeContainer}>
            <Svg width="100%" height={200} viewBox="0 0 300 200">
              {Array.from({ length: 16 }).map((_, i) => (
                <Line
                  key={`vg${i}`}
                  x1={i * 20}
                  y1={0}
                  x2={i * 20}
                  y2={200}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <Line
                  key={`hg${i}`}
                  x1={0}
                  y1={i * 20}
                  x2={300}
                  y2={i * 20}
                  stroke="rgba(255,255,255,0.04)"
                  strokeWidth={0.5}
                />
              ))}
              <Path
                d="M 30 170 Q 35 140 50 120 L 70 110 Q 90 100 110 85 L 130 80 Q 145 78 155 90 L 165 110 Q 170 125 180 130 L 200 125 Q 215 118 225 100 L 235 80 Q 240 65 250 55 L 260 50 Q 265 48 270 55 L 275 70 Q 278 80 270 95 L 258 110"
                stroke={Colors.teal}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={30} cy={170} r={5} fill={Colors.green} />
              <Circle cx={30} cy={170} r={2.5} fill={Colors.deepBlack} />
              <Circle cx={258} cy={110} r={5} fill={Colors.red} />
              <Circle cx={258} cy={110} r={2.5} fill={Colors.deepBlack} />
              <SvgText x={38} y={175} fontSize={8} fill={Colors.green} fontFamily="Outfit_300Light">START</SvgText>
              <SvgText x={235} y={128} fontSize={8} fill={Colors.red} fontFamily="Outfit_300Light">END</SvgText>
            </Svg>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(240).duration(400)}>
          <Text style={styles.sectionLabel}>SPLIT TIMES</Text>
          <View style={styles.splitHeader}>
            <Text style={styles.splitHeaderText}>MILE</Text>
            <Text style={styles.splitHeaderText}>PACE</Text>
          </View>
          {SPLITS.map((split, i) => (
            <React.Fragment key={split.mile}>
              <SplitRow split={split} index={i} />
              {i < SPLITS.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
          <View style={styles.splitAvgRow}>
            <Text style={styles.splitAvgLabel}>AVG PACE</Text>
            <Text style={styles.splitAvgValue}>8:08 /mi</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(320).duration(400)}>
          <Text style={styles.sectionLabel}>HEART RATE ZONES</Text>
          <View style={styles.hrBarContainer}>
            {HR_ZONES.map((zone) => (
              <View
                key={zone.zone}
                style={[
                  styles.hrBarSegment,
                  {
                    flex: zone.minutes / totalHRMinutes,
                    backgroundColor: zone.color,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.hrLegend}>
            {HR_ZONES.map((zone) => (
              <View key={zone.zone} style={styles.hrLegendItem}>
                <View style={[styles.hrDot, { backgroundColor: zone.color }]} />
                <View>
                  <Text style={styles.hrLegendLabel}>{zone.label}</Text>
                  <Text style={styles.hrLegendRange}>{zone.range} bpm</Text>
                  <Text style={styles.hrLegendTime}>{zone.minutes} min</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionLabel}>ELEVATION PROFILE</Text>
          <View style={styles.elevContainer}>
            <Svg width="100%" height={100} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
              <Defs>
                <LinearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={Colors.teal} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={Colors.teal} stopOpacity="0.02" />
                </LinearGradient>
              </Defs>
              <Path d={elevAreaPath} fill="url(#elevGrad)" />
              <Polyline
                points={elevPolyline}
                fill="none"
                stroke={Colors.teal}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            </Svg>
            <View style={styles.elevLabels}>
              <Text style={styles.elevLabel}>0 mi</Text>
              <Text style={styles.elevLabel}>1</Text>
              <Text style={styles.elevLabel}>2</Text>
              <Text style={styles.elevLabel}>3</Text>
              <Text style={styles.elevLabel}>4</Text>
              <Text style={styles.elevLabel}>5.2</Text>
            </View>
            <View style={styles.elevStats}>
              <View style={styles.elevStatItem}>
                <Ionicons name="arrow-up" size={10} color={Colors.green} />
                <Text style={styles.elevStatText}>+284 ft</Text>
              </View>
              <View style={styles.elevStatItem}>
                <Ionicons name="arrow-down" size={10} color={Colors.red} />
                <Text style={styles.elevStatText}>-276 ft</Text>
              </View>
              <View style={styles.elevStatItem}>
                <Text style={styles.elevStatText}>Max: 172 ft</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(480).duration(400)}>
          <Text style={styles.sectionLabel}>RUN HISTORY</Text>
          {RUN_HISTORY.map((run, i) => (
            <React.Fragment key={run.date}>
              <View style={styles.historyRow}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{run.date}</Text>
                  <Text style={styles.historyDistance}>{run.distance}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyPace}>{run.pace}</Text>
                  <Ionicons
                    name={run.trend === "down" ? "trending-down" : "trending-up"}
                    size={14}
                    color={run.trend === "down" ? Colors.green : Colors.red}
                  />
                </View>
              </View>
              {i < RUN_HISTORY.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(560).duration(400)}>
          <Text style={styles.sectionLabel}>MONTHLY STATS</Text>
          <View style={styles.monthlyGrid}>
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyValue}>{MONTHLY_STATS.totalMiles}</Text>
              <Text style={styles.monthlyUnit}>TOTAL MILES</Text>
            </View>
            <View style={styles.monthlyDivider} />
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyValue}>{MONTHLY_STATS.totalRuns}</Text>
              <Text style={styles.monthlyUnit}>TOTAL RUNS</Text>
            </View>
            <View style={styles.monthlyDivider} />
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyValue}>{MONTHLY_STATS.avgPace}</Text>
              <Text style={styles.monthlyUnit}>AVG PACE</Text>
            </View>
            <View style={styles.monthlyDivider} />
            <View style={styles.monthlyItem}>
              <Text style={styles.monthlyValue}>{MONTHLY_STATS.bestPace}</Text>
              <Text style={styles.monthlyUnit}>BEST PACE</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(640).duration(400)}>
          <Text style={styles.sectionLabel}>MONTHLY GOAL</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons name="flag" size={14} color={Colors.teal} />
              <Text style={styles.goalTitle}>Run 100 miles this month</Text>
            </View>
            <View style={styles.goalProgress}>
              <View style={styles.goalBarBg}>
                <View style={[styles.goalBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.goalNumbers}>
                <Text style={styles.goalCurrent}>{CURRENT_MILES} mi</Text>
                <Text style={styles.goalTarget}>{GOAL_MILES} mi</Text>
              </View>
              <Text style={styles.goalPercent}>{progressPercent.toFixed(0)}%</Text>
            </View>
            <Text style={styles.goalRemaining}>
              {(GOAL_MILES - CURRENT_MILES).toFixed(1)} miles remaining
            </Text>
          </View>
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
    color: Colors.white,
    letterSpacing: 3,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 14,
  },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },

  heroCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
  },
  heroStat: { alignItems: "center" as const, gap: 6 },
  heroValue: {
    fontSize: 26,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  heroUnit: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  heroDivider: { width: 0.5, height: 36, backgroundColor: Colors.border },

  routeContainer: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    padding: 12,
    overflow: "hidden" as const,
  },

  splitHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  splitHeaderText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  splitRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    gap: 10,
  },
  splitLeft: {
    width: 100,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  splitMile: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 1,
  },
  splitPace: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    letterSpacing: -0.2,
  },
  splitBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 2,
  },
  splitBar: {
    height: 4,
    borderRadius: 2,
  },
  splitAvgRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  splitAvgLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  splitAvgValue: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.teal,
  },

  hrBarContainer: {
    flexDirection: "row" as const,
    height: 20,
    borderRadius: 2,
    overflow: "hidden" as const,
    marginBottom: 16,
  },
  hrBarSegment: {
    height: 20,
  },
  hrLegend: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 16,
    rowGap: 12,
  },
  hrLegendItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 6,
    width: "28%" as any,
  },
  hrDot: { width: 6, height: 6, borderRadius: 3, marginTop: 3 },
  hrLegendLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
  },
  hrLegendRange: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 1,
  },
  hrLegendTime: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.secondaryText,
    marginTop: 1,
  },

  elevContainer: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    padding: 16,
  },
  elevLabels: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  elevLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  elevStats: {
    flexDirection: "row" as const,
    gap: 20,
    marginTop: 12,
  },
  elevStatItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  elevStatText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.5,
  },

  historyRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 14,
  },
  historyLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
  },
  historyDate: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    width: 50,
    letterSpacing: 0.5,
  },
  historyDistance: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  historyRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  historyPace: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
  },

  monthlyGrid: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  monthlyItem: { alignItems: "center" as const, gap: 6, flex: 1 },
  monthlyValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  monthlyUnit: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    textAlign: "center" as const,
  },
  monthlyDivider: { width: 0.5, height: 28, backgroundColor: Colors.border },

  goalCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    padding: 20,
  },
  goalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  goalProgress: { gap: 8 },
  goalBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  goalBarFill: {
    height: 6,
    backgroundColor: Colors.teal,
    borderRadius: 3,
  },
  goalNumbers: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  goalCurrent: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.teal,
    letterSpacing: 0.5,
  },
  goalTarget: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  goalPercent: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.teal,
    textAlign: "center" as const,
    marginTop: 4,
  },
  goalRemaining: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    textAlign: "center" as const,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
