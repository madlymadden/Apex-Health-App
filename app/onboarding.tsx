import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";
import { setOnboardingDone, saveGoals } from "@/lib/storage";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TOTAL_STEPS = 4;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={styles.stepIndicator}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <StepDot key={i} active={i === currentStep} completed={i < currentStep} />
      ))}
    </View>
  );
}

function StepDot({ active, completed }: { active: boolean; completed: boolean }) {
  const width = useSharedValue(active ? 20 : 6);
  const bgOpacity = useSharedValue(active ? 1 : completed ? 0.5 : 0.15);

  useEffect(() => {
    width.value = withTiming(active ? 20 : 6, { duration: 300 });
    bgOpacity.value = withTiming(active ? 1 : completed ? 0.5 : 0.15, { duration: 300 });
  }, [active, completed]);

  const animStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: bgOpacity.value,
  }));

  return <Animated.View style={[styles.dot, animStyle]} />;
}

function PulsingRing() {
  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.3);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.2);
  const innerGlow = useSharedValue(0.4);

  useEffect(() => {
    scale1.value = withRepeat(
      withTiming(1.35, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
    scale2.value = withRepeat(
      withDelay(600,
        withTiming(1.5, { duration: 2800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    opacity2.value = withRepeat(
      withDelay(600,
        withTiming(0, { duration: 2800, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
    innerGlow.value = withRepeat(
      withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1, true
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: innerGlow.value,
  }));

  const ringSize = 140;
  const strokeWidth = 1.5;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={styles.pulsingRingContainer}>
      <Animated.View style={[styles.pulsingRingOuter, ring1Style]}>
        <View style={styles.pulsingRingCircle} />
      </Animated.View>
      <Animated.View style={[styles.pulsingRingOuter, ring2Style]}>
        <View style={[styles.pulsingRingCircle, { width: 160, height: 160, borderRadius: 80 }]} />
      </Animated.View>
      <Animated.View style={glowStyle}>
        <Svg width={ringSize} height={ringSize}>
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke={Colors.gold}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
            rotation="-90"
            origin={`${ringSize / 2}, ${ringSize / 2}`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function CompletionRing() {
  const progress = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    checkScale.value = withDelay(800, withSpring(1, { damping: 8, stiffness: 120 }));
    glowOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
  }, []);

  const ringSize = 120;
  const strokeWidth = 2;
  const radius = (ringSize - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.completionContainer}>
      <Animated.View style={[styles.completionGlow, glowStyle]} />
      <Svg width={ringSize} height={ringSize}>
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          stroke={Colors.gold}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * 0.001}
          strokeLinecap="round"
          rotation="-90"
          origin={`${ringSize / 2}, ${ringSize / 2}`}
        />
      </Svg>
      <Animated.View style={[styles.completionCheck, checkStyle]}>
        <Ionicons name="checkmark" size={36} color={Colors.gold} />
      </Animated.View>
    </View>
  );
}

function GoalRow({
  label,
  value,
  unit,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const handleMinus = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.max(min, value - step));
  };
  const handlePlus = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(Math.min(max, value + step));
  };

  return (
    <View style={styles.goalRow}>
      <View style={styles.goalLabelCol}>
        <Text style={styles.goalLabel}>{label}</Text>
        <Text style={styles.goalUnit}>{unit}</Text>
      </View>
      <View style={styles.goalControls}>
        <Pressable onPress={handleMinus} style={styles.goalBtn} hitSlop={8}>
          <Ionicons name="remove" size={18} color={Colors.white} />
        </Pressable>
        <Text style={styles.goalValue}>{value.toLocaleString()}</Text>
        <Pressable onPress={handlePlus} style={styles.goalBtn} hitSlop={8}>
          <Ionicons name="add" size={18} color={Colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

function GenderPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={[styles.genderPill, selected && styles.genderPillActive]}
    >
      <Text style={[styles.genderPillText, selected && styles.genderPillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function StepContent({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <Animated.View
      key={`step-${step}`}
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(200)}
      style={styles.stepContent}
    >
      {children}
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const [steps, setSteps] = useState(10000);
  const [calories, setCalories] = useState(650);
  const [activeMinutes, setActiveMinutes] = useState(45);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(5);

  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [weight, setWeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");

  const goNext = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleComplete = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await saveGoals({
      steps,
      calories,
      activeMinutes,
      weeklyWorkouts,
    });
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <StepIndicator currentStep={currentStep} />

      <View style={styles.body}>
        {currentStep === 0 && (
          <StepContent step={0}>
            <View style={styles.welcomeCenter}>
              <PulsingRing />
              <View style={styles.welcomeTextBlock}>
                <Text style={styles.welcomeTitle}>MADDEN</Text>
                <View style={styles.hairline} />
                <Text style={styles.welcomeSubtitle}>YOUR BODY. YOUR DATA.</Text>
              </View>
            </View>
          </StepContent>
        )}

        {currentStep === 1 && (
          <StepContent step={1}>
            <Text style={styles.sectionHeader}>SET YOUR GOALS</Text>
            <View style={styles.hairline} />
            <View style={styles.goalsCard}>
              <GoalRow label="DAILY STEPS" value={steps} unit="steps/day" step={500} min={1000} max={30000} onChange={setSteps} />
              <View style={styles.goalDivider} />
              <GoalRow label="ACTIVE CALORIES" value={calories} unit="cal/day" step={50} min={100} max={2000} onChange={setCalories} />
              <View style={styles.goalDivider} />
              <GoalRow label="ACTIVE MINUTES" value={activeMinutes} unit="min/day" step={5} min={10} max={120} onChange={setActiveMinutes} />
              <View style={styles.goalDivider} />
              <GoalRow label="WEEKLY WORKOUTS" value={weeklyWorkouts} unit="sessions/week" step={1} min={1} max={7} onChange={setWeeklyWorkouts} />
            </View>
          </StepContent>
        )}

        {currentStep === 2 && (
          <StepContent step={2}>
            <Text style={styles.sectionHeader}>KNOW YOUR BODY</Text>
            <View style={styles.hairline} />

            <View style={styles.formCard}>
              <View style={styles.formRow}>
                <Text style={styles.formLabel}>WEIGHT</Text>
                <View style={styles.formInputRow}>
                  <TextInput
                    style={styles.formInput}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    placeholder={weightUnit === "lbs" ? "175" : "80"}
                    placeholderTextColor="rgba(255,255,255,0.15)"
                  />
                  <View style={styles.unitToggle}>
                    <Pressable
                      onPress={() => {
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setWeightUnit("lbs");
                      }}
                      style={[styles.unitBtn, weightUnit === "lbs" && styles.unitBtnActive]}
                    >
                      <Text style={[styles.unitBtnText, weightUnit === "lbs" && styles.unitBtnTextActive]}>LBS</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setWeightUnit("kg");
                      }}
                      style={[styles.unitBtn, weightUnit === "kg" && styles.unitBtnActive]}
                    >
                      <Text style={[styles.unitBtnText, weightUnit === "kg" && styles.unitBtnTextActive]}>KG</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.goalDivider} />

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>HEIGHT</Text>
                {weightUnit === "lbs" ? (
                  <View style={styles.formInputRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={heightFt}
                      onChangeText={setHeightFt}
                      keyboardType="numeric"
                      placeholder="5"
                      placeholderTextColor="rgba(255,255,255,0.15)"
                    />
                    <Text style={styles.formUnitLabel}>FT</Text>
                    <TextInput
                      style={[styles.formInput, { flex: 1 }]}
                      value={heightIn}
                      onChangeText={setHeightIn}
                      keyboardType="numeric"
                      placeholder="10"
                      placeholderTextColor="rgba(255,255,255,0.15)"
                    />
                    <Text style={styles.formUnitLabel}>IN</Text>
                  </View>
                ) : (
                  <View style={styles.formInputRow}>
                    <TextInput
                      style={styles.formInput}
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="numeric"
                      placeholder="178"
                      placeholderTextColor="rgba(255,255,255,0.15)"
                    />
                    <Text style={styles.formUnitLabel}>CM</Text>
                  </View>
                )}
              </View>

              <View style={styles.goalDivider} />

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>AGE</Text>
                <View style={styles.formInputRow}>
                  <TextInput
                    style={styles.formInput}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    placeholder="28"
                    placeholderTextColor="rgba(255,255,255,0.15)"
                  />
                </View>
              </View>

              <View style={styles.goalDivider} />

              <View style={styles.formRow}>
                <Text style={styles.formLabel}>GENDER</Text>
                <View style={styles.genderRow}>
                  <GenderPill label="MALE" selected={gender === "Male"} onPress={() => setGender("Male")} />
                  <GenderPill label="FEMALE" selected={gender === "Female"} onPress={() => setGender("Female")} />
                  <GenderPill label="OTHER" selected={gender === "Other"} onPress={() => setGender("Other")} />
                </View>
              </View>
            </View>
          </StepContent>
        )}

        {currentStep === 3 && (
          <StepContent step={3}>
            <View style={styles.readyCenter}>
              <CompletionRing />
              <View style={styles.readyTextBlock}>
                <Text style={styles.readyTitle}>YOU'RE IN</Text>
                <View style={styles.hairline} />
                <Text style={styles.readyTagline}>COMMIT TO KNOWING</Text>
              </View>
            </View>
          </StepContent>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24) }]}>
        {currentStep < TOTAL_STEPS - 1 ? (
          <Pressable
            onPress={goNext}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.primaryBtnText}>
              {currentStep === 0 ? "BEGIN" : "CONTINUE"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleComplete}
            style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.primaryBtnText}>START TRACKING</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.white,
  },
  body: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
  },
  pulsingRingContainer: {
    width: 160,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
  },
  pulsingRingOuter: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  pulsingRingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 0.5,
    borderColor: "rgba(212,175,55,0.25)",
  },
  welcomeTextBlock: {
    alignItems: "center",
    gap: 16,
  },
  welcomeTitle: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 12,
  },
  hairline: {
    width: 40,
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 5,
  },
  sectionHeader: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  goalsCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  goalLabelCol: {
    gap: 2,
  },
  goalLabel: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: 2,
  },
  goalUnit: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 1,
  },
  goalControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  goalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  goalValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    minWidth: 64,
    textAlign: "center",
  },
  goalDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  formCard: {
    backgroundColor: Colors.charcoal,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  formRow: {
    paddingVertical: 14,
    gap: 10,
  },
  formLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  formInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  formInput: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    minWidth: 80,
    flex: 2,
  },
  formUnitLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  unitToggle: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  unitBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  unitBtnActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  unitBtnText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  unitBtnTextActive: {
    color: Colors.gold,
  },
  genderRow: {
    flexDirection: "row",
    gap: 8,
  },
  genderPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  genderPillActive: {
    borderColor: Colors.gold,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  genderPillText: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  genderPillTextActive: {
    color: Colors.gold,
  },
  readyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 48,
  },
  completionContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  completionGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  completionCheck: {
    position: "absolute",
  },
  readyTextBlock: {
    alignItems: "center",
    gap: 16,
  },
  readyTitle: {
    fontSize: 44,
    fontFamily: "Outfit_300Light",
    color: Colors.gold,
    letterSpacing: 8,
  },
  readyTagline: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 5,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.gold,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.deepBlack,
    letterSpacing: 4,
  },
});
