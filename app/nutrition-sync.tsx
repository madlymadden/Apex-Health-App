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
  generateNutritionEntries,
  getRelativeDate,
  type NutritionEntry,
} from "@/lib/health-data";

const SWEETGREEN = "#2E7D32";
const NUTRIFACTOR = "#4CAF50";

function MealCard({ entry, index, onImport }: { entry: NutritionEntry; index: number; onImport: (id: string) => void }) {
  const sourceColor = entry.source === "Sweetgreen" ? SWEETGREEN : NUTRIFACTOR;

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <View style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealLeft}>
            <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{entry.meal}</Text>
              <Text style={styles.mealMeta}>
                {entry.source} {" \u00B7 "} {getRelativeDate(entry.date)}
              </Text>
            </View>
          </View>
          {entry.imported ? (
            <View style={styles.importedBadge}>
              <Ionicons name="checkmark" size={10} color={Colors.green} />
              <Text style={styles.importedLabel}>LOGGED</Text>
            </View>
          ) : (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onImport(entry.id);
              }}
              style={({ pressed }) => [styles.logButton, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="add" size={12} color={Colors.white} />
              <Text style={styles.logText}>LOG</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{entry.calories}</Text>
            <Text style={styles.macroLabel}>CAL</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: Colors.teal }]}>{entry.protein}g</Text>
            <Text style={styles.macroLabel}>PROTEIN</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{entry.carbs}g</Text>
            <Text style={styles.macroLabel}>CARBS</Text>
          </View>
          <View style={styles.macroDivider} />
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{entry.fat}g</Text>
            <Text style={styles.macroLabel}>FAT</Text>
          </View>
        </View>

        <View style={styles.itemsRow}>
          {entry.items.map((item, i) => (
            <View key={i} style={styles.itemChip}>
              <Text style={styles.itemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

export default function NutritionSyncScreen() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<NutritionEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "sweetgreen" | "nutrifactor">("all");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setEntries(generateNutritionEntries());
  }, []);

  const handleImport = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, imported: true } : e))
    );
  };

  const filtered = filter === "all" ? entries : entries.filter((e) => e.source.toLowerCase() === filter);
  const totalCal = entries.filter((e) => e.imported).reduce((s, e) => s + e.calories, 0);
  const totalProtein = entries.filter((e) => e.imported).reduce((s, e) => s + e.protein, 0);
  const logged = entries.filter((e) => e.imported).length;

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
            <Text style={styles.headerTitle}>NUTRITION</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalCal.toLocaleString()}</Text>
              <Text style={styles.summaryLabel}>LOGGED CAL</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: Colors.teal }]}>{totalProtein}g</Text>
              <Text style={styles.summaryLabel}>PROTEIN</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{logged}</Text>
              <Text style={styles.summaryLabel}>MEALS</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.filterRow}>
            {(["all", "sweetgreen", "nutrifactor"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => {
                  setFilter(f);
                  if (Platform.OS !== "web") Haptics.selectionAsync();
                }}
                style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === "nutrifactor" ? "NUTRI" : f.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setEntries((prev) => prev.map((e) => ({ ...e, imported: true })));
            }}
            style={({ pressed }) => [styles.logAllButton, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.logAllText}>LOG ALL MEALS</Text>
          </Pressable>

          {filtered.map((entry, i) => (
            <MealCard key={entry.id} entry={entry} index={i} onImport={handleImport} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="nutrition-outline" size={28} color={Colors.border} />
              <Text style={styles.emptyText}>No meals from this source</Text>
            </View>
          )}
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
  summaryRow: { flexDirection: "row" as const, justifyContent: "space-around" as const, alignItems: "center" as const, marginBottom: 8 },
  summaryItem: { flex: 1, alignItems: "center" as const, gap: 6 },
  summaryValue: { fontSize: 24, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.5 },
  summaryLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  summaryDivider: { width: 0.5, height: 28, backgroundColor: Colors.border },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  filterRow: { flexDirection: "row" as const, gap: 2, marginBottom: 16 },
  filterButton: { flex: 1, paddingVertical: 10, alignItems: "center" as const },
  filterButtonActive: { borderBottomWidth: 1, borderBottomColor: Colors.white },
  filterText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  filterTextActive: { color: Colors.white },
  logAllButton: { backgroundColor: Colors.white, paddingVertical: 14, alignItems: "center" as const, marginBottom: 20 },
  logAllText: { fontSize: 11, fontFamily: "Outfit_400Regular", color: Colors.deepBlack, letterSpacing: 2 },
  mealCard: { marginBottom: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 16 },
  mealHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginBottom: 14 },
  mealLeft: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, flex: 1 },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  mealInfo: { gap: 2, flex: 1 },
  mealName: { fontSize: 16, fontFamily: "Outfit_400Regular", color: Colors.white, letterSpacing: -0.2 },
  mealMeta: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 0.3 },
  importedBadge: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4 },
  importedLabel: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.green, letterSpacing: 1.5 },
  logButton: { flexDirection: "row" as const, alignItems: "center" as const, gap: 4, paddingVertical: 5, paddingHorizontal: 10, borderWidth: 0.5, borderColor: Colors.white },
  logText: { fontSize: 9, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: 1.5 },
  macroRow: { flexDirection: "row" as const, justifyContent: "space-around" as const, alignItems: "center" as const, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.06)" },
  macroItem: { alignItems: "center" as const, gap: 4 },
  macroValue: { fontSize: 16, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.3 },
  macroLabel: { fontSize: 7, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2 },
  macroDivider: { width: 0.5, height: 20, backgroundColor: "rgba(255,255,255,0.08)" },
  itemsRow: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 5, marginTop: 10 },
  itemChip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "rgba(255,255,255,0.04)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)" },
  itemText: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 0.3 },
  emptyState: { alignItems: "center" as const, paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Outfit_300Light", color: Colors.muted },
});
