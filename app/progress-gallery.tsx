import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type AngleFilter = "ALL" | "FRONT" | "SIDE" | "BACK";

interface ProgressEntry {
  id: number;
  month: string;
  year: number;
  weight: number;
  bodyFat: number;
  angle: "FRONT" | "SIDE" | "BACK";
}

const ENTRIES: ProgressEntry[] = [
  { id: 1, month: "JUN", year: 2025, weight: 198, bodyFat: 24, angle: "FRONT" },
  { id: 2, month: "JUL", year: 2025, weight: 195, bodyFat: 23, angle: "SIDE" },
  { id: 3, month: "AUG", year: 2025, weight: 192, bodyFat: 22, angle: "BACK" },
  { id: 4, month: "SEP", year: 2025, weight: 190, bodyFat: 21, angle: "FRONT" },
  { id: 5, month: "OCT", year: 2025, weight: 188, bodyFat: 20, angle: "SIDE" },
  { id: 6, month: "NOV", year: 2025, weight: 187, bodyFat: 19, angle: "BACK" },
  { id: 7, month: "DEC", year: 2025, weight: 186, bodyFat: 18.5, angle: "FRONT" },
  { id: 8, month: "JAN", year: 2026, weight: 185, bodyFat: 18, angle: "SIDE" },
];

const START_WEIGHT = ENTRIES[0].weight;
const CURRENT_WEIGHT = ENTRIES[ENTRIES.length - 1].weight;
const WEIGHT_DELTA = CURRENT_WEIGHT - START_WEIGHT;

const FILTERS: AngleFilter[] = ["ALL", "FRONT", "SIDE", "BACK"];

function WeightGraph() {
  const graphWidth = SCREEN_WIDTH - 48;
  const graphHeight = 60;
  const weights = ENTRIES.map((e) => e.weight);
  const minW = Math.min(...weights) - 2;
  const maxW = Math.max(...weights) + 2;
  const range = maxW - minW;

  const points = weights.map((w, i) => {
    const x = (i / (weights.length - 1)) * graphWidth;
    const y = graphHeight - ((w - minW) / range) * graphHeight;
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <View style={styles.graphContainer}>
      <Text style={styles.sectionLabel}>WEIGHT TREND</Text>
      <View style={{ height: graphHeight + 20, marginTop: 8 }}>
        <View style={styles.graphSvg}>
          {points.map((point, i) => (
            <View
              key={i}
              style={[
                styles.graphDot,
                {
                  left: point.x - 3,
                  top: point.y - 3,
                },
              ]}
            />
          ))}
          {points.slice(0, -1).map((point, i) => {
            const next = points[i + 1];
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`line-${i}`}
                style={[
                  styles.graphLine,
                  {
                    left: point.x,
                    top: point.y,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: "left center",
                  },
                ]}
              />
            );
          })}
        </View>
        <View style={styles.graphLabels}>
          {ENTRIES.map((e, i) => (
            <Text key={i} style={styles.graphLabel}>
              {e.month}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function PhotoCard({
  entry,
  isSelected,
  onPress,
  compareMode,
  index,
}: {
  entry: ProgressEntry;
  isSelected: boolean;
  onPress: () => void;
  compareMode: boolean;
  index: number;
}) {
  const prevEntry = ENTRIES.find((e) => e.id === entry.id - 1);
  const weightChange = prevEntry ? entry.weight - prevEntry.weight : 0;
  const fatChange = prevEntry ? entry.bodyFat - prevEntry.bodyFat : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(400)}>
      <Pressable
        onPress={onPress}
        style={[styles.entryContainer, isSelected && styles.entrySelected]}
      >
        <Text style={styles.monthLabel}>
          {entry.month} {entry.year}
        </Text>
        <View style={styles.photoPlaceholder}>
          <View style={styles.photoInner}>
            <Ionicons name="body-outline" size={64} color={Colors.muted} />
          </View>
          {compareMode && (
            <View style={styles.selectOverlay}>
              <View style={[styles.selectCircle, isSelected && styles.selectCircleActive]}>
                {isSelected && <Ionicons name="checkmark" size={14} color={Colors.deepBlack} />}
              </View>
            </View>
          )}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>WEIGHT</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{entry.weight} lbs</Text>
              {prevEntry && weightChange !== 0 && (
                <View style={styles.changeIndicator}>
                  <Ionicons
                    name={weightChange < 0 ? "arrow-down" : "arrow-up"}
                    size={10}
                    color={weightChange < 0 ? Colors.green : Colors.red}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: weightChange < 0 ? Colors.green : Colors.red },
                    ]}
                  >
                    {Math.abs(weightChange)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>BODY FAT</Text>
            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{entry.bodyFat}%</Text>
              {prevEntry && fatChange !== 0 && (
                <View style={styles.changeIndicator}>
                  <Ionicons
                    name={fatChange < 0 ? "arrow-down" : "arrow-up"}
                    size={10}
                    color={fatChange < 0 ? Colors.green : Colors.red}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      { color: fatChange < 0 ? Colors.green : Colors.red },
                    ]}
                  >
                    {Math.abs(fatChange)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CompareView({ entries }: { entries: ProgressEntry[] }) {
  if (entries.length !== 2) return null;
  const [a, b] = entries;
  const weightDelta = b.weight - a.weight;
  const fatDelta = b.bodyFat - a.bodyFat;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.compareContainer}>
      <Text style={styles.sectionLabel}>COMPARISON</Text>
      <View style={styles.compareCards}>
        <View style={styles.compareCard}>
          <Text style={styles.compareMonth}>
            {a.month} {a.year}
          </Text>
          <View style={styles.comparePhoto}>
            <Ionicons name="body-outline" size={48} color={Colors.muted} />
          </View>
          <Text style={styles.compareWeight}>{a.weight} lbs</Text>
          <Text style={styles.compareFat}>{a.bodyFat}% BF</Text>
        </View>
        <View style={styles.compareDelta}>
          <View style={styles.deltaItem}>
            <Ionicons
              name={weightDelta <= 0 ? "arrow-down" : "arrow-up"}
              size={16}
              color={weightDelta <= 0 ? Colors.green : Colors.red}
            />
            <Text
              style={[
                styles.deltaValue,
                { color: weightDelta <= 0 ? Colors.green : Colors.red },
              ]}
            >
              {Math.abs(weightDelta)} lbs
            </Text>
          </View>
          <View style={styles.deltaDivider} />
          <View style={styles.deltaItem}>
            <Ionicons
              name={fatDelta <= 0 ? "arrow-down" : "arrow-up"}
              size={16}
              color={fatDelta <= 0 ? Colors.green : Colors.red}
            />
            <Text
              style={[
                styles.deltaValue,
                { color: fatDelta <= 0 ? Colors.green : Colors.red },
              ]}
            >
              {Math.abs(fatDelta)}% BF
            </Text>
          </View>
        </View>
        <View style={styles.compareCard}>
          <Text style={styles.compareMonth}>
            {b.month} {b.year}
          </Text>
          <View style={styles.comparePhoto}>
            <Ionicons name="body-outline" size={48} color={Colors.muted} />
          </View>
          <Text style={styles.compareWeight}>{b.weight} lbs</Text>
          <Text style={styles.compareFat}>{b.bodyFat}% BF</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function ProgressGalleryScreen() {
  const insets = useSafeAreaInsets();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<AngleFilter>("ALL");

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;
  const topPadding = insets.top + webTopInset;
  const bottomPadding = insets.bottom + webBottomInset;

  const filteredEntries =
    activeFilter === "ALL" ? ENTRIES : ENTRIES.filter((e) => e.angle === activeFilter);

  const selectedEntries = ENTRIES.filter((e) => selectedIds.includes(e.id));

  const handleToggleCompare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (compareMode) {
      setCompareMode(false);
      setSelectedIds([]);
    } else {
      setCompareMode(true);
      setSelectedIds([]);
    }
  };

  const handleSelectEntry = (id: number) => {
    Haptics.selectionAsync();
    if (!compareMode) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={16}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.title}>Progress</Text>
        <Pressable onPress={handleToggleCompare} hitSlop={16}>
          <Text style={[styles.compareToggle, compareMode && styles.compareToggleActive]}>
            {compareMode ? "DONE" : "COMPARE"}
          </Text>
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomPadding + 80 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>STARTING</Text>
            <Text style={styles.summaryValue}>{START_WEIGHT} lbs</Text>
          </View>
          <View style={styles.summaryArrow}>
            <Ionicons name="arrow-forward" size={16} color={Colors.muted} />
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>CURRENT</Text>
            <Text style={styles.summaryValue}>{CURRENT_WEIGHT} lbs</Text>
          </View>
          <View style={styles.summaryDelta}>
            <Ionicons name="arrow-down" size={14} color={Colors.green} />
            <Text style={styles.summaryDeltaText}>{Math.abs(WEIGHT_DELTA)} lbs</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <WeightGraph />

        <View style={styles.divider} />

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(f);
              }}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        {compareMode && selectedEntries.length === 2 && (
          <CompareView entries={selectedEntries} />
        )}

        {compareMode && selectedEntries.length < 2 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.compareHint}>
            <Text style={styles.compareHintText}>
              SELECT {2 - selectedEntries.length} {selectedEntries.length === 1 ? "MORE ENTRY" : "ENTRIES"} TO COMPARE
            </Text>
          </Animated.View>
        )}

        <View style={styles.timeline}>
          {filteredEntries.map((entry, index) => (
            <PhotoCard
              key={entry.id}
              entry={entry}
              isSelected={selectedIds.includes(entry.id)}
              onPress={() => handleSelectEntry(entry.id)}
              compareMode={compareMode}
              index={index}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomPadding + 12 }]}>
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={styles.addButton}
        >
          <Ionicons name="camera-outline" size={18} color={Colors.deepBlack} />
          <Text style={styles.addButtonText}>ADD PHOTO</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
  },
  compareToggle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  compareToggleActive: {
    color: Colors.teal,
  },
  scrollView: {
    flex: 1,
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 22,
    color: Colors.white,
  },
  summaryArrow: {
    marginHorizontal: 16,
  },
  summaryDelta: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    backgroundColor: "rgba(76, 217, 100, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  summaryDeltaText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.green,
    marginLeft: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  graphContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 3,
  },
  graphSvg: {
    height: 60,
    position: "relative",
  },
  graphDot: {
    position: "absolute",
    width: 6,
    height: 6,
    backgroundColor: Colors.teal,
  },
  graphLine: {
    position: "absolute",
    height: 1,
    backgroundColor: Colors.teal,
    opacity: 0.5,
  },
  graphLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  graphLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 8,
    color: Colors.muted,
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 0,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: Colors.charcoal,
  },
  filterTabActive: {
    backgroundColor: Colors.elevated,
  },
  filterText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 2,
  },
  filterTextActive: {
    color: Colors.white,
  },
  compareHint: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
  },
  compareHintText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.teal,
    letterSpacing: 2,
  },
  timeline: {
    paddingHorizontal: 20,
    gap: 20,
  },
  entryContainer: {
    backgroundColor: Colors.charcoal,
    padding: 12,
  },
  entrySelected: {
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  monthLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 8,
  },
  photoPlaceholder: {
    height: 160,
    backgroundColor: Colors.elevated,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  photoInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  selectOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: Colors.muted,
    justifyContent: "center",
    alignItems: "center",
  },
  selectCircleActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 20,
  },
  statItem: {},
  statLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontFamily: "Outfit_300Light",
    fontSize: 15,
    color: Colors.white,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  changeText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
  },
  compareContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  compareCards: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  compareCard: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    padding: 10,
    alignItems: "center",
  },
  compareMonth: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 6,
  },
  comparePhoto: {
    height: 80,
    width: "100%",
    backgroundColor: Colors.elevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  compareWeight: {
    fontFamily: "Outfit_300Light",
    fontSize: 16,
    color: Colors.white,
  },
  compareFat: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  compareDelta: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  deltaItem: {
    alignItems: "center",
  },
  deltaValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  deltaDivider: {
    width: 16,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.deepBlack,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    color: Colors.deepBlack,
    letterSpacing: 3,
  },
});
