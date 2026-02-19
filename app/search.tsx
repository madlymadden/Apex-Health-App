import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
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
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const RECENT_KEY = "@madden_recent_searches";

const SEARCHABLE_SCREENS = [
  { label: "Dashboard", icon: "grid-outline", route: "/(tabs)" },
  { label: "Activity", icon: "fitness-outline", route: "/(tabs)/activity" },
  { label: "Body", icon: "body-outline", route: "/(tabs)/body" },
  { label: "Profile", icon: "person-outline", route: "/(tabs)/profile" },
  { label: "Weekly Report", icon: "stats-chart-outline", route: "/weekly-report" },
  { label: "Sleep Analysis", icon: "moon-outline", route: "/sleep-analysis" },
  { label: "Nutrition Tracker", icon: "nutrition-outline", route: "/nutrition-tracker" },
  { label: "Heart Rate Zones", icon: "heart-outline", route: "/heart-rate-zones" },
  { label: "Recovery", icon: "leaf-outline", route: "/recovery" },
  { label: "Analytics", icon: "analytics-outline", route: "/stats" },
  { label: "Workout Plans", icon: "clipboard-outline", route: "/workout-plans" },
  { label: "AI Scanner", icon: "sparkles-outline", route: "/smart-scanner" },
  { label: "Achievements", icon: "trophy-outline", route: "/achievements" },
  { label: "Challenges", icon: "flag-outline", route: "/challenges" },
  { label: "Personal Records", icon: "medal-outline", route: "/personal-records" },
  { label: "Run Tracker", icon: "walk-outline", route: "/run-tracker" },
  { label: "Body Trends", icon: "trending-down-outline", route: "/body-trends" },
  { label: "Training Calendar", icon: "calendar-outline", route: "/training-calendar" },
  { label: "Exercise Library", icon: "barbell-outline", route: "/exercise-library" },
  { label: "Fasting Timer", icon: "timer-outline", route: "/fasting-timer" },
  { label: "Progress Gallery", icon: "images-outline", route: "/progress-gallery" },
  { label: "Habit Tracker", icon: "checkmark-circle-outline", route: "/habit-tracker" },
  { label: "Community", icon: "people-outline", route: "/social-feed" },
  { label: "Muscle Map", icon: "body-outline", route: "/body-heatmap" },
  { label: "Meditation", icon: "flower-outline", route: "/meditation" },
  { label: "Supplements", icon: "medical-outline", route: "/supplement-tracker" },
  { label: "Music", icon: "musical-notes-outline", route: "/workout-music" },
  { label: "Equinox Classes", icon: "diamond-outline", route: "/equinox-classes" },
  { label: "Settings", icon: "settings-outline", route: "/settings" },
  { label: "Connected Apps", icon: "apps-outline", route: "/connected-apps" },
];

const QUICK_ACTIONS = [
  { label: "Start Workout", icon: "play-outline", route: "/active-workout", action: undefined },
  { label: "Log Water", icon: "water-outline", route: undefined, action: "hydration" },
  { label: "Log Weight", icon: "scale-outline", route: "/(tabs)/body", action: undefined },
  { label: "Take Progress Photo", icon: "camera-outline", route: "/progress-gallery", action: undefined },
];

const EXPLORE_SCREENS = SEARCHABLE_SCREENS.filter((s) =>
  ["Weekly Report", "Sleep Analysis", "Achievements", "AI Scanner", "Recovery", "Analytics", "Exercise Library", "Meditation"].includes(s.label)
);

type SearchItem = {
  label: string;
  icon: string;
  route?: string;
  action?: string;
  type: "screen" | "action";
};

function SpringPress({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

function ResultRow({ item, onSelect }: { item: SearchItem; onSelect: (item: SearchItem) => void }) {
  return (
    <SpringPress onPress={() => onSelect(item)}>
      <View style={styles.resultRow}>
        <View style={styles.resultIconWrap}>
          <Ionicons name={item.icon as any} size={18} color={Colors.white} />
        </View>
        <Text style={styles.resultLabel}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.muted} />
      </View>
    </SpringPress>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) setRecentSearches(parsed);
        } catch {}
      }
    });
  }, []);

  const saveRecentSearch = useCallback(
    async (label: string) => {
      const updated = [label, ...recentSearches.filter((r) => r !== label)].slice(0, 5);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches]
  );

  const removeRecent = useCallback(
    async (label: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const updated = recentSearches.filter((r) => r !== label);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches]
  );

  const filteredResults = useMemo(() => {
    if (!query.trim()) return { screens: [] as SearchItem[], actions: [] as SearchItem[] };
    const q = query.toLowerCase();
    const screens: SearchItem[] = SEARCHABLE_SCREENS.filter((s) =>
      s.label.toLowerCase().includes(q)
    ).map((s) => ({ ...s, type: "screen" as const }));
    const actions: SearchItem[] = QUICK_ACTIONS.filter((a) =>
      a.label.toLowerCase().includes(q)
    ).map((a) => ({ ...a, type: "action" as const }));
    return { screens, actions };
  }, [query]);

  const hasResults = filteredResults.screens.length > 0 || filteredResults.actions.length > 0;
  const showEmptyState = !query.trim();

  const handleSelect = useCallback(
    (item: SearchItem) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      saveRecentSearch(item.label);
      if (item.route) {
        router.push(item.route as any);
      }
    },
    [saveRecentSearch]
  );

  const handleRecentTap = useCallback(
    (label: string) => {
      if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setQuery(label);
    },
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.headerBar}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={12}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </Pressable>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={16} color={Colors.muted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search screens, actions..."
            placeholderTextColor={Colors.muted}
            style={styles.searchInput}
            selectionColor={Colors.white}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              hitSlop={8}
              style={styles.clearBtn}
            >
              <Ionicons name="close-circle" size={16} color={Colors.muted} />
            </Pressable>
          )}
        </View>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={8}
        >
          <Text style={styles.cancelText}>CANCEL</Text>
        </Pressable>
      </Animated.View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {showEmptyState ? (
          <Animated.View entering={FadeIn.duration(400)}>
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>RECENT</Text>
                {recentSearches.map((label) => {
                  const screen = SEARCHABLE_SCREENS.find((s) => s.label === label);
                  const action = QUICK_ACTIONS.find((a) => a.label === label);
                  const icon = screen?.icon || action?.icon || "time-outline";
                  return (
                    <SpringPress key={label} onPress={() => handleRecentTap(label)}>
                      <View style={styles.resultRow}>
                        <View style={styles.resultIconWrap}>
                          <Ionicons name={icon as any} size={16} color={Colors.secondaryText} />
                        </View>
                        <Text style={[styles.resultLabel, { color: Colors.secondaryText }]}>{label}</Text>
                        <Pressable onPress={() => removeRecent(label)} hitSlop={10}>
                          <Ionicons name="close" size={14} color={Colors.muted} />
                        </Pressable>
                      </View>
                    </SpringPress>
                  );
                })}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
              <View style={styles.quickActionsGrid}>
                {QUICK_ACTIONS.map((action) => (
                  <SpringPress
                    key={action.label}
                    onPress={() => handleSelect({ ...action, type: "action" })}
                    style={styles.quickActionItem}
                  >
                    <View style={styles.quickActionInner}>
                      <Ionicons name={action.icon as any} size={20} color={Colors.white} />
                      <Text style={styles.quickActionLabel}>{action.label.toUpperCase()}</Text>
                    </View>
                  </SpringPress>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>EXPLORE</Text>
              {EXPLORE_SCREENS.map((screen) => (
                <ResultRow
                  key={screen.label}
                  item={{ ...screen, type: "screen" }}
                  onSelect={handleSelect}
                />
              ))}
            </View>
          </Animated.View>
        ) : hasResults ? (
          <Animated.View entering={FadeIn.duration(200)}>
            {filteredResults.actions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>ACTIONS</Text>
                {filteredResults.actions.map((item) => (
                  <ResultRow key={item.label} item={item} onSelect={handleSelect} />
                ))}
              </View>
            )}
            {filteredResults.screens.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>SCREENS</Text>
                {filteredResults.screens.map((item) => (
                  <ResultRow key={item.label} item={item} onSelect={handleSelect} />
                ))}
              </View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(200)} style={styles.noResults}>
            <Ionicons name="search" size={32} color={Colors.muted} />
            <Text style={styles.noResultsText}>NO RESULTS</Text>
            <Text style={styles.noResultsSub}>Try a different search term</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.charcoal,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    height: 40,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  cancelText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 14,
    textTransform: "uppercase" as const,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.04)",
    gap: 14,
  },
  resultIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  resultLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickActionItem: {
    width: "48%",
    flexGrow: 1,
  },
  quickActionInner: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: "center",
    gap: 8,
  },
  quickActionLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    letterSpacing: 2,
    textAlign: "center",
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  noResultsText: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
  },
  noResultsSub: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.3)",
  },
});
