import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const MACROFACTOR_ORANGE = "#FF6B35";

const macroTargets = [
  { label: "CALORIES", target: 2450, consumed: 1820, unit: "cal" },
  { label: "PROTEIN", target: 185, consumed: 142, unit: "g" },
  { label: "CARBS", target: 275, consumed: 198, unit: "g" },
  { label: "FAT", target: 78, consumed: 52, unit: "g" },
];

const expenditureTrend = [2620, 2710, 2650, 2690, 2640, 2680, 2670];

const foodLog = [
  { name: "Overnight Oats with Berries", time: "7:30 AM", calories: 420, protein: 28 },
  { name: "Grilled Chicken Wrap", time: "12:15 PM", calories: 580, protein: 42 },
  { name: "Protein Shake", time: "2:45 PM", calories: 210, protein: 35 },
  { name: "Greek Yogurt & Granola", time: "4:00 PM", calories: 180, protein: 15 },
  { name: "Salmon with Rice & Veggies", time: "7:00 PM", calories: 620, protein: 38 },
  { name: "Casein Pudding", time: "9:30 PM", calories: 160, protein: 24 },
];

function MiniTrendLine({ data }: { data: number[] }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 140;
  const step = width / (data.length - 1);

  const points = data.map((v, i) => ({
    x: i * step,
    y: height - ((v - min) / range) * height,
  }));

  return (
    <View style={{ width, height, flexDirection: "row", alignItems: "flex-end" }}>
      {points.map((point, i) => (
        <View key={i} style={{ position: "absolute", left: point.x - 2, top: point.y - 2 }}>
          <View
            style={{
              width: 4,
              height: 4,
              backgroundColor: MACROFACTOR_ORANGE,
            }}
          />
        </View>
      ))}
      {points.slice(0, -1).map((point, i) => {
        const next = points[i + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        return (
          <View
            key={`line-${i}`}
            style={{
              position: "absolute",
              left: point.x,
              top: point.y,
              width: length,
              height: 1,
              backgroundColor: MACROFACTOR_ORANGE,
              opacity: 0.6,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: "left center",
            }}
          />
        );
      })}
    </View>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

function ToggleRow({ label, defaultValue }: { label: string; defaultValue: boolean }) {
  const [enabled, setEnabled] = useState(defaultValue);
  return (
    <Pressable
      style={styles.toggleRow}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEnabled(!enabled);
      }}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, enabled && styles.toggleActive]}>
        <View style={[styles.toggleThumb, enabled && styles.toggleThumbActive]} />
      </View>
    </Pressable>
  );
}

export default function MacroFactorScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>

          <Text style={styles.title}>MacroFactor</Text>

          <View style={styles.connectionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedText}>CONNECTED</Text>
            <Text style={styles.syncTimeText}>Last synced 30 min ago</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionLabel}>TODAY'S MACRO TARGETS</Text>
          <View style={styles.card}>
            {macroTargets.map((macro, index) => {
              const progress = macro.consumed / macro.target;
              return (
                <View key={macro.label}>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>{macro.label}</Text>
                    <View style={styles.macroValues}>
                      <Text style={styles.macroConsumed}>
                        {macro.consumed.toLocaleString()}
                      </Text>
                      <Text style={styles.macroSeparator}> / </Text>
                      <Text style={styles.macroTarget}>
                        {macro.target.toLocaleString()} {macro.unit}
                      </Text>
                    </View>
                  </View>
                  <ProgressBar progress={progress} color={MACROFACTOR_ORANGE} />
                  {index < macroTargets.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionLabel}>EXPENDITURE</Text>
          <View style={styles.card}>
            <View style={styles.expenditureGrid}>
              <View style={styles.expenditureItem}>
                <Text style={styles.expenditureLabel}>ESTIMATED TDEE</Text>
                <Text style={styles.expenditureValue}>2,680</Text>
                <Text style={styles.expenditureUnit}>cal/day</Text>
              </View>
              <View style={styles.expenditureItem}>
                <Text style={styles.expenditureLabel}>WEEKLY AVERAGE</Text>
                <Text style={styles.expenditureValue}>2,640</Text>
                <Text style={styles.expenditureUnit}>cal/day</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.trendRow}>
              <View style={styles.trendInfo}>
                <Ionicons name="trending-up" size={16} color={Colors.green} />
                <Text style={styles.trendText}>Stable</Text>
              </View>
              <MiniTrendLine data={expenditureTrend} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionLabel}>COACHING RECOMMENDATIONS</Text>
          <View style={styles.card}>
            <View style={styles.coachingGrid}>
              <View style={styles.coachingItem}>
                <Text style={styles.coachingLabel}>CURRENT PHASE</Text>
                <Text style={styles.coachingValue}>Lean Bulk</Text>
              </View>
              <View style={styles.coachingItem}>
                <Text style={styles.coachingLabel}>TARGET RATE</Text>
                <Text style={styles.coachingValue}>+0.25 lbs/week</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.coachingGrid}>
              <View style={styles.coachingItem}>
                <Text style={styles.coachingLabel}>MACRO SPLIT</Text>
                <Text style={styles.coachingValue}>35P / 40C / 25F</Text>
              </View>
              <View style={styles.coachingItem}>
                <Text style={styles.coachingLabel}>ADHERENCE</Text>
                <View style={styles.adherenceRow}>
                  <Text style={[styles.coachingValue, { color: Colors.green }]}>92%</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <Text style={styles.sectionLabel}>RECENT FOOD LOG</Text>
          <View style={styles.card}>
            {foodLog.map((entry, index) => (
              <View key={index}>
                <View style={styles.foodRow}>
                  <View style={styles.foodLeft}>
                    <Text style={styles.foodName}>{entry.name}</Text>
                    <Text style={styles.foodTime}>{entry.time}</Text>
                  </View>
                  <View style={styles.foodRight}>
                    <Text style={styles.foodCalories}>{entry.calories} cal</Text>
                    <Text style={styles.foodProtein}>{entry.protein}g protein</Text>
                  </View>
                </View>
                {index < foodLog.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)}>
          <Text style={styles.sectionLabel}>SYNC SETTINGS</Text>
          <View style={styles.card}>
            <ToggleRow label="Auto-import meals" defaultValue={true} />
            <View style={styles.divider} />
            <ToggleRow label="Sync weight data" defaultValue={true} />
            <View style={styles.divider} />
            <ToggleRow label="Import expenditure estimates" defaultValue={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Pressable
            style={({ pressed }) => [styles.syncButton, pressed && { opacity: 0.7 }]}
            onPress={handleSync}
          >
            {syncing ? (
              <Ionicons name="sync" size={18} color={Colors.white} />
            ) : (
              <Text style={styles.syncButtonText}>SYNC NOW</Text>
            )}
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
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 12,
    marginBottom: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 36,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  greenDot: {
    width: 6,
    height: 6,
    backgroundColor: Colors.green,
    marginRight: 8,
  },
  connectedText: {
    fontSize: 10,
    color: Colors.green,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 2,
    marginRight: 12,
  },
  syncTimeText: {
    fontSize: 10,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
    letterSpacing: 1,
  },
  sectionLabel: {
    fontSize: 9,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 3,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.charcoal,
    padding: 16,
    marginBottom: 20,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 10,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 2,
  },
  macroValues: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  macroConsumed: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  macroSeparator: {
    fontSize: 12,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  macroTarget: {
    fontSize: 12,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
  },
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.border,
    marginBottom: 14,
  },
  progressBarFill: {
    height: 3,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  expenditureGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  expenditureItem: {
    flex: 1,
  },
  expenditureLabel: {
    fontSize: 9,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 2,
    marginBottom: 6,
  },
  expenditureValue: {
    fontSize: 24,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
  },
  expenditureUnit: {
    fontSize: 10,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
    letterSpacing: 1,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  trendInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trendText: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
  },
  coachingGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coachingItem: {
    flex: 1,
  },
  coachingLabel: {
    fontSize: 9,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 2,
    marginBottom: 6,
  },
  coachingValue: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  adherenceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  foodLeft: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
    marginBottom: 2,
  },
  foodTime: {
    fontSize: 10,
    color: Colors.muted,
    fontFamily: "Outfit_300Light",
    letterSpacing: 1,
  },
  foodRight: {
    alignItems: "flex-end",
  },
  foodCalories: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
  },
  foodProtein: {
    fontSize: 10,
    color: MACROFACTOR_ORANGE,
    fontFamily: "Outfit_300Light",
    letterSpacing: 1,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.white,
    fontFamily: "Outfit_300Light",
  },
  toggle: {
    width: 40,
    height: 22,
    backgroundColor: Colors.border,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: MACROFACTOR_ORANGE,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    backgroundColor: Colors.muted,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },
  syncButton: {
    backgroundColor: MACROFACTOR_ORANGE,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  syncButtonText: {
    fontSize: 12,
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 3,
  },
});
