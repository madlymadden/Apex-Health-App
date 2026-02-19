import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { SPACING } from "@/constants/theme";
import {
  generateEquinoxRecommendations,
  type EquinoxClass,
  type EquinoxLocation,
  type DayType,
} from "@/lib/health-data";

const EQ_GOLD = "#D4AF37";
const EQ_TEAL = "#5AC8D4";

function intensityColor(intensity: string): string {
  switch (intensity) {
    case "max": return "#D94848";
    case "high": return "#FF8C42";
    case "moderate": return EQ_TEAL;
    case "low": return Colors.green;
    default: return Colors.muted;
  }
}

function dayTypeLabel(type: DayType): { label: string; color: string; description: string } {
  if (type === "workout") return { label: "PUSH DAY", color: Colors.green, description: "Your body is recovered and ready for intensity" };
  if (type === "recovery") return { label: "ACTIVE RECOVERY", color: EQ_TEAL, description: "Light movement and mobility recommended" };
  return { label: "REST DAY", color: EQ_GOLD, description: "Restorative activities only \u2014 let your body heal" };
}

function SpringPress({ children, scale = 0.96, style }: { children: React.ReactNode; scale?: number; style?: any }) {
  const pressed = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));
  return (
    <Pressable
      onPressIn={() => { pressed.value = withSpring(scale, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { pressed.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={style}
    >
      <Animated.View style={animStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

function CategoryPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const pressed = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));
  return (
    <Pressable
      onPressIn={() => { pressed.value = withSpring(0.94, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { pressed.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={[animStyle, styles.categoryPill, active && { backgroundColor: "rgba(255,255,255,0.12)", borderColor: Colors.white }]}>
        <Text style={[styles.categoryPillText, active && { color: Colors.white }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function MatchBar({ score }: { score: number }) {
  const barColor = score >= 80 ? Colors.green : score >= 60 ? EQ_TEAL : score >= 40 ? EQ_GOLD : Colors.muted;
  return (
    <View style={styles.matchBarContainer}>
      <View style={styles.matchBarBg}>
        <Animated.View entering={FadeIn.duration(600)} style={[styles.matchBarFill, { width: `${score}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={[styles.matchBarLabel, { color: barColor }]}>{score}%</Text>
    </View>
  );
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 80 ? Colors.green : score >= 60 ? EQ_TEAL : score >= 40 ? EQ_GOLD : Colors.muted;
  return (
    <View style={[styles.matchBadge, { borderColor: color }]}>
      <Text style={[styles.matchBadgeText, { color }]}>{score}%</Text>
    </View>
  );
}

function AmenityTagBadge({ tag }: { tag: string }) {
  return (
    <View style={styles.classAmenityTag}>
      <Text style={styles.classAmenityTagText}>{tag}</Text>
    </View>
  );
}

function ClassCard({ cls, location, index }: { cls: EquinoxClass; location?: EquinoxLocation; index: number }) {
  const pressed = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));
  const bookPressed = useSharedValue(1);
  const bookAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookPressed.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
      <Pressable
        onPressIn={() => { pressed.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { pressed.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
        onPress={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View style={[animStyle, styles.classCard]}>
          <View style={styles.classCardHeader}>
            <View style={styles.classIconWrap}>
              <Ionicons name={cls.icon as any} size={18} color={intensityColor(cls.intensity)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.className}>{cls.name}</Text>
              <Text style={styles.classInstructor}>{cls.instructor} {"\u00b7"} {cls.duration} min</Text>
            </View>
            <View style={styles.classTimeWrap}>
              <MatchBadge score={cls.matchScore} />
              <Text style={styles.classTime}>{cls.time}</Text>
              <Text style={[styles.spotsLeft, cls.spotsLeft <= 3 && { color: "#D94848" }]}>
                {cls.spotsLeft} {cls.spotsLeft === 1 ? "spot" : "spots"}
              </Text>
            </View>
          </View>

          <View style={styles.classCardBody}>
            <MatchBar score={cls.matchScore} />
            <Text style={styles.matchReason}>{cls.matchReason}</Text>
          </View>

          {cls.amenityTags && cls.amenityTags.length > 0 && (
            <View style={styles.classAmenityRow}>
              {cls.amenityTags.map((tag) => (
                <AmenityTagBadge key={tag} tag={tag} />
              ))}
            </View>
          )}

          {location && (
            <View style={styles.classLocation}>
              <Ionicons name="location-outline" size={12} color={Colors.muted} />
              <Text style={styles.classLocationText}>{location.neighborhood} {"\u00b7"} {location.distance}</Text>
            </View>
          )}

          <View style={styles.classCardFooter}>
            <View style={[styles.intensityBadge, { borderColor: intensityColor(cls.intensity) }]}>
              <Text style={[styles.intensityText, { color: intensityColor(cls.intensity) }]}>{cls.intensity.toUpperCase()}</Text>
            </View>
            <Pressable
              onPressIn={() => { bookPressed.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
              onPressOut={() => { bookPressed.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
            >
              <Animated.View style={[bookAnimStyle, styles.bookButton]}>
                <Text style={styles.bookButtonText}>BOOK</Text>
              </Animated.View>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function LocationChip({ location, active, onPress }: { location: EquinoxLocation; active: boolean; onPress: () => void }) {
  const pressed = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));
  return (
    <Pressable
      onPressIn={() => { pressed.value = withSpring(0.94, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { pressed.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View style={[animStyle, styles.locationChip, active && { backgroundColor: "rgba(255,255,255,0.12)", borderColor: EQ_GOLD }]}>
        {location.isFavorite && <Ionicons name="star" size={10} color={EQ_GOLD} style={{ marginRight: 4 }} />}
        <Text style={[styles.locationChipText, active && { color: Colors.white }]}>{location.neighborhood}</Text>
        <Text style={styles.locationChipDistance}>{location.distance}</Text>
      </Animated.View>
    </Pressable>
  );
}

function AmenityTag({ amenity }: { amenity: string }) {
  const iconMap: Record<string, string> = {
    "Pool": "water-outline",
    "Steam": "cloud-outline",
    "Sauna": "flame-outline",
    "Cold Plunge": "snow-outline",
    "Spa": "sparkles-outline",
    "Juice Bar": "cafe-outline",
    "Body Lab": "fitness-outline",
    "Eucalyptus Towels": "leaf-outline",
    "Kiehl's": "flask-outline",
    "Rooftop": "sunny-outline",
    "Hotel": "bed-outline",
  };
  return (
    <View style={styles.amenityTag}>
      <Ionicons name={(iconMap[amenity] || "ellipse-outline") as any} size={11} color={EQ_TEAL} />
      <Text style={styles.amenityText}>{amenity}</Text>
    </View>
  );
}

export default function EquinoxClassesScreen() {
  const insets = useSafeAreaInsets();
  const data = useMemo(() => generateEquinoxRecommendations(), []);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const dayInfo = dayTypeLabel(data.dayType);

  const categories = ["all", "strength", "cardio", "cycle", "mind-body", "pilates", "boxing", "recovery"];

  const filteredLocations = showFavoritesOnly
    ? data.locations.filter((l) => l.isFavorite)
    : data.locations;

  const filteredClasses = useMemo(() => {
    let classes = data.classes;
    if (selectedLocationId) {
      classes = classes.filter((c) => c.locationId === selectedLocationId);
    }
    if (selectedCategory !== "all") {
      classes = classes.filter((c) => c.category === selectedCategory);
    }
    if (showFavoritesOnly) {
      const favIds = data.locations.filter((l) => l.isFavorite).map((l) => l.id);
      classes = classes.filter((c) => favIds.includes(c.locationId));
    }
    return classes;
  }, [data.classes, selectedLocationId, selectedCategory, showFavoritesOnly]);

  const selectedLocation = data.locations.find((l) => l.id === selectedLocationId);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={16}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={styles.headerTitle}>EQUINOX</Text>
          <Text style={styles.headerSubtitle}>CLASS RECOMMENDATIONS</Text>
        </View>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFavoritesOnly(!showFavoritesOnly);
          }}
          hitSlop={16}
        >
          <Ionicons name={showFavoritesOnly ? "star" : "star-outline"} size={20} color={showFavoritesOnly ? EQ_GOLD : Colors.muted} />
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onMomentumScrollEnd={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.dayTypeCard}>
          <View style={styles.dayTypeHeader}>
            <View style={[styles.dayTypeDot, { backgroundColor: dayInfo.color }]} />
            <Text style={[styles.dayTypeLabel, { color: dayInfo.color }]}>{dayInfo.label}</Text>
          </View>
          <Text style={styles.dayTypeDescription}>{dayInfo.description}</Text>
          <View style={styles.dayTypeDivider} />
          <View style={styles.dayTypeStats}>
            <View style={styles.dayTypeStat}>
              <Text style={styles.dayTypeStatValue}>{data.recoveryScore}</Text>
              <Text style={styles.dayTypeStatLabel}>RECOVERY</Text>
            </View>
            <View style={styles.dayTypeStatDivider} />
            <View style={styles.dayTypeStat}>
              <Text style={styles.dayTypeStatValue}>{data.recentWorkouts}</Text>
              <Text style={styles.dayTypeStatLabel}>WORKOUTS</Text>
            </View>
            <View style={styles.dayTypeStatDivider} />
            <View style={styles.dayTypeStat}>
              <Text style={styles.dayTypeStatValue}>{data.restDays}</Text>
              <Text style={styles.dayTypeStatLabel}>REST DAYS</Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCATIONS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.screenPadding }}>
            <LocationChip
              location={{ id: "all", name: "All", neighborhood: "All Clubs", city: "", distance: "", tier: "Equinox", amenities: [], isFavorite: false }}
              active={selectedLocationId === null}
              onPress={() => setSelectedLocationId(null)}
            />
            {filteredLocations.map((loc) => (
              <LocationChip
                key={loc.id}
                location={loc}
                active={selectedLocationId === loc.id}
                onPress={() => setSelectedLocationId(selectedLocationId === loc.id ? null : loc.id)}
              />
            ))}
          </ScrollView>
        </View>

        {selectedLocation && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.locationDetail}>
            <View style={styles.locationDetailHeader}>
              <Text style={styles.locationDetailName}>{selectedLocation.name}</Text>
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>{selectedLocation.tier}</Text>
              </View>
            </View>
            <Text style={styles.locationDetailCity}>{selectedLocation.city} {"\u00b7"} {selectedLocation.distance}</Text>
            <View style={styles.amenitiesRow}>
              {selectedLocation.amenities.map((a) => (
                <AmenityTag key={a} amenity={a} />
              ))}
            </View>
          </Animated.View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CLASS TYPE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING.screenPadding }}>
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat === "all" ? "All" : cat === "mind-body" ? "Mind & Body" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>RECOMMENDED FOR YOU</Text>
            <Text style={styles.classCount}>{filteredClasses.length} classes</Text>
          </View>
          <View style={{ paddingHorizontal: SPACING.screenPadding }}>
            {filteredClasses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={28} color={Colors.muted} />
                <Text style={styles.emptyText}>No classes match your filters</Text>
              </View>
            ) : (
              filteredClasses.map((cls, i) => (
                <ClassCard
                  key={cls.id}
                  cls={cls}
                  location={data.locations.find((l) => l.id === cls.locationId)}
                  index={i}
                />
              ))
            )}
          </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.white,
    letterSpacing: 6,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: 2,
  },
  dayTypeCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: EQ_GOLD,
  },
  dayTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dayTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dayTypeLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    letterSpacing: 4,
  },
  dayTypeDescription: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: Colors.lightText,
    marginBottom: 16,
    lineHeight: 18,
  },
  dayTypeDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  dayTypeStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 14,
  },
  dayTypeStat: {
    alignItems: "center",
    flex: 1,
  },
  dayTypeStatValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 22,
    color: Colors.white,
  },
  dayTypeStatLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 4,
    marginTop: 4,
  },
  dayTypeStatDivider: {
    width: 0.5,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 4,
    paddingHorizontal: SPACING.screenPadding,
    marginBottom: 12,
    textTransform: "uppercase" as const,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 20,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  classCount: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    backgroundColor: "#1A1A1A",
  },
  locationChipText: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.lightText,
  },
  locationChipDistance: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    color: Colors.muted,
    marginLeft: 6,
  },
  locationDetail: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
  },
  locationDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  locationDetailName: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: EQ_GOLD,
    borderRadius: 2,
  },
  tierText: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    color: EQ_GOLD,
    letterSpacing: 1,
  },
  locationDetailCity: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
    marginBottom: 12,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  amenityTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(90,200,212,0.08)",
    borderRadius: 2,
    gap: 4,
  },
  amenityText: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    color: EQ_TEAL,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    backgroundColor: "#1A1A1A",
  },
  categoryPillText: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
    letterSpacing: 1,
  },
  classCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 2,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: "rgba(255,255,255,0.06)",
  },
  classCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  classIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  className: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: Colors.white,
  },
  classInstructor: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  classTimeWrap: {
    alignItems: "flex-end",
  },
  classTime: {
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    color: Colors.white,
    marginTop: 4,
  },
  spotsLeft: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    color: Colors.muted,
    marginTop: 2,
  },
  matchBadge: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  matchBadgeText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    letterSpacing: 1,
  },
  classCardBody: {
    marginBottom: 10,
  },
  matchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  matchBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 1.5,
    overflow: "hidden",
    marginRight: 8,
  },
  matchBarFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  matchBarLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    width: 32,
    textAlign: "right",
  },
  matchReason: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.secondaryText,
    fontStyle: "italic",
  },
  classAmenityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  classAmenityTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    backgroundColor: "rgba(90,200,212,0.08)",
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: "rgba(90,200,212,0.15)",
  },
  classAmenityTagText: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    color: EQ_TEAL,
    letterSpacing: 1,
  },
  classLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 4,
  },
  classLocationText: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    color: Colors.muted,
  },
  classCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  intensityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderRadius: 2,
  },
  intensityText: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
  },
  bookButton: {
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: 7,
    backgroundColor: EQ_GOLD,
    borderRadius: 2,
  },
  bookButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    color: Colors.deepBlack,
    letterSpacing: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: Colors.muted,
  },
});
