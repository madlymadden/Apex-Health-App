import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const RUNNA_CORAL = "#FF5A5F";

const WEEK_SCHEDULE = [
  { day: "Mon", workout: "Easy Run", detail: "4mi @ 9:15/mi", completed: true, today: false },
  { day: "Tue", workout: "Intervals", detail: "6x800m @ 6:45/mi", completed: true, today: false },
  { day: "Wed", workout: "Rest Day", detail: null, completed: false, today: true },
  { day: "Thu", workout: "Tempo Run", detail: "5mi @ 7:30/mi", completed: false, today: false },
  { day: "Fri", workout: "Easy Run", detail: "3mi @ 9:30/mi", completed: false, today: false },
  { day: "Sat", workout: "Long Run", detail: "10mi @ 8:45/mi", completed: false, today: false },
  { day: "Sun", workout: "Cross Training / Rest", detail: null, completed: false, today: false },
];

const RECENT_RUNS = [
  { id: "1", name: "Easy Run", distance: "4.0mi", time: "37:12", date: "Feb 13" },
  { id: "2", name: "Intervals", distance: "4.8mi", time: "32:24", date: "Feb 12" },
  { id: "3", name: "Tempo Run", distance: "5.1mi", time: "38:15", date: "Feb 10" },
  { id: "4", name: "Long Run", distance: "8.5mi", time: "1:14:22", date: "Feb 8" },
];

export default function RunnaScreen() {
  const insets = useSafeAreaInsets();
  const [syncPlans, setSyncPlans] = useState(true);
  const [syncRunData, setSyncRunData] = useState(true);
  const [smartCoaching, setSmartCoaching] = useState(true);
  const [autoAdjustPaces, setAutoAdjustPaces] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleScrollBeginDrag = () => {
    Haptics.selectionAsync();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset,
          paddingBottom: insets.bottom + webBottomInset + 40,
        }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.titleSection}>
          <Text style={styles.title}>
            RUNNA
          </Text>
          <View style={styles.connectionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedLabel}>CONNECTED</Text>
            <Text style={styles.syncedText}>Last synced 2 min ago</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVE PLAN</Text>
          <View style={styles.card}>
            <Text style={styles.planName}>Half Marathon — Sub 1:45</Text>
            <View style={styles.planWeekRow}>
              <Text style={styles.planWeekText}>Week 6 of 16</Text>
              <Text style={styles.planPercentText}>37.5%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "37.5%" }]} />
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.raceRow}>
              <Text style={styles.raceLabel}>NEXT RACE</Text>
              <Text style={styles.raceValue}>Brooklyn Half — Apr 19</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.card}>
            {WEEK_SCHEDULE.map((item, index) => (
              <View key={item.day}>
                {index > 0 && <View style={styles.settingDivider} />}
                <View style={styles.weekRow}>
                  <View style={styles.weekDayContainer}>
                    <Text style={[styles.weekDay, item.today && { color: RUNNA_CORAL }]}>{item.day}</Text>
                    {item.today && <View style={styles.todayDot} />}
                  </View>
                  <View style={styles.weekWorkoutInfo}>
                    <Text style={[styles.weekWorkout, item.completed && styles.weekWorkoutCompleted]}>
                      {item.workout}
                    </Text>
                    {item.detail && (
                      <Text style={styles.weekDetail}>{item.detail}</Text>
                    )}
                  </View>
                  {item.completed && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                  )}
                  {item.today && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.sectionLabel}>PERFORMANCE</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>WEEKLY MILEAGE</Text>
              <Text style={styles.statValue}>
                18.2 <Text style={styles.statUnit}>mi</Text>
                <Text style={styles.statTotal}> / 28 mi</Text>
              </Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: "65%", backgroundColor: RUNNA_CORAL }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>AVG PACE</Text>
              <Text style={styles.statValue}>
                8:24 <Text style={styles.statUnit}>/mi</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>LONGEST RUN</Text>
              <Text style={styles.statValue}>
                8.5 <Text style={styles.statUnit}>mi</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL RUNS THIS MONTH</Text>
              <Text style={styles.statValue}>14</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>CURRENT STREAK</Text>
              <Text style={styles.statValue}>
                3 <Text style={styles.statUnit}>weeks</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionLabel}>RECENT RUNS</Text>
          {RECENT_RUNS.map((run, index) => (
            <Animated.View
              key={run.id}
              entering={FadeInDown.duration(400).delay(550 + index * 60)}
              style={styles.runCard}
            >
              <View style={styles.runHeader}>
                <View style={styles.runIconContainer}>
                  <Ionicons name="footsteps-outline" size={20} color={Colors.white} />
                </View>
                <View style={styles.runInfo}>
                  <Text style={styles.runName}>{run.name}</Text>
                  <Text style={styles.runDate}>{run.date}</Text>
                </View>
              </View>
              <View style={styles.runStats}>
                <View style={styles.runStatItem}>
                  <Text style={styles.runStatLabel}>DISTANCE</Text>
                  <Text style={styles.runStatValue}>{run.distance}</Text>
                </View>
                <View style={styles.runStatItem}>
                  <Text style={styles.runStatLabel}>TIME</Text>
                  <Text style={styles.runStatValue}>{run.time}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(800)} style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Training Plans</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncPlans(!syncPlans);
              }}
              style={[styles.toggle, syncPlans && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncPlans && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDividerFull} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Run Data</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncRunData(!syncRunData);
              }}
              style={[styles.toggle, syncRunData && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncRunData && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDividerFull} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Smart Coaching Alerts</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSmartCoaching(!smartCoaching);
              }}
              style={[styles.toggle, smartCoaching && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, smartCoaching && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDividerFull} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-adjust Paces</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoAdjustPaces(!autoAdjustPaces);
              }}
              style={[styles.toggle, autoAdjustPaces && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, autoAdjustPaces && styles.toggleThumbOn]} />
            </Pressable>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: RUNNA_CORAL,
    letterSpacing: 4,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.green,
    borderRadius: 4,
  },
  connectedLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.green,
    letterSpacing: 2,
  },
  syncedText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  section: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 20,
    marginVertical: 24,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  planName: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    marginBottom: 12,
  },
  planWeekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planWeekText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
  },
  planPercentText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: RUNNA_CORAL,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: RUNNA_CORAL,
  },
  raceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
  },
  raceLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  raceValue: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  weekDayContainer: {
    width: 40,
    alignItems: "center",
  },
  weekDay: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 1,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: RUNNA_CORAL,
    marginTop: 3,
  },
  weekWorkoutInfo: {
    flex: 1,
    marginLeft: 12,
  },
  weekWorkout: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  weekWorkoutCompleted: {
    color: Colors.secondaryText,
  },
  weekDetail: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: RUNNA_CORAL,
  },
  todayBadgeText: {
    fontSize: 8,
    fontFamily: "Outfit_400Regular",
    color: RUNNA_CORAL,
    letterSpacing: 2,
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  statTotal: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  statUnit: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  statBarBg: {
    height: 3,
    backgroundColor: Colors.surface,
    marginTop: 10,
  },
  statBarFill: {
    height: 3,
  },
  runCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  runHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  runIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  runInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  runName: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  runDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  runStats: {
    flexDirection: "row",
    gap: 16,
  },
  runStatItem: {
    gap: 2,
  },
  runStatLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  runStatValue: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  settingText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  settingDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  settingDividerFull: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 20,
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleOn: {
    backgroundColor: RUNNA_CORAL,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: Colors.muted,
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },
});
