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
  generateAchievements,
  type Achievement,
} from "@/lib/health-data";

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const pct = Math.min(achievement.progress / achievement.target, 1);
  const categoryColors: Record<string, string> = {
    streak: "#FC4C02",
    distance: Colors.teal,
    strength: "#6C63FF",
    consistency: Colors.green,
    milestone: Colors.white,
  };
  const accentColor = categoryColors[achievement.category] || Colors.white;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.achievementCard, !achievement.unlocked && styles.achievementLocked]}>
        <View style={styles.achievementHeader}>
          <View style={[styles.iconCircle, achievement.unlocked ? { borderColor: accentColor } : {}]}>
            <Ionicons
              name={achievement.icon as any}
              size={18}
              color={achievement.unlocked ? accentColor : Colors.border}
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[styles.achievementTitle, !achievement.unlocked && { color: Colors.muted }]}>
              {achievement.title}
            </Text>
            <Text style={styles.achievementDesc}>{achievement.description}</Text>
          </View>
          {achievement.unlocked && (
            <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
          )}
        </View>

        {!achievement.unlocked && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${pct * 100}%`, backgroundColor: accentColor }]} />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()} {achievement.unit}
            </Text>
          </View>
        )}

        {achievement.unlocked && achievement.unlockedDate && (
          <Text style={styles.unlockedDate}>
            Unlocked {new Date(achievement.unlockedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setAchievements(generateAchievements());
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;
  const filtered =
    filter === "all" ? achievements
    : filter === "unlocked" ? achievements.filter((a) => a.unlocked)
    : achievements.filter((a) => !a.unlocked);

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
            <Text style={styles.headerTitle}>ACHIEVEMENTS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.heroSection}>
            <Text style={styles.heroValue}>{unlocked}</Text>
            <Text style={styles.heroLabel}>UNLOCKED</Text>
            <View style={styles.heroProgressBg}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${(unlocked / achievements.length) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.heroSubtext}>
              {unlocked} of {achievements.length} achievements earned
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.filterRow}>
            {(["all", "unlocked", "locked"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFilter(f);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          {filtered.map((a, i) => (
            <AchievementCard key={a.id} achievement={a} index={i} />
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
  heroSection: { alignItems: "center" as const, gap: 8 },
  heroValue: { fontSize: 56, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -3 },
  heroLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  heroProgressBg: { width: "100%" as any, height: 3, backgroundColor: "rgba(255,255,255,0.06)", marginTop: 12 },
  heroProgressFill: { height: 3, backgroundColor: Colors.white },
  heroSubtext: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted, marginTop: 4, letterSpacing: 0.3 },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 28 },
  filterRow: { flexDirection: "row" as const, gap: 2, marginBottom: 20 },
  filterButton: { flex: 1, paddingVertical: 10, alignItems: "center" as const },
  filterButtonActive: { borderBottomWidth: 1, borderBottomColor: Colors.white },
  filterText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  filterTextActive: { color: Colors.white },
  achievementCard: { borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 18, marginBottom: 10 },
  achievementLocked: { opacity: 0.7 },
  achievementHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 0.5, borderColor: Colors.border, alignItems: "center" as const, justifyContent: "center" as const },
  achievementInfo: { flex: 1, gap: 3 },
  achievementTitle: { fontSize: 16, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  achievementDesc: { fontSize: 12, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.2 },
  progressSection: { marginTop: 14, gap: 6 },
  progressBarBg: { height: 3, backgroundColor: "rgba(255,255,255,0.06)" },
  progressBarFill: { height: 3 },
  progressText: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5, textAlign: "right" as const },
  unlockedDate: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.green, letterSpacing: 0.5, marginTop: 10 },
});
