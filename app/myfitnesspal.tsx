import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const MFP_BLUE = "#0070E0";

const mealsData = [
  { name: "Breakfast", items: "Oatmeal with berries, protein shake", calories: 520 },
  { name: "Lunch", items: "Grilled chicken salad, quinoa", calories: 680 },
  { name: "Snack", items: "Greek yogurt, almonds", calories: 280 },
  { name: "Dinner", items: "Salmon, sweet potato, vegetables", calories: 470 },
];

const weeklyData = [
  { day: "Mon", consumed: 2150, target: 2200 },
  { day: "Tue", consumed: 2300, target: 2200 },
  { day: "Wed", consumed: 2180, target: 2200 },
  { day: "Thu", consumed: 1900, target: 2200 },
  { day: "Fri", consumed: 2050, target: 2200 },
  { day: "Sat", consumed: 2400, target: 2200 },
  { day: "Sun", consumed: 1950, target: 2200 },
];

const macros = [
  { label: "PROTEIN", current: 128, goal: 160, unit: "g" },
  { label: "CARBS", current: 215, goal: 250, unit: "g" },
  { label: "FAT", current: 62, goal: 73, unit: "g" },
];

const syncSettingsData = [
  { label: "Auto-import meals", key: "autoImport" },
  { label: "Sync exercise calories", key: "syncExercise" },
  { label: "Import water intake", key: "importWater" },
  { label: "Share weight data", key: "shareWeight" },
];

function getBarColor(consumed: number, target: number) {
  const ratio = consumed / target;
  if (ratio > 1.05) return Colors.red;
  if (ratio >= 0.95) return Colors.green;
  return MFP_BLUE;
}

export default function MyFitnessPalScreen() {
  const insets = useSafeAreaInsets();
  const [syncSettings, setSyncSettings] = useState<Record<string, boolean>>({
    autoImport: true,
    syncExercise: true,
    importWater: false,
    shareWeight: false,
  });

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const totalCalories = 1950;
  const calorieGoal = 2200;
  const remaining = calorieGoal - totalCalories;
  const calorieProgress = totalCalories / calorieGoal;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleSyncNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleSetting = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSyncSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={16}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.title}>MyFitnessPal</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.connectionRow}>
          <View style={styles.connectedDot} />
          <Text style={styles.connectedLabel}>CONNECTED</Text>
          <Text style={styles.syncTime}>Last synced 1 hr ago</Text>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionLabel}>TODAY'S NUTRITION</Text>

          <View style={styles.calorieHeader}>
            <Text style={styles.calorieValue}>
              {totalCalories.toLocaleString()}
            </Text>
            <Text style={styles.calorieGoalText}>
              {" "}/ {calorieGoal.toLocaleString()} cal
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(calorieProgress * 100, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.remainingContainer}>
            <Text style={styles.remainingValue}>{remaining}</Text>
            <Text style={styles.remainingLabel}>CALORIES REMAINING</Text>
          </View>

          <View style={styles.macrosRow}>
            {macros.map((macro) => (
              <View key={macro.label} style={styles.macroItem}>
                <Text style={styles.macroValue}>
                  {macro.current}{macro.unit}
                </Text>
                <Text style={styles.macroGoal}>
                  / {macro.goal}{macro.unit}
                </Text>
                <Text style={styles.macroLabel}>{macro.label}</Text>
                <View style={styles.macroBarBg}>
                  <View
                    style={[
                      styles.macroBarFill,
                      { width: `${Math.min((macro.current / macro.goal) * 100, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionLabel}>MEALS TODAY</Text>
          {mealsData.map((meal, index) => (
            <View key={meal.name} style={styles.mealCard}>
              <View style={styles.mealTop}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.syncedBadge}>
                  <Text style={styles.syncedBadgeText}>SYNCED</Text>
                </View>
              </View>
              <Text style={styles.mealItems}>{meal.items}</Text>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
              {index < mealsData.length - 1 && <View style={styles.mealDivider} />}
            </View>
          ))}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionLabel}>WEEKLY OVERVIEW</Text>
          {weeklyData.map((day) => {
            const maxCal = 2600;
            const consumedWidth = (day.consumed / maxCal) * 100;
            const targetWidth = (day.target / maxCal) * 100;
            const barColor = getBarColor(day.consumed, day.target);
            return (
              <View key={day.day} style={styles.weekRow}>
                <Text style={styles.weekDay}>{day.day}</Text>
                <View style={styles.weekBarContainer}>
                  <View style={[styles.weekBarTarget, { width: `${targetWidth}%` }]} />
                  <View
                    style={[
                      styles.weekBarConsumed,
                      { width: `${consumedWidth}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
                <Text style={[styles.weekCalText, { color: barColor }]}>
                  {day.consumed.toLocaleString()}
                </Text>
              </View>
            );
          })}
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.streakContainer}>
          <Ionicons name="flame" size={28} color={MFP_BLUE} />
          <Text style={styles.streakValue}>42</Text>
          <Text style={styles.streakLabel}>DAY LOGGING STREAK</Text>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(700)}>
          <Text style={styles.sectionLabel}>FOOD DATABASE</Text>
          <View style={styles.dbCard}>
            <View style={styles.dbRow}>
              <Ionicons name="search" size={18} color={MFP_BLUE} />
              <Text style={styles.dbText}>14M+ foods available</Text>
            </View>
            <View style={styles.dbRow}>
              <Ionicons name="barcode-outline" size={18} color={MFP_BLUE} />
              <Text style={styles.dbText}>Barcode scanner active</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(800)}>
          <Text style={styles.sectionLabel}>SYNC SETTINGS</Text>
          {syncSettingsData.map((setting) => (
            <View key={setting.key} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{setting.label}</Text>
              <Pressable
                onPress={() => toggleSetting(setting.key)}
                style={[
                  styles.toggle,
                  syncSettings[setting.key] && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    syncSettings[setting.key] && styles.toggleThumbActive,
                  ]}
                />
              </Pressable>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(900)}>
          <Pressable onPress={handleSyncNow} style={styles.syncButton}>
            <Ionicons name="sync" size={18} color={Colors.white} />
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    marginBottom: 16,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  connectedDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.green,
    marginRight: 8,
  },
  connectedLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.green,
    letterSpacing: 2,
    marginRight: 12,
  },
  syncTime: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  calorieValue: {
    fontSize: 42,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  calorieGoalText: {
    fontSize: 16,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.charcoal,
    marginBottom: 20,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: MFP_BLUE,
  },
  remainingContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: Colors.charcoal,
  },
  remainingValue: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: MFP_BLUE,
  },
  remainingLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: 4,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  macroValue: {
    fontSize: 18,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  macroGoal: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  macroBarBg: {
    height: 3,
    backgroundColor: Colors.charcoal,
  },
  macroBarFill: {
    height: 3,
    backgroundColor: MFP_BLUE,
  },
  mealCard: {
    marginBottom: 4,
  },
  mealTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealName: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  syncedBadge: {
    backgroundColor: Colors.charcoal,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  syncedBadgeText: {
    fontSize: 8,
    fontFamily: "Outfit_400Regular",
    color: Colors.green,
    letterSpacing: 2,
  },
  mealItems: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: MFP_BLUE,
    marginBottom: 4,
  },
  mealDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  weekDay: {
    width: 32,
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 1,
  },
  weekBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: Colors.charcoal,
    marginHorizontal: 10,
    position: "relative",
  },
  weekBarTarget: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 16,
    backgroundColor: Colors.border,
  },
  weekBarConsumed: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 16,
  },
  weekCalText: {
    width: 48,
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    textAlign: "right",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: Colors.charcoal,
  },
  streakValue: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    marginHorizontal: 10,
  },
  streakLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  dbCard: {
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  dbRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dbText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    marginLeft: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  toggle: {
    width: 44,
    height: 24,
    backgroundColor: Colors.charcoal,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: MFP_BLUE,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: Colors.muted,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },
  syncButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: MFP_BLUE,
    paddingVertical: 16,
    marginTop: 32,
    gap: 10,
  },
  syncButtonText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 3,
  },
});
