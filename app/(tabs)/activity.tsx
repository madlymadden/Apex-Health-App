import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  RefreshControl,
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
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";
import {
  formatDuration,
  getRelativeDate,
  type WorkoutEntry,
} from "@/lib/health-data";

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

const weeklyBarData = Array.from({ length: 7 }, (_, i) => ({
  day: dayNames[i],
  minutes: Math.random() > 0.25 ? randomBetween(20, 70) : 0,
  isToday: i === 6,
}));

const maxMinutes = Math.max(...weeklyBarData.map((d) => d.minutes), 1);

function getWorkoutIcon(type: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    "Upper Body": "barbell-outline",
    "Strength Training": "barbell-outline",
    "Running": "walk-outline",
    "Cycling": "bicycle-outline",
    "Swimming": "water-outline",
    "HIIT": "flash-outline",
    "HIIT Circuit": "flash-outline",
    "Yoga": "leaf-outline",
    "Yoga Flow": "leaf-outline",
    "Lower Body": "fitness-outline",
    "Pilates": "body-outline",
    "Boxing": "fitness-outline",
  };
  return map[type] || "barbell-outline";
}

function getIntensityColor(intensity: string): string {
  if (intensity === "high") return "#D94848";
  if (intensity === "moderate") return "#5AC8D4";
  return Colors.muted;
}

function SpringPress({
  children, onPress, onLongPress, hapticStyle, style, scaleDown = 0.96,
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

function WorkoutCard({ workout, index }: { workout: WorkoutEntry; index: number }) {
  const borderColor = getIntensityColor(workout.intensity);
  const icon = getWorkoutIcon(workout.type);
  const [expanded, setExpanded] = useState(false);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <SpringPress
        scaleDown={0.97}
        hapticStyle={Haptics.ImpactFeedbackStyle.Light}
        onPress={() => {
          router.push({ pathname: "/workout/[id]", params: { id: workout.id } });
        }}
        onLongPress={() => setExpanded((prev) => !prev)}
      >
        <View
          style={[
            styles.workoutCard,
            { borderLeftColor: borderColor },
          ]}
        >
          <View style={styles.cardLeft}>
            <View style={styles.cardIconWrap}>
              <Ionicons name={icon} size={18} color={Colors.lightText} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardType}>{workout.type}</Text>
              <Text style={styles.cardDate}>{getRelativeDate(workout.date)}</Text>
            </View>
          </View>
          <View style={styles.cardRight}>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{formatDuration(workout.duration)}</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{workout.calories}</Text>
              <Text style={styles.statPillUnit}>cal</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statPillValue}>{workout.heartRateAvg}</Text>
              <Text style={styles.statPillUnit}>bpm</Text>
            </View>
          </View>
        </View>
        {expanded && (
          <View style={styles.expandedArea}>
            <View style={styles.expandedDivider} />
            <View style={styles.expandedStats}>
              <View style={styles.expandedStatItem}>
                <Text style={styles.expandedStatValue}>{Math.floor(workout.duration / 8)}</Text>
                <Text style={styles.expandedStatLabel}>SETS</Text>
              </View>
              <View style={styles.expandedStatItem}>
                <Text style={styles.expandedStatValue}>{(workout.calories * 0.45).toFixed(0)}</Text>
                <Text style={styles.expandedStatLabel}>VOLUME</Text>
              </View>
              <View style={styles.expandedStatItem}>
                <Text style={styles.expandedStatValue}>{workout.intensity.toUpperCase()}</Text>
                <Text style={styles.expandedStatLabel}>EFFORT</Text>
              </View>
            </View>
            <Text style={styles.expandedNote}>Every rep is a step closer to your goal.</Text>
          </View>
        )}
      </SpringPress>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.emptyState}>
      <Ionicons name="barbell-outline" size={48} color={Colors.border} />
      <Text style={styles.emptyTitle}>Your Training Begins Here</Text>
      <Text style={styles.emptySubtext}>
        Every rep counts. Tap + to log your first session and start building your legacy.
      </Text>
    </Animated.View>
  );
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { workouts, refreshWorkouts } = useHealth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBar, setSelectedBar] = useState<number | null>(null);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await refreshWorkouts();
    setRefreshing(false);
  }, [refreshWorkouts]);

  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgHR = workouts.length
    ? Math.round(
        workouts.reduce((sum, w) => sum + w.heartRateAvg, 0) / workouts.length
      )
    : 0;

  const thisWeekWorkouts = useMemo(() => workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  }), [workouts]);

  const olderWorkouts = useMemo(() => workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 7;
  }), [workouts]);

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
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.screenTitle}>Activity</Text>
              <Text style={styles.screenSubtitle}>
                {thisWeekWorkouts.length} session{thisWeekWorkouts.length !== 1 ? "s" : ""} this week
              </Text>
            </View>
            <View style={styles.titleActions}>
              <SpringPress
                scaleDown={0.88}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                onPress={() => {
                  router.push({ pathname: "/smart-scanner", params: { context: "workout" } });
                }}
                style={styles.addButton}
              >
                <Ionicons name="scan-outline" size={19} color={Colors.white} />
              </SpringPress>
              <SpringPress
                scaleDown={0.88}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                onPress={() => {
                  router.push("/add-workout");
                }}
                style={styles.addButton}
              >
                <Ionicons name="add" size={22} color={Colors.white} />
              </SpringPress>
            </View>
          </View>

          <SpringPress
            scaleDown={0.97}
            hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
            onPress={() => {
              router.push("/active-workout");
            }}
          >
            <View style={styles.startWorkoutBtn}>
              <Ionicons name="play" size={14} color={Colors.deepBlack} />
              <Text style={styles.startWorkoutText}>START WORKOUT</Text>
            </View>
          </SpringPress>

          <View style={styles.weeklyCard}>
            <Text style={styles.weeklyTitle}>WEEKLY ACTIVITY</Text>
            <View style={styles.barChart}>
              {weeklyBarData.map((d, i) => {
                const fillHeight = d.minutes > 0 ? (d.minutes / maxMinutes) * 100 : 0;
                const isSelected = selectedBar === i;
                return (
                  <SpringPress
                    key={i}
                    scaleDown={0.92}
                    hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                    onPress={() => {
                      setSelectedBar(isSelected ? null : i);
                    }}
                    style={styles.barCol}
                  >
                    {isSelected && d.minutes > 0 && (
                      <Text style={styles.barMinuteLabel}>{d.minutes}m</Text>
                    )}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${fillHeight}%`,
                            backgroundColor: isSelected
                              ? Colors.white
                              : d.isToday
                                ? Colors.white
                                : "rgba(255,255,255,0.2)",
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.barLabel,
                        (d.isToday || isSelected) && { color: Colors.white },
                      ]}
                    >
                      {d.day}
                    </Text>
                  </SpringPress>
                );
              })}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <SpringPress scaleDown={0.95} hapticStyle={Haptics.ImpactFeedbackStyle.Light} style={styles.summaryItem}>
              <View style={[styles.accentLine, { backgroundColor: "#D94848" }]} />
              <Text style={styles.summaryValue}>
                {totalCalories.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>TOTAL CAL</Text>
            </SpringPress>
            <View style={styles.summaryDivider} />
            <SpringPress scaleDown={0.95} hapticStyle={Haptics.ImpactFeedbackStyle.Light} style={styles.summaryItem}>
              <View style={[styles.accentLine, { backgroundColor: "#5AC8D4" }]} />
              <Text style={styles.summaryValue}>
                {formatDuration(totalMinutes)}
              </Text>
              <Text style={styles.summaryLabel}>DURATION</Text>
            </SpringPress>
            <View style={styles.summaryDivider} />
            <SpringPress scaleDown={0.95} hapticStyle={Haptics.ImpactFeedbackStyle.Light} style={styles.summaryItem}>
              <View style={[styles.accentLine, { backgroundColor: Colors.muted }]} />
              <Text style={styles.summaryValue}>{avgHR}</Text>
              <Text style={styles.summaryLabel}>AVG HR</Text>
            </SpringPress>
            <View style={styles.summaryDivider} />
            <SpringPress scaleDown={0.95} hapticStyle={Haptics.ImpactFeedbackStyle.Light} style={styles.summaryItem}>
              <View style={[styles.accentLine, { backgroundColor: Colors.white }]} />
              <Text style={styles.summaryValue}>{workouts.length}</Text>
              <Text style={styles.summaryLabel}>SESSIONS</Text>
            </SpringPress>
          </View>

          <View style={styles.hairline} />

          {workouts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {thisWeekWorkouts.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>THIS WEEK</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{thisWeekWorkouts.length}</Text>
                    </View>
                  </View>
                  {thisWeekWorkouts.map((workout, index) => (
                    <WorkoutCard key={workout.id} workout={workout} index={index} />
                  ))}
                </>
              )}

              {olderWorkouts.length > 0 && (
                <>
                  <View style={[styles.hairline, { marginTop: 16 }]} />
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionLabel}>RECENT</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{olderWorkouts.length}</Text>
                    </View>
                  </View>
                  {olderWorkouts.map((workout, index) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      index={thisWeekWorkouts.length + index}
                    />
                  ))}
                </>
              )}
            </>
          )}
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
    alignItems: "flex-start" as const,
    marginBottom: 28,
  },
  titleActions: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 4,
  },
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  screenSubtitle: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  addButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  startWorkoutBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
    backgroundColor: Colors.white,
    paddingVertical: 15,
    marginBottom: 32,
  },
  startWorkoutText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.deepBlack,
    letterSpacing: 5,
  },
  weeklyCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    padding: 20,
    marginBottom: 16,
  },
  weeklyTitle: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 16,
  },
  barChart: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    height: 80,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center" as const,
    height: "100%" as const,
    justifyContent: "flex-end" as const,
  },
  barTrack: {
    width: "100%" as const,
    height: 60,
    justifyContent: "flex-end" as const,
    borderRadius: 1,
    overflow: "hidden" as const,
  },
  barFill: {
    width: "100%" as const,
    borderRadius: 1,
  },
  barLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 8,
    letterSpacing: 1,
  },
  summaryCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    paddingVertical: 20,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 6,
  },
  accentLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  summaryDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  hairline: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
  },
  countBadge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  workoutCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: Colors.muted,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  cardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    flex: 1,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  cardDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  cardRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  statPill: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 2,
  },
  statPillValue: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightText,
  },
  statPillUnit: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
    textAlign: "center" as const,
    maxWidth: 260,
    lineHeight: 20,
  },
  expandedArea: {
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  expandedDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },
  expandedStats: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    marginBottom: 10,
  },
  expandedStatItem: {
    alignItems: "center" as const,
    gap: 4,
  },
  expandedStatValue: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  expandedStatLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  expandedNote: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
    textAlign: "center" as const,
    marginTop: 4,
    fontStyle: "italic" as const,
  },
  barMinuteLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
});
