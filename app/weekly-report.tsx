import React, { useState, useEffect } from "react";
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  generateWeeklyReport,
  formatDuration,
  type WeeklyReport,
} from "@/lib/health-data";

function DailyBar({ day, calories, maxCal }: { day: string; calories: number; maxCal: number }) {
  const height = Math.max((calories / maxCal) * 100, 4);
  return (
    <View style={styles.dailyBarItem}>
      <View style={styles.dailyBarWrapper}>
        <View style={[styles.dailyBar, { height: `${height}%` as any }]} />
      </View>
      <Text style={styles.dailyBarLabel}>{day}</Text>
    </View>
  );
}

export default function WeeklyReportScreen() {
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setReport(generateWeeklyReport());
  }, []);

  if (!report) return <View style={styles.container} />;

  const maxCal = Math.max(...report.dailyActivity.map((d) => d.calories));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>WEEKLY REPORT</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.scoreSection}>
            <Text style={styles.scoreValue}>{report.consistencyScore}</Text>
            <Text style={styles.scoreLabel}>CONSISTENCY SCORE</Text>
            <View style={styles.scoreChange}>
              <Ionicons
                name={report.weekOverWeekChange >= 0 ? "arrow-up" : "arrow-down"}
                size={10}
                color={report.weekOverWeekChange >= 0 ? Colors.green : Colors.red}
              />
              <Text
                style={[
                  styles.scoreChangeText,
                  { color: report.weekOverWeekChange >= 0 ? Colors.green : Colors.red },
                ]}
              >
                {Math.abs(report.weekOverWeekChange)}% vs last week
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsGrid}>
            <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.statCard}>
              <Text style={styles.statCardValue}>{report.totalWorkouts}</Text>
              <Text style={styles.statCardLabel}>WORKOUTS</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(150).duration(300)} style={styles.statCard}>
              <Text style={styles.statCardValue}>{report.totalCalories.toLocaleString()}</Text>
              <Text style={styles.statCardLabel}>CALORIES</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(300)} style={styles.statCard}>
              <Text style={styles.statCardValue}>{formatDuration(report.totalMinutes)}</Text>
              <Text style={styles.statCardLabel}>ACTIVE TIME</Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(250).duration(300)} style={styles.statCard}>
              <Text style={styles.statCardValue}>{report.avgHeartRate}</Text>
              <Text style={styles.statCardLabel}>AVG HR</Text>
            </Animated.View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DAILY BREAKDOWN</Text>
          <View style={styles.dailyChart}>
            {report.dailyActivity.map((d) => (
              <DailyBar key={d.day} day={d.day} calories={d.calories} maxCal={maxCal} />
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>PERSONAL RECORDS</Text>
          {report.personalRecords.map((pr, i) => (
            <Animated.View key={pr.label} entering={FadeInDown.delay(i * 60).duration(300)}>
              <View style={styles.prRow}>
                <View style={styles.prLeft}>
                  <View style={styles.prDot} />
                  <View>
                    <Text style={styles.prLabel}>{pr.label}</Text>
                    <Text style={styles.prPrevious}>Previous: {pr.previous}</Text>
                  </View>
                </View>
                <Text style={styles.prValue}>{pr.value}</Text>
              </View>
              {i < report.personalRecords.length - 1 && <View style={styles.rowDivider} />}
            </Animated.View>
          ))}

          <View style={styles.divider} />

          <View style={styles.additionalStats}>
            <View style={styles.additionalRow}>
              <Text style={styles.additionalLabel}>Top Workout</Text>
              <Text style={styles.additionalValue}>{report.topWorkoutType}</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.additionalRow}>
              <Text style={styles.additionalLabel}>Avg Sleep</Text>
              <Text style={styles.additionalValue}>{report.sleepAvg} hrs</Text>
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.additionalRow}>
              <Text style={styles.additionalLabel}>Avg Steps</Text>
              <Text style={styles.additionalValue}>{report.stepsAvg.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>INSIGHTS</Text>
          {report.insights.map((insight, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(i * 60).duration(300)}>
              <View style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepBlack },
  scrollContent: { paddingHorizontal: 24 },
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 32 },
  backButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  headerTitle: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  scoreSection: { alignItems: "center" as const, marginBottom: 8 },
  scoreValue: { fontSize: 64, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -3 },
  scoreLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3, marginTop: 4 },
  scoreChange: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, marginTop: 12 },
  scoreChangeText: { fontSize: 12, fontFamily: "Outfit_300Light", letterSpacing: 0.3 },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 28 },
  statsGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 10 },
  statCard: { flex: 1, minWidth: "45%" as any, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 20, alignItems: "center" as const, gap: 8 },
  statCardValue: { fontSize: 22, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  statCardLabel: { fontSize: 8, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  sectionLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3, marginBottom: 20 },
  dailyChart: { flexDirection: "row" as const, justifyContent: "space-between" as const, height: 120, paddingHorizontal: 4 },
  dailyBarItem: { flex: 1, alignItems: "center" as const, gap: 8, justifyContent: "flex-end" as const },
  dailyBarWrapper: { flex: 1, width: 20, justifyContent: "flex-end" as const },
  dailyBar: { width: 20, backgroundColor: Colors.white },
  dailyBarLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 1 },
  prRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 16 },
  prLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 12 },
  prDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.teal },
  prLabel: { fontSize: 14, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  prPrevious: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, marginTop: 2, letterSpacing: 0.3 },
  prValue: { fontSize: 16, fontFamily: "Outfit_300Light", color: Colors.teal, letterSpacing: -0.3 },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  additionalStats: {},
  additionalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 14 },
  additionalLabel: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 0.2 },
  additionalValue: { fontSize: 14, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  insightRow: { flexDirection: "row" as const, gap: 12, paddingVertical: 10, alignItems: "flex-start" as const },
  insightDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.teal, marginTop: 7 },
  insightText: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.lightText, lineHeight: 22, flex: 1, letterSpacing: 0.2 },
});
