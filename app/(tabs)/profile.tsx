import React, { useEffect, useState } from "react";
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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";

function haptic(
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) {
  if (Platform.OS !== "web") {
    Haptics.impactAsync(style);
  }
}

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  accent?: string;
}

function SettingsRow({ icon, label, value, onPress, accent }: SettingsRowProps) {
  return (
    <SpringPress
      scaleDown={0.98}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      onPress={onPress}
    >
      <View style={styles.settingsRow}>
        <View style={styles.settingsLeft}>
          <Ionicons
            name={icon as any}
            size={18}
            color={accent || Colors.muted}
          />
          <Text style={styles.settingsLabel}>{label}</Text>
        </View>
        <View style={styles.settingsRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          <Ionicons
            name="chevron-forward"
            size={14}
            color="rgba(255,255,255,0.2)"
          />
        </View>
      </View>
    </SpringPress>
  );
}

interface QuickStatProps {
  value: string;
  label: string;
  icon: string;
  color: string;
}

function QuickStat({ value, label, icon, color }: QuickStatProps) {
  return (
    <SpringPress
      scaleDown={0.93}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      style={{ width: "48%" as any, flexGrow: 1, flexShrink: 0, flexBasis: "45%" as any }}
    >
      <View style={[styles.quickStatItem, { borderLeftColor: color, borderLeftWidth: 2 }]}>
        <View style={[styles.quickStatIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={15} color={color} />
        </View>
        <Text style={styles.quickStatValue}>{value}</Text>
        <Text style={styles.quickStatLabel}>{label}</Text>
      </View>
    </SpringPress>
  );
}

function SpringPress({ 
  children, onPress, onLongPress, hapticStyle, style, scaleDown = 0.96 
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
  style?: any;
  scaleDown?: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
        if (Platform.OS !== 'web') Haptics.impactAsync(hapticStyle || Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      onLongPress={() => {
        if (onLongPress) {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onLongPress();
        }
      }}
      delayLongPress={400}
      style={style}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function PulseDot({ color, active }: { color: string; active: boolean }) {
  const opacity = useSharedValue(active ? 1 : 0.3);

  useEffect(() => {
    if (active) {
      opacity.value = withRepeat(
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 5,
          height: 5,
          borderRadius: 2.5,
          backgroundColor: color,
          position: "absolute" as const,
          top: 10,
          right: 10,
        },
        animStyle,
      ]}
    />
  );
}

interface StatCardProps {
  value: string;
  label: string;
  active: boolean;
  color: string;
  detail?: string;
  expanded?: boolean;
  onLongPress?: () => void;
}

function StatCard({ value, label, active, color, detail, expanded, onLongPress }: StatCardProps) {
  return (
    <SpringPress
      scaleDown={0.94}
      hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
      onLongPress={onLongPress}
      style={{ flex: 1 }}
    >
      <View style={styles.statCard}>
        <PulseDot color={color} active={active} />
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardLabel}>{label}</Text>
        {expanded && detail && (
          <Text style={[styles.statCardDetail, { color }]}>{detail}</Text>
        )}
      </View>
    </SpringPress>
  );
}

interface AchievementBadgeProps {
  icon: string;
  label: string;
  progress: number;
  color: string;
}

function AchievementBadge({ icon, label, progress, color }: AchievementBadgeProps) {
  const isComplete = progress >= 100;
  return (
    <SpringPress
      scaleDown={0.90}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      onPress={() => router.push("/achievements")}
    >
      <View style={styles.achievementBadge}>
        <View
          style={[
            styles.achievementCircle,
            {
              borderColor: isComplete ? color : `${color}40`,
              backgroundColor: isComplete ? `${color}15` : `${color}08`,
            },
          ]}
        >
          <Ionicons name={icon as any} size={18} color={isComplete ? color : `${color}80`} />
        </View>
        <Text style={styles.achievementLabel}>{label}</Text>
        <Text style={[styles.achievementProgress, { color: isComplete ? color : Colors.muted }]}>
          {progress}%
        </Text>
      </View>
    </SpringPress>
  );
}

function ConnectedAppIcon({ color, icon, route }: { color: string; icon: string; route?: string }) {
  return (
    <SpringPress
      scaleDown={0.85}
      hapticStyle={Haptics.ImpactFeedbackStyle.Light}
      onPress={() => router.push((route || "/connected-apps") as any)}
    >
      <View style={[styles.connectedAppCircle, { backgroundColor: `${color}20`, borderColor: `${color}30` }]}>
        <Ionicons name={icon as any} size={14} color={color} />
      </View>
    </SpringPress>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { goals, profile, workouts, metrics } = useHealth();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [expandedStat, setExpandedStat] = useState<string | null>(null);

  const toggleStat = (key: string) => {
    setExpandedStat(prev => prev === key ? null : key);
  };

  const streak = Math.min(workouts.length, 42);
  const totalHours = Math.round(
    workouts.reduce((s, w) => s + w.duration, 0) / 60
  );
  const hoursDisplay =
    totalHours >= 1000
      ? `${(totalHours / 1000).toFixed(1)}k`
      : totalHours.toString();
  const avgCalories = Math.round(
    workouts.reduce((s, w) => s + (w.calories || 0), 0) /
      Math.max(workouts.length, 1)
  );
  const thisWeekWorkouts = workouts.filter((w) => {
    const d = new Date(w.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  const healthScore = Math.round(
    metrics.reduce((sum, m) => {
      const ratio = Math.min(m.value / m.goal, 1);
      return sum + ratio * 25;
    }, 0)
  );

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset,
            paddingBottom: 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => haptic(Haptics.ImpactFeedbackStyle.Light)}
        onMomentumScrollEnd={() => haptic(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <LinearGradient
            colors={[Colors.charcoal, Colors.deepBlack]}
            style={styles.headerGradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <View style={styles.headerRow}>
              <Text style={styles.screenTitle}>Profile</Text>
              <SpringPress
                scaleDown={0.88}
                hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                onPress={() => router.push("/settings")}
              >
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={Colors.muted}
                />
              </SpringPress>
            </View>

            <View style={styles.profileSection}>
              <View style={styles.avatarRow}>
                <SpringPress
                  scaleDown={0.95}
                  hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
                  onPress={() => router.push("/settings")}
                >
                  <View style={styles.avatarOuter}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                  </View>
                </SpringPress>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{profile.name}</Text>
                  <Text style={styles.memberSince}>
                    Member since {profile.memberSince}
                  </Text>
                  <View style={styles.tierBadge}>
                    <View style={styles.tierDot} />
                    <Text style={styles.tierText}>ELITE</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.statsGrid}>
            <StatCard value={`${workouts.length}`} label="WORKOUTS" active={workouts.length > 0} color={Colors.teal} detail="12 this month, avg 4.2/week" expanded={expandedStat === 'workouts'} onLongPress={() => toggleStat('workouts')} />
            <StatCard value={`${streak}`} label="STREAK" active={streak > 0} color={Colors.gold} detail="Best: 58 days" expanded={expandedStat === 'streak'} onLongPress={() => toggleStat('streak')} />
            <StatCard value={hoursDisplay} label="HOURS" active={totalHours > 0} color={Colors.green} detail="This month: 24h" expanded={expandedStat === 'hours'} onLongPress={() => toggleStat('hours')} />
            <StatCard value={`${healthScore}`} label="SCORE" active={healthScore > 50} color={Colors.gold} detail="Top 15% of users" expanded={expandedStat === 'score'} onLongPress={() => toggleStat('score')} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>THIS WEEK</Text>
          <View style={styles.quickStatsGrid}>
            <QuickStat
              value={`${thisWeekWorkouts}`}
              label="SESSIONS"
              icon="flame-outline"
              color={Colors.gold}
            />
            <QuickStat
              value={`${avgCalories}`}
              label="AVG KCAL"
              icon="flash-outline"
              color={Colors.teal}
            />
            <QuickStat
              value={`${metrics.find((m) => m.id === "active")?.value || 0}`}
              label="ACTIVE MIN"
              icon="timer-outline"
              color={Colors.green}
            />
            <QuickStat
              value={`${metrics.find((m) => m.id === "heart")?.value || 0}`}
              label="AVG BPM"
              icon="heart-outline"
              color={Colors.red}
            />
          </View>
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>RECENT ACHIEVEMENTS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            <AchievementBadge icon="sunny" label="Early Bird" progress={78} color={Colors.gold} />
            <AchievementBadge icon="barbell" label="Iron Will" progress={100} color={Colors.teal} />
            <AchievementBadge icon="walk" label="Mile Master" progress={65} color={Colors.green} />
            <AchievementBadge icon="leaf" label="Zen Mode" progress={45} color="#8B9DC3" />
          </ScrollView>
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>TRAINING</Text>
          <SettingsRow
            icon="clipboard-outline"
            label="Workout Plans"
            onPress={() => router.push("/workout-plans")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="calendar-outline"
            label="Training Calendar"
            onPress={() => router.push("/training-calendar")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="barbell-outline"
            label="Exercise Library"
            onPress={() => router.push("/exercise-library")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="medal-outline"
            label="Personal Records"
            onPress={() => router.push("/personal-records")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="walk-outline"
            label="Run Tracker"
            onPress={() => router.push("/run-tracker")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="heart-outline"
            label="Heart Rate Zones"
            onPress={() => router.push("/heart-rate-zones")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="diamond-outline"
            label="Equinox Classes"
            onPress={() => router.push("/equinox-classes")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>WELLNESS</Text>
          <SettingsRow
            icon="moon-outline"
            label="Sleep Analysis"
            onPress={() => router.push("/sleep-analysis")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="leaf-outline"
            label="Recovery"
            onPress={() => router.push("/recovery")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="nutrition-outline"
            label="Nutrition Tracker"
            onPress={() => router.push("/nutrition-tracker")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="timer-outline"
            label="Fasting Timer"
            onPress={() => router.push("/fasting-timer")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="medical-outline"
            label="Supplements"
            onPress={() => router.push("/supplement-tracker")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="flower-outline"
            label="Mindfulness"
            onPress={() => router.push("/meditation")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>BODY</Text>
          <SettingsRow
            icon="body-outline"
            label="Body Trends"
            onPress={() => router.push("/body-trends")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="fitness-outline"
            label="Muscle Map"
            onPress={() => router.push("/body-heatmap")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="camera-outline"
            label="Progress Photos"
            onPress={() => router.push("/progress-gallery")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(350)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>INSIGHTS</Text>
          <SettingsRow
            icon="stats-chart-outline"
            label="Weekly Report"
            onPress={() => router.push("/weekly-report")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="analytics-outline"
            label="Analytics"
            onPress={() => router.push("/stats")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="trophy-outline"
            label="Achievements"
            onPress={() => router.push("/achievements")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="flag-outline"
            label="Challenges"
            onPress={() => router.push("/challenges")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="checkmark-circle-outline"
            label="Habit Tracker"
            onPress={() => router.push("/habit-tracker")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>SOCIAL</Text>
          <SettingsRow
            icon="people-outline"
            label="Community"
            onPress={() => router.push("/social-feed")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="musical-notes-outline"
            label="Workout Music"
            onPress={() => router.push("/workout-music")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(450)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>CONNECTED APPS</Text>
          <View style={styles.connectedAppsRow}>
            <ConnectedAppIcon color="#FF2D55" icon="heart" route="/apple-health" />
            <ConnectedAppIcon color="#FC4C02" icon="bicycle" route="/strava" />
            <ConnectedAppIcon color="#D4AF37" icon="ellipse-outline" route="/oura-ring" />
            <ConnectedAppIcon color="#007DC5" icon="watch" route="/garmin" />
          </View>
          <SettingsRow
            icon="apps-outline"
            label="Connected Apps"
            value="10 Active"
            onPress={() => router.push("/connected-apps")}
          />
          <View style={styles.sectionDivider} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <View style={styles.sectionAccent} />
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <SettingsRow
            icon="flag-outline"
            label="Goals"
            value={`${goals.steps.toLocaleString()} steps`}
            onPress={() => router.push("/edit-goals")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push("/settings")}
          />
          <View style={styles.rowDivider} />
          <SettingsRow icon="moon-outline" label="Appearance" value="Dark" />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="notifications-outline"
            label="Notifications"
            value="On"
          />
          <View style={styles.rowDivider} />
          <SettingsRow
            icon="globe-outline"
            label="Units"
            value={profile.units === "imperial" ? "Imperial" : "Metric"}
          />

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>MADDEN v2.0</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
  },
  headerGradient: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 32,
  },
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
  },
  profileSection: {
    marginBottom: 0,
  },
  avatarRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 18,
  },
  avatarOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: Colors.gold,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 3,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.charcoal,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  avatarInitials: {
    fontSize: 24,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 1,
  },
  profileInfo: {
    gap: 5,
    flex: 1,
  },
  userName: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  memberSince: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
  },
  tierBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start" as const,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  tierDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gold,
  },
  tierText: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.gold,
    letterSpacing: 3,
  },
  statsGrid: {
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center" as const,
    gap: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.04)",
    position: "relative" as const,
  },
  statCardValue: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statCardLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statCardDetail: {
    fontSize: 7,
    fontFamily: "Outfit_300Light",
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: "center" as const,
    opacity: 0.85,
  },
  sectionAccent: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 14,
    textTransform: "uppercase" as const,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  quickStatsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  quickStatItem: {
    backgroundColor: Colors.charcoal,
    borderRadius: 10,
    padding: 14,
    alignItems: "center" as const,
    gap: 6,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.04)",
    borderLeftWidth: 2,
  },
  quickStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  quickStatValue: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  quickStatLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1.5,
  },
  achievementsScroll: {
    gap: 14,
    paddingRight: 4,
  },
  achievementBadge: {
    alignItems: "center" as const,
    gap: 8,
    width: 80,
  },
  achievementCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  achievementLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 0.3,
    textAlign: "center" as const,
  },
  achievementProgress: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    letterSpacing: 0.5,
  },
  connectedAppsRow: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 12,
    paddingLeft: 2,
  },
  connectedAppCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 0.5,
  },
  settingsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 16,
  },
  settingsLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 14,
  },
  settingsLabel: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 0.2,
  },
  settingsRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  settingsValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  versionRow: {
    alignItems: "center" as const,
    marginTop: 48,
  },
  versionText: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.border,
    letterSpacing: 6,
  },
});
