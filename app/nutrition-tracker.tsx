import React, { useState } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FoodItem[];
}

const CALORIE_GOAL = 2200;
const PROTEIN_GOAL = 150;
const CARBS_GOAL = 250;
const FAT_GOAL = 75;

const MEALS: Meal[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    time: "7:30 AM",
    icon: "sunny-outline",
    items: [
      { name: "Greek Yogurt", calories: 130, protein: 15, carbs: 9, fat: 4, serving: "170g" },
      { name: "Granola", calories: 210, protein: 5, carbs: 34, fat: 7, serving: "50g" },
      { name: "Blueberries", calories: 42, protein: 1, carbs: 11, fat: 0, serving: "75g" },
      { name: "Black Coffee", calories: 5, protein: 0, carbs: 1, fat: 0, serving: "240ml" },
    ],
  },
  {
    id: "lunch",
    name: "Lunch",
    time: "12:15 PM",
    icon: "partly-sunny-outline",
    items: [
      { name: "Grilled Chicken Breast", calories: 284, protein: 53, carbs: 0, fat: 6, serving: "200g" },
      { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 2, serving: "195g" },
      { name: "Steamed Broccoli", calories: 55, protein: 4, carbs: 11, fat: 1, serving: "150g" },
      { name: "Olive Oil Dressing", calories: 72, protein: 0, carbs: 0, fat: 8, serving: "1 tbsp" },
    ],
  },
  {
    id: "dinner",
    name: "Dinner",
    time: "7:00 PM",
    icon: "moon-outline",
    items: [
      { name: "Atlantic Salmon", calories: 312, protein: 34, carbs: 0, fat: 18, serving: "170g" },
      { name: "Sweet Potato", calories: 103, protein: 2, carbs: 24, fat: 0, serving: "130g" },
      { name: "Mixed Green Salad", calories: 35, protein: 2, carbs: 6, fat: 0, serving: "100g" },
      { name: "Lemon Vinaigrette", calories: 45, protein: 0, carbs: 2, fat: 4, serving: "1 tbsp" },
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    time: "3:30 PM",
    icon: "cafe-outline",
    items: [
      { name: "Almonds", calories: 164, protein: 6, carbs: 6, fat: 14, serving: "28g" },
      { name: "Protein Bar", calories: 190, protein: 20, carbs: 22, fat: 6, serving: "1 bar" },
    ],
  },
];

function SpringPress({
  children,
  onPress,
  style,
  scaleDown = 0.96,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  scaleDown?: number;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
        if (Platform.OS !== "web")
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
    >
      <Animated.View style={[style, animStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

function MacroRing({
  consumed,
  goal,
  color,
  label,
}: {
  consumed: number;
  goal: number;
  color: string;
  label: string;
}) {
  const size = 44;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(consumed / goal, 1);
  const strokeDashoffset = circumference * (1 - ratio);

  return (
    <View style={{ alignItems: "center" as const }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={s.ringValue}>
        {consumed}
        <Text style={s.ringGoal}>/{goal}g</Text>
      </Text>
      <Text style={s.ringLabel}>{label}</Text>
    </View>
  );
}

function MealTimelineCard({ meal, index }: { meal: Meal; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const totalCalories = meal.items.reduce((sum, i) => sum + i.calories, 0);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(350)}
      style={s.timelineRow}
    >
      <View style={s.timelineLeft}>
        <Text style={s.timelineTime}>{meal.time}</Text>
        <View style={s.timelineLine} />
      </View>
      <SpringPress
        onPress={() => setExpanded(!expanded)}
        style={s.mealCard}
        scaleDown={0.97}
      >
        <View style={s.mealCardHeader}>
          <View style={s.mealCardLeft}>
            <View style={s.mealIconWrap}>
              <Ionicons name={meal.icon} size={16} color={Colors.teal} />
            </View>
            <View>
              <Text style={s.mealName}>{meal.name}</Text>
              <Text style={s.mealTime}>{meal.time}</Text>
            </View>
          </View>
          <View style={s.mealCardRight}>
            <Text style={s.mealCal}>{totalCalories}</Text>
            <Text style={s.mealCalUnit}>kcal</Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={14}
              color={Colors.muted}
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
        {expanded && (
          <View style={s.mealItems}>
            {meal.items.map((item, i) => (
              <View key={i}>
                {i > 0 && <View style={s.itemDivider} />}
                <View style={s.itemRow}>
                  <View style={s.itemLeft}>
                    <View style={s.itemDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.itemName}>{item.name}</Text>
                      <Text style={s.itemServing}>{item.serving}</Text>
                    </View>
                  </View>
                  <View style={s.itemRight}>
                    <Text style={s.itemCal}>{item.calories} kcal</Text>
                    <View style={s.itemMacros}>
                      <Text style={s.itemMacro}>P {item.protein}</Text>
                      <Text style={s.itemMacro}>C {item.carbs}</Text>
                      <Text style={s.itemMacro}>F {item.fat}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </SpringPress>
    </Animated.View>
  );
}

function MacroDetailCard({
  label,
  grams,
  goal,
  percentage,
  color,
}: {
  label: string;
  grams: number;
  goal: number;
  percentage: number;
  color: string;
}) {
  const ratio = Math.min(grams / goal, 1);
  return (
    <View style={s.macroDetailCard}>
      <View style={s.macroDetailTop}>
        <Text style={s.macroDetailLabel}>{label}</Text>
        <Text style={s.macroDetailPct}>{percentage}%</Text>
      </View>
      <Text style={s.macroDetailGrams}>
        {grams}g
        <Text style={s.macroDetailGoal}> / {goal}g</Text>
      </Text>
      <View style={s.macroDetailTrack}>
        <View
          style={[
            s.macroDetailFill,
            { width: `${ratio * 100}%` as any, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}

function QuickStatCard({
  label,
  value,
  unit,
  progress,
}: {
  label: string;
  value: string;
  unit: string;
  progress: number;
}) {
  return (
    <View style={s.quickStatCard}>
      <Text style={s.quickStatLabel}>{label}</Text>
      <Text style={s.quickStatValue}>
        {value}
        <Text style={s.quickStatUnit}> {unit}</Text>
      </Text>
      <View style={s.quickStatTrack}>
        <View
          style={[
            s.quickStatFill,
            { width: `${Math.min(progress, 1) * 100}%` as any },
          ]}
        />
      </View>
    </View>
  );
}

export default function NutritionTrackerScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const totalCalories = MEALS.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
    0
  );
  const totalProtein = MEALS.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0),
    0
  );
  const totalCarbs = MEALS.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0),
    0
  );
  const totalFat = MEALS.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0),
    0
  );

  const totalMacroCals = totalProtein * 4 + totalCarbs * 4 + totalFat * 9;
  const proteinPct =
    totalMacroCals > 0 ? Math.round((totalProtein * 4 / totalMacroCals) * 100) : 0;
  const carbsPct =
    totalMacroCals > 0 ? Math.round((totalCarbs * 4 / totalMacroCals) * 100) : 0;
  const fatPct =
    totalMacroCals > 0 ? Math.round((totalFat * 9 / totalMacroCals) * 100) : 0;

  const calorieRatio = Math.min(totalCalories / CALORIE_GOAL, 1);

  return (
    <View style={s.container}>
      <ScrollView
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingTop: insets.top + webTopInset + 12,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={() => {
          if (Platform.OS !== "web")
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <View style={s.header}>
          <SpringPress
            onPress={() => router.back()}
            style={s.backBtn}
          >
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </SpringPress>
          <View style={{ width: 32 }} />
        </View>

        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={s.sectionHeader}>TODAY'S NUTRITION</Text>

          <View style={s.heroCalorieRow}>
            <Text style={s.heroCalorie}>{totalCalories.toLocaleString()}</Text>
            <Text style={s.heroGoal}>/{CALORIE_GOAL}</Text>
          </View>

          <View style={s.progressTrack}>
            <Animated.View
              style={[
                s.progressFill,
                { width: `${calorieRatio * 100}%` as any },
              ]}
            />
          </View>

          <View style={s.macroRingsRow}>
            <MacroRing
              consumed={totalProtein}
              goal={PROTEIN_GOAL}
              color={Colors.teal}
              label="PROTEIN"
            />
            <MacroRing
              consumed={totalCarbs}
              goal={CARBS_GOAL}
              color={Colors.white}
              label="CARBS"
            />
            <MacroRing
              consumed={totalFat}
              goal={FAT_GOAL}
              color={Colors.gold}
              label="FAT"
            />
          </View>
        </Animated.View>

        <View style={s.divider} />

        <Text style={s.sectionHeader}>MEALS</Text>
        <View style={s.timelineContainer}>
          {MEALS.map((meal, i) => (
            <MealTimelineCard key={meal.id} meal={meal} index={i} />
          ))}
        </View>

        <View style={s.divider} />

        <Text style={s.sectionHeader}>MACRONUTRIENTS</Text>
        <View style={s.macroDetailSection}>
          <MacroDetailCard
            label="PROTEIN"
            grams={totalProtein}
            goal={PROTEIN_GOAL}
            percentage={proteinPct}
            color={Colors.teal}
          />
          <MacroDetailCard
            label="CARBS"
            grams={totalCarbs}
            goal={CARBS_GOAL}
            percentage={carbsPct}
            color={Colors.white}
          />
          <MacroDetailCard
            label="FAT"
            grams={totalFat}
            goal={FAT_GOAL}
            percentage={fatPct}
            color={Colors.gold}
          />
        </View>

        <View style={s.divider} />

        <Text style={s.sectionHeader}>TODAY'S OVERVIEW</Text>
        <View style={s.quickStatsGrid}>
          <View style={s.quickStatsRow}>
            <QuickStatCard label="FIBER" value="24" unit="g" progress={0.8} />
            <QuickStatCard label="WATER" value="2.1" unit="L" progress={0.7} />
          </View>
          <View style={s.quickStatsRow}>
            <QuickStatCard label="SODIUM" value="1,840" unit="mg" progress={0.6} />
            <QuickStatCard label="SUGAR" value="38" unit="g" progress={0.5} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 28,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sectionHeader: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    textTransform: "uppercase" as const,
    marginBottom: 16,
  },
  heroCalorieRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
  },
  heroCalorie: {
    fontSize: 48,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -2,
  },
  heroGoal: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: -0.5,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.charcoal,
    borderRadius: 2,
    marginBottom: 28,
    overflow: "hidden" as const,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.gold,
    borderRadius: 2,
  },
  macroRingsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  ringValue: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    marginTop: 6,
    letterSpacing: -0.3,
  },
  ringGoal: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  ringLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: 28,
  },
  timelineContainer: {},
  timelineRow: {
    flexDirection: "row" as const,
    marginBottom: 12,
  },
  timelineLeft: {
    width: 56,
    alignItems: "center" as const,
    paddingTop: 16,
  },
  timelineTime: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  timelineLine: {
    flex: 1,
    width: 0.5,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  mealCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  mealCardHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  mealCardLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  mealIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(90,200,212,0.08)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  mealName: {
    fontSize: 15,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.2,
  },
  mealTime: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  mealCardRight: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
  },
  mealCal: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  mealCalUnit: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginLeft: 3,
  },
  mealItems: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  itemDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.04)",
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  itemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  itemDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.teal,
  },
  itemName: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.offWhite,
    letterSpacing: 0.2,
  },
  itemServing: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 1,
  },
  itemRight: {
    alignItems: "flex-end" as const,
  },
  itemCal: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  itemMacros: {
    flexDirection: "row" as const,
    gap: 6,
    marginTop: 2,
  },
  itemMacro: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  macroDetailSection: {
    gap: 10,
  },
  macroDetailCard: {
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
  },
  macroDetailTop: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 6,
  },
  macroDetailLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  macroDetailPct: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  macroDetailGrams: {
    fontSize: 18,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  macroDetailGoal: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  macroDetailTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 2,
    overflow: "hidden" as const,
  },
  macroDetailFill: {
    height: 3,
    borderRadius: 2,
  },
  quickStatsGrid: {
    gap: 10,
  },
  quickStatsRow: {
    flexDirection: "row" as const,
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
  },
  quickStatLabel: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 20,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  quickStatUnit: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  quickStatTrack: {
    height: 2,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 1,
    overflow: "hidden" as const,
  },
  quickStatFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.gold,
  },
});
