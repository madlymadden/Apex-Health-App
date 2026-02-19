import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

type FilterType = "ALL" | "WORKOUTS" | "RECORDS" | "STREAKS";

type ActivityType = "workout" | "pr" | "challenge" | "streak" | "run";

interface FeedPost {
  id: string;
  name: string;
  timestamp: string;
  activityType: ActivityType;
  body: string;
  duration?: string;
  calories?: number;
  distance?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const FILTERS: FilterType[] = ["ALL", "WORKOUTS", "RECORDS", "STREAKS"];

const FILTER_MAP: Record<FilterType, ActivityType[]> = {
  ALL: ["workout", "pr", "challenge", "streak", "run"],
  WORKOUTS: ["workout", "run"],
  RECORDS: ["pr"],
  STREAKS: ["streak", "challenge"],
};

const INITIAL_POSTS: FeedPost[] = [
  {
    id: "1",
    name: "Sarah K.",
    timestamp: "2h ago",
    activityType: "workout",
    body: "Sarah crushed a 45min HIIT session — 620 cal burned",
    duration: "45 min",
    calories: 620,
    likes: 24,
    comments: 3,
    liked: false,
  },
  {
    id: "2",
    name: "Marcus T.",
    timestamp: "3h ago",
    activityType: "pr",
    body: "Marcus hit a new deadlift PR — 405 lbs. Absolute beast mode",
    calories: 280,
    duration: "62 min",
    likes: 47,
    comments: 12,
    liked: false,
  },
  {
    id: "3",
    name: "Elena R.",
    timestamp: "4h ago",
    activityType: "run",
    body: "Elena shared a morning run through the park — perfect pace",
    duration: "32 min",
    calories: 340,
    distance: "5.2 km",
    likes: 18,
    comments: 5,
    liked: false,
  },
  {
    id: "4",
    name: "James W.",
    timestamp: "5h ago",
    activityType: "streak",
    body: "James logged a 30-day workout streak. Consistency wins",
    likes: 56,
    comments: 8,
    liked: false,
  },
  {
    id: "5",
    name: "Ava L.",
    timestamp: "6h ago",
    activityType: "challenge",
    body: "Ava finished the 21-Day Core Challenge — all sessions complete",
    duration: "21 days",
    likes: 33,
    comments: 7,
    liked: false,
  },
  {
    id: "6",
    name: "Derek M.",
    timestamp: "7h ago",
    activityType: "workout",
    body: "Derek completed a 60min strength session — upper body focus",
    duration: "60 min",
    calories: 480,
    likes: 15,
    comments: 2,
    liked: false,
  },
  {
    id: "7",
    name: "Nina P.",
    timestamp: "8h ago",
    activityType: "pr",
    body: "Nina set a new 5K personal record — 22:14. Unstoppable",
    duration: "22 min",
    distance: "5.0 km",
    calories: 310,
    likes: 41,
    comments: 9,
    liked: false,
  },
  {
    id: "8",
    name: "Chris B.",
    timestamp: "10h ago",
    activityType: "run",
    body: "Chris shared an evening 10K — city lights and clear skies",
    duration: "48 min",
    calories: 620,
    distance: "10.0 km",
    likes: 29,
    comments: 4,
    liked: false,
  },
  {
    id: "9",
    name: "Mia H.",
    timestamp: "12h ago",
    activityType: "streak",
    body: "Mia hit a 60-day activity streak. Relentless discipline",
    likes: 72,
    comments: 15,
    liked: false,
  },
  {
    id: "10",
    name: "Lucas D.",
    timestamp: "1d ago",
    activityType: "workout",
    body: "Lucas wrapped up a 50min cycling session — 580 cal torched",
    duration: "50 min",
    calories: 580,
    likes: 21,
    comments: 6,
    liked: false,
  },
];

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  workout: "COMPLETED WORKOUT",
  pr: "HIT PERSONAL RECORD",
  challenge: "FINISHED CHALLENGE",
  streak: "STREAK MILESTONE",
  run: "SHARED RUN",
};

const ACTIVITY_ICONS: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  workout: "barbell-outline",
  pr: "trophy-outline",
  challenge: "flag-outline",
  streak: "flame-outline",
  run: "footsteps-outline",
};

export default function SocialFeedScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);

  const filteredPosts = posts.filter((p) =>
    FILTER_MAP[activeFilter].includes(p.activityType)
  );

  const handleFilterChange = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(filter);
  };

  const handleLike = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[
        styles.container,
        {
          paddingTop:
            insets.top + (Platform.OS === "web" ? 67 : 0) + 20,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.title}>Community</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.connectionsLabel}>12 CONNECTIONS</Text>

        <View style={styles.yourActivity}>
          <Text style={styles.sectionLabel}>YOUR ACTIVITY</Text>
          <View style={styles.yourActivityCard}>
            <View style={styles.yourActivityRow}>
              <Ionicons name="flame-outline" size={18} color={Colors.gold} />
              <Text style={styles.yourActivityText}>
                You completed a 38min Strength session today — 410 cal
              </Text>
            </View>
            <Text style={styles.yourActivityTimestamp}>Just now</Text>
          </View>
        </View>

        <View style={styles.filtersRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => handleFilterChange(f)}
              style={[
                styles.filterPill,
                activeFilter === f && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredPosts.map((post, index) => (
          <Animated.View
            key={post.id}
            entering={FadeInDown.delay(Math.min(index, 8) * 60).duration(400)}
          >
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={Colors.muted} />
                </View>
                <View style={styles.postHeaderText}>
                  <Text style={styles.postName}>{post.name}</Text>
                  <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                </View>
                <View style={styles.activityBadge}>
                  <Ionicons
                    name={ACTIVITY_ICONS[post.activityType]}
                    size={12}
                    color={Colors.gold}
                  />
                  <Text style={styles.activityBadgeText}>
                    {ACTIVITY_LABELS[post.activityType]}
                  </Text>
                </View>
              </View>

              <Text style={styles.postBody}>{post.body}</Text>

              {(post.duration || post.calories || post.distance) && (
                <View style={styles.statsRow}>
                  {post.duration && (
                    <View style={styles.statItem}>
                      <Ionicons
                        name="time-outline"
                        size={13}
                        color={Colors.muted}
                      />
                      <Text style={styles.statText}>{post.duration}</Text>
                    </View>
                  )}
                  {post.calories && (
                    <View style={styles.statItem}>
                      <Ionicons
                        name="flame-outline"
                        size={13}
                        color={Colors.muted}
                      />
                      <Text style={styles.statText}>{post.calories} cal</Text>
                    </View>
                  )}
                  {post.distance && (
                    <View style={styles.statItem}>
                      <Ionicons
                        name="navigate-outline"
                        size={13}
                        color={Colors.muted}
                      />
                      <Text style={styles.statText}>{post.distance}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => handleLike(post.id)}
                  style={styles.actionButton}
                  hitSlop={8}
                >
                  <Ionicons
                    name={post.liked ? "heart" : "heart-outline"}
                    size={18}
                    color={post.liked ? Colors.gold : Colors.muted}
                  />
                  <Text
                    style={[
                      styles.actionCount,
                      post.liked && { color: Colors.gold },
                    ]}
                  >
                    {post.likes}
                  </Text>
                </Pressable>
                <View style={styles.actionButton}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={16}
                    color={Colors.muted}
                  />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </Animated.View>
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  connectionsLabel: {
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 24,
    textTransform: "uppercase",
  },
  yourActivity: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  yourActivityCard: {
    backgroundColor: Colors.charcoal,
    padding: 16,
  },
  yourActivityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  yourActivityText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    flex: 1,
  },
  yourActivityTimestamp: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 8,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.charcoal,
  },
  filterPillActive: {
    backgroundColor: Colors.white,
  },
  filterText: {
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    textTransform: "uppercase",
  },
  filterTextActive: {
    color: Colors.deepBlack,
  },
  postContainer: {
    paddingVertical: 20,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
  },
  postHeaderText: {
    marginLeft: 10,
    flex: 1,
  },
  postName: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  postTimestamp: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 1,
  },
  activityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activityBadgeText: {
    fontSize: 8,
    letterSpacing: 2,
    color: Colors.gold,
    fontFamily: "Outfit_400Regular",
    textTransform: "uppercase",
  },
  postBody: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    lineHeight: 22,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
  },
});
