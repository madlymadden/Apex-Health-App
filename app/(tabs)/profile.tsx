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
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

interface SettingsItemProps {
  icon: string;
  label: string;
  value?: string;
  index: number;
  showChevron?: boolean;
}

function SettingsItem({
  icon,
  label,
  value,
  index,
  showChevron = true,
}: SettingsItemProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <Pressable
        style={({ pressed }) => [
          styles.settingsItem,
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <View style={styles.settingsLeft}>
          <View style={styles.settingsIconBg}>
            <Ionicons name={icon as any} size={18} color={Colors.gold} />
          </View>
          <Text style={styles.settingsLabel}>{label}</Text>
        </View>
        <View style={styles.settingsRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          {showChevron && (
            <Ionicons name="chevron-forward" size={16} color={Colors.lightGray} />
          )}
        </View>
      </Pressable>
    </Animated.View>
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
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Profile</Text>

        <View style={styles.profileCard}>
          <LinearGradient
            colors={["rgba(201,169,110,0.15)", "rgba(201,169,110,0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={Colors.gold} />
            </View>
          </View>
          <Text style={styles.userName}>Alex Morgan</Text>
          <Text style={styles.userMembership}>Equinox Member Since 2023</Text>

          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>247</Text>
              <Text style={styles.profileStatLabel}>Workouts</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>38</Text>
              <Text style={styles.profileStatLabel}>Streak</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>1.2k</Text>
              <Text style={styles.profileStatLabel}>Hours</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Goals</Text>
        <SettingsItem
          icon="walk"
          label="Daily Steps"
          value="10,000"
          index={0}
        />
        <SettingsItem
          icon="flame"
          label="Calorie Target"
          value="650 kcal"
          index={1}
        />
        <SettingsItem
          icon="timer"
          label="Active Minutes"
          value="45 min"
          index={2}
        />
        <SettingsItem
          icon="fitness"
          label="Weekly Workouts"
          value="5x"
          index={3}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Health Connect
        </Text>
        <SettingsItem
          icon="heart-circle"
          label="Apple Health"
          value="Connected"
          index={4}
        />
        <SettingsItem
          icon="watch"
          label="Apple Watch"
          value="Series 9"
          index={5}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Preferences
        </Text>
        <SettingsItem icon="moon" label="Appearance" value="Dark" index={6} />
        <SettingsItem
          icon="notifications"
          label="Notifications"
          value="On"
          index={7}
        />
        <SettingsItem
          icon="globe"
          label="Units"
          value="Imperial"
          index={8}
        />

        <View style={styles.versionRow}>
          <Text style={styles.versionText}>Vitality v1.0.0</Text>
        </View>
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
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 32,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 20,
    padding: 24,
    alignItems: "center" as const,
    marginBottom: 28,
    overflow: "hidden" as const,
    borderWidth: 1,
    borderColor: "rgba(201,169,110,0.15)",
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(201,169,110,0.15)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  userName: {
    fontSize: 22,
    fontFamily: "Outfit_700Bold",
    color: Colors.white,
  },
  userMembership: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.goldDim,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  profileStats: {
    flexDirection: "row" as const,
    marginTop: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    width: "100%" as const,
    justifyContent: "space-around" as const,
  },
  profileStat: {
    alignItems: "center" as const,
  },
  profileStatValue: {
    fontSize: 20,
    fontFamily: "Outfit_700Bold",
    color: Colors.gold,
  },
  profileStatLabel: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Outfit_600SemiBold",
    color: Colors.gold,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 12,
  },
  settingsItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: Colors.charcoal,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  settingsLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  settingsIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(201,169,110,0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  settingsLabel: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
    color: Colors.white,
  },
  settingsRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  settingsValue: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
  },
  versionRow: {
    alignItems: "center" as const,
    marginTop: 28,
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightGray,
    letterSpacing: 0.3,
  },
});
