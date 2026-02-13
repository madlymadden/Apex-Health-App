import React from "react";
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
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
}

function SettingsRow({ icon, label, value }: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && { opacity: 0.5 },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
    >
      <View style={styles.settingsLeft}>
        <Ionicons name={icon as any} size={18} color={Colors.muted} />
        <Text style={styles.settingsLabel}>{label}</Text>
      </View>
      <View style={styles.settingsRight}>
        {value && <Text style={styles.settingsValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={14} color={Colors.border} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 20,
            paddingBottom: 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <Text style={styles.screenTitle}>Profile</Text>

          <View style={styles.profileSection}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={28} color={Colors.muted} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Alex Morgan</Text>
                <Text style={styles.memberSince}>Member since 2023</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>247</Text>
                <Text style={styles.statLabel}>WORKOUTS</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>38</Text>
                <Text style={styles.statLabel}>STREAK</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>1.2k</Text>
                <Text style={styles.statLabel}>HOURS</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>GOALS</Text>
          <SettingsRow icon="walk-outline" label="Daily Steps" value="10,000" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="flame-outline" label="Calorie Target" value="650 kcal" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="timer-outline" label="Active Minutes" value="45 min" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="fitness-outline" label="Weekly Workouts" value="5x" />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionLabel}>CONNECTED</Text>
          <SettingsRow icon="heart-circle-outline" label="Apple Health" value="Active" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="watch-outline" label="Apple Watch" value="Series 9" />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <SettingsRow icon="moon-outline" label="Appearance" value="Dark" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="notifications-outline" label="Notifications" value="On" />
          <View style={styles.rowDivider} />
          <SettingsRow icon="globe-outline" label="Units" value="Imperial" />

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>VITALITY V1.0</Text>
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
  screenTitle: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 36,
  },
  profileSection: {
    marginBottom: 32,
  },
  avatarRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  profileInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  memberSince: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
    paddingTop: 24,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  statItem: {
    alignItems: "center" as const,
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  statDivider: {
    width: 0.5,
    height: 28,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
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
    marginTop: 40,
  },
  versionText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.border,
    letterSpacing: 3,
  },
});
