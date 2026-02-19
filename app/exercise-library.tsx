import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

type Difficulty = "beginner" | "intermediate" | "advanced";
type MuscleGroup = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
  difficulty: Difficulty;
  description: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tips: [string, string, string];
}

const EXERCISES: Exercise[] = [
  { id: "1", name: "Bench Press", muscleGroup: "Chest", equipment: "Barbell", difficulty: "intermediate", description: "A compound pressing movement targeting the chest, performed lying on a flat bench.", primaryMuscles: ["Pectoralis Major"], secondaryMuscles: ["Anterior Deltoid", "Triceps"], tips: ["Keep shoulder blades retracted and depressed", "Plant feet firmly on the floor", "Lower the bar to mid-chest level"] },
  { id: "2", name: "Incline Dumbbell Press", muscleGroup: "Chest", equipment: "Dumbbells", difficulty: "intermediate", description: "An incline pressing variation that emphasizes the upper chest fibers.", primaryMuscles: ["Upper Pectoralis Major"], secondaryMuscles: ["Anterior Deltoid", "Triceps"], tips: ["Set bench to 30-45 degree angle", "Press dumbbells up and slightly inward", "Control the eccentric phase"] },
  { id: "3", name: "Cable Flye", muscleGroup: "Chest", equipment: "Cable", difficulty: "beginner", description: "An isolation movement for the chest using cables for constant tension.", primaryMuscles: ["Pectoralis Major"], secondaryMuscles: ["Anterior Deltoid"], tips: ["Maintain a slight bend in elbows throughout", "Squeeze chest at peak contraction", "Keep torso upright and stable"] },
  { id: "4", name: "Dips", muscleGroup: "Chest", equipment: "Bodyweight", difficulty: "intermediate", description: "A compound bodyweight exercise targeting chest and triceps.", primaryMuscles: ["Pectoralis Major", "Triceps"], secondaryMuscles: ["Anterior Deltoid"], tips: ["Lean forward slightly to target chest more", "Lower until upper arms are parallel to floor", "Avoid flaring elbows excessively"] },
  { id: "5", name: "Deadlift", muscleGroup: "Back", equipment: "Barbell", difficulty: "advanced", description: "A foundational compound lift that targets the entire posterior chain.", primaryMuscles: ["Erector Spinae", "Glutes", "Hamstrings"], secondaryMuscles: ["Trapezius", "Forearms", "Lats"], tips: ["Maintain a neutral spine throughout the lift", "Drive through your heels", "Keep the bar close to your body"] },
  { id: "6", name: "Pull-Up", muscleGroup: "Back", equipment: "Bodyweight", difficulty: "intermediate", description: "A vertical pulling movement targeting the lats and upper back.", primaryMuscles: ["Latissimus Dorsi"], secondaryMuscles: ["Biceps", "Rear Deltoid", "Rhomboids"], tips: ["Initiate the pull by depressing your scapulae", "Pull your chin above the bar", "Avoid excessive kipping or swinging"] },
  { id: "7", name: "Barbell Row", muscleGroup: "Back", equipment: "Barbell", difficulty: "intermediate", description: "A horizontal pulling movement for back thickness and strength.", primaryMuscles: ["Latissimus Dorsi", "Rhomboids"], secondaryMuscles: ["Biceps", "Rear Deltoid", "Erector Spinae"], tips: ["Hinge at hips to roughly 45 degrees", "Pull the bar toward your lower ribcage", "Squeeze shoulder blades together at the top"] },
  { id: "8", name: "Lat Pulldown", muscleGroup: "Back", equipment: "Cable", difficulty: "beginner", description: "A cable-based vertical pull targeting the latissimus dorsi.", primaryMuscles: ["Latissimus Dorsi"], secondaryMuscles: ["Biceps", "Teres Major"], tips: ["Lean back slightly and pull to upper chest", "Focus on driving elbows down", "Avoid using momentum"] },
  { id: "9", name: "Seated Cable Row", muscleGroup: "Back", equipment: "Cable", difficulty: "beginner", description: "A horizontal cable pull for mid-back development.", primaryMuscles: ["Rhomboids", "Middle Trapezius"], secondaryMuscles: ["Latissimus Dorsi", "Biceps"], tips: ["Sit upright with chest proud", "Pull handle to your abdomen", "Pause briefly at peak contraction"] },
  { id: "10", name: "Squat", muscleGroup: "Legs", equipment: "Barbell", difficulty: "intermediate", description: "The king of lower body exercises, targeting quads, glutes, and hamstrings.", primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstrings", "Erector Spinae", "Core"], tips: ["Keep your chest up and core braced", "Push knees out over toes", "Descend until thighs are at least parallel"] },
  { id: "11", name: "Romanian Deadlift", muscleGroup: "Legs", equipment: "Barbell", difficulty: "intermediate", description: "A hip-hinge movement emphasizing the hamstrings and glutes.", primaryMuscles: ["Hamstrings", "Glutes"], secondaryMuscles: ["Erector Spinae", "Forearms"], tips: ["Maintain a slight knee bend throughout", "Push hips back as far as possible", "Feel the stretch in your hamstrings"] },
  { id: "12", name: "Leg Press", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner", description: "A machine-based compound leg exercise for quad and glute development.", primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstrings"], tips: ["Place feet shoulder-width on the platform", "Lower until knees reach 90 degrees", "Do not lock out knees at the top"] },
  { id: "13", name: "Walking Lunge", muscleGroup: "Legs", equipment: "Dumbbells", difficulty: "intermediate", description: "A unilateral leg exercise that builds balance and lower body strength.", primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstrings", "Core"], tips: ["Take long, controlled steps", "Keep torso upright throughout", "Drive through the front heel"] },
  { id: "14", name: "Leg Curl", muscleGroup: "Legs", equipment: "Machine", difficulty: "beginner", description: "An isolation exercise targeting the hamstrings.", primaryMuscles: ["Hamstrings"], secondaryMuscles: ["Calves"], tips: ["Control the weight on both phases", "Avoid lifting hips off the pad", "Squeeze hamstrings at full contraction"] },
  { id: "15", name: "Overhead Press", muscleGroup: "Shoulders", equipment: "Barbell", difficulty: "intermediate", description: "A standing barbell press for overall shoulder strength and size.", primaryMuscles: ["Anterior Deltoid", "Medial Deltoid"], secondaryMuscles: ["Triceps", "Upper Trapezius", "Core"], tips: ["Brace your core and squeeze glutes", "Press the bar in a straight path overhead", "Avoid excessive arching of the lower back"] },
  { id: "16", name: "Lateral Raise", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "beginner", description: "An isolation exercise for the medial deltoid to build shoulder width.", primaryMuscles: ["Medial Deltoid"], secondaryMuscles: ["Anterior Deltoid", "Upper Trapezius"], tips: ["Raise arms to shoulder height only", "Lead with your elbows, not hands", "Use a controlled tempo throughout"] },
  { id: "17", name: "Face Pull", muscleGroup: "Shoulders", equipment: "Cable", difficulty: "beginner", description: "A cable exercise targeting rear deltoids and external rotators.", primaryMuscles: ["Rear Deltoid", "Infraspinatus"], secondaryMuscles: ["Rhomboids", "Middle Trapezius"], tips: ["Pull the rope to eye level", "Externally rotate at the end of the pull", "Keep elbows high throughout the movement"] },
  { id: "18", name: "Arnold Press", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "intermediate", description: "A rotational pressing movement that targets all three deltoid heads.", primaryMuscles: ["Anterior Deltoid", "Medial Deltoid"], secondaryMuscles: ["Triceps", "Rear Deltoid"], tips: ["Start with palms facing you at chin level", "Rotate palms outward as you press up", "Control the rotation on the way down"] },
  { id: "19", name: "Barbell Curl", muscleGroup: "Arms", equipment: "Barbell", difficulty: "beginner", description: "A classic bicep exercise using a straight or EZ bar.", primaryMuscles: ["Biceps Brachii"], secondaryMuscles: ["Brachialis", "Forearms"], tips: ["Keep elbows pinned to your sides", "Avoid swinging or using momentum", "Squeeze biceps hard at the top"] },
  { id: "20", name: "Tricep Pushdown", muscleGroup: "Arms", equipment: "Cable", difficulty: "beginner", description: "A cable isolation exercise for the triceps.", primaryMuscles: ["Triceps"], secondaryMuscles: ["Anconeus"], tips: ["Keep upper arms stationary at your sides", "Fully extend arms at the bottom", "Control the return to starting position"] },
  { id: "21", name: "Hammer Curl", muscleGroup: "Arms", equipment: "Dumbbells", difficulty: "beginner", description: "A neutral-grip curl variation targeting the brachialis and forearms.", primaryMuscles: ["Brachialis", "Biceps Brachii"], secondaryMuscles: ["Brachioradialis"], tips: ["Maintain a neutral wrist position throughout", "Curl both dumbbells simultaneously or alternate", "Keep elbows close to your torso"] },
  { id: "22", name: "Skull Crusher", muscleGroup: "Arms", equipment: "Barbell", difficulty: "intermediate", description: "A lying tricep extension for building arm mass.", primaryMuscles: ["Triceps"], secondaryMuscles: ["Anconeus"], tips: ["Lower the bar to your forehead or just behind", "Keep elbows pointing to the ceiling", "Use a controlled tempo to protect the elbows"] },
  { id: "23", name: "Plank", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "beginner", description: "An isometric core exercise that develops stability and endurance.", primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"], secondaryMuscles: ["Obliques", "Erector Spinae", "Shoulders"], tips: ["Maintain a straight line from head to heels", "Engage your glutes and brace your core", "Avoid letting hips sag or pike up"] },
  { id: "24", name: "Hanging Leg Raise", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "advanced", description: "An advanced core exercise performed hanging from a bar.", primaryMuscles: ["Rectus Abdominis", "Hip Flexors"], secondaryMuscles: ["Obliques", "Forearms"], tips: ["Avoid swinging—use controlled movement", "Raise legs to at least parallel", "Curl pelvis up for full ab engagement"] },
  { id: "25", name: "Cable Woodchop", muscleGroup: "Core", equipment: "Cable", difficulty: "intermediate", description: "A rotational core exercise using a cable machine.", primaryMuscles: ["Obliques", "Transverse Abdominis"], secondaryMuscles: ["Rectus Abdominis", "Shoulders"], tips: ["Rotate through your torso, not arms", "Keep arms extended throughout the movement", "Control the return phase slowly"] },
  { id: "26", name: "Ab Rollout", muscleGroup: "Core", equipment: "Bodyweight", difficulty: "advanced", description: "An anti-extension core exercise using a wheel or barbell.", primaryMuscles: ["Rectus Abdominis", "Transverse Abdominis"], secondaryMuscles: ["Latissimus Dorsi", "Shoulders"], tips: ["Start on your knees and extend gradually", "Keep your core tight to prevent lower back sag", "Roll out only as far as you can control"] },
  { id: "27", name: "Bulgarian Split Squat", muscleGroup: "Legs", equipment: "Dumbbells", difficulty: "advanced", description: "A single-leg squat variation with the rear foot elevated.", primaryMuscles: ["Quadriceps", "Glutes"], secondaryMuscles: ["Hamstrings", "Core"], tips: ["Keep front shin as vertical as possible", "Lower until rear knee nearly touches the floor", "Maintain an upright torso"] },
  { id: "28", name: "Rear Delt Flye", muscleGroup: "Shoulders", equipment: "Dumbbells", difficulty: "beginner", description: "An isolation exercise for the rear deltoids performed bent over.", primaryMuscles: ["Rear Deltoid"], secondaryMuscles: ["Rhomboids", "Middle Trapezius"], tips: ["Hinge forward at the hips with flat back", "Raise arms out to the sides with slight bend", "Focus on squeezing shoulder blades together"] },
];

const MUSCLE_GROUPS = ["ALL", "CHEST", "BACK", "LEGS", "SHOULDERS", "ARMS", "CORE"] as const;

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  beginner: Colors.green,
  intermediate: Colors.white,
  advanced: Colors.red,
};

export default function ExerciseLibraryScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredExercises = useMemo(() => {
    let result = EXERCISES;
    if (selectedGroup !== "ALL") {
      result = result.filter(
        (e) => e.muscleGroup.toUpperCase() === selectedGroup
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }
    return result;
  }, [selectedGroup, searchQuery]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFilterPress = (group: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGroup(group);
  };

  const handleExercisePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Animated.View entering={FadeIn} style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={16}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.title}>Exercises</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          placeholderTextColor={Colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={Colors.white}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterScroll}
      >
        {MUSCLE_GROUPS.map((group) => (
          <Pressable
            key={group}
            onPress={() => handleFilterPress(group)}
            style={[
              styles.filterPill,
              selectedGroup === group ? styles.filterPillActive : styles.filterPillInactive,
            ]}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedGroup === group ? styles.filterPillTextActive : styles.filterPillTextInactive,
              ]}
            >
              {group}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.countContainer}>
        <Text style={styles.countLabel}>
          {filteredExercises.length} EXERCISE{filteredExercises.length !== 1 ? "S" : ""}
        </Text>
      </View>

      <View style={styles.divider} />

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        {filteredExercises.map((exercise, index) => (
          <Animated.View
            key={exercise.id}
            entering={FadeInDown.delay(Math.min(index, 10) * 50)}
          >
            <Pressable onPress={() => handleExercisePress(exercise.id)} style={styles.exerciseRow}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseMeta}>
                  {exercise.muscleGroup.toUpperCase()}  ·  {exercise.equipment.toUpperCase()}
                </Text>
              </View>
              <View style={styles.exerciseRight}>
                <View
                  style={[
                    styles.difficultyDot,
                    { backgroundColor: DIFFICULTY_COLORS[exercise.difficulty] },
                  ]}
                />
                <Ionicons
                  name={expandedId === exercise.id ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={Colors.muted}
                />
              </View>
            </Pressable>

            {expandedId === exercise.id && (
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>DESCRIPTION</Text>
                <Text style={styles.detailText}>{exercise.description}</Text>

                <Text style={styles.detailLabel}>PRIMARY MUSCLES</Text>
                <Text style={styles.detailText}>{exercise.primaryMuscles.join(", ")}</Text>

                <Text style={styles.detailLabel}>SECONDARY MUSCLES</Text>
                <Text style={styles.detailText}>{exercise.secondaryMuscles.join(", ")}</Text>

                <Text style={styles.detailLabel}>TIPS</Text>
                {exercise.tips.map((tip, i) => (
                  <Text key={i} style={styles.tipText}>
                    {i + 1}. {tip}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.divider} />
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.charcoal,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    height: 44,
  },
  filterScroll: {
    flexGrow: 0,
    marginTop: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.white,
  },
  filterPillInactive: {
    backgroundColor: Colors.charcoal,
  },
  filterPillText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 2,
  },
  filterPillTextActive: {
    color: Colors.deepBlack,
  },
  filterPillTextInactive: {
    color: Colors.muted,
  },
  countContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  countLabel: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
  },
  list: {
    flex: 1,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  exerciseMeta: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  exerciseRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  difficultyDot: {
    width: 8,
    height: 8,
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 6,
  },
  detailLabel: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: 10,
  },
  detailText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    lineHeight: 20,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.secondaryText,
    lineHeight: 20,
    paddingLeft: 4,
  },
});
