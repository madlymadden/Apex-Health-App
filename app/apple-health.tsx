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
  generateAppleHealthData,
  type AppleHealthData,
  formatDuration,
} from "@/lib/health-data";

function SleepBar({ sleep }: { sleep: AppleHealthData["sleep"][0] }) {
  const total = sleep.deep + sleep.rem + sleep.light + sleep.awake;
  const qualityColor =
    sleep.quality === "excellent" ? Colors.green
    : sleep.quality === "good" ? Colors.teal
    : sleep.quality === "fair" ? Colors.offWhite
    : Colors.red;

  const dayLabel = new Date(sleep.date).toLocaleDateString("en-US", { weekday: "short" });

  return (
    <View style={styles.sleepBarRow}>
      <Text style={styles.sleepDayLabel}>{dayLabel}</Text>
      <View style={styles.sleepBarContainer}>
        <View style={[styles.sleepSegment, { flex: sleep.deep, backgroundColor: "#1A237E" }]} />
        <View style={[styles.sleepSegment, { flex: sleep.rem, backgroundColor: "#5C6BC0" }]} />
        <View style={[styles.sleepSegment, { flex: sleep.light, backgroundColor: "#9FA8DA" }]} />
        <View style={[styles.sleepSegment, { flex: sleep.awake, backgroundColor: "rgba(255,255,255,0.1)" }]} />
      </View>
      <Text style={[styles.sleepQuality, { color: qualityColor }]}>
        {formatDuration(sleep.duration)}
      </Text>
    </View>
  );
}

function NutrientBar({ label, value, goal, unit }: { label: string; value: number; goal: number; unit: string }) {
  const pct = Math.min(value / goal, 1);
  const isOver = value > goal;
  return (
    <View style={styles.nutrientRow}>
      <View style={styles.nutrientHeader}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={[styles.nutrientValue, isOver && { color: Colors.red }]}>
          {value} <Text style={styles.nutrientUnit}>/ {goal} {unit}</Text>
        </Text>
      </View>
      <View style={styles.nutrientBarBg}>
        <View
          style={[
            styles.nutrientBarFill,
            {
              width: `${pct * 100}%`,
              backgroundColor: isOver ? Colors.red : pct > 0.8 ? Colors.green : Colors.white,
            },
          ]}
        />
      </View>
    </View>
  );
}

export default function AppleHealthScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AppleHealthData | null>(null);
  const [tab, setTab] = useState<"vitals" | "sleep" | "nutrition" | "activity">("vitals");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setData(generateAppleHealthData());
  }, []);

  if (!data) return <View style={styles.container} />;

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
            <Text style={styles.headerTitle}>APPLE HEALTH</Text>
            <View style={styles.syncButton}>
              <View style={[styles.syncDot, { backgroundColor: Colors.green }]} />
              <Text style={styles.syncText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.tabRow}>
            {(["vitals", "sleep", "nutrition", "activity"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  setTab(t);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.tabButton, tab === t && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          {tab === "vitals" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.sectionLabel}>CURRENT READINGS</Text>
              {data.vitals.map((v, i) => (
                <Animated.View key={v.label} entering={FadeInDown.delay(i * 50).duration(300)}>
                  <View style={styles.vitalRow}>
                    <View style={styles.vitalLeft}>
                      <Text style={styles.vitalLabel}>{v.label.toUpperCase()}</Text>
                      <View style={styles.vitalValueRow}>
                        <Text style={styles.vitalValue}>{v.value}</Text>
                        <Text style={styles.vitalUnit}>{v.unit}</Text>
                      </View>
                    </View>
                    <Text style={styles.vitalTime}>{v.time}</Text>
                  </View>
                  {i < data.vitals.length - 1 && <View style={styles.rowDivider} />}
                </Animated.View>
              ))}

              <View style={styles.divider} />
              <View style={styles.insightSection}>
                <View style={styles.insightHeader}>
                  <View style={[styles.insightDot, { backgroundColor: "#FF2D55" }]} />
                  <Text style={[styles.insightLabel, { color: "#FF2D55" }]}>HEALTH SUMMARY</Text>
                </View>
                <Text style={styles.insightText}>
                  All vitals are within normal range. Your resting heart rate and HRV indicate strong cardiovascular fitness. Blood oxygen levels are optimal.
                </Text>
              </View>
            </Animated.View>
          )}

          {tab === "sleep" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <View style={styles.sleepSummary}>
                <View style={styles.sleepSummaryItem}>
                  <Text style={styles.sleepSummaryValue}>
                    {formatDuration(Math.round(data.sleep.reduce((s, d) => s + d.duration, 0) / data.sleep.length))}
                  </Text>
                  <Text style={styles.sleepSummaryLabel}>AVG DURATION</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.sleepSummaryItem}>
                  <Text style={styles.sleepSummaryValue}>
                    {Math.round(data.sleep.reduce((s, d) => s + d.deep, 0) / data.sleep.length)}m
                  </Text>
                  <Text style={styles.sleepSummaryLabel}>AVG DEEP</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.sleepSummaryItem}>
                  <Text style={styles.sleepSummaryValue}>
                    {data.sleep.filter((s) => s.quality === "good" || s.quality === "excellent").length}/7
                  </Text>
                  <Text style={styles.sleepSummaryLabel}>GOOD NIGHTS</Text>
                </View>
              </View>

              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>LAST 7 NIGHTS</Text>

              <View style={styles.sleepLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#1A237E" }]} />
                  <Text style={styles.legendText}>Deep</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#5C6BC0" }]} />
                  <Text style={styles.legendText}>REM</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#9FA8DA" }]} />
                  <Text style={styles.legendText}>Light</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
                  <Text style={styles.legendText}>Awake</Text>
                </View>
              </View>

              {data.sleep.map((s, i) => (
                <SleepBar key={i} sleep={s} />
              ))}
            </Animated.View>
          )}

          {tab === "nutrition" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.sectionLabel}>TODAY'S INTAKE</Text>
              {data.nutrition.map((n, i) => (
                <NutrientBar key={n.label} label={n.label} value={n.value} goal={n.goal} unit={n.unit} />
              ))}

              <View style={styles.divider} />
              <View style={styles.macroSummary}>
                <Text style={styles.sectionLabel}>MACRO SPLIT</Text>
                <View style={styles.macroBarContainer}>
                  {(() => {
                    const p = data.nutrition.find((n) => n.label === "Protein");
                    const c = data.nutrition.find((n) => n.label === "Carbs");
                    const f = data.nutrition.find((n) => n.label === "Fat");
                    const total = (p?.value || 0) * 4 + (c?.value || 0) * 4 + (f?.value || 0) * 9;
                    return (
                      <>
                        <View style={[styles.macroSegment, { flex: ((p?.value || 0) * 4) / total, backgroundColor: Colors.teal }]} />
                        <View style={[styles.macroSegment, { flex: ((c?.value || 0) * 4) / total, backgroundColor: Colors.white }]} />
                        <View style={[styles.macroSegment, { flex: ((f?.value || 0) * 9) / total, backgroundColor: Colors.muted }]} />
                      </>
                    );
                  })()}
                </View>
                <View style={styles.macroLabels}>
                  <Text style={[styles.macroLabel, { color: Colors.teal }]}>
                    PROTEIN {data.nutrition.find((n) => n.label === "Protein")?.value}g
                  </Text>
                  <Text style={[styles.macroLabel, { color: Colors.white }]}>
                    CARBS {data.nutrition.find((n) => n.label === "Carbs")?.value}g
                  </Text>
                  <Text style={[styles.macroLabel, { color: Colors.muted }]}>
                    FAT {data.nutrition.find((n) => n.label === "Fat")?.value}g
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}

          {tab === "activity" && (
            <Animated.View entering={FadeIn.duration(300)}>
              <Text style={styles.sectionLabel}>7-DAY ACTIVITY</Text>
              {data.activity.map((a, i) => {
                const dayLabel = new Date(a.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                return (
                  <Animated.View key={i} entering={FadeInDown.delay(i * 50).duration(300)}>
                    <View style={styles.activityRow}>
                      <Text style={styles.activityDay}>{dayLabel}</Text>
                      <View style={styles.activityStats}>
                        <View style={styles.activityStat}>
                          <Text style={styles.activityStatValue}>{a.steps.toLocaleString()}</Text>
                          <Text style={styles.activityStatUnit}>steps</Text>
                        </View>
                        <View style={styles.activityStatDivider} />
                        <View style={styles.activityStat}>
                          <Text style={styles.activityStatValue}>{a.calories}</Text>
                          <Text style={styles.activityStatUnit}>cal</Text>
                        </View>
                        <View style={styles.activityStatDivider} />
                        <View style={styles.activityStat}>
                          <Text style={styles.activityStatValue}>{a.distance}</Text>
                          <Text style={styles.activityStatUnit}>mi</Text>
                        </View>
                        <View style={styles.activityStatDivider} />
                        <View style={styles.activityStat}>
                          <Text style={styles.activityStatValue}>{a.flights}</Text>
                          <Text style={styles.activityStatUnit}>floors</Text>
                        </View>
                      </View>
                    </View>
                    {i < data.activity.length - 1 && <View style={styles.rowDivider} />}
                  </Animated.View>
                );
              })}
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepBlack },
  scrollContent: { paddingHorizontal: 24 },
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 28 },
  backButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  headerTitle: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  syncButton: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5 },
  syncDot: { width: 5, height: 5, borderRadius: 2.5 },
  syncText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.green, letterSpacing: 2 },
  tabRow: { flexDirection: "row" as const, gap: 2 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center" as const },
  tabButtonActive: { borderBottomWidth: 1, borderBottomColor: Colors.white },
  tabText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  tabTextActive: { color: Colors.white },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  sectionLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3, marginBottom: 16 },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  vitalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 18 },
  vitalLeft: { gap: 4 },
  vitalLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  vitalValueRow: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 4 },
  vitalValue: { fontSize: 26, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  vitalUnit: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted },
  vitalTime: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  insightSection: {},
  insightHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8, marginBottom: 12 },
  insightDot: { width: 4, height: 4, borderRadius: 2 },
  insightLabel: { fontSize: 10, fontFamily: "Outfit_300Light", letterSpacing: 3 },
  insightText: { fontSize: 15, fontFamily: "Outfit_300Light", color: Colors.lightText, lineHeight: 24, letterSpacing: 0.2 },
  sleepSummary: { flexDirection: "row" as const, justifyContent: "space-around" as const, alignItems: "center" as const },
  sleepSummaryItem: { flex: 1, alignItems: "center" as const, gap: 6 },
  sleepSummaryValue: { fontSize: 24, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  sleepSummaryLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  summaryDivider: { width: 0.5, height: 28, backgroundColor: Colors.border },
  sleepLegend: { flexDirection: "row" as const, gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 0.5 },
  sleepBarRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginBottom: 10 },
  sleepDayLabel: { width: 28, fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  sleepBarContainer: { flex: 1, height: 16, flexDirection: "row" as const },
  sleepSegment: { height: 16 },
  sleepQuality: { width: 40, fontSize: 11, fontFamily: "Outfit_300Light", textAlign: "right" as const, letterSpacing: 0.3 },
  nutrientRow: { marginBottom: 20 },
  nutrientHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 8 },
  nutrientLabel: { fontSize: 12, fontFamily: "Outfit_400Regular", color: Colors.offWhite, letterSpacing: 0.3 },
  nutrientValue: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.white },
  nutrientUnit: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted },
  nutrientBarBg: { height: 3, backgroundColor: "rgba(255,255,255,0.06)" },
  nutrientBarFill: { height: 3 },
  macroSummary: {},
  macroBarContainer: { flexDirection: "row" as const, height: 8, gap: 2, marginBottom: 12 },
  macroSegment: { height: 8 },
  macroLabels: { flexDirection: "row" as const, justifyContent: "space-between" as const },
  macroLabel: { fontSize: 9, fontFamily: "Outfit_300Light", letterSpacing: 1.5 },
  activityRow: { paddingVertical: 16, gap: 10 },
  activityDay: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 0.5 },
  activityStats: { flexDirection: "row" as const, gap: 16, alignItems: "center" as const },
  activityStat: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 3 },
  activityStatValue: { fontSize: 15, fontFamily: "Outfit_300Light", color: Colors.white },
  activityStatUnit: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  activityStatDivider: { width: 0.5, height: 12, backgroundColor: "rgba(255,255,255,0.1)" },
});
