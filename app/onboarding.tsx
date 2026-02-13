import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  FlatList,
  type ViewToken,
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
  withTiming,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { setOnboardingDone } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PAGES = [
  {
    icon: "pulse" as const,
    title: "Track Everything",
    subtitle:
      "Steps, heart rate, calories, and active minutes — all in one elegant dashboard.",
  },
  {
    icon: "barbell" as const,
    title: "Log Workouts",
    subtitle:
      "Record your training sessions with detailed stats, heart rate zones, and performance insights.",
  },
  {
    icon: "trending-up" as const,
    title: "See Progress",
    subtitle:
      "Track body composition changes over time with beautiful charts and trend analysis.",
  },
];

function PageIndicator({ active }: { active: boolean }) {
  const width = useSharedValue(active ? 24 : 6);
  const opacity = useSharedValue(active ? 1 : 0.3);

  React.useEffect(() => {
    width.value = withTiming(active ? 24 : 6, { duration: 300 });
    opacity.value = withTiming(active ? 1 : 0.3, { duration: 300 });
  }, [active]);

  const style = useAnimatedStyle(() => ({
    width: width.value,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.indicator, style]} />
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    }
  ).current;

  const handleComplete = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    if (currentPage < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
    } else {
      handleComplete();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={handleComplete}>
          <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item, index }) => (
          <View style={[styles.page, { width: SCREEN_WIDTH }]}>
            <Animated.View entering={FadeIn.delay(index * 200).duration(800)} style={styles.pageContent}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={36} color={Colors.white} />
              </View>
              <Text style={styles.pageTitle}>{item.title}</Text>
              <View style={styles.pageDivider} />
              <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
            </Animated.View>
          </View>
        )}
        keyExtractor={(_, i) => i.toString()}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 20) }]}>
        <View style={styles.indicators}>
          {PAGES.map((_, i) => (
            <PageIndicator key={i} active={i === currentPage} />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.nextButtonText}>
            {currentPage === PAGES.length - 1 ? "BEGIN" : "NEXT"}
          </Text>
          <Ionicons
            name={currentPage === PAGES.length - 1 ? "checkmark" : "arrow-forward"}
            size={16}
            color={Colors.deepBlack}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  skipRow: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  page: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 48,
  },
  pageContent: {
    alignItems: "center" as const,
    gap: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0.5,
    borderColor: Colors.border,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
    textAlign: "center" as const,
  },
  pageDivider: {
    width: 32,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  pageSubtitle: {
    fontSize: 16,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    textAlign: "center" as const,
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 28,
    alignItems: "center" as const,
  },
  indicators: {
    flexDirection: "row" as const,
    gap: 6,
    alignItems: "center" as const,
  },
  indicator: {
    height: 3,
    backgroundColor: Colors.white,
  },
  nextButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
  },
  nextButtonText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.deepBlack,
    letterSpacing: 3,
  },
});
