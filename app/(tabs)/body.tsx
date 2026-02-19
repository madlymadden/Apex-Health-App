import React, { useState } from "react";
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
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from "react-native-svg";
import Colors from "@/constants/colors";
import { MiniChart } from "@/components/MiniChart";
import { MetricRing } from "@/components/MetricRing";
import { useHealth } from "@/lib/health-context";
import { type BodyMetric } from "@/lib/health-data";

function generateSparklinePath(data: number[], width: number, height: number): string {
  if (!data || data.length < 2) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const padding = 2;
  const usableHeight = height - padding * 2;
  return data
    .map((val, i) => {
      const x = i * stepX;
      const y = padding + usableHeight - ((val - min) / range) * usableHeight;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const LAST_UPDATED_TIMES: Record<string, string> = {
  "Weight": "2h ago",
  "Body Fat": "3d ago",
  "Muscle Mass": "3d ago",
  "Resting HR": "12m ago",
  "VO2 Max": "1w ago",
  "Sleep Avg": "8h ago",
};

const METRIC_COLORS: Record<string, string> = {
  "Weight": Colors.white,
  "Body Fat": Colors.teal,
  "Muscle Mass": Colors.green,
  "Resting HR": Colors.red,
  "VO2 Max": Colors.teal,
  "Sleep Avg": Colors.muted,
};

const METRIC_DELTAS: Record<string, string> = {
  "Weight": "-3.8",
  "Body Fat": "-2.8",
  "Muscle Mass": "+2.4",
  "Resting HR": "-2",
  "VO2 Max": "+1.2",
  "Sleep Avg": "+0.3",
};

function GradientUnderline({ color }: { color: string }) {
  return (
    <View style={{ width: 48, height: 2, marginTop: 6 }}>
      <Svg width={48} height={2}>
        <Defs>
          <LinearGradient id="underline" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={color} stopOpacity="0.9" />
            <Stop offset="1" stopColor={color} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="48" height="2" fill="url(#underline)" />
      </Svg>
    </View>
  );
}

function BodyMetricRow({ metric }: { metric: BodyMetric }) {
  const [expanded, setExpanded] = useState(false);
  const isPositive =
    metric.label === "Weight" || metric.label === "Body Fat" || metric.label === "Resting HR"
      ? metric.trend === "down"
      : metric.trend === "up";
  const trendColor = isPositive
    ? Colors.green
    : metric.trend === "stable"
    ? Colors.white
    : Colors.teal;

  const accentColor = METRIC_COLORS[metric.label] || Colors.muted;
  const delta = METRIC_DELTAS[metric.label] || "0";
  const lastUpdated = LAST_UPDATED_TIMES[metric.label] || "today";
  const sparkPath = generateSparklinePath(metric.history.slice(-7), 80, 30);

  return (
    <SpringPress
      scaleDown={0.97}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      onLongPress={() => setExpanded((prev) => !prev)}
    >
      <View style={styles.metricCard}>
        <View style={[styles.metricCardAccent, { backgroundColor: accentColor }]} />
        <View style={styles.bodyRowLeft}>
          <Text style={styles.bodyLabel}>{metric.label.toUpperCase()}</Text>
          <View style={styles.bodyValueRow}>
            <Text style={styles.bodyValue}>{metric.value}</Text>
            <Text style={styles.bodyUnit}>{metric.unit}</Text>
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
              <Text style={[styles.trendDelta, { color: trendColor }]}>{delta}</Text>
            </View>
          </View>
          <Text style={styles.lastUpdated}>LAST UPDATED {lastUpdated.toUpperCase()}</Text>
        </View>

        <View style={styles.bodyRowRight}>
          <Svg width={80} height={30}>
            <Path d={sparkPath} stroke={trendColor} strokeWidth={1.5} fill="none" />
          </Svg>
        </View>
      </View>
      {expanded && (
        <View style={styles.expandedRow}>
          <Svg width={200} height={48}>
            <Path d={generateSparklinePath(metric.history, 200, 48)} stroke={trendColor} strokeWidth={1.5} fill="none" />
          </Svg>
          <Text style={styles.expandedLabel}>14-day trend</Text>
          <Text style={styles.expandedHint}>Goal: maintain steady progress</Text>
        </View>
      )}
    </SpringPress>
  );
}

interface ToolCardProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function ToolCard({ icon, label, onPress }: ToolCardProps) {
  return (
    <SpringPress
      scaleDown={0.93}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      onPress={onPress}
      style={{ width: "48%" as any }}
    >
      <View style={styles.toolCard}>
        <Ionicons name={icon as any} size={22} color={Colors.offWhite} />
        <Text style={styles.toolCardLabel}>{label}</Text>
      </View>
    </SpringPress>
  );
}

function SpringPress({ 
  children, onPress, onLongPress, hapticStyle, style, scaleDown = 0.96 
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
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
        if (Platform.OS !== 'web') Haptics.impactAsync(hapticStyle || Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }
      }}
      delayLongPress={400}
      style={style}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function CompositionStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.compStat}>
      <Text style={styles.compStatValue}>{value}</Text>
      <Text style={styles.compStatLabel}>{label}</Text>
    </View>
  );
}

export default function BodyScreen() {
  const insets = useSafeAreaInsets();
  const { bodyMetrics } = useHealth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [expandedHero, setExpandedHero] = useState<string | null>(null);

  const weight = bodyMetrics.find((m) => m.label === "Weight");
  const bodyFat = bodyMetrics.find((m) => m.label === "Body Fat");
  const muscleMass = bodyMetrics.find((m) => m.label === "Muscle Mass");

  const bodyFatNum = bodyFat ? parseFloat(bodyFat.value) : 18;
  const leanMassProgress = (100 - bodyFatNum) / 100;
  const bmi = ((172.4 / (70 * 70)) * 703).toFixed(1);

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
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onMomentumScrollEnd={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Body</Text>
            <View style={{ flexDirection: "row" as const, gap: 12 }}>
              <SpringPress
                scaleDown={0.88}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                onPress={() => router.push({ pathname: "/smart-scanner", params: { context: "body" } })}
                style={styles.addButton}
              >
                <Ionicons name="scan-outline" size={20} color={Colors.white} />
              </SpringPress>
              <SpringPress
                scaleDown={0.88}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                onPress={() => router.push("/add-measurement")}
                style={styles.addButton}
              >
                <Ionicons name="add" size={22} color={Colors.white} />
              </SpringPress>
            </View>
          </View>

          {weight && bodyFat && (
            <View style={styles.heroSection}>
              <SpringPress
                scaleDown={0.97}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                onLongPress={() => setExpandedHero((prev) => prev === "weight" ? null : "weight")}
              >
                <View style={styles.heroCard}>
                  <Text style={styles.heroLabel}>WEIGHT</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{weight.value}</Text>
                    <Text style={styles.heroUnit}>{weight.unit}</Text>
                  </View>
                  <GradientUnderline color={Colors.white} />
                  <View style={styles.heroDeltaRow}>
                    <Ionicons name="arrow-down" size={11} color={Colors.green} />
                    <Text style={styles.heroDelta}>- 3.8 lbs</Text>
                  </View>
                  {expandedHero === "weight" && (
                    <View style={styles.heroExpanded}>
                      <Text style={styles.heroExpandedText}>Goal: 165.0 lbs</Text>
                      <Text style={styles.heroExpandedText}>7-day avg: {weight.value} {weight.unit}</Text>
                      <Text style={styles.heroExpandedHint}>Tap to see trends</Text>
                    </View>
                  )}
                  <MiniChart
                    data={weight.history}
                    width={120}
                    height={36}
                    color="rgba(255,255,255,0.3)"
                  />
                </View>
              </SpringPress>

              <SpringPress
                scaleDown={0.97}
                hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                onLongPress={() => setExpandedHero((prev) => prev === "bodyfat" ? null : "bodyfat")}
              >
                <View style={styles.heroCard}>
                  <Text style={styles.heroLabel}>BODY FAT</Text>
                  <View style={styles.heroValueRow}>
                    <Text style={styles.heroValue}>{bodyFat.value}</Text>
                    <Text style={styles.heroUnit}>{bodyFat.unit}</Text>
                  </View>
                  <GradientUnderline color={Colors.teal} />
                  <View style={styles.heroDeltaRow}>
                    <Ionicons name="arrow-down" size={11} color={Colors.green} />
                    <Text style={styles.heroDelta}>- 2.8%</Text>
                  </View>
                  {expandedHero === "bodyfat" && (
                    <View style={styles.heroExpanded}>
                      <Text style={styles.heroExpandedText}>Goal: 12.0%</Text>
                      <Text style={styles.heroExpandedText}>7-day avg: {bodyFat.value}{bodyFat.unit}</Text>
                      <Text style={styles.heroExpandedHint}>Tap to see trends</Text>
                    </View>
                  )}
                  <MiniChart
                    data={bodyFat.history}
                    width={120}
                    height={36}
                    color="rgba(90,200,212,0.3)"
                  />
                </View>
              </SpringPress>
            </View>
          )}

          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.duration(400).delay(100)}>
            <Text style={styles.sectionLabel}>COMPOSITION</Text>
            <SpringPress
              scaleDown={0.97}
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
              onPress={() => router.push("/body-trends")}
            >
              <View style={styles.compositionSection}>
                <View style={styles.ringContainer}>
                  <MetricRing
                    progress={leanMassProgress}
                    size={140}
                    strokeWidth={10}
                    color={Colors.teal}
                    bgColor="rgba(255,255,255,0.06)"
                  />
                  <View style={styles.ringCenter}>
                    <Text style={styles.ringPercent}>{(leanMassProgress * 100).toFixed(0)}</Text>
                    <Text style={styles.ringPercentLabel}>LEAN %</Text>
                  </View>
                </View>
                <View style={styles.compStatsGrid}>
                  <CompositionStat label="WEIGHT" value={weight ? `${weight.value} ${weight.unit}` : "--"} />
                  <CompositionStat label="BODY FAT" value={bodyFat ? `${bodyFat.value}${bodyFat.unit}` : "--"} />
                  <CompositionStat label="MUSCLE" value={muscleMass ? `${muscleMass.value} ${muscleMass.unit}` : "--"} />
                  <CompositionStat label="BMI" value={bmi} />
                </View>
              </View>
            </SpringPress>
          </Animated.View>

          <View style={styles.sectionSpacer} />
          <View style={styles.divider} />

          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <Text style={styles.sectionLabel}>BODY TOOLS</Text>
            <View style={styles.toolsGrid}>
              <ToolCard
                icon="body-outline"
                label="Muscle Map"
                onPress={() => router.push("/body-heatmap")}
              />
              <ToolCard
                icon="trending-down-outline"
                label="Body Trends"
                onPress={() => router.push("/body-trends")}
              />
              <ToolCard
                icon="images-outline"
                label="Progress Photos"
                onPress={() => router.push("/progress-gallery")}
              />
              <ToolCard
                icon="scan-outline"
                label="Smart Scanner"
                onPress={() => router.push({ pathname: "/smart-scanner", params: { context: "body" } })}
              />
            </View>
          </Animated.View>

          <View style={styles.sectionSpacer} />
          <View style={styles.divider} />

          <SpringPress
            scaleDown={0.97}
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            onPress={() => router.push("/body-trends")}
          >
            <View style={styles.trendsCard}>
              <View style={styles.trendsCardLeft}>
                <Text style={styles.trendsCardTitle}>VIEW FULL TRENDS</Text>
                <Text style={styles.trendsCardSub}>Weight, body fat, and muscle over time</Text>
              </View>
              <View style={styles.trendsCardRight}>
                {weight && (
                  <MiniChart
                    data={weight.history}
                    width={80}
                    height={28}
                    color={Colors.teal}
                  />
                )}
                <Ionicons name="chevron-forward" size={16} color={Colors.teal} />
              </View>
            </View>
          </SpringPress>

          <View style={styles.sectionSpacer} />
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>PROGRESS</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressDot} />
            <Text style={styles.progressText}>
              Down <Text style={styles.progressHighlight}>3.8 lbs</Text> and{" "}
              <Text style={styles.progressHighlight}>2.8% body fat</Text> over 7 weeks
            </Text>
          </View>

          <View style={styles.sectionSpacer} />
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
  titleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 36,
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  heroSection: {
    gap: 12,
    marginBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 20,
    gap: 2,
  },
  heroLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 4,
  },
  heroValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 6,
  },
  heroValue: {
    fontSize: 44,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  heroUnit: {
    fontSize: 16,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  heroDeltaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  heroDelta: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.green,
    letterSpacing: 0.3,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  sectionSpacer: {
    height: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 20,
  },
  compositionSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 24,
  },
  ringContainer: {
    position: "relative" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ringCenter: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  ringPercent: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  ringPercentLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: -2,
  },
  compStatsGrid: {
    flex: 1,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 16,
  },
  compStat: {
    width: "44%" as any,
    gap: 2,
  },
  compStatValue: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: -0.3,
  },
  compStatLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  toolsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  toolCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
  },
  toolCardLabel: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
    letterSpacing: 1,
    textAlign: "center" as const,
  },
  trendsCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 18,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  trendsCardLeft: {
    flex: 1,
    gap: 4,
  },
  trendsCardTitle: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.teal,
    letterSpacing: 3,
  },
  trendsCardSub: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  trendsCardRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  progressCard: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    paddingBottom: 8,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
    marginTop: 5,
  },
  progressText: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  progressHighlight: {
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
  },
  metricCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingLeft: 18,
    overflow: "hidden" as const,
  },
  metricCardAccent: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  bodyRowLeft: {
    flex: 1,
    gap: 3,
  },
  bodyLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  bodyValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  bodyValue: {
    fontSize: 22,
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  trendDelta: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.2,
  },
  lastUpdated: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.6,
  },
  rowDivider: {
    height: 8,
  },
  expandedRow: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 6,
    alignItems: "flex-start" as const,
  },
  expandedLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  expandedHint: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
  },
  heroExpanded: {
    gap: 4,
    marginTop: 6,
    marginBottom: 4,
  },
  heroExpandedText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
  },
  heroExpandedHint: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.teal,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
