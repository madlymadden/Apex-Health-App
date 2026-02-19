import React, { useState, useEffect, useCallback } from "react";
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
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import {
  generateSleepData,
  formatDuration,
  type SleepEntry,
} from "@/lib/health-data";

const SCREEN_WIDTH = Dimensions.get("window").width;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function SpringPress({
  children,
  onPress,
  hapticStyle,
  style,
  scaleDown = 0.96,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  style?: any;
  scaleDown?: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
        if (Platform.OS !== "web")
          Haptics.impactAsync(
            hapticStyle || Haptics.ImpactFeedbackStyle.Light
          );
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

function SleepScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? Colors.teal : score >= 60 ? Colors.white : Colors.red;
  const radius = 54;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1400,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.heroRingContainer}>
      <View style={styles.ringWrapper}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle
            cx={60}
            cy={60}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={60}
            cy={60}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 60 60)`}
          />
        </Svg>
        <View style={styles.ringScoreOverlay}>
          <Text style={[styles.ringScoreText, { color }]}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

function SleepNightRow({
  entry,
  index,
}: {
  entry: SleepEntry;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const dayLabel = new Date(entry.date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const total = entry.deep + entry.rem + entry.light + entry.awake;
  const qualityColor =
    entry.quality >= 80
      ? Colors.teal
      : entry.quality >= 60
        ? Colors.white
        : Colors.red;

  return (
    <Animated.View entering={FadeInDown.delay(index * 35).duration(280)}>
      <SpringPress
        onPress={() => setExpanded(!expanded)}
        scaleDown={0.98}
        hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      >
        <View style={styles.nightRow}>
          <View style={styles.nightHeader}>
            <Text style={styles.nightDate}>{dayLabel}</Text>
            <View style={styles.nightTimes}>
              <Text style={styles.nightTime}>{entry.bedtime}</Text>
              <Ionicons name="arrow-forward" size={8} color={Colors.muted} />
              <Text style={styles.nightTime}>{entry.wakeTime}</Text>
            </View>
            <Text style={[styles.nightScore, { color: qualityColor }]}>
              {entry.quality}
            </Text>
          </View>

          <View style={styles.stagesBar}>
            <View
              style={[
                styles.stageSegment,
                { flex: entry.deep, backgroundColor: "#1A237E" },
              ]}
            />
            <View
              style={[
                styles.stageSegment,
                { flex: entry.rem, backgroundColor: "#5C6BC0" },
              ]}
            />
            <View
              style={[
                styles.stageSegment,
                { flex: entry.light, backgroundColor: "#9FA8DA" },
              ]}
            />
            <View
              style={[
                styles.stageSegment,
                {
                  flex: entry.awake,
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              ]}
            />
          </View>

          <View style={styles.nightFooter}>
            <Text style={styles.nightDuration}>
              {formatDuration(entry.duration)}
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={12}
              color={Colors.muted}
            />
          </View>

          {expanded && (
            <View style={styles.nightExpanded}>
              <View style={styles.nightExpandedRow}>
                <Text style={styles.nightExpandLabel}>AVG HR</Text>
                <Text style={styles.nightExpandValue}>
                  {entry.hrAvg}{" "}
                  <Text style={styles.nightExpandUnit}>bpm</Text>
                </Text>
              </View>
              <View style={styles.nightExpandDivider} />
              <View style={styles.nightExpandedRow}>
                <Text style={styles.nightExpandLabel}>LOW HR</Text>
                <Text style={styles.nightExpandValue}>
                  {entry.hrLow}{" "}
                  <Text style={styles.nightExpandUnit}>bpm</Text>
                </Text>
              </View>
              <View style={styles.nightExpandDivider} />
              <View style={styles.nightExpandedRow}>
                <Text style={styles.nightExpandLabel}>WAKEUPS</Text>
                <Text style={styles.nightExpandValue}>
                  {entry.disturbances}
                </Text>
              </View>
              <View style={styles.nightExpandDivider} />
              <View style={styles.nightExpandedRow}>
                <Text style={styles.nightExpandLabel}>RESP RATE</Text>
                <Text style={styles.nightExpandValue}>
                  {entry.respiratoryRate}{" "}
                  <Text style={styles.nightExpandUnit}>br/min</Text>
                </Text>
              </View>
            </View>
          )}
        </View>
      </SpringPress>
    </Animated.View>
  );
}

function WeeklyTrendChart({ data }: { data: SleepEntry[] }) {
  const last7 = data.slice(0, 7).reverse();
  const maxDuration = Math.max(...last7.map((d) => d.duration));
  const barWidth = (SCREEN_WIDTH - 48 - 6 * 8) / 7;

  return (
    <View style={styles.trendContainer}>
      <View style={styles.trendBars}>
        {last7.map((entry, i) => {
          const height = (entry.duration / maxDuration) * 100;
          const barColor =
            entry.quality >= 80
              ? Colors.teal
              : entry.quality >= 60
                ? Colors.white
                : Colors.red;
          const dayLabel = new Date(entry.date).toLocaleDateString("en-US", {
            weekday: "narrow",
          });

          return (
            <View key={i} style={styles.trendBarCol}>
              <View style={styles.trendBarTrack}>
                <Animated.View
                  entering={FadeInDown.delay(i * 60).duration(400)}
                  style={[
                    styles.trendBar,
                    {
                      height: `${height}%` as any,
                      backgroundColor: barColor,
                      width: barWidth,
                    },
                  ]}
                />
              </View>
              <Text style={styles.trendDayLabel}>{dayLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function SleepAnalysisScreen() {
  const insets = useSafeAreaInsets();
  const [sleepData, setSleepData] = useState<SleepEntry[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setSleepData(generateSleepData());
  }, []);

  const handleMomentumEnd = useCallback(() => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  if (sleepData.length === 0) return <View style={styles.container} />;

  const lastNight = sleepData[0];
  const totalStages =
    lastNight.deep + lastNight.rem + lastNight.light + lastNight.awake;
  const hrv = Math.round(38 + Math.random() * 27);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>SLEEP ANALYSIS</Text>
            <View style={{ width: 32 }} />
          </View>

          <Text style={styles.sectionLabel}>SLEEP SCORE</Text>

          <SleepScoreRing score={lastNight.quality} />

          <View style={styles.heroMeta}>
            <Text style={styles.heroSubtitle}>LAST NIGHT</Text>
            <Text style={styles.heroTimesText}>
              {lastNight.bedtime}
              {"  "}
              <Ionicons name="arrow-forward" size={10} color={Colors.muted} />
              {"  "}
              {lastNight.wakeTime}
            </Text>
            <Text style={styles.heroDuration}>
              {formatDuration(lastNight.duration)}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>SLEEP STAGES</Text>

          <View style={styles.stagesBarLarge}>
            <View
              style={[
                styles.stageSegmentLarge,
                { flex: lastNight.deep, backgroundColor: "#1A237E" },
              ]}
            />
            <View
              style={[
                styles.stageSegmentLarge,
                { flex: lastNight.rem, backgroundColor: "#5C6BC0" },
              ]}
            />
            <View
              style={[
                styles.stageSegmentLarge,
                { flex: lastNight.light, backgroundColor: "#9FA8DA" },
              ]}
            />
            <View
              style={[
                styles.stageSegmentLarge,
                {
                  flex: lastNight.awake,
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              ]}
            />
          </View>

          <View style={styles.stageColumns}>
            <View style={styles.stageCol}>
              <View
                style={[styles.stageDot, { backgroundColor: "#1A237E" }]}
              />
              <Text style={styles.stageColValue}>
                {formatDuration(lastNight.deep)}
              </Text>
              <Text style={styles.stageColLabel}>DEEP</Text>
            </View>
            <View style={styles.stageCol}>
              <View
                style={[styles.stageDot, { backgroundColor: "#5C6BC0" }]}
              />
              <Text style={styles.stageColValue}>
                {formatDuration(lastNight.rem)}
              </Text>
              <Text style={styles.stageColLabel}>REM</Text>
            </View>
            <View style={styles.stageCol}>
              <View
                style={[styles.stageDot, { backgroundColor: "#9FA8DA" }]}
              />
              <Text style={styles.stageColValue}>
                {formatDuration(lastNight.light)}
              </Text>
              <Text style={styles.stageColLabel}>LIGHT</Text>
            </View>
            <View style={styles.stageCol}>
              <View
                style={[
                  styles.stageDot,
                  { backgroundColor: "rgba(255,255,255,0.25)" },
                ]}
              />
              <Text style={styles.stageColValue}>
                {formatDuration(lastNight.awake)}
              </Text>
              <Text style={styles.stageColLabel}>AWAKE</Text>
            </View>
          </View>

          <Text style={styles.totalDurationText}>
            {formatDuration(lastNight.duration)}
          </Text>
          <Text style={styles.totalDurationLabel}>TOTAL SLEEP</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>VITAL SIGNS DURING SLEEP</Text>

          <View style={styles.vitalsCard}>
            <View style={styles.vitalRow}>
              <View style={styles.vitalLeft}>
                <Ionicons name="heart" size={14} color={Colors.red} />
                <Text style={styles.vitalLabel}>Average Heart Rate</Text>
              </View>
              <Text style={styles.vitalValue}>
                {lastNight.hrAvg}{" "}
                <Text style={styles.vitalUnit}>bpm</Text>
              </Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalRow}>
              <View style={styles.vitalLeft}>
                <Ionicons
                  name="heart-outline"
                  size={14}
                  color={Colors.muted}
                />
                <Text style={styles.vitalLabel}>Lowest Heart Rate</Text>
              </View>
              <Text style={styles.vitalValue}>
                {lastNight.hrLow}{" "}
                <Text style={styles.vitalUnit}>bpm</Text>
              </Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalRow}>
              <View style={styles.vitalLeft}>
                <Ionicons name="leaf" size={14} color={Colors.teal} />
                <Text style={styles.vitalLabel}>Respiratory Rate</Text>
              </View>
              <Text style={styles.vitalValue}>
                {lastNight.respiratoryRate}{" "}
                <Text style={styles.vitalUnit}>br/min</Text>
              </Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalRow}>
              <View style={styles.vitalLeft}>
                <Ionicons name="pulse" size={14} color="#5C6BC0" />
                <Text style={styles.vitalLabel}>HRV</Text>
              </View>
              <Text style={styles.vitalValue}>
                {hrv} <Text style={styles.vitalUnit}>ms</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>WEEKLY TREND</Text>
          <WeeklyTrendChart data={sleepData} />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>SLEEP HISTORY</Text>

          {sleepData.map((entry, i) => (
            <React.Fragment key={i}>
              <SleepNightRow entry={entry} index={i} />
              {i < sleepData.length - 1 && (
                <View style={styles.nightDivider} />
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
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 36,
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
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 20,
  },
  heroRingContainer: {
    alignItems: "center" as const,
    marginBottom: 28,
  },
  ringWrapper: {
    width: 120,
    height: 120,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ringScoreOverlay: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ringScoreText: {
    fontSize: 38,
    fontFamily: "Outfit_300Light",
    letterSpacing: -2,
  },
  heroMeta: {
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  heroTimesText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.5,
  },
  heroDuration: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 32,
  },
  stagesBarLarge: {
    flexDirection: "row" as const,
    height: 14,
    gap: 2,
    marginBottom: 20,
  },
  stageSegmentLarge: {
    height: 14,
    borderRadius: 2,
  },
  stageColumns: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 24,
  },
  stageCol: {
    alignItems: "center" as const,
    gap: 5,
    flex: 1,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stageColValue: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  stageColLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  totalDurationText: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    textAlign: "center" as const,
    letterSpacing: -1,
  },
  totalDurationLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    textAlign: "center" as const,
    letterSpacing: 3,
    marginTop: 4,
  },
  vitalsCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  vitalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  vitalLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  vitalLabel: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.2,
  },
  vitalValue: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  vitalUnit: {
    fontSize: 11,
    color: Colors.muted,
  },
  vitalDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  trendContainer: {
    paddingVertical: 8,
  },
  trendBars: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    height: 110,
    gap: 8,
  },
  trendBarCol: {
    flex: 1,
    alignItems: "center" as const,
    height: "100%" as any,
    justifyContent: "flex-end" as const,
  },
  trendBarTrack: {
    flex: 1,
    width: "100%" as any,
    justifyContent: "flex-end" as const,
  },
  trendBar: {
    borderRadius: 2,
    minHeight: 4,
  },
  trendDayLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 8,
  },
  nightRow: {
    paddingVertical: 14,
    gap: 8,
  },
  nightHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  nightDate: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.3,
    flex: 1,
  },
  nightTimes: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  nightTime: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  nightScore: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    width: 30,
    textAlign: "right" as const,
  },
  stagesBar: {
    flexDirection: "row" as const,
    height: 8,
    gap: 1,
    borderRadius: 1,
    overflow: "hidden" as const,
  },
  stageSegment: {
    height: 8,
  },
  nightFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  nightDuration: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
  },
  nightExpanded: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.02)",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  nightExpandedRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
  },
  nightExpandLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  nightExpandValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  nightExpandUnit: {
    fontSize: 10,
    color: Colors.muted,
  },
  nightExpandDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  nightDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
