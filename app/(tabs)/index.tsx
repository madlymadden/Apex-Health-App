import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import Colors from "@/constants/colors";
import { SPACING, TYPOGRAPHY, RADIUS } from "@/constants/theme";
import { MetricRing } from "@/components/MetricRing";
import { MiniChart } from "@/components/MiniChart";
import { useHealth } from "@/lib/health-context";
import { formatNumber, getUserDayType, type HealthMetric } from "@/lib/health-data";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const ALL_SHORTCUTS = [
  { label: "WEEKLY REPORT", icon: "stats-chart-outline", route: "/weekly-report" },
  { label: "SLEEP", icon: "moon-outline", route: "/sleep-analysis" },
  { label: "NUTRITION", icon: "nutrition-outline", route: "/nutrition-tracker" },
  { label: "HEART RATE", icon: "heart-outline", route: "/heart-rate-zones" },
  { label: "RECOVERY", icon: "leaf-outline", route: "/recovery" },
  { label: "ANALYTICS", icon: "analytics-outline", route: "/stats" },
  { label: "PLANS", icon: "clipboard-outline", route: "/workout-plans" },
  { label: "AI SCAN", icon: "sparkles-outline", route: "/smart-scanner" },
  { label: "ACHIEVEMENTS", icon: "trophy-outline", route: "/achievements" },
  { label: "CHALLENGES", icon: "flag-outline", route: "/challenges" },
  { label: "RECORDS", icon: "medal-outline", route: "/personal-records" },
  { label: "RUN TRACKER", icon: "walk-outline", route: "/run-tracker" },
  { label: "BODY TRENDS", icon: "trending-down-outline", route: "/body-trends" },
  { label: "CALENDAR", icon: "calendar-outline", route: "/training-calendar" },
  { label: "EXERCISES", icon: "barbell-outline", route: "/exercise-library" },
  { label: "FASTING", icon: "timer-outline", route: "/fasting-timer" },
  { label: "PROGRESS", icon: "images-outline", route: "/progress-gallery" },
  { label: "HABITS", icon: "checkmark-circle-outline", route: "/habit-tracker" },
  { label: "COMMUNITY", icon: "people-outline", route: "/social-feed" },
  { label: "MUSCLE MAP", icon: "body-outline", route: "/body-heatmap" },
  { label: "MINDFULNESS", icon: "flower-outline", route: "/meditation" },
  { label: "SUPPLEMENTS", icon: "medical-outline", route: "/supplement-tracker" },
  { label: "MUSIC", icon: "musical-notes-outline", route: "/workout-music" },
  { label: "EQ CLASSES", icon: "diamond-outline", route: "/equinox-classes" },
];

const DEFAULT_SHORTCUT_ROUTES = ALL_SHORTCUTS.slice(0, 8).map((s) => s.route);
const SHORTCUTS_KEY = "@madden_shortcuts";

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        { width: 5, height: 5, borderRadius: 2.5, backgroundColor: color },
        style,
      ]}
    />
  );
}

function SkeletonBar({
  width,
  height = 8,
  borderRadius = 2,
}: {
  width: number | string;
  height?: number;
  borderRadius?: number;
}) {
  const opacity = useSharedValue(0.25);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius,
        },
        style,
      ]}
    />
  );
}

function DashboardSkeleton() {
  return (
    <View style={[styles.loadingContainer, { paddingHorizontal: SPACING.screenPadding, paddingTop: 60 }]}>
      <View style={{ gap: 12, marginBottom: 40 }}>
        <SkeletonBar width={140} />
        <SkeletonBar width={100} />
      </View>
      <View style={{ gap: 8, marginBottom: 40, paddingVertical: 16, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: Colors.border }}>
        <SkeletonBar width={80} height={6} />
        <SkeletonBar width="90%" height={10} />
      </View>
      <View style={{ alignItems: "center", marginBottom: 36 }}>
        <SkeletonBar width={120} height={120} borderRadius={60} />
        <View style={{ marginTop: 16, gap: 6 }}>
          <SkeletonBar width={60} height={6} />
          <SkeletonBar width={100} height={2} />
        </View>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 40 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBar key={i} width={44} height={44} borderRadius={22} />
        ))}
      </View>
      <View style={{ alignSelf: "stretch" }}>
        <SkeletonBar width="100%" height={52} />
      </View>
      <View style={{ marginTop: 48, gap: 24 }}>
        <SkeletonBar width={80} height={6} />
        <View style={{ gap: 12, alignSelf: "stretch" }}>
          {[1, 2, 3].map((i) => (
            <SkeletonBar key={i} width="100%" height={48} />
          ))}
        </View>
      </View>
    </View>
  );
}

function SpringPress({ 
  children, onPress, onLongPress, hapticStyle, style, scaleDown = 0.96, disabled 
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  style?: any;
  scaleDown?: number;
  disabled?: boolean;
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
      disabled={disabled}
      style={style}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function AnimatedCounter({ value, fontSize = 80 }: { value: number; fontSize?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    prevValue.current = value;
    const duration = 1200;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <Text
      style={[
        styles.heroNumber,
        { fontSize, lineHeight: fontSize * 1.05 },
      ]}
    >
      {displayValue}
    </Text>
  );
}

function RotatingGlowRing({ size, progress }: { size: number; progress: number }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const radius = (size - 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Animated.View style={[{ width: size, height: size, position: "absolute" }, animStyle]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1}
          fill="none"
          strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
          strokeLinecap="round"
        />
      </Svg>
    </Animated.View>
  );
}

function LiveHeartRate() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.liveHeart, style]}>
      <Ionicons name="heart" size={10} color={Colors.red} />
    </Animated.View>
  );
}

function PulsingRingWrapper({ children, shouldPulse }: { children: React.ReactNode; shouldPulse: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (shouldPulse) {
      scale.value = withRepeat(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [shouldPulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!shouldPulse) return <>{children}</>;

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

function HeroMetric({ metric }: { metric: HealthMetric }) {
  const progress = Math.min(metric.value / metric.goal, 1);
  const isComplete = progress >= 1;

  return (
    <SpringPress
      onPress={() => {
        router.push({ pathname: "/metric/[id]", params: { id: metric.id } });
      }}
      scaleDown={0.90}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      style={styles.heroMetric}
    >
      <PulsingRingWrapper shouldPulse={isComplete}>
        <MetricRing
          progress={progress}
          size={58}
          strokeWidth={2.5}
          color={metric.color}
          bgColor="rgba(255,255,255,0.04)"
        />
      </PulsingRingWrapper>
      <View style={styles.heroMetricOverlay}>
        <Text style={[styles.heroMetricValue, { color: metric.color }]}>
          {Math.round(progress * 100)}
        </Text>
      </View>
    </SpringPress>
  );
}

function ScoreBreakdown({
  visible,
  onClose,
  metrics,
  overallScore,
}: {
  visible: boolean;
  onClose: () => void;
  metrics: HealthMetric[];
  overallScore: number;
}) {
  const insets = useSafeAreaInsets();

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "EXCEPTIONAL";
    if (score >= 75) return "STRONG";
    if (score >= 60) return "ON TRACK";
    if (score >= 40) return "ROOM TO GROW";
    return "JUST GETTING STARTED";
  };

  const getScoreInsight = (score: number) => {
    if (score >= 90) return "You're operating at peak performance. Every metric is dialed in.";
    if (score >= 75) return "Strong consistency across your key metrics. Stay the course.";
    if (score >= 60) return "Solid foundation. A few areas could use attention to elevate your day.";
    if (score >= 40) return "You've made progress. Focus on one or two metrics to build momentum.";
    return "Every journey starts here. One intentional action shifts everything.";
  };

  const sorted = [...metrics].sort((a, b) => {
    const pa = Math.min(a.value / a.goal, 1);
    const pb = Math.min(b.value / b.goal, 1);
    return pb - pa;
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={breakdownStyles.overlay}>
        <Pressable style={breakdownStyles.dismissArea} onPress={onClose} />
        <View style={[breakdownStyles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={breakdownStyles.handle} />

          <View style={breakdownStyles.headerRow}>
            <Text style={breakdownStyles.sheetTitle}>SCORE BREAKDOWN</Text>
            <Pressable onPress={onClose} hitSlop={16}>
              <Ionicons name="close" size={20} color={Colors.muted} />
            </Pressable>
          </View>

          <View style={breakdownStyles.scoreHeader}>
            <Text style={breakdownStyles.bigScore}>{overallScore}</Text>
            <View style={breakdownStyles.scoreMeta}>
              <Text style={breakdownStyles.scoreLabel}>{getScoreLabel(overallScore)}</Text>
              <Text style={breakdownStyles.scoreInsight}>{getScoreInsight(overallScore)}</Text>
            </View>
          </View>

          <View style={breakdownStyles.divider} />

          <Text style={breakdownStyles.contributorsLabel}>CONTRIBUTING FACTORS</Text>

          {sorted.map((metric) => {
            const pct = Math.round(Math.min(metric.value / metric.goal, 1) * 100);
            const weight = Math.round(100 / metrics.length);
            const contribution = Math.round((pct * weight) / 100);

            return (
              <View key={metric.id} style={breakdownStyles.factorRow}>
                <View style={breakdownStyles.factorLeft}>
                  <View style={[breakdownStyles.factorDot, { backgroundColor: metric.color }]} />
                  <Text style={breakdownStyles.factorName}>{metric.label.toUpperCase()}</Text>
                </View>
                <View style={breakdownStyles.factorRight}>
                  <View style={breakdownStyles.factorBarBg}>
                    <View
                      style={[
                        breakdownStyles.factorBarFill,
                        { width: `${pct}%`, backgroundColor: metric.color },
                      ]}
                    />
                  </View>
                  <Text style={[breakdownStyles.factorPct, { color: metric.color }]}>{pct}%</Text>
                  <Text style={breakdownStyles.factorContrib}>+{contribution}</Text>
                </View>
              </View>
            );
          })}

          <View style={breakdownStyles.divider} />

          <View style={breakdownStyles.formulaRow}>
            <Text style={breakdownStyles.formulaLabel}>CALCULATION</Text>
            <Text style={breakdownStyles.formulaText}>
              Average completion across {metrics.length} metrics, weighted equally
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const breakdownStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.handle,
    alignSelf: "center",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 24,
  },
  bigScore: {
    fontSize: 56,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    lineHeight: 56,
  },
  scoreMeta: {
    flex: 1,
    paddingTop: 4,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 3,
  },
  scoreInsight: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    lineHeight: 19,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 20,
  },
  contributorsLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: TYPOGRAPHY.captionLetterSpacing,
    marginBottom: 16,
  },
  factorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  factorLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: 100,
  },
  factorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  factorName: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 2,
  },
  factorRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 12,
  },
  factorBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 1.5,
  },
  factorBarFill: {
    height: 3,
    borderRadius: 1.5,
  },
  factorPct: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    width: 32,
    textAlign: "right",
  },
  factorContrib: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    width: 24,
    textAlign: "right",
  },
  formulaRow: {
    gap: 6,
  },
  formulaLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  formulaText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.4)",
    lineHeight: 17,
  },
});

function ShortcutsEditor({
  visible,
  onClose,
  activeRoutes,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  activeRoutes: string[];
  onSave: (routes: string[]) => void;
}) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(activeRoutes);

  useEffect(() => {
    if (visible) setSelected(activeRoutes);
  }, [visible]);

  const toggleRoute = (route: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      if (prev.includes(route)) return prev.filter((r) => r !== route);
      if (prev.length >= 10) return prev;
      return [...prev, route];
    });
  };

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(selected);
    onClose();
  };

  const handleReset = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelected(DEFAULT_SHORTCUT_ROUTES);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={editorStyles.overlay}>
        <Pressable style={editorStyles.dismissArea} onPress={onClose} />
        <View style={[editorStyles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={editorStyles.handle} />

          <View style={editorStyles.headerRow}>
            <View>
              <Text style={editorStyles.sheetTitle}>CUSTOMIZE SHORTCUTS</Text>
              <Text style={editorStyles.sheetSubtitle}>{selected.length} of 10 selected</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={16}>
              <Ionicons name="close" size={20} color={Colors.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={editorStyles.scrollArea}
            contentContainerStyle={editorStyles.grid}
            showsVerticalScrollIndicator={false}
          >
            {ALL_SHORTCUTS.map((item) => {
              const isActive = selected.includes(item.route);
              const idx = selected.indexOf(item.route);
              return (
                <Pressable
                  key={item.route}
                  onPress={() => toggleRoute(item.route)}
                  style={[
                    editorStyles.tile,
                    isActive && editorStyles.tileActive,
                  ]}
                >
                  {isActive && (
                    <View style={editorStyles.tileBadge}>
                      <Text style={editorStyles.tileBadgeText}>{idx + 1}</Text>
                    </View>
                  )}
                  <View style={editorStyles.tileIconWrap}>
                    <Ionicons
                      name={item.icon as any}
                      size={18}
                      color={isActive ? Colors.white : Colors.muted}
                    />
                  </View>
                  <Text style={[editorStyles.tileLabel, isActive && editorStyles.tileLabelActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={editorStyles.footer}>
            <Pressable onPress={handleReset} style={editorStyles.resetBtn}>
              <Text style={editorStyles.resetText}>RESET</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[editorStyles.saveBtn, selected.length === 0 && { opacity: 0.3 }]}
              disabled={selected.length === 0}
            >
              <Text style={editorStyles.saveText}>SAVE</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const editorStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 16,
    maxHeight: "80%",
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: RADIUS.handle,
    alignSelf: "center",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  sheetSubtitle: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.3)",
    marginTop: 4,
  },
  scrollArea: {
    flexGrow: 0,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingBottom: 20,
  },
  tile: {
    width: "30%",
    flexGrow: 1,
    minWidth: 95,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  tileIconWrap: {
    width: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  tileActive: {
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  tileBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  tileBadgeText: {
    fontSize: 8,
    fontFamily: "Outfit_400Regular",
    color: "#0D0D0D",
  },
  tileLabel: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  tileLabelActive: {
    color: Colors.white,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  resetBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    alignItems: "center",
  },
  resetText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: "#0D0D0D",
    letterSpacing: 3,
  },
});

function MetricRow({ metric }: { metric: HealthMetric }) {
  const [expanded, setExpanded] = useState(false);
  const expandOpacity = useSharedValue(0);

  const weeklyData = useMemo(() => {
    const ranges: Record<string, [number, number]> = {
      steps: [4000, 14000],
      calories: [300, 850],
      heart: [58, 82],
      active: [15, 70],
    };
    const [min, max] = ranges[metric.id] || [0, 100];
    return Array.from({ length: 7 }, () => randomBetween(min, max));
  }, [metric.id]);

  const expandedData = useMemo(() => {
    const ranges: Record<string, [number, number]> = {
      steps: [4000, 14000],
      calories: [300, 850],
      heart: [58, 82],
      active: [15, 70],
    };
    const [min, max] = ranges[metric.id] || [0, 100];
    return Array.from({ length: 14 }, () => randomBetween(min, max));
  }, [metric.id]);

  const expandAnimStyle = useAnimatedStyle(() => ({
    opacity: expandOpacity.value,
  }));

  const handlePress = () => {
    router.push({ pathname: "/metric/[id]", params: { id: metric.id } });
  };

  const handleLongPress = () => {
    const next = !expanded;
    setExpanded(next);
    expandOpacity.value = withTiming(next ? 1 : 0, { duration: 300 });
  };

  const progress = Math.min(metric.value / metric.goal, 1);

  return (
    <View>
      <SpringPress
        onPress={handlePress}
        onLongPress={handleLongPress}
        hapticStyle={Haptics.ImpactFeedbackStyle.Light}
        style={styles.metricRow}
      >
        <View style={[styles.metricRowBorder, { backgroundColor: metric.color }]} />
        <View style={styles.metricRowLeft}>
          <Text style={styles.metricRowLabel}>{metric.label.toUpperCase()}</Text>
          <View style={styles.metricRowValueRow}>
            <Text style={styles.metricRowValue}>
              {metric.id === "steps"
                ? formatNumber(metric.value)
                : metric.value.toString()}
            </Text>
            {metric.unit ? (
              <Text style={styles.metricRowUnit}>{metric.unit}</Text>
            ) : null}
            {metric.id === "heart" && <LiveHeartRate />}
          </View>
        </View>

        <View style={styles.metricRowCenter}>
          <MiniChart data={weeklyData} width={56} height={24} color={metric.color} />
        </View>

        <View style={styles.metricRowRight}>
          <View style={styles.metricProgressBg}>
            <View style={[styles.metricProgressFill, { width: `${progress * 100}%`, backgroundColor: metric.color }]} />
          </View>
          <View style={styles.trendContainer}>
            <Ionicons
              name={metric.trend >= 0 ? "arrow-up" : "arrow-down"}
              size={9}
              color={metric.trend >= 0 ? Colors.green : Colors.red}
            />
            <Text
              style={[
                styles.trendText,
                { color: metric.trend >= 0 ? Colors.green : Colors.red },
              ]}
            >
              {Math.abs(metric.trend)}%
            </Text>
          </View>
        </View>
      </SpringPress>
      {expanded && (
        <Animated.View style={[styles.expandedMetric, expandAnimStyle]}>
          <MiniChart data={expandedData} width={SCREEN_WIDTH - 54} height={48} color={metric.color} />
          <Text style={styles.expandedGoalText}>
            GOAL: {formatNumber(metric.goal)} {metric.unit}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

function HydrationSegment({ filled, index, onTap }: { filled: boolean; index: number; onTap: () => void }) {
  const fillAnim = useSharedValue(0);
  const successScale = useSharedValue(1);
  const prevFilled = useRef(false);

  useEffect(() => {
    fillAnim.value = withTiming(filled ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled]);

  useEffect(() => {
    if (filled && !prevFilled.current) {
      successScale.value = withTiming(1.12, { duration: 100, easing: Easing.out(Easing.cubic) }, () => {
        successScale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      });
    }
    prevFilled.current = filled;
  }, [filled]);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: fillAnim.value > 0.5 ? Colors.teal : "rgba(255,255,255,0.04)",
    opacity: fillAnim.value > 0.5 ? 0.6 + fillAnim.value * 0.4 : 1,
    transform: [{ scale: successScale.value }],
  }));

  return (
    <SpringPress
      onPress={onTap}
      scaleDown={0.92}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      style={{ flex: 1 }}
    >
      <Animated.View style={[styles.hydrationSegment, animStyle]} />
    </SpringPress>
  );
}

function LogWaterButton({ onLogWater }: { onLogWater: () => void }) {
  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onLogWater();
  }, [onLogWater]);

  return (
    <SpringPress
      onPress={handlePress}
      scaleDown={0.97}
      hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
      style={styles.hydrationButton}
    >
      <View style={styles.hydrationButtonIconWrap}>
        <Ionicons name="water" size={14} color={Colors.teal} />
      </View>
      <Text style={styles.hydrationButtonText}>LOG WATER</Text>
    </SpringPress>
  );
}

function HydrationSection() {
  const { hydration, logWater } = useHealth();

  const handleSegmentTap = useCallback((index: number) => {
    if (index >= hydration.glasses) {
      logWater(1);
    }
  }, [hydration.glasses, logWater]);

  return (
    <View style={styles.hydrationSection}>
      <View style={styles.hydrationHeader}>
        <Text style={styles.sectionLabel}>HYDRATION</Text>
        <Text style={styles.hydrationCount}>
          {hydration.glasses} / {hydration.goal}
        </Text>
      </View>
      <View style={styles.hydrationBarRow}>
        {Array.from({ length: hydration.goal }, (_, i) => (
          <HydrationSegment key={i} filled={i < hydration.glasses} index={i} onTap={() => handleSegmentTap(i)} />
        ))}
      </View>
      <LogWaterButton onLogWater={() => logWater(1)} />
    </View>
  );
}

function StreakBar({ active, isToday }: { active: boolean; isToday: boolean }) {
  return (
    <View style={[styles.streakBarOuter, isToday && active && styles.streakBarGlow]}>
      {active ? (
        <Svg width="100%" height={36} style={{ position: "absolute" }}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={isToday ? "1" : "0.85"} />
              <Stop offset="1" stopColor="#333333" stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="36" fill="url(#barGrad)" />
        </Svg>
      ) : null}
      <View style={[styles.streakBar, !active && styles.streakBarInactive]} />
    </View>
  );
}

function StreakDayItem({ dayData, index }: { dayData: { day: string; active: boolean; isToday: boolean }; index: number }) {
  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(500)} style={styles.streakDay}>
      <Text style={[styles.streakDayLabel, dayData.isToday && { color: Colors.white }]}>
        {dayData.day}
      </Text>
      <SpringPress
        scaleDown={0.93}
        hapticStyle={dayData.active ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light}
      >
        <StreakBar active={dayData.active} isToday={dayData.isToday} />
      </SpringPress>
    </Animated.View>
  );
}

function StreakCalendar() {
  const days = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push({
        day: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        active: Math.random() > 0.2,
        isToday: i === 0,
      });
    }
    return result;
  }, []);

  const activeDays = days.filter(d => d.active).length;

  return (
    <View style={styles.streakSection}>
      <View style={styles.streakHeader}>
        <Text style={styles.sectionLabel}>THIS WEEK</Text>
        <View style={styles.streakCountRow}>
          <Text style={styles.streakCountBig}>{activeDays}</Text>
          <Text style={styles.streakCountSep}>/</Text>
          <Text style={styles.streakCountTotal}>7</Text>
        </View>
      </View>
      <View style={styles.streakRow}>
        {days.map((d, i) => (
          <StreakDayItem key={i} dayData={d} index={i} />
        ))}
      </View>
    </View>
  );
}

function TodayRecommendation() {
  const dayData = useMemo(() => getUserDayType(), []);

  const dayTypeConfig = {
    workout: {
      label: "PUSH DAY",
      color: Colors.red,
      message: "Your recovery is optimal. Time to push your limits with high-intensity work.",
    },
    recovery: {
      label: "ACTIVE RECOVERY",
      color: Colors.teal,
      message: "Focus on mobility and low-impact movement. Your body is adapting.",
    },
    rest: {
      label: "REST DAY",
      color: Colors.muted,
      message: "Strategic rest today. Recovery is where growth happens.",
    },
  };

  const config = dayTypeConfig[dayData.type];

  return (
    <SpringPress
      onPress={() => {
        router.push("/equinox-classes" as any);
      }}
      scaleDown={0.97}
      hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
      style={[styles.recommendationCard, { borderLeftColor: config.color }]}
    >
      <View style={styles.recommendationInner}>
        <View style={styles.recommendationTop}>
          <Text style={[styles.recommendationLabel, { color: config.color }]}>{config.label}</Text>
          <PulsingDot color={config.color} />
        </View>
        <Text style={styles.recommendationMessage}>{config.message}</Text>
        <View style={styles.recommendationFooter}>
          <Text style={styles.recommendationBtn}>VIEW CLASSES</Text>
          <Ionicons name="arrow-forward" size={12} color={Colors.muted} />
        </View>
      </View>
    </SpringPress>
  );
}

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 17) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { metrics, refreshMetrics, workouts, isLoading, profile } = useHealth();
  const [refreshing, setRefreshing] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showShortcutsEditor, setShowShortcutsEditor] = useState(false);
  const [shortcutRoutes, setShortcutRoutes] = useState<string[]>(DEFAULT_SHORTCUT_ROUTES);

  useEffect(() => {
    AsyncStorage.getItem(SHORTCUTS_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) setShortcutRoutes(parsed);
        } catch {}
      }
    });
  }, []);

  const handleSaveShortcuts = useCallback((routes: string[]) => {
    setShortcutRoutes(routes);
    AsyncStorage.setItem(SHORTCUTS_KEY, JSON.stringify(routes));
  }, []);

  const activeShortcuts = shortcutRoutes
    .map((r) => ALL_SHORTCUTS.find((s) => s.route === r))
    .filter(Boolean) as typeof ALL_SHORTCUTS;
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimeout(() => {
      refreshMetrics();
      setRefreshing(false);
    }, 800);
  }, [refreshMetrics]);

  const dateString = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    .toUpperCase();

  const greeting = getTimeGreeting();

  const overallProgress = metrics.length
    ? Math.round(
        (metrics.reduce(
          (sum, m) => sum + Math.min(m.value / m.goal, 1),
          0
        ) /
          metrics.length) *
          100
      )
    : 0;

  const todayWorkouts = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { flex: 1 }]}>
        <Animated.View entering={FadeIn.duration(500)}>
          <DashboardSkeleton />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: 140,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onMomentumScrollEnd={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.white}
          />
        }
      >
        <Animated.View entering={FadeIn.duration(800)}>

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerIcon}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/search" as any);
                }}
              >
                <Ionicons name="search-outline" size={18} color={Colors.white} />
              </Pressable>
              <Pressable
                style={styles.headerIcon}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: "/smart-scanner", params: { context: "general" } });
                }}
              >
                <Ionicons name="scan-outline" size={18} color={Colors.white} />
              </Pressable>
              <Pressable
                style={styles.headerIcon}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/notifications" as any);
                }}
              >
                <View>
                  <Ionicons name="notifications-outline" size={18} color={Colors.white} />
                  <View style={styles.notificationBadge} />
                </View>
              </Pressable>
            </View>
          </View>

          <Text style={styles.mottoText}>COMMIT TO SOMETHING</Text>
          <Text style={styles.mottoSub}>COMMIT TO KNOWING</Text>

          <View style={styles.insightBanner}>
            <Text style={styles.insightLabel}>
              {overallProgress >= 80 ? "PEAK PERFORMANCE" : overallProgress >= 50 ? "ON TRACK" : "READY TO BEGIN"}
            </Text>
            <Text style={styles.insightBannerText}>
              {overallProgress >= 80
                ? "Every metric elevated. Maintain this standard."
                : overallProgress >= 50
                ? "Momentum is building. Stay committed to the process."
                : "The best version of today is still ahead of you."}
            </Text>
          </View>

          <SpringPress
            onPress={() => {
              setShowScoreBreakdown(true);
            }}
            onLongPress={() => {
              setShowScoreBreakdown(true);
            }}
            scaleDown={0.94}
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            style={styles.heroSection}
          >
            <View style={styles.heroScoreContainer}>
              <RotatingGlowRing size={140} progress={overallProgress} />
              <AnimatedCounter value={overallProgress} fontSize={80} />
            </View>
            <Text style={styles.heroLabel}>DAILY SCORE</Text>
            <View style={styles.heroProgressBar}>
              <View style={[styles.heroProgressFill, { width: `${overallProgress}%` }]} />
            </View>
          </SpringPress>

          <View style={styles.heroRingsRow}>
            {metrics.map((m) => (
              <View key={m.id} style={styles.heroRingCol}>
                <HeroMetric metric={m} />
                <Text style={styles.heroRingLabel}>{m.label.toUpperCase()}</Text>
              </View>
            ))}
          </View>

          <ScoreBreakdown
            visible={showScoreBreakdown}
            onClose={() => setShowScoreBreakdown(false)}
            metrics={metrics}
            overallScore={overallProgress}
          />

          <TodayRecommendation />

          <SpringPress
            onPress={() => {
              router.push("/active-workout" as any);
            }}
            scaleDown={0.97}
            hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
            style={styles.startWorkoutBtn}
          >
            <Text style={styles.startWorkoutText}>START WORKOUT</Text>
          </SpringPress>

          <View style={styles.sectionDivider} />

          <StreakCalendar />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionLabel}>TODAY'S METRICS</Text>

          {metrics.map((metric, i) => (
            <React.Fragment key={metric.id}>
              <MetricRow metric={metric} />
              {i < metrics.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
          ))}

          {todayWorkouts.length > 0 && (
            <>
              <View style={styles.sectionDivider} />
              <View style={styles.todayWorkoutsHeader}>
                <Text style={styles.sectionLabel}>TODAY'S SESSIONS</Text>
                <Text style={styles.todayWorkoutCount}>
                  {todayWorkouts.length}
                </Text>
              </View>
              {todayWorkouts.map((w, i) => (
                <React.Fragment key={w.id}>
                  <Pressable
                    onPress={() => router.push({ pathname: "/workout/[id]", params: { id: w.id } })}
                    style={({ pressed }) => [
                      styles.todayWorkoutRow,
                      pressed && { opacity: 0.5 },
                    ]}
                  >
                    <View style={styles.todayWorkoutLeft}>
                      <View
                        style={[
                          styles.todayWorkoutDot,
                          {
                            backgroundColor:
                              w.intensity === "high"
                                ? Colors.red
                                : w.intensity === "moderate"
                                ? Colors.white
                                : Colors.muted,
                          },
                        ]}
                      />
                      <Text style={styles.todayWorkoutType}>{w.type}</Text>
                    </View>
                    <Text style={styles.todayWorkoutDuration}>{w.duration}m</Text>
                  </Pressable>
                  {i < todayWorkouts.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))}
            </>
          )}

          <View style={styles.sectionDivider} />

          <HydrationSection />

          <View style={styles.sectionDivider} />

          <View style={styles.quickAccessHeader}>
            <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>QUICK ACCESS</Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowShortcutsEditor(true);
              }}
              hitSlop={12}
            >
              <Text style={styles.editButton}>EDIT</Text>
            </Pressable>
          </View>
          <View style={styles.quickAccessGrid}>
            {activeShortcuts.map((item) => (
              <SpringPress
                key={item.route}
                onPress={() => {
                  router.push(item.route as any);
                }}
                scaleDown={0.94}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                style={styles.quickAccessCard}
              >
                <View style={styles.quickAccessIconWrap}>
                  <Ionicons name={item.icon as any} size={18} color={Colors.white} />
                </View>
                <Text style={styles.quickAccessLabel}>{item.label}</Text>
              </SpringPress>
            ))}
          </View>

          <ShortcutsEditor
            visible={showShortcutsEditor}
            onClose={() => setShowShortcutsEditor(false)}
            activeRoutes={shortcutRoutes}
            onSave={handleSaveShortcuts}
          />

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
  loadingContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingContent: {
    alignItems: "center" as const,
    gap: 16,
  },
  loadingText: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  loadingDivider: {
    width: 24,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  loadingSubtext: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 48,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  greetingText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 4,
  },
  dateText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  headerActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 2,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  notificationBadge: {
    position: "absolute" as const,
    top: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  mottoText: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 8,
    marginBottom: 10,
  },
  mottoSub: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.30)",
    letterSpacing: 5,
    marginBottom: 48,
  },
  insightBanner: {
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    marginBottom: 48,
    gap: 6,
  },
  insightLabel: {
    fontSize: 8,
    letterSpacing: TYPOGRAPHY.labelLetterSpacing,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
  },
  insightBannerText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.55)",
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  heroSection: {
    alignItems: "center" as const,
    marginBottom: 32,
  },
  heroScoreContainer: {
    width: 140,
    height: 140,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroNumber: {
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -3,
  },
  heroLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 6,
    marginTop: 12,
  },
  heroProgressBar: {
    width: 120,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 10,
    borderRadius: 1,
  },
  heroProgressFill: {
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  heroRingsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginBottom: 40,
    paddingHorizontal: 0,
  },
  heroRingCol: {
    alignItems: "center" as const,
    gap: 10,
  },
  heroRingLabel: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1.5,
  },
  heroMetric: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroMetricOverlay: {
    position: "absolute" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  heroMetricValue: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    letterSpacing: -0.5,
  },
  recommendationCard: {
    borderLeftWidth: 3,
    borderColor: "rgba(255,255,255,0.06)",
    borderWidth: 0.5,
    marginBottom: 24,
    overflow: "hidden" as const,
  },
  recommendationInner: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 10,
  },
  recommendationTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  recommendationLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 3,
  },
  recommendationMessage: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.5)",
    lineHeight: 19,
  },
  recommendationFooter: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 4,
  },
  recommendationBtn: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
  },
  startWorkoutBtn: {
    borderWidth: 1,
    borderColor: Colors.white,
    paddingVertical: 20,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  startWorkoutText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 5,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: SPACING.sectionGap,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: TYPOGRAPHY.labelLetterSpacing,
    marginBottom: 20,
  },
  streakSection: {
    marginBottom: 0,
  },
  streakHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 18,
  },
  streakCountRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 2,
  },
  streakCountBig: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  streakCountSep: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  streakCountTotal: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  streakRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 6,
  },
  streakDay: {
    flex: 1,
    alignItems: "center" as const,
    gap: 10,
  },
  streakDayLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  streakBarOuter: {
    width: "100%" as any,
    height: 36,
    overflow: "hidden" as const,
  },
  streakBar: {
    width: "100%" as any,
    height: 36,
  },
  streakBarInactive: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  streakBarGlow: {
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  liveHeart: {
    marginLeft: 6,
  },
  metricRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 20,
    paddingLeft: 14,
  },
  metricRowBorder: {
    position: "absolute" as const,
    left: 0,
    top: 8,
    bottom: 8,
    width: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
  metricRowLeft: {
    gap: 4,
    flex: 1,
  },
  metricRowLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  metricRowValueRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
  },
  metricRowValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  metricRowUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  metricRowCenter: {
    marginRight: 16,
  },
  metricRowRight: {
    alignItems: "flex-end" as const,
    gap: 8,
  },
  metricProgressBg: {
    width: 60,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 1.5,
  },
  metricProgressFill: {
    height: 3,
    borderRadius: 1.5,
  },
  trendContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  trendText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  todayWorkoutsHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  todayWorkoutCount: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
    marginBottom: 20,
  },
  todayWorkoutRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  todayWorkoutLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  todayWorkoutDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  todayWorkoutType: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  todayWorkoutDuration: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  hydrationSection: {
    marginBottom: 0,
  },
  hydrationHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  hydrationCount: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
  },
  hydrationBarRow: {
    flexDirection: "row" as const,
    gap: 4,
    marginBottom: 16,
  },
  hydrationSegment: {
    flex: 1,
    height: 24,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  hydrationButton: {
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: "rgba(90,200,212,0.2)",
    borderRadius: 2,
  },
  hydrationButtonIconWrap: {
    width: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  hydrationButtonText: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.teal,
    letterSpacing: 3,
    textAlign: "center" as const,
  },
  quickAccessHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  editButton: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  quickAccessGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginBottom: 8,
  },
  quickAccessCard: {
    flexBasis: "31%" as any,
    flexGrow: 1,
    minWidth: 0,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  quickAccessIconWrap: {
    width: "100%" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  quickAccessLabel: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    textAlign: "center" as const,
  },
  expandedMetric: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
    gap: 8,
  },
  expandedGoalText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
});
