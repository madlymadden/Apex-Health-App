import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useHealth } from "@/lib/health-context";

const WORKOUT_TYPES = [
  { type: "Strength Training", icon: "barbell", intensity: "high" as const },
  { type: "HIIT Circuit", icon: "flash", intensity: "high" as const },
  { type: "Running", icon: "walk", intensity: "high" as const },
  { type: "Cycling", icon: "bicycle", intensity: "moderate" as const },
  { type: "Swimming", icon: "water", intensity: "moderate" as const },
  { type: "Yoga Flow", icon: "leaf", intensity: "low" as const },
  { type: "Pilates", icon: "body", intensity: "moderate" as const },
  { type: "Boxing", icon: "fitness", intensity: "high" as const },
];

export default function AddWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { addWorkout } = useHealth();
  const [selectedType, setSelectedType] = useState(0);
  const [duration, setDuration] = useState("45");
  const [calories, setCalories] = useState("320");
  const [heartRate, setHeartRate] = useState("142");
  const [saving, setSaving] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const wt = WORKOUT_TYPES[selectedType];
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

    await addWorkout({
      id,
      type: wt.type,
      icon: wt.icon,
      duration: parseInt(duration) || 45,
      calories: parseInt(calories) || 320,
      date: new Date().toISOString(),
      intensity: wt.intensity,
      heartRateAvg: parseInt(heartRate) || 142,
    });

    router.back();
  };

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
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>LOG WORKOUT</Text>
            <Pressable
              onPress={handleSave}
              style={[styles.headerButton, saving && { opacity: 0.3 }]}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={22} color={Colors.white} />
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>TYPE</Text>
          <View style={styles.typeGrid}>
            {WORKOUT_TYPES.map((wt, index) => (
              <Pressable
                key={wt.type}
                onPress={() => {
                  setSelectedType(index);
                  if (Platform.OS !== "web") {
                    Haptics.selectionAsync();
                  }
                }}
                style={[
                  styles.typeItem,
                  selectedType === index && styles.typeItemActive,
                ]}
              >
                <Ionicons
                  name={wt.icon as any}
                  size={20}
                  color={selectedType === index ? Colors.white : Colors.muted}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === index && styles.typeLabelActive,
                  ]}
                >
                  {wt.type}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>DETAILS</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>DURATION</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.muted}
                  selectionColor={Colors.white}
                />
                <Text style={styles.inputUnit}>min</Text>
              </View>
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CALORIES</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.muted}
                  selectionColor={Colors.white}
                />
                <Text style={styles.inputUnit}>kcal</Text>
              </View>
            </View>
            <View style={styles.inputDivider} />
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>AVG HR</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={heartRate}
                  onChangeText={setHeartRate}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.muted}
                  selectionColor={Colors.white}
                />
                <Text style={styles.inputUnit}>bpm</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>PREVIEW</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewLeft}>
                <View
                  style={[
                    styles.previewDot,
                    {
                      backgroundColor:
                        WORKOUT_TYPES[selectedType].intensity === "high"
                          ? Colors.red
                          : WORKOUT_TYPES[selectedType].intensity === "moderate"
                          ? Colors.white
                          : Colors.muted,
                    },
                  ]}
                />
                <View>
                  <Text style={styles.previewType}>
                    {WORKOUT_TYPES[selectedType].type}
                  </Text>
                  <Text style={styles.previewTime}>Just now</Text>
                </View>
              </View>
              <View style={styles.previewStats}>
                <Text style={styles.previewStat}>{duration || "0"}m</Text>
                <View style={styles.previewStatDivider} />
                <Text style={styles.previewStat}>
                  {calories || "0"} cal
                </Text>
                <View style={styles.previewStatDivider} />
                <Text style={styles.previewStat}>
                  {heartRate || "0"} bpm
                </Text>
              </View>
            </View>
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
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 36,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 8,
  },
  typeItem: {
    width: "48%" as any,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  typeItemActive: {
    borderColor: Colors.white,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  typeLabel: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.2,
    flex: 1,
  },
  typeLabelActive: {
    color: Colors.white,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  inputRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  inputGroup: {
    flex: 1,
    alignItems: "center" as const,
    gap: 10,
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  inputContainer: {
    alignItems: "center" as const,
  },
  input: {
    fontSize: 32,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    textAlign: "center" as const,
    letterSpacing: -1,
    minWidth: 60,
  },
  inputUnit: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
    marginTop: 4,
  },
  inputDivider: {
    width: 0.5,
    height: 48,
    backgroundColor: Colors.border,
  },
  previewSection: {
    marginTop: 4,
  },
  previewCard: {
    paddingVertical: 18,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  previewLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    marginBottom: 14,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  previewType: {
    fontSize: 17,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  previewTime: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  previewStats: {
    flexDirection: "row" as const,
    paddingLeft: 18,
    gap: 20,
    alignItems: "center" as const,
  },
  previewStat: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
  },
  previewStatDivider: {
    width: 0.5,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});
