import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { SPACING } from "@/constants/theme";

const OURA_GOLD = "#D4AF37";

const READINESS_CONTRIBUTORS = [
  { label: "RESTING HEART RATE", value: "58 bpm", status: "Good" },
  { label: "HRV BALANCE", value: "48ms", status: "Optimal" },
  { label: "BODY TEMPERATURE", value: "+0.1°F", status: "Normal" },
  { label: "RECOVERY INDEX", value: "92%", status: "Good" },
  { label: "PREVIOUS NIGHT SLEEP", value: "7h 42m", status: "Good" },
];

const SLEEP_BREAKDOWN = [
  { label: "TOTAL SLEEP", value: "7h 42m" },
  { label: "DEEP SLEEP", value: "1h 35m" },
  { label: "REM SLEEP", value: "1h 48m" },
  { label: "LIGHT SLEEP", value: "3h 52m" },
  { label: "AWAKE TIME", value: "27m" },
  { label: "SLEEP EFFICIENCY", value: "92%" },
  { label: "LATENCY", value: "8 min" },
];

const ACTIVITY_STATS = [
  { label: "STEPS", value: "8,234" },
  { label: "CALORIES BURNED", value: "2,180" },
  { label: "WALKING EQUIV", value: "6.2 mi" },
  { label: "INACTIVE TIME", value: "5h 20m" },
  { label: "ACTIVITY SCORE", value: "78" },
];

const TREND_DATA = [72, 85, 78, 90, 82, 88, 82];
const TREND_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function OuraRingScreen() {
  const insets = useSafeAreaInsets();
  const [syncReadiness, setSyncReadiness] = useState(true);
  const [syncSleep, setSyncSleep] = useState(true);
  const [syncActivity, setSyncActivity] = useState(true);
  const [syncTemperature, setSyncTemperature] = useState(false);
  const [showInDashboard, setShowInDashboard] = useState(true);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleScrollBegin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderScoreRing = (score: number, total: number, size: number, color: string) => {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / total) * circumference;

    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: "rgba(255,255,255,0.06)",
          position: "absolute",
        }} />
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          position: "absolute",
          borderTopColor: color,
          borderRightColor: score / total > 0.25 ? color : "transparent",
          borderBottomColor: score / total > 0.5 ? color : "transparent",
          borderLeftColor: score / total > 0.75 ? color : "transparent",
          transform: [{ rotate: "-90deg" }],
        }} />
        <Text style={styles.ringScore}>{score}</Text>
        <Text style={styles.ringTotal}>/ {total}</Text>
      </View>
    );
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
        onScrollBeginDrag={handleScrollBegin}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={Colors.white} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.titleSection}>
          <Text style={styles.title}>OURA <Text style={{ color: OURA_GOLD }}>RING</Text></Text>
          <View style={styles.connectionRow}>
            <View style={styles.greenDot} />
            <Text style={styles.connectedLabel}>CONNECTED</Text>
            <Text style={styles.syncedText}>Last synced 2 min ago</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={styles.sectionLabel}>READINESS</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              {renderScoreRing(82, 100, 80, OURA_GOLD)}
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>Readiness Score</Text>
                <Text style={styles.scoreSubtext}>You're ready for the day</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            {READINESS_CONTRIBUTORS.map((item, index) => (
              <View key={item.label}>
                <View style={styles.contributorRow}>
                  <Text style={styles.contributorLabel}>{item.label}</Text>
                  <View style={styles.contributorRight}>
                    <Text style={styles.contributorValue}>{item.value}</Text>
                    <Text style={[styles.contributorStatus, {
                      color: item.status === "Optimal" ? OURA_GOLD : Colors.green,
                    }]}>{item.status}</Text>
                  </View>
                </View>
                {index < READINESS_CONTRIBUTORS.length - 1 && <View style={styles.cardDivider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.sectionLabel}>SLEEP SCORE</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              {renderScoreRing(87, 100, 80, Colors.teal)}
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>Sleep Score</Text>
                <Text style={styles.scoreSubtext}>Excellent recovery</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            {SLEEP_BREAKDOWN.map((item, index) => (
              <View key={item.label}>
                <View style={styles.deviceRow}>
                  <Text style={styles.deviceLabel}>{item.label}</Text>
                  <Text style={styles.deviceValue}>{item.value}</Text>
                </View>
                {index < SLEEP_BREAKDOWN.length - 1 && <View style={styles.cardDivider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIVITY</Text>
          <View style={styles.statsGrid}>
            {ACTIVITY_STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.section}>
          <Text style={styles.sectionLabel}>TRENDS</Text>
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>7-Day Readiness</Text>
            <View style={styles.trendRow}>
              {TREND_DATA.map((score, index) => (
                <View key={index} style={styles.trendItem}>
                  <View style={styles.trendBarBg}>
                    <View style={[styles.trendBarFill, {
                      height: `${score}%`,
                      backgroundColor: index === TREND_DATA.length - 1 ? OURA_GOLD : "rgba(255,255,255,0.4)",
                    }]} />
                  </View>
                  <Text style={[styles.trendDay, index === TREND_DATA.length - 1 && { color: OURA_GOLD }]}>
                    {TREND_DAYS[index]}
                  </Text>
                  <Text style={[styles.trendScore, index === TREND_DATA.length - 1 && { color: Colors.white }]}>
                    {score}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.section}>
          <Text style={styles.sectionLabel}>SETTINGS</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Readiness Data</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncReadiness(!syncReadiness);
              }}
              style={[styles.toggle, syncReadiness && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncReadiness && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Sleep Data</Text>
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
            <Text style={styles.settingText}>Sync Activity</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncActivity(!syncActivity);
              }}
              style={[styles.toggle, syncActivity && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncActivity && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Sync Temperature</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSyncTemperature(!syncTemperature);
              }}
              style={[styles.toggle, syncTemperature && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, syncTemperature && styles.toggleThumbOn]} />
            </Pressable>
          </View>
          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Show in Dashboard</Text>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowInDashboard(!showInDashboard);
              }}
              style={[styles.toggle, showInDashboard && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, showInDashboard && styles.toggleThumbOn]} />
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
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 8,
    paddingBottom: 4,
  },
  titleSection: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 2,
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
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: 16,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 20,
    marginVertical: 24,
  },
  scoreCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingBottom: 12,
  },
  scoreInfo: {
    flex: 1,
    gap: 4,
  },
  scoreTitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  scoreSubtext: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  ringScore: {
    fontSize: 22,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  ringTotal: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  cardDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  contributorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  contributorLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 2,
  },
  contributorRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  contributorValue: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  contributorStatus: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 1,
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
  statsGrid: {
    paddingHorizontal: SPACING.screenPadding,
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
  trendCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  trendTitle: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    marginBottom: 16,
  },
  trendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  trendItem: {
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  trendBarBg: {
    width: 16,
    height: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  trendBarFill: {
    width: "100%",
  },
  trendDay: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  trendScore: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.screenPadding,
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
    backgroundColor: OURA_GOLD,
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
