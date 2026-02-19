import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

interface Supplement {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
  takenAt: string;
}

const INITIAL_SUPPLEMENTS: Record<string, Supplement[]> = {
  MORNING: [
    { id: "1", name: "Vitamin D3", dosage: "5000 IU", time: "MORNING", taken: true, takenAt: "7:15 AM" },
    { id: "2", name: "Omega-3 Fish Oil", dosage: "2g", time: "MORNING", taken: true, takenAt: "7:15 AM" },
    { id: "3", name: "Creatine", dosage: "5g", time: "MORNING", taken: true, takenAt: "7:30 AM" },
    { id: "4", name: "Multivitamin", dosage: "", time: "MORNING", taken: true, takenAt: "7:15 AM" },
  ],
  AFTERNOON: [
    { id: "5", name: "Protein Shake", dosage: "30g", time: "AFTERNOON", taken: true, takenAt: "1:00 PM" },
    { id: "6", name: "BCAAs", dosage: "5g", time: "AFTERNOON", taken: false, takenAt: "" },
  ],
  EVENING: [
    { id: "7", name: "Magnesium", dosage: "400mg", time: "EVENING", taken: false, takenAt: "" },
    { id: "8", name: "ZMA", dosage: "", time: "EVENING", taken: false, takenAt: "" },
  ],
};

const WEEKLY_ADHERENCE = [
  { day: "MON", percent: 100 },
  { day: "TUE", percent: 87 },
  { day: "WED", percent: 75 },
  { day: "THU", percent: 100 },
  { day: "FRI", percent: 62 },
  { day: "SAT", percent: 100 },
  { day: "SUN", percent: 87 },
];

function getCurrentTime(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minuteStr = minutes < 10 ? "0" + minutes : minutes.toString();
  return `${hours}:${minuteStr} ${ampm}`;
}

export default function SupplementTrackerScreen() {
  const insets = useSafeAreaInsets();
  const [supplements, setSupplements] = useState(INITIAL_SUPPLEMENTS);

  const allSupplements = Object.values(supplements).flat();
  const takenCount = allSupplements.filter((s) => s.taken).length;
  const totalCount = allSupplements.length;
  const progress = takenCount / totalCount;

  const toggleSupplement = (section: string, id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSupplements((prev) => ({
      ...prev,
      [section]: prev[section].map((s) =>
        s.id === id
          ? { ...s, taken: !s.taken, takenAt: !s.taken ? getCurrentTime() : "" }
          : s
      ),
    }));
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + webBottomInset + 40 }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={20}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: "/smart-scanner", params: { context: "supplement" } });
            }}
            hitSlop={12}
          >
            <Ionicons name="scan-outline" size={20} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.title}>Supplements</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.progressSection}>
          <Text style={styles.progressLabel}>
            {takenCount}/{totalCount} TAKEN
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>YOUR STACK</Text>
            <Pressable hitSlop={16}>
              <Ionicons name="create-outline" size={18} color={Colors.muted} />
            </Pressable>
          </View>
          <View style={styles.divider} />
        </Animated.View>

        {Object.entries(supplements).map(([section, items], sectionIndex) => (
          <Animated.View
            key={section}
            entering={FadeInDown.duration(500).delay(400 + sectionIndex * 100)}
          >
            <Text style={styles.timeLabel}>{section}</Text>
            {items.map((supplement) => (
              <Pressable
                key={supplement.id}
                style={styles.supplementRow}
                onPress={() => toggleSupplement(section, supplement.id)}
              >
                <View
                  style={[
                    styles.toggleCircle,
                    supplement.taken && styles.toggleCircleActive,
                  ]}
                >
                  {supplement.taken && (
                    <Ionicons name="checkmark" size={14} color={Colors.deepBlack} />
                  )}
                </View>
                <View style={styles.supplementInfo}>
                  <Text style={styles.supplementName}>{supplement.name}</Text>
                  {supplement.dosage ? (
                    <Text style={styles.supplementDosage}>{supplement.dosage}</Text>
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.takenTime,
                    !supplement.taken && styles.takenTimeNotYet,
                  ]}
                >
                  {supplement.taken ? supplement.takenAt : "NOT YET"}
                </Text>
              </Pressable>
            ))}
            {sectionIndex < Object.keys(supplements).length - 1 && (
              <View style={styles.divider} />
            )}
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.chartSection}>
          <Text style={styles.sectionTitle}>WEEKLY ADHERENCE</Text>
          <View style={styles.divider} />
          <View style={styles.chartRow}>
            {WEEKLY_ADHERENCE.map((item) => (
              <View key={item.day} style={styles.chartColumn}>
                <View style={styles.chartBarBg}>
                  <View
                    style={[
                      styles.chartBarFill,
                      { height: `${item.percent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.chartDayLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(800)} style={styles.statsSection}>
          <Text style={styles.sectionTitle}>STATS</Text>
          <View style={styles.divider} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>14</Text>
              <Text style={styles.statLabel}>DAY STREAK</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>ADHERENCE</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>1,247</Text>
              <Text style={styles.statLabel}>TOTAL DOSES</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(900)} style={styles.addButtonWrap}>
          <Pressable style={styles.addButton}>
            <Text style={styles.addButtonText}>ADD SUPPLEMENT</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 3,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: Colors.charcoal,
    width: "100%",
  },
  progressBarFill: {
    height: 3,
    backgroundColor: Colors.white,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  timeLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 4,
  },
  supplementRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleCircleActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  supplementInfo: {
    flex: 1,
    marginLeft: 14,
  },
  supplementName: {
    fontFamily: "Outfit_300Light",
    fontSize: 16,
    color: Colors.white,
  },
  supplementDosage: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.muted,
    marginTop: 1,
  },
  takenTime: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.white,
    letterSpacing: 1,
  },
  takenTimeNotYet: {
    color: Colors.muted,
  },
  chartSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  chartRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
    marginTop: 8,
    marginBottom: 16,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
  },
  chartBarBg: {
    width: 20,
    height: 80,
    backgroundColor: Colors.charcoal,
    justifyContent: "flex-end",
  },
  chartBarFill: {
    width: 20,
    backgroundColor: Colors.white,
  },
  chartDayLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 8,
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 6,
  },
  statsSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 28,
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 8,
    color: Colors.muted,
    letterSpacing: 2,
  },
  addButtonWrap: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  addButton: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.deepBlack,
    letterSpacing: 3,
  },
});
