import React, { useState } from "react";
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

type Category = "strength" | "cardio" | "body";

interface PersonalRecord {
  id: string;
  name: string;
  category: Category;
  currentValue: string;
  previousValue: string;
  date: string;
  improvement: number;
  icon: string;
}

const PR_DATA: PersonalRecord[] = [
  { id: "1", name: "Bench Press", category: "strength", currentValue: "225 lbs", previousValue: "was 205 lbs", date: "2026-02-08", improvement: 9.8, icon: "barbell-outline" },
  { id: "2", name: "Squat", category: "strength", currentValue: "315 lbs", previousValue: "was 295 lbs", date: "2026-02-03", improvement: 6.8, icon: "barbell-outline" },
  { id: "3", name: "Deadlift", category: "strength", currentValue: "405 lbs", previousValue: "was 385 lbs", date: "2026-01-28", improvement: 5.2, icon: "barbell-outline" },
  { id: "4", name: "Overhead Press", category: "strength", currentValue: "155 lbs", previousValue: "was 145 lbs", date: "2026-01-20", improvement: 6.9, icon: "barbell-outline" },
  { id: "5", name: "Pull-ups", category: "strength", currentValue: "18 reps", previousValue: "was 15 reps", date: "2026-02-10", improvement: 20.0, icon: "fitness-outline" },
  { id: "6", name: "Barbell Row", category: "strength", currentValue: "185 lbs", previousValue: "was 170 lbs", date: "2026-01-15", improvement: 8.8, icon: "barbell-outline" },
  { id: "7", name: "Fastest 5K", category: "cardio", currentValue: "22:14", previousValue: "was 23:45", date: "2026-02-06", improvement: 6.4, icon: "timer-outline" },
  { id: "8", name: "Longest Run", category: "cardio", currentValue: "8.2 mi", previousValue: "was 7.1 mi", date: "2026-01-30", improvement: 15.5, icon: "walk-outline" },
  { id: "9", name: "Best Mile", category: "cardio", currentValue: "6:32", previousValue: "was 6:58", date: "2026-02-11", improvement: 6.2, icon: "speedometer-outline" },
  { id: "10", name: "Max Cycling Speed", category: "cardio", currentValue: "34.7 mph", previousValue: "was 31.2 mph", date: "2026-01-22", improvement: 11.2, icon: "bicycle-outline" },
  { id: "11", name: "Longest Ride", category: "cardio", currentValue: "42.5 mi", previousValue: "was 36.8 mi", date: "2026-01-10", improvement: 15.5, icon: "bicycle-outline" },
  { id: "12", name: "Lowest Weight", category: "body", currentValue: "172 lbs", previousValue: "was 178 lbs", date: "2026-02-12", improvement: 3.4, icon: "scale-outline" },
  { id: "13", name: "Lowest Body Fat %", category: "body", currentValue: "14.2%", previousValue: "was 16.1%", date: "2026-02-01", improvement: 11.8, icon: "body-outline" },
  { id: "14", name: "Most Consecutive Workout Days", category: "body", currentValue: "21 days", previousValue: "was 14 days", date: "2026-01-25", improvement: 50.0, icon: "flame-outline" },
  { id: "15", name: "Highest Step Count", category: "body", currentValue: "28,430", previousValue: "was 24,100", date: "2026-02-09", improvement: 18.0, icon: "footsteps-outline" },
];

const CATEGORY_COLORS: Record<Category, string> = {
  strength: "#6C63FF",
  cardio: Colors.teal,
  body: Colors.green,
};

const CATEGORY_ICONS: Record<Category, string> = {
  strength: "barbell-outline",
  cardio: "heart-outline",
  body: "body-outline",
};

function PRCard({ pr, index }: { pr: PersonalRecord; index: number }) {
  const accent = CATEGORY_COLORS[pr.category];
  const dateStr = new Date(pr.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <View style={styles.prCard}>
        <View style={styles.prCardHeader}>
          <View style={[styles.categoryIcon, { borderColor: accent }]}>
            <Ionicons name={pr.icon as any} size={16} color={accent} />
          </View>
          <View style={styles.prCardInfo}>
            <Text style={styles.prName}>{pr.name}</Text>
            <Text style={styles.prCategory}>
              {pr.category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.prValueContainer}>
            <Text style={styles.prValue}>{pr.currentValue}</Text>
            <Text style={styles.prPrevious}>{pr.previousValue}</Text>
          </View>
        </View>
        <View style={styles.prCardFooter}>
          <Text style={styles.prDate}>{dateStr}</Text>
          <View style={styles.improvementBadge}>
            <Ionicons name="arrow-up" size={10} color={Colors.green} />
            <Text style={styles.improvementText}>
              {pr.improvement.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function TimelineItem({ pr, index }: { pr: PersonalRecord; index: number }) {
  const accent = CATEGORY_COLORS[pr.category];
  const dateStr = new Date(pr.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <View style={styles.timelineItem}>
        <View style={styles.timelineDotContainer}>
          <View style={[styles.timelineDot, { backgroundColor: accent }]} />
          {index < 4 && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineDate}>{dateStr}</Text>
          <Text style={styles.timelineName}>{pr.name}</Text>
          <Text style={styles.timelineValue}>{pr.currentValue}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function PersonalRecordsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [filter, setFilter] = useState<"all" | Category>("all");

  const filtered =
    filter === "all" ? PR_DATA : PR_DATA.filter((pr) => pr.category === filter);

  const recentPRs = [...PR_DATA]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const mostRecent = recentPRs[0];

  const prsThisMonth = PR_DATA.filter((pr) => {
    const d = new Date(pr.date);
    return d.getMonth() === 1 && d.getFullYear() === 2026;
  }).length;

  const prsThisYear = PR_DATA.filter(
    (pr) => new Date(pr.date).getFullYear() === 2026
  ).length;

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
                if (Platform.OS !== "web")
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>PERSONAL RECORDS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroValue}>{PR_DATA.length}</Text>
            <Text style={styles.heroLabel}>PERSONAL RECORDS</Text>
          </View>

          <View style={styles.recentHighlight}>
            <Text style={styles.recentHighlightLabel}>LATEST PR</Text>
            <View style={styles.recentHighlightRow}>
              <View
                style={[
                  styles.categoryIcon,
                  { borderColor: CATEGORY_COLORS[mostRecent.category] },
                ]}
              >
                <Ionicons
                  name={mostRecent.icon as any}
                  size={16}
                  color={CATEGORY_COLORS[mostRecent.category]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentHighlightName}>
                  {mostRecent.name}
                </Text>
                <Text style={styles.recentHighlightValue}>
                  {mostRecent.currentValue}
                </Text>
              </View>
              <View style={styles.improvementBadge}>
                <Ionicons name="arrow-up" size={10} color={Colors.green} />
                <Text style={styles.improvementText}>
                  {mostRecent.improvement.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{prsThisMonth}</Text>
              <Text style={styles.statLabel}>THIS MONTH</Text>
            </View>
            <View
              style={[styles.statItem, styles.statBorder]}
            >
              <Text style={styles.statValue}>{prsThisYear}</Text>
              <Text style={styles.statLabel}>THIS YEAR</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>LONGEST STREAK</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.filterRow}>
            {(["all", "strength", "cardio", "body"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFilter(f);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[
                  styles.filterButton,
                  filter === f && styles.filterButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f && styles.filterTextActive,
                  ]}
                >
                  {f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {filtered.map((pr, i) => (
            <PRCard key={pr.id} pr={pr} index={i} />
          ))}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>RECENT TIMELINE</Text>

          {recentPRs.map((pr, i) => (
            <TimelineItem key={pr.id} pr={pr} index={i} />
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepBlack },
  scrollContent: { paddingHorizontal: 24 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 32,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  heroSection: { alignItems: "center" as const, gap: 8, marginBottom: 24 },
  heroValue: {
    fontSize: 56,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -3,
  },
  heroLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  recentHighlight: {
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  recentHighlightLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 12,
  },
  recentHighlightRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  recentHighlightName: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  recentHighlightValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
  },
  statItem: { flex: 1, alignItems: "center" as const, gap: 4 },
  statBorder: {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  statLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  filterRow: {
    flexDirection: "row" as const,
    gap: 2,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center" as const,
  },
  filterButtonActive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
  },
  filterText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  filterTextActive: { color: Colors.white },
  prCard: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    marginBottom: 10,
  },
  prCardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  prCardInfo: { flex: 1, gap: 2 },
  prName: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  prCategory: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  prValueContainer: { alignItems: "flex-end" as const, gap: 2 },
  prValue: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  prPrevious: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  prCardFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  prDate: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
  },
  improvementBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
  },
  improvementText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.green,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: "row" as const,
    gap: 14,
    marginBottom: 0,
  },
  timelineDotContainer: {
    alignItems: "center" as const,
    width: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  timelineLine: {
    width: 0.5,
    flex: 1,
    backgroundColor: Colors.border,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
    gap: 2,
  },
  timelineDate: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  timelineName: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  timelineValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
  },
});
