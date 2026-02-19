import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const GARMIN_BLUE = "#007DC5";

const ACTIVITIES = [
  {
    id: "1",
    name: "Trail Run",
    icon: "trail-sign-outline" as const,
    date: "Today, 6:45 AM",
    duration: "42:15",
    distance: "5.3 mi",
    calories: 486,
  },
  {
    id: "2",
    name: "Strength Training",
    icon: "barbell-outline" as const,
    date: "Yesterday, 5:30 PM",
    duration: "55:00",
    distance: null,
    calories: 380,
  },
  {
    id: "3",
    name: "Cycling",
    icon: "bicycle-outline" as const,
    date: "Feb 11, 7:00 AM",
    duration: "1:12:30",
    distance: "18.2 mi",
    calories: 612,
  },
  {
    id: "4",
    name: "Pool Swim",
    icon: "water-outline" as const,
    date: "Feb 10, 6:30 AM",
    duration: "35:00",
    distance: "1500 yds",
    calories: 340,
  },
  {
    id: "5",
    name: "Yoga",
    icon: "body-outline" as const,
    date: "Feb 9, 7:00 AM",
    duration: "45:00",
    distance: null,
    calories: 180,
  },
  {
    id: "6",
    name: "HIIT",
    icon: "flame-outline" as const,
    date: "Feb 8, 12:00 PM",
    duration: "28:00",
    distance: null,
    calories: 320,
  },
];

export default function GarminScreen() {
  const insets = useSafeAreaInsets();
  const [autoSync, setAutoSync] = useState(true);
  const [syncSleep, setSyncSleep] = useState(true);
  const [importHR, setImportHR] = useState(true);
  const [syncBodyBattery, setSyncBodyBattery] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSyncNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.titleSection}>
          <Text style={styles.title}>Garmin</Text>
          <View style={styles.connectionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedLabel}>CONNECTED</Text>
            <Text style={styles.syncedText}>Last synced 5 min ago</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={styles.sectionLabel}>DEVICE</Text>
          <View style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>DEVICE</Text>
              <Text style={styles.deviceValue}>Garmin Fenix 8</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>BATTERY</Text>
              <View style={styles.batteryContainer}>
                <Text style={styles.deviceValue}>68%</Text>
                <View style={styles.batteryBarBg}>
                  <View style={[styles.batteryBarFill, { width: "68%" }]} />
                </View>
              </View>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>FIRMWARE</Text>
              <Text style={styles.deviceValue}>v12.34</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.sectionLabel}>TODAY'S STATS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STEPS</Text>
              <Text style={styles.statValue}>
                8,432<Text style={styles.statTotal}> / 10,000</Text>
              </Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: "84.3%", backgroundColor: GARMIN_BLUE }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statLabel}>HEART RATE</Text>
                <Ionicons name="pulse-outline" size={12} color={Colors.red} />
              </View>
              <Text style={styles.statValue}>
                62 <Text style={styles.statUnit}>BPM</Text>
              </Text>
              <Text style={styles.statSubtext}>Resting</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>BODY BATTERY</Text>
              <Text style={styles.statValue}>
                72<Text style={styles.statTotal}> / 100</Text>
              </Text>
              <View style={styles.statBarBg}>
                <View style={[styles.statBarFill, { width: "72%", backgroundColor: Colors.teal }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STRESS LEVEL</Text>
              <Text style={styles.statValue}>
                28 <Text style={[styles.statUnit, { color: Colors.green }]}>(Low)</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>SPO2</Text>
              <Text style={styles.statValue}>97%</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>FLOORS CLIMBED</Text>
              <Text style={styles.statValue}>14</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>INTENSITY MINUTES</Text>
              <Text style={styles.statValue}>
                42 <Text style={styles.statUnit}>min</Text>
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionLabel}>RECENT ACTIVITIES</Text>
          {ACTIVITIES.map((activity, index) => (
            <Animated.View
              key={activity.id}
              entering={FadeInDown.duration(400).delay(450 + index * 60)}
              style={styles.activityCard}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityIconContainer}>
                  <Ionicons name={activity.icon} size={22} color={Colors.white} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityDate}>{activity.date}</Text>
                </View>
                <View style={styles.syncBadge}>
                  <Text style={styles.syncBadgeText}>SYNCED</Text>
                </View>
              </View>
              <View style={styles.activityStats}>
                <View style={styles.activityStatItem}>
                  <Text style={styles.activityStatLabel}>DURATION</Text>
                  <Text style={styles.activityStatValue}>{activity.duration}</Text>
                </View>
                {activity.distance && (
                  <View style={styles.activityStatItem}>
                    <Text style={styles.activityStatLabel}>DISTANCE</Text>
                    <Text style={styles.activityStatValue}>{activity.distance}</Text>
                  </View>
                )}
                <View style={styles.activityStatItem}>
                  <Text style={styles.activityStatLabel}>CALORIES</Text>
                  <Text style={styles.activityStatValue}>{activity.calories}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.section}>
          <Text style={styles.sectionLabel}>SLEEP DATA</Text>
          <View style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>LAST NIGHT</Text>
              <Text style={styles.deviceValue}>7h 42m</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>DEEP SLEEP</Text>
              <Text style={styles.deviceValue}>1h 18m</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>LIGHT SLEEP</Text>
              <Text style={styles.deviceValue}>4h 12m</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>REM</Text>
              <Text style={styles.deviceValue}>1h 52m</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>AWAKE</Text>
              <Text style={styles.deviceValue}>20m</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>SLEEP SCORE</Text>
              <Text style={[styles.deviceValue, { color: Colors.teal }]}>82</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(800)} style={styles.section}>
          <Text style={styles.sectionLabel}>TRAINING STATUS</Text>
          <View style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>STATUS</Text>
              <Text style={[styles.deviceValue, { color: Colors.green }]}>Productive</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>VO2 MAX</Text>
              <Text style={styles.deviceValue}>48</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>TRAINING LOAD</Text>
              <Text style={styles.deviceValue}>Optimal</Text>
            </View>
            <View style={styles.settingDivider} />
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>RECOVERY TIME</Text>
              <Text style={styles.deviceValue}>14 hrs</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(900)} style={styles.section}>
          <Text style={styles.sectionLabel}>SYNC SETTINGS</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-sync activities</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAutoSync(!autoSync);
              }}
              style={[styles.toggle, autoSync && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, autoSync && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync sleep data</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncSleep(!syncSleep);
              }}
              style={[styles.toggle, syncSleep && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncSleep && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Import heart rate</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setImportHR(!importHR);
              }}
              style={[styles.toggle, importHR && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, importHR && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Body Battery</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncBodyBattery(!syncBodyBattery);
              }}
              style={[styles.toggle, syncBodyBattery && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncBodyBattery && styles.toggleThumbOn]} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(1000)} style={styles.syncButtonContainer}>
          <Pressable onPress={handleSyncNow} style={styles.syncButton}>
            <Ionicons name="sync-outline" size={18} color={Colors.white} />
            <Text style={styles.syncButtonText}>SYNC NOW</Text>
          </Pressable>
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
    color: Colors.white,
    letterSpacing: -0.5,
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
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 24,
  },
  deviceCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  deviceLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  deviceValue: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  batteryBarBg: {
    width: 80,
    height: 4,
    backgroundColor: Colors.surface,
  },
  batteryBarFill: {
    height: 4,
    backgroundColor: Colors.green,
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  statSubtext: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
  },
  statBarBg: {
    height: 3,
    backgroundColor: Colors.surface,
    marginTop: 10,
  },
  statBarFill: {
    height: 3,
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  activityName: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  activityDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: GARMIN_BLUE,
  },
  syncBadgeText: {
    fontSize: 8,
    fontFamily: "Outfit_400Regular",
    color: GARMIN_BLUE,
    letterSpacing: 2,
  },
  activityStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  activityStatItem: {
    gap: 2,
  },
  activityStatLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  activityStatValue: {
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
    backgroundColor: Colors.border,
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
    backgroundColor: GARMIN_BLUE,
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
  syncButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GARMIN_BLUE,
    paddingVertical: 16,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 3,
  },
});
