import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";
import {
  generateStravaActivities,
  formatDuration,
  getRelativeDate,
  type StravaActivity,
} from "@/lib/health-data";

const STRAVA_ORANGE = "#FC4C02";

function ActivityRow({ activity, index, onImport }: { activity: StravaActivity; index: number; onImport: (id: string) => void }) {
  const typeIcon: Record<string, string> = {
    Run: "walk",
    Ride: "bicycle",
    Swim: "water",
    Hike: "trail-sign",
    Walk: "footsteps",
    "Trail Run": "leaf",
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <View style={styles.activityRow}>
        <View style={styles.activityHeader}>
          <View style={styles.activityLeft}>
            <Ionicons name={(typeIcon[activity.type] || "fitness") as any} size={16} color={STRAVA_ORANGE} />
            <View style={styles.activityInfo}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityDate}>{getRelativeDate(activity.date)}</Text>
            </View>
          </View>
          {activity.imported ? (
            <View style={styles.importedBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.green} />
              <Text style={styles.importedText}>SYNCED</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onImport(activity.id);
              }}
              style={({ pressed }) => [styles.importButton, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="download-outline" size={12} color={Colors.white} />
              <Text style={styles.importText}>IMPORT</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.activityStats}>
          <View style={styles.activityStat}>
            <Text style={styles.statValue}>{activity.distance}</Text>
            <Text style={styles.statUnit}>{activity.type === "Swim" ? "km" : "mi"}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.activityStat}>
            <Text style={styles.statValue}>{formatDuration(activity.duration)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.activityStat}>
            <Text style={styles.statValue}>{activity.avgPace}</Text>
            <Text style={styles.statUnit}>/mi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.activityStat}>
            <Text style={styles.statValue}>{activity.avgHR}</Text>
            <Text style={styles.statUnit}>bpm</Text>
          </View>
        </View>

        {(activity.type === "Ride" || activity.type === "Hike" || activity.type === "Trail Run") && (
          <View style={styles.elevationRow}>
            <Ionicons name="trending-up" size={12} color={Colors.muted} />
            <Text style={styles.elevationText}>{activity.elevation} ft elevation</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default function StravaScreen() {
  const insets = useSafeAreaInsets();
  const { addWorkout } = useHealth();
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setActivities(generateStravaActivities());
  }, []);

  const handleImport = async (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    const workoutId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    await addWorkout({
      id: workoutId,
      type: activity.type === "Ride" ? "Cycling" : activity.type === "Run" ? "Running" : activity.type === "Swim" ? "Swimming" : activity.type,
      icon: activity.type === "Ride" ? "bicycle" : activity.type === "Swim" ? "water" : "walk",
      duration: activity.duration,
      calories: activity.calories,
      date: activity.date,
      intensity: activity.avgHR > 150 ? "high" : activity.avgHR > 130 ? "moderate" : "low",
      heartRateAvg: activity.avgHR,
    });

    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, imported: true } : a))
    );
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const unimported = activities.filter((a) => !a.imported);
    for (const activity of unimported.slice(0, 5)) {
      await handleImport(activity.id);
    }

    setTimeout(() => setSyncing(false), 500);
  };

  const imported = activities.filter((a) => a.imported).length;
  const totalDist = activities.reduce((s, a) => s + a.distance, 0);
  const totalTime = activities.reduce((s, a) => s + a.duration, 0);

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
            <Text style={[styles.headerTitle, { color: STRAVA_ORANGE }]}>STRAVA</Text>
            <Pressable
              onPress={handleSyncAll}
              style={[styles.syncAllButton, syncing && { opacity: 0.3 }]}
              disabled={syncing}
            >
              <Ionicons name="sync" size={18} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{activities.length}</Text>
              <Text style={styles.summaryLabel}>ACTIVITIES</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalDist.toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>TOTAL MI</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{imported}</Text>
              <Text style={styles.summaryLabel}>IMPORTED</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>RECENT ACTIVITIES</Text>
            <Pressable
              onPress={handleSyncAll}
              style={({ pressed }) => [
                styles.importAllButton,
                pressed && { opacity: 0.6 },
                syncing && { opacity: 0.3 },
              ]}
              disabled={syncing}
            >
              <Text style={styles.importAllText}>IMPORT ALL</Text>
            </Pressable>
          </View>

          {activities.map((activity, i) => (
            <React.Fragment key={activity.id}>
              <ActivityRow activity={activity} index={i} onImport={handleImport} />
              {i < activities.length - 1 && <View style={styles.rowDivider} />}
            </React.Fragment>
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
  headerTitle: { fontSize: 10, fontFamily: "Outfit_300Light", letterSpacing: 3 },
  syncAllButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  summaryRow: { flexDirection: "row" as const, justifyContent: "space-around" as const, alignItems: "center" as const, marginBottom: 8 },
  summaryItem: { flex: 1, alignItems: "center" as const, gap: 6 },
  summaryValue: { fontSize: 28, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  summaryDivider: { width: 0.5, height: 32, backgroundColor: Colors.border },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  sectionHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 16 },
  sectionLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 3 },
  importAllButton: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 0.5, borderColor: STRAVA_ORANGE },
  importAllText: { fontSize: 9, fontFamily: "Outfit_300Light", color: STRAVA_ORANGE, letterSpacing: 2 },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  activityRow: { paddingVertical: 18 },
  activityHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 14 },
  activityLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 },
  activityInfo: { gap: 2, flex: 1 },
  activityName: { fontSize: 16, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  activityDate: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  importedBadge: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
  importedText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.green, letterSpacing: 1.5 },
  importButton: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 0.5, borderColor: Colors.white },
  importText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: 1.5 },
  activityStats: { flexDirection: "row" as const, gap: 16, alignItems: "center" as const, paddingLeft: 26 },
  activityStat: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 2 },
  statValue: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.lightText },
  statUnit: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.5 },
  statDivider: { width: 0.5, height: 12, backgroundColor: "rgba(255,255,255,0.1)" },
  elevationRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 5, paddingLeft: 26, marginTop: 8 },
  elevationText: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.3 },
});
