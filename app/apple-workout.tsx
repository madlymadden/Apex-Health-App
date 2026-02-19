import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const APPLE_GREEN = "#32D74B";

const FILTER_TABS = ["ALL", "CARDIO", "STRENGTH", "FLEXIBILITY"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const WORKOUTS = [
  {
    id: "1",
    type: "Outdoor Run",
    icon: "walk-outline" as const,
    date: "Today, 7:15 AM",
    duration: "32:14",
    calories: 385,
    heartRate: 156,
    distance: "5.2 km",
    category: "CARDIO" as FilterTab,
  },
  {
    id: "2",
    type: "Indoor Cycle",
    icon: "bicycle-outline" as const,
    date: "Yesterday, 6:30 PM",
    duration: "45:00",
    calories: 520,
    heartRate: 142,
    distance: "18.4 km",
    category: "CARDIO" as FilterTab,
  },
  {
    id: "3",
    type: "HIIT",
    icon: "flame-outline" as const,
    date: "Feb 11, 12:00 PM",
    duration: "28:30",
    calories: 410,
    heartRate: 168,
    distance: null,
    category: "CARDIO" as FilterTab,
  },
  {
    id: "4",
    type: "Strength Training",
    icon: "barbell-outline" as const,
    date: "Feb 10, 5:45 PM",
    duration: "52:10",
    calories: 380,
    heartRate: 128,
    distance: null,
    category: "STRENGTH" as FilterTab,
  },
  {
    id: "5",
    type: "Pool Swim",
    icon: "water-outline" as const,
    date: "Feb 9, 8:00 AM",
    duration: "35:00",
    calories: 340,
    heartRate: 134,
    distance: "1.2 km",
    category: "CARDIO" as FilterTab,
  },
  {
    id: "6",
    type: "Yoga",
    icon: "body-outline" as const,
    date: "Feb 8, 7:00 AM",
    duration: "60:00",
    calories: 180,
    heartRate: 98,
    distance: null,
    category: "FLEXIBILITY" as FilterTab,
  },
  {
    id: "7",
    type: "Outdoor Walk",
    icon: "footsteps-outline" as const,
    date: "Feb 7, 6:00 PM",
    duration: "42:20",
    calories: 245,
    heartRate: 112,
    distance: "3.8 km",
    category: "CARDIO" as FilterTab,
  },
  {
    id: "8",
    type: "Functional Training",
    icon: "fitness-outline" as const,
    date: "Feb 6, 12:30 PM",
    duration: "38:00",
    calories: 380,
    heartRate: 145,
    distance: null,
    category: "STRENGTH" as FilterTab,
  },
];

export default function AppleWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterTab>("ALL");
  const [autoSync, setAutoSync] = useState(true);
  const [syncHeartRate, setSyncHeartRate] = useState(true);
  const [includeGPS, setIncludeGPS] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const filteredWorkouts =
    activeFilter === "ALL"
      ? WORKOUTS
      : WORKOUTS.filter((w) => w.category === activeFilter);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFilterPress = (tab: FilterTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(tab);
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
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.titleSection}>
          <Text style={styles.title}>Apple Workout</Text>
          <View style={styles.connectionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedLabel}>CONNECTED</Text>
            <Text style={styles.syncedText}>Last synced 15 min ago</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.ringsSection}>
          <Text style={styles.sectionLabel}>ACTIVITY RINGS</Text>
          <View style={styles.ringsContainer}>
            <View style={styles.ringsVisual}>
              <View style={[styles.ring, styles.ringOuter]} />
              <View style={[styles.ring, styles.ringMiddle]} />
              <View style={[styles.ring, styles.ringInner]} />
            </View>
            <View style={styles.ringsData}>
              <View style={styles.ringDataRow}>
                <View style={[styles.ringIndicator, { backgroundColor: "#FF375F" }]} />
                <View style={styles.ringDataText}>
                  <Text style={styles.ringLabel}>MOVE</Text>
                  <Text style={styles.ringValue}>
                    620<Text style={styles.ringTotal}>/650 CAL</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.ringDataRow}>
                <View style={[styles.ringIndicator, { backgroundColor: APPLE_GREEN }]} />
                <View style={styles.ringDataText}>
                  <Text style={styles.ringLabel}>EXERCISE</Text>
                  <Text style={styles.ringValue}>
                    42<Text style={styles.ringTotal}>/30 MIN</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.ringDataRow}>
                <View style={[styles.ringIndicator, { backgroundColor: Colors.teal }]} />
                <View style={styles.ringDataText}>
                  <Text style={styles.ringLabel}>STAND</Text>
                  <Text style={styles.ringValue}>
                    11<Text style={styles.ringTotal}>/12 HRS</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.weekSection}>
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.weekStats}>
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>5</Text>
              <Text style={styles.weekStatLabel}>WORKOUTS</Text>
            </View>
            <View style={styles.weekDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>2,840</Text>
              <Text style={styles.weekStatLabel}>CALORIES</Text>
            </View>
            <View style={styles.weekDivider} />
            <View style={styles.weekStat}>
              <Text style={styles.weekStatValue}>186</Text>
              <Text style={styles.weekStatLabel}>MINUTES</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionLabel}>RECENT WORKOUTS</Text>
          <View style={styles.filterRow}>
            {FILTER_TABS.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => handleFilterPress(tab)}
                style={[
                  styles.filterTab,
                  activeFilter === tab && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    activeFilter === tab && styles.filterTabTextActive,
                  ]}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {filteredWorkouts.map((workout, index) => (
            <Animated.View
              key={workout.id}
              entering={FadeInDown.duration(400).delay(450 + index * 60)}
              style={styles.workoutCard}
            >
              <View style={styles.workoutHeader}>
                <View style={styles.workoutIconContainer}>
                  <Ionicons name={workout.icon} size={22} color={Colors.white} />
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.type}</Text>
                  <Text style={styles.workoutDate}>{workout.date}</Text>
                </View>
                <View style={styles.syncBadge}>
                  <Text style={styles.syncBadgeText}>SYNCED</Text>
                </View>
              </View>
              <View style={styles.workoutStats}>
                <View style={styles.workoutStatItem}>
                  <Text style={styles.workoutStatLabel}>DURATION</Text>
                  <Text style={styles.workoutStatValue}>{workout.duration}</Text>
                </View>
                <View style={styles.workoutStatItem}>
                  <Text style={styles.workoutStatLabel}>CALORIES</Text>
                  <Text style={styles.workoutStatValue}>{workout.calories}</Text>
                </View>
                <View style={styles.workoutStatItem}>
                  <Text style={styles.workoutStatLabel}>AVG HR</Text>
                  <Text style={styles.workoutStatValue}>{workout.heartRate} bpm</Text>
                </View>
                {workout.distance && (
                  <View style={styles.workoutStatItem}>
                    <Text style={styles.workoutStatLabel}>DISTANCE</Text>
                    <Text style={styles.workoutStatValue}>{workout.distance}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.settingsSection}>
          <Text style={styles.sectionLabel}>SYNC SETTINGS</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Auto-sync</Text>
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
            <Text style={styles.settingText}>Import workout types</Text>
            <View style={styles.settingChevron}>
              <Text style={styles.settingValueText}>All Types</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
            </View>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Heart Rate Zones</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncHeartRate(!syncHeartRate);
              }}
              style={[styles.toggle, syncHeartRate && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncHeartRate && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Include GPS Routes</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIncludeGPS(!includeGPS);
              }}
              style={[styles.toggle, includeGPS && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, includeGPS && styles.toggleThumbOn]} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(800)} style={styles.syncButtonContainer}>
          <Pressable onPress={handleSyncNow} style={styles.syncButton}>
            <Ionicons name="sync-outline" size={18} color={Colors.deepBlack} />
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
    backgroundColor: APPLE_GREEN,
    borderRadius: 4,
  },
  connectedLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: APPLE_GREEN,
    letterSpacing: 2,
  },
  syncedText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  ringsSection: {
    paddingBottom: 24,
  },
  ringsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 28,
  },
  ringsVisual: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 999,
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderWidth: 10,
    borderColor: "#FF375F",
    borderTopColor: "rgba(255,55,95,0.2)",
  },
  ringMiddle: {
    width: 92,
    height: 92,
    borderWidth: 10,
    borderColor: APPLE_GREEN,
  },
  ringInner: {
    width: 64,
    height: 64,
    borderWidth: 10,
    borderColor: Colors.teal,
    borderBottomColor: "rgba(90,200,212,0.2)",
  },
  ringsData: {
    flex: 1,
    gap: 14,
  },
  ringDataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  ringIndicator: {
    width: 4,
    height: 28,
  },
  ringDataText: {
    gap: 2,
  },
  ringLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  ringValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  ringTotal: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  weekSection: {
    paddingBottom: 24,
  },
  weekStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  weekStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  weekStatValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  weekStatLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  weekDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginVertical: 24,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.charcoal,
  },
  filterTabActive: {
    backgroundColor: Colors.white,
  },
  filterTabText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  filterTabTextActive: {
    color: Colors.deepBlack,
  },
  workoutCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  workoutIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  workoutName: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  workoutDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: APPLE_GREEN,
  },
  syncBadgeText: {
    fontSize: 8,
    fontFamily: "Outfit_400Regular",
    color: APPLE_GREEN,
    letterSpacing: 2,
  },
  workoutStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  workoutStatItem: {
    gap: 2,
  },
  workoutStatLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  workoutStatValue: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  settingsSection: {
    paddingBottom: 24,
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
  settingChevron: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  settingValueText: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
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
    backgroundColor: APPLE_GREEN,
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
    backgroundColor: Colors.white,
    paddingVertical: 16,
    gap: 8,
  },
  syncButtonText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.deepBlack,
    letterSpacing: 3,
  },
});
