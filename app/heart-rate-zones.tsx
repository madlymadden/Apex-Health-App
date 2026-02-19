import React, { useEffect } from "react";
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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Polyline, Circle, Line, Text as SvgText } from "react-native-svg";
import Colors from "@/constants/colors";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_PADDING = 24;
const CHART_WIDTH = SCREEN_WIDTH - CHART_PADDING * 2;

const ZONES = [
  { name: "Recovery", range: "90–108", min: 90, max: 108, color: "#888888", minutes: 42 },
  { name: "Fat Burn", range: "108–126", min: 108, max: 126, color: "#4A90D9", minutes: 28 },
  { name: "Cardio", range: "126–144", min: 126, max: 144, color: "#4CD964", minutes: 18 },
  { name: "Peak", range: "144–162", min: 144, max: 162, color: "#FC8C02", minutes: 8 },
  { name: "VO2 Max", range: "162–180", min: 162, max: 180, color: "#D94848", minutes: 4 },
];

const TOTAL_ZONE_MINUTES = ZONES.reduce((s, z) => s + z.minutes, 0);

const TIMELINE_DATA = [
  68, 67, 65, 64, 63, 62, 61, 60, 62, 65, 72, 78, 85, 92, 105, 118, 132, 128, 115, 98, 82, 75, 72, 70,
];

const WEEKLY_RESTING = [62, 64, 61, 63, 60, 62, 61];

const CURRENT_HR = 72;
const RESTING_HR = 62;
const MAX_HR = 165;
const MIN_HR = 58;
const AVG_HR = 78;
const TIME_IN_TARGET = "46 min";
const HRV_CURRENT = 48;
const HRV_TREND = "+3";
const RECOVERY_STATUS = "Good";
const RECOVERY_SCORE = 82;

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulsingDot, animatedStyle]} />
  );
}

function ZoneRow({ zone, index }: { zone: typeof ZONES[0]; index: number }) {
  const barWidth = (zone.minutes / TOTAL_ZONE_MINUTES) * 100;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <View style={styles.zoneRow}>
        <View style={styles.zoneInfo}>
          <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
          <View>
            <Text style={styles.zoneName}>Zone {index + 1}</Text>
            <Text style={styles.zoneSubName}>{zone.name}</Text>
          </View>
        </View>
        <View style={styles.zoneBarContainer}>
          <View style={[styles.zoneBar, { width: `${barWidth}%`, backgroundColor: zone.color }]} />
        </View>
        <View style={styles.zoneRight}>
          <Text style={styles.zoneMinutes}>{zone.minutes}m</Text>
          <Text style={styles.zoneRange}>{zone.range}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

function TimelineChart() {
  const data = TIMELINE_DATA;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const avg = Math.round(data.reduce((s, v) => s + v, 0) / data.length);
  const chartH = 120;
  const padX = 8;
  const padY = 12;
  const w = CHART_WIDTH;

  const points = data
    .map((val, i) => {
      const x = padX + (i / (data.length - 1)) * (w - padX * 2);
      const y = padY + ((max - val) / range) * (chartH - padY * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const minIdx = data.indexOf(Math.min(...data));
  const maxIdx = data.indexOf(Math.max(...data));

  const getX = (i: number) => padX + (i / (data.length - 1)) * (w - padX * 2);
  const getY = (val: number) => padY + ((max - val) / range) * (chartH - padY * 2);

  const avgY = getY(avg);

  return (
    <View style={{ width: w, height: chartH + 20 }}>
      <Svg width={w} height={chartH + 20}>
        <Line x1={padX} y1={avgY} x2={w - padX} y2={avgY} stroke="rgba(255,255,255,0.1)" strokeWidth={0.5} strokeDasharray="4,4" />
        <Polyline
          points={points}
          fill="none"
          stroke={Colors.red}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={getX(minIdx)} cy={getY(data[minIdx])} r={3.5} fill={Colors.teal} />
        <Circle cx={getX(maxIdx)} cy={getY(data[maxIdx])} r={3.5} fill={Colors.red} />
        <SvgText x={getX(minIdx)} y={getY(data[minIdx]) + 14} fill={Colors.teal} fontSize={8} textAnchor="middle" fontFamily="Outfit_300Light">
          {data[minIdx]}
        </SvgText>
        <SvgText x={getX(maxIdx)} y={getY(data[maxIdx]) - 8} fill={Colors.red} fontSize={8} textAnchor="middle" fontFamily="Outfit_300Light">
          {data[maxIdx]}
        </SvgText>
        <SvgText x={w - padX + 2} y={avgY + 3} fill="rgba(255,255,255,0.3)" fontSize={8} textAnchor="start" fontFamily="Outfit_300Light">
          avg
        </SvgText>
      </Svg>
      <View style={styles.timelineLabels}>
        <Text style={styles.timelineLabel}>12 AM</Text>
        <Text style={styles.timelineLabel}>6 AM</Text>
        <Text style={styles.timelineLabel}>12 PM</Text>
        <Text style={styles.timelineLabel}>6 PM</Text>
        <Text style={styles.timelineLabel}>NOW</Text>
      </View>
    </View>
  );
}

function WeeklySparkline() {
  const data = WEEKLY_RESTING;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 140;
  const h = 36;
  const pad = 4;

  const points = data
    .map((val, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = pad + ((max - val) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h}>
        <Polyline
          points={points}
          fill="none"
          stroke={Colors.teal}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function StatCard({ label, value, color, index }: { label: string; value: string; color?: string; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 50).duration(300)} style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function HeartRateZonesScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const weeklyAvg = Math.round(WEEKLY_RESTING.reduce((s, v) => s + v, 0) / WEEKLY_RESTING.length);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
            <Text style={styles.headerTitle}>HEART RATE</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroRow}>
              <PulsingDot />
              <Text style={styles.heroValue}>{CURRENT_HR}</Text>
              <Text style={styles.heroBpm}>bpm</Text>
            </View>
            <Text style={styles.heroLabel}>CURRENT HEART RATE</Text>
            <View style={styles.restingRow}>
              <Ionicons name="heart-outline" size={12} color={Colors.muted} />
              <Text style={styles.restingText}>Resting: {RESTING_HR} bpm</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>HEART RATE ZONES</Text>
          <View style={styles.zonesContainer}>
            {ZONES.map((zone, i) => (
              <React.Fragment key={i}>
                <ZoneRow zone={zone} index={i} />
                {i < ZONES.length - 1 && <View style={styles.zoneDivider} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>TODAY'S TIMELINE</Text>
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <TimelineChart />
          </Animated.View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>WEEKLY RESTING HR</Text>
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <View style={styles.weeklySection}>
              <View style={styles.weeklyLeft}>
                <Text style={styles.weeklyValue}>{weeklyAvg}</Text>
                <Text style={styles.weeklyUnit}>bpm avg</Text>
              </View>
              <View style={styles.weeklyRight}>
                <WeeklySparkline />
                <View style={styles.weeklyDays}>
                  {days.map((d) => (
                    <Text key={d} style={styles.weeklyDay}>{d}</Text>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>STATISTICS</Text>
          <View style={styles.statsGrid}>
            <StatCard label="MAX HR" value={`${MAX_HR}`} color={Colors.red} index={0} />
            <StatCard label="MIN HR" value={`${MIN_HR}`} color={Colors.teal} index={1} />
            <StatCard label="AVG HR" value={`${AVG_HR}`} index={2} />
            <StatCard label="IN TARGET" value={TIME_IN_TARGET} color={Colors.green} index={3} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>HR VARIABILITY</Text>
          <Animated.View entering={FadeInDown.delay(200).duration(300)}>
            <View style={styles.hrvSection}>
              <View style={styles.hrvMain}>
                <Text style={styles.hrvValue}>{HRV_CURRENT}</Text>
                <Text style={styles.hrvUnit}>ms</Text>
              </View>
              <View style={styles.hrvMeta}>
                <View style={styles.hrvTrendRow}>
                  <Ionicons name="trending-up" size={14} color={Colors.green} />
                  <Text style={[styles.hrvTrend, { color: Colors.green }]}>{HRV_TREND} ms</Text>
                </View>
                <Text style={styles.hrvTrendLabel}>VS LAST WEEK</Text>
              </View>
              <View style={styles.hrvDivider} />
              <View style={styles.hrvInfo}>
                <Text style={styles.hrvInfoText}>Higher HRV indicates better cardiovascular fitness and stress resilience.</Text>
              </View>
            </View>
          </Animated.View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>RECOVERY STATUS</Text>
          <Animated.View entering={FadeInDown.delay(250).duration(300)}>
            <View style={styles.recoverySection}>
              <View style={styles.recoveryLeft}>
                <View style={[styles.recoveryIndicator, { borderColor: Colors.green }]}>
                  <Text style={[styles.recoveryScore, { color: Colors.green }]}>{RECOVERY_SCORE}</Text>
                </View>
              </View>
              <View style={styles.recoveryRight}>
                <Text style={[styles.recoveryStatus, { color: Colors.green }]}>{RECOVERY_STATUS}</Text>
                <Text style={styles.recoveryDesc}>Your body is well-recovered. You are ready for high-intensity training.</Text>
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
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 28 },
  backButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  headerTitle: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },

  heroSection: { alignItems: "center" as const, gap: 8 },
  heroRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  pulsingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.red },
  heroValue: { fontSize: 56, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -3 },
  heroBpm: { fontSize: 16, fontFamily: "Outfit_300Light", color: Colors.muted, marginTop: 20 },
  heroLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  restingRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5, marginTop: 4 },
  restingText: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted },

  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 28 },
  sectionLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3, marginBottom: 16 },

  zonesContainer: {},
  zoneRow: { flexDirection: "row" as const, alignItems: "center" as const, paddingVertical: 10 },
  zoneInfo: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, width: 90 },
  zoneDot: { width: 8, height: 8, borderRadius: 4 },
  zoneName: { fontSize: 11, fontFamily: "Outfit_400Regular", color: Colors.offWhite, letterSpacing: 0.3 },
  zoneSubName: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.2 },
  zoneBarContainer: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.04)", marginHorizontal: 10 },
  zoneBar: { height: 6 },
  zoneRight: { alignItems: "flex-end" as const, width: 52 },
  zoneMinutes: { fontSize: 13, fontFamily: "Outfit_400Regular", color: Colors.white },
  zoneRange: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  zoneDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },

  timelineLabels: { flexDirection: "row" as const, justifyContent: "space-between" as const, paddingHorizontal: 8, marginTop: 4 },
  timelineLabel: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },

  weeklySection: { flexDirection: "row" as const, alignItems: "center" as const, gap: 20 },
  weeklyLeft: { alignItems: "center" as const },
  weeklyValue: { fontSize: 36, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -2 },
  weeklyUnit: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 1 },
  weeklyRight: { flex: 1, gap: 4 },
  weeklyDays: { flexDirection: "row" as const, justifyContent: "space-between" as const, paddingHorizontal: 4 },
  weeklyDay: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },

  statsGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10 },
  statCard: { flex: 1, minWidth: "45%" as any, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 18, alignItems: "center" as const, gap: 6 },
  statValue: { fontSize: 22, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  statLabel: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },

  hrvSection: { borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 20, gap: 14 },
  hrvMain: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 4 },
  hrvValue: { fontSize: 36, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -2 },
  hrvUnit: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.muted },
  hrvMeta: { gap: 4 },
  hrvTrendRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5 },
  hrvTrend: { fontSize: 13, fontFamily: "Outfit_400Regular" },
  hrvTrendLabel: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  hrvDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  hrvInfo: {},
  hrvInfoText: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.secondaryText, lineHeight: 18 },

  recoverySection: { flexDirection: "row" as const, alignItems: "center" as const, gap: 20, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 20 },
  recoveryLeft: {},
  recoveryIndicator: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: "center" as const, justifyContent: "center" as const },
  recoveryScore: { fontSize: 22, fontFamily: "Outfit_300Light" },
  recoveryRight: { flex: 1, gap: 6 },
  recoveryStatus: { fontSize: 16, fontFamily: "Outfit_400Regular", letterSpacing: 1 },
  recoveryDesc: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.secondaryText, lineHeight: 18 },
});
