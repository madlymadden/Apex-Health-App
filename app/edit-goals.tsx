import React, { useState, useEffect } from "react";
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

export default function EditGoalsScreen() {
  const insets = useSafeAreaInsets();
  const { goals, updateGoals } = useHealth();
  const [steps, setSteps] = useState(goals.steps.toString());
  const [calories, setCalories] = useState(goals.calories.toString());
  const [activeMinutes, setActiveMinutes] = useState(goals.activeMinutes.toString());
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(goals.weeklyWorkouts.toString());
  const [saving, setSaving] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setSteps(goals.steps.toString());
    setCalories(goals.calories.toString());
    setActiveMinutes(goals.activeMinutes.toString());
    setWeeklyWorkouts(goals.weeklyWorkouts.toString());
  }, [goals]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await updateGoals({
      steps: parseInt(steps) || 10000,
      calories: parseInt(calories) || 650,
      activeMinutes: parseInt(activeMinutes) || 45,
      weeklyWorkouts: parseInt(weeklyWorkouts) || 5,
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
            <Pressable onPress={() => router.back()} style={styles.headerButton}>
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>EDIT GOALS</Text>
            <Pressable
              onPress={handleSave}
              style={[styles.headerButton, saving && { opacity: 0.3 }]}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={22} color={Colors.white} />
            </Pressable>
          </View>

          <GoalInput
            icon="walk-outline"
            label="DAILY STEPS"
            value={steps}
            onChangeText={setSteps}
            unit="steps"
          />
          <View style={styles.divider} />
          <GoalInput
            icon="flame-outline"
            label="CALORIE TARGET"
            value={calories}
            onChangeText={setCalories}
            unit="kcal"
          />
          <View style={styles.divider} />
          <GoalInput
            icon="timer-outline"
            label="ACTIVE MINUTES"
            value={activeMinutes}
            onChangeText={setActiveMinutes}
            unit="min / day"
          />
          <View style={styles.divider} />
          <GoalInput
            icon="fitness-outline"
            label="WEEKLY WORKOUTS"
            value={weeklyWorkouts}
            onChangeText={setWeeklyWorkouts}
            unit="per week"
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function GoalInput({
  icon,
  label,
  value,
  onChangeText,
  unit,
}: {
  icon: string;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  unit: string;
}) {
  return (
    <View style={styles.goalRow}>
      <View style={styles.goalHeader}>
        <Ionicons name={icon as any} size={16} color={Colors.muted} />
        <Text style={styles.goalLabel}>{label}</Text>
      </View>
      <View style={styles.goalInputRow}>
        <TextInput
          style={styles.goalInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          selectionColor={Colors.white}
          placeholderTextColor={Colors.muted}
        />
        <Text style={styles.goalUnit}>{unit}</Text>
      </View>
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
    marginBottom: 44,
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
  goalRow: {
    paddingVertical: 24,
  },
  goalHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  goalInputRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 10,
  },
  goalInput: {
    fontSize: 42,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
    minWidth: 80,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  goalUnit: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
});
