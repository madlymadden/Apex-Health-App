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

type FilterTab = "ACTIVE" | "COMPLETED" | "AVAILABLE";

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unit: string;
  daysLeft: number;
  participants: number;
  type: "daily" | "monthly" | "community";
  accentColor: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  progress: number;
  isUser: boolean;
  color: string;
}

interface CompletedChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  completedDate: string;
  participants: number;
}

interface AvailableChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  participants: number;
  startsIn: string;
  accentColor: string;
}

const activeChallenges: Challenge[] = [
  {
    id: "1",
    title: "10K Steps Daily",
    description: "Hit 10,000 steps every day for a week",
    icon: "footsteps-outline",
    progress: 5,
    target: 7,
    unit: "days",
    daysLeft: 2,
    participants: 1247,
    type: "daily",
    accentColor: "#FC4C02",
  },
  {
    id: "2",
    title: "100 Pushups",
    description: "Complete 100 pushups daily for 30 days",
    icon: "fitness-outline",
    progress: 18,
    target: 30,
    unit: "days",
    daysLeft: 12,
    participants: 834,
    type: "monthly",
    accentColor: "#6C63FF",
  },
  {
    id: "3",
    title: "Run 50 Miles",
    description: "Log 50 miles this month with the community",
    icon: "walk-outline",
    progress: 32.4,
    target: 50,
    unit: "miles",
    daysLeft: 9,
    participants: 2103,
    type: "community",
    accentColor: Colors.teal,
  },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Sarah M.", progress: 47.2, isUser: false, color: "#FC4C02" },
  { rank: 2, name: "James K.", progress: 44.8, isUser: false, color: "#E5C76B" },
  { rank: 3, name: "Priya R.", progress: 41.1, isUser: false, color: "#6C63FF" },
  { rank: 4, name: "You", progress: 32.4, isUser: true, color: Colors.teal },
  { rank: 5, name: "Marcus T.", progress: 29.7, isUser: false, color: Colors.muted },
];

const completedChallenges: CompletedChallenge[] = [
  {
    id: "c1",
    title: "Plank Challenge",
    description: "5-minute plank hold achieved",
    icon: "timer-outline",
    completedDate: "Jan 28, 2026",
    participants: 612,
  },
  {
    id: "c2",
    title: "Morning Runs",
    description: "14 consecutive morning runs before 7am",
    icon: "sunny-outline",
    completedDate: "Jan 12, 2026",
    participants: 489,
  },
  {
    id: "c3",
    title: "Hydration Week",
    description: "Logged 8 glasses of water daily for 7 days",
    icon: "water-outline",
    completedDate: "Dec 30, 2025",
    participants: 1534,
  },
];

const availableChallenges: AvailableChallenge[] = [
  {
    id: "a1",
    title: "Marathon Prep",
    description: "Build up to 26.2 miles over 8 weeks",
    icon: "medal-outline",
    duration: "8 weeks",
    participants: 376,
    startsIn: "3 days",
    accentColor: "#FC4C02",
  },
  {
    id: "a2",
    title: "Cold Plunge Feb",
    description: "Take a cold shower or plunge every day",
    icon: "snow-outline",
    duration: "28 days",
    participants: 218,
    startsIn: "5 days",
    accentColor: Colors.teal,
  },
  {
    id: "a3",
    title: "200 Squats",
    description: "Work up to 200 bodyweight squats in one set",
    icon: "trending-up-outline",
    duration: "30 days",
    participants: 542,
    startsIn: "1 week",
    accentColor: "#6C63FF",
  },
  {
    id: "a4",
    title: "Stretch & Flow",
    description: "15 min daily mobility and yoga flow",
    icon: "body-outline",
    duration: "21 days",
    participants: 891,
    startsIn: "2 days",
    accentColor: Colors.green,
  },
];

function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const pct = Math.min(challenge.progress / challenge.target, 1);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(300)}>
      <View style={styles.challengeCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { borderColor: challenge.accentColor }]}>
            <Ionicons name={challenge.icon as any} size={18} color={challenge.accentColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{challenge.title}</Text>
            <Text style={styles.cardDesc}>{challenge.description}</Text>
          </View>
          <View style={styles.daysLeftBadge}>
            <Text style={styles.daysLeftValue}>{challenge.daysLeft}</Text>
            <Text style={styles.daysLeftLabel}>DAYS</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${pct * 100}%`, backgroundColor: challenge.accentColor },
              ]}
            />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {challenge.progress % 1 === 0
                ? challenge.progress
                : challenge.progress.toFixed(1)}{" "}
              / {challenge.target} {challenge.unit}
            </Text>
            <View style={styles.participantRow}>
              <Ionicons name="people-outline" size={11} color={Colors.muted} />
              <Text style={styles.participantText}>
                {challenge.participants.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 40).duration(250)}>
      <View style={[styles.leaderRow, entry.isUser && styles.leaderRowHighlight]}>
        <Text style={[styles.leaderRank, { color: entry.rank <= 3 ? entry.color : Colors.muted }]}>
          {entry.rank}
        </Text>
        <View style={[styles.avatarCircle, { borderColor: entry.color }]}>
          <Text style={[styles.avatarText, { color: entry.color }]}>
            {entry.name.charAt(0)}
          </Text>
        </View>
        <Text style={[styles.leaderName, entry.isUser && { color: Colors.white }]}>
          {entry.name}
        </Text>
        <Text style={[styles.leaderProgress, { color: entry.color }]}>
          {entry.progress.toFixed(1)} mi
        </Text>
      </View>
    </Animated.View>
  );
}

function CompletedCard({ challenge, index }: { challenge: CompletedChallenge; index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={styles.completedCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { borderColor: Colors.green }]}>
            <Ionicons name={challenge.icon as any} size={18} color={Colors.green} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{challenge.title}</Text>
            <Text style={styles.cardDesc}>{challenge.description}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
        </View>
        <View style={styles.completedFooter}>
          <Text style={styles.completedDate}>{challenge.completedDate}</Text>
          <View style={styles.participantRow}>
            <Ionicons name="people-outline" size={11} color={Colors.muted} />
            <Text style={styles.participantText}>
              {challenge.participants.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function AvailableCard({ challenge, index }: { challenge: AvailableChallenge; index: number }) {
  const handleJoin = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={styles.availableCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { borderColor: challenge.accentColor }]}>
            <Ionicons name={challenge.icon as any} size={18} color={challenge.accentColor} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{challenge.title}</Text>
            <Text style={styles.cardDesc}>{challenge.description}</Text>
          </View>
        </View>
        <View style={styles.availableMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={12} color={Colors.muted} />
            <Text style={styles.metaText}>{challenge.duration}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={12} color={Colors.muted} />
            <Text style={styles.metaText}>Starts in {challenge.startsIn}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={12} color={Colors.muted} />
            <Text style={styles.metaText}>{challenge.participants} joined</Text>
          </View>
        </View>
        <Pressable onPress={handleJoin} style={[styles.joinButton, { borderColor: challenge.accentColor }]}>
          <Text style={[styles.joinButtonText, { color: challenge.accentColor }]}>JOIN</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function ChallengesScreen() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterTab>("ACTIVE");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const filters: FilterTab[] = ["ACTIVE", "COMPLETED", "AVAILABLE"];

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
            <Text style={styles.headerTitle}>CHALLENGES</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.filterRow}>
            {filters.map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFilter(f);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          {filter === "ACTIVE" && (
            <>
              <Text style={styles.sectionLabel}>ACTIVE CHALLENGES</Text>
              {activeChallenges.map((c, i) => (
                <ChallengeCard key={c.id} challenge={c} index={i} />
              ))}

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>LEADERBOARD</Text>
              <Text style={styles.sectionSubLabel}>Run 50 Miles — Community Challenge</Text>
              {leaderboard.map((entry, i) => (
                <LeaderboardRow key={entry.rank} entry={entry} index={i} />
              ))}
            </>
          )}

          {filter === "COMPLETED" && (
            <>
              <Text style={styles.sectionLabel}>COMPLETED</Text>
              {completedChallenges.map((c, i) => (
                <CompletedCard key={c.id} challenge={c} index={i} />
              ))}
            </>
          )}

          {filter === "AVAILABLE" && (
            <>
              <View style={styles.joinHeaderRow}>
                <Text style={styles.sectionLabel}>AVAILABLE</Text>
                <Text style={styles.joinCount}>{availableChallenges.length} challenges</Text>
              </View>
              {availableChallenges.map((c, i) => (
                <AvailableCard key={c.id} challenge={c} index={i} />
              ))}
            </>
          )}
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
    marginBottom: 28,
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
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  sectionSubLabel: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
    marginTop: -8,
    marginBottom: 16,
  },
  challengeCard: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  daysLeftBadge: {
    alignItems: "center" as const,
    gap: 2,
  },
  daysLeftValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  daysLeftLabel: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  progressSection: { marginTop: 14, gap: 6 },
  progressBarBg: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  progressBarFill: { height: 3 },
  progressRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  progressText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  participantRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  participantText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  leaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    marginBottom: 2,
  },
  leaderRowHighlight: {
    backgroundColor: "rgba(90,200,212,0.06)",
    borderWidth: 0.5,
    borderColor: "rgba(90,200,212,0.15)",
  },
  leaderRank: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    width: 20,
    textAlign: "center" as const,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarText: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  leaderName: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.2,
  },
  leaderProgress: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    letterSpacing: -0.3,
  },
  completedCard: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
    marginBottom: 10,
  },
  completedFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 12,
  },
  completedDate: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.green,
    letterSpacing: 0.5,
  },
  availableCard: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 18,
    marginBottom: 10,
  },
  availableMeta: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginTop: 12,
  },
  metaRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  joinButton: {
    marginTop: 14,
    borderWidth: 0.5,
    paddingVertical: 10,
    alignItems: "center" as const,
  },
  joinButtonText: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 3,
  },
  joinHeaderRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  joinCount: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 0.3,
  },
});
