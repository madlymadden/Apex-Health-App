import React, { useState, useEffect, useCallback } from "react";
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
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { SPACING } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

function haptic(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  if (Platform.OS !== "web") Haptics.impactAsync(style);
}

interface Preferences {
  theme: string;
  units: string;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  weekStartDay: string;
  restDayReminders: boolean;
  workoutReminders: boolean;
  socialSharing: boolean;
  dataSharing: boolean;
}

const DEFAULT_PREFS: Preferences = {
  theme: "dark",
  units: "imperial",
  notificationsEnabled: true,
  hapticFeedback: true,
  weekStartDay: "monday",
  restDayReminders: true,
  workoutReminders: true,
  socialSharing: false,
  dataSharing: false,
};

interface AnimatedToggleProps {
  value: boolean;
  onToggle: () => void;
}

function AnimatedToggle({ value, onToggle }: AnimatedToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#2A2A2A", "#D4AF37"]
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(progress.value * 20, { damping: 15, stiffness: 200 }) }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["#666666", "#FFFFFF"]
    ),
  }));

  return (
    <Pressable
      onPress={() => {
        haptic();
        onToggle();
      }}
    >
      <Animated.View style={[styles.toggleTrack, trackStyle]}>
        <Animated.View style={[styles.toggleKnob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

interface SpringPressProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

function SpringPress({ children, onPress, disabled }: SpringPressProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
  right?: React.ReactNode;
  icon?: string;
  subtitle?: string;
}

function SettingsRow({
  label,
  value,
  onPress,
  danger,
  showChevron = true,
  right,
  icon,
  subtitle,
}: SettingsRowProps) {
  return (
    <SpringPress
      onPress={() => {
        haptic();
        onPress?.();
      }}
      disabled={!onPress && !right}
    >
      <View style={styles.settingsRow}>
        <View style={styles.rowLeft}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={18}
              color={danger ? Colors.red : Colors.muted}
              style={{ marginRight: 12 }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, danger && { color: Colors.red }]}>
              {label}
            </Text>
            {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.rowRight}>
          {right}
          {value && (
            <Text style={[styles.rowValue, danger && { color: Colors.red }]}>
              {value}
            </Text>
          )}
          {showChevron && !right && (
            <Ionicons name="chevron-forward" size={14} color={Colors.border} />
          )}
        </View>
      </View>
    </SpringPress>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function Divider() {
  return <View style={styles.rowDivider} />;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(baseUrl + "api/preferences");
      if (res.ok) {
        const data = await res.json();
        setPrefs({ ...DEFAULT_PREFS, ...data });
      }
    } catch {}
    setLoaded(true);
  };

  const savePreferences = useCallback(async (updated: Preferences) => {
    try {
      const baseUrl = getApiUrl();
      await fetch(baseUrl + "api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch {}
  }, []);

  const togglePref = useCallback(
    (key: keyof Preferences) => {
      setPrefs((prev) => {
        const updated = { ...prev, [key]: !prev[key] };
        savePreferences(updated);
        return updated;
      });
    },
    [savePreferences]
  );

  const setUnitsPref = useCallback(
    (units: string) => {
      setPrefs((prev) => {
        const updated = { ...prev, units };
        savePreferences(updated);
        return updated;
      });
    },
    [savePreferences]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(600)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                haptic();
                router.back();
              }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && { opacity: 0.5 },
              ]}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.offWhite} />
            </Pressable>
            <Text style={styles.headerTitle}>SETTINGS</Text>
            <View style={{ width: 22 }} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(80)}>
          <SectionHeader title="APPEARANCE" />
          <SectionCard>
            <SettingsRow
              icon="moon-outline"
              label="Theme"
              value="Dark"
              showChevron={false}
            />
            <Divider />
            <SpringPress
              onPress={() => {
                haptic();
                setUnitsPref(prefs.units === "imperial" ? "metric" : "imperial");
              }}
            >
              <View style={styles.settingsRow}>
                <View style={styles.rowLeft}>
                  <Ionicons name="resize-outline" size={18} color={Colors.muted} style={{ marginRight: 12 }} />
                  <Text style={styles.rowLabel}>Units</Text>
                </View>
                <View style={styles.rowRight}>
                  <AnimatedToggle
                    value={prefs.units === "metric"}
                    onToggle={() => setUnitsPref(prefs.units === "imperial" ? "metric" : "imperial")}
                  />
                  <Text style={styles.rowValue}>
                    {prefs.units === "imperial" ? "Imperial" : "Metric"}
                  </Text>
                </View>
              </View>
            </SpringPress>
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(140)}>
          <SectionHeader title="NOTIFICATIONS" />
          <SectionCard>
            <SettingsRow
              icon="notifications-outline"
              label="Push Notifications"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.notificationsEnabled}
                  onToggle={() => togglePref("notificationsEnabled")}
                />
              }
            />
            <Divider />
            <SettingsRow
              icon="barbell-outline"
              label="Workout Reminders"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.workoutReminders}
                  onToggle={() => togglePref("workoutReminders")}
                />
              }
            />
            <Divider />
            <SettingsRow
              icon="bed-outline"
              label="Rest Day Reminders"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.restDayReminders}
                  onToggle={() => togglePref("restDayReminders")}
                />
              }
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <SectionHeader title="PRIVACY" />
          <SectionCard>
            <SettingsRow
              icon="share-social-outline"
              label="Social Sharing"
              subtitle="Share workouts with friends"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.socialSharing}
                  onToggle={() => togglePref("socialSharing")}
                />
              }
            />
            <Divider />
            <SettingsRow
              icon="analytics-outline"
              label="Data Sharing"
              subtitle="Help improve the app"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.dataSharing}
                  onToggle={() => togglePref("dataSharing")}
                />
              }
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(260)}>
          <SectionHeader title="FEEDBACK" />
          <SectionCard>
            <SettingsRow
              icon="phone-portrait-outline"
              label="Haptic Feedback"
              subtitle="Vibration on interactions"
              showChevron={false}
              right={
                <AnimatedToggle
                  value={prefs.hapticFeedback}
                  onToggle={() => togglePref("hapticFeedback")}
                />
              }
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(320)}>
          <SectionHeader title="ABOUT" />
          <SectionCard>
            <SettingsRow
              icon="information-circle-outline"
              label="Version"
              value="3.0.0"
              showChevron={false}
            />
            <Divider />
            <SettingsRow
              icon="document-outline"
              label="Terms of Service"
              onPress={() => {}}
            />
            <Divider />
            <SettingsRow
              icon="lock-closed-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </SectionCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(380)}>
          <SectionHeader title="ACCOUNT" />
          <SectionCard>
            <SettingsRow
              icon="person-outline"
              label="Edit Profile"
              onPress={() => {}}
            />
            <Divider />
            <SettingsRow
              icon="log-out-outline"
              label="Sign Out"
              danger
              showChevron={false}
              onPress={() => {
                haptic(Haptics.ImpactFeedbackStyle.Heavy);
                Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Sign Out", style: "destructive" },
                ]);
              }}
            />
          </SectionCard>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pureBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
    letterSpacing: 3,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    marginBottom: 10,
    marginTop: 28,
    textTransform: "uppercase" as const,
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  settingsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.offWhite,
    letterSpacing: 0.2,
  },
  rowSubtitle: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  rowValue: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  rowDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center" as const,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  signOutButton: {
    alignItems: "center" as const,
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.red,
    letterSpacing: 0.5,
  },
});
