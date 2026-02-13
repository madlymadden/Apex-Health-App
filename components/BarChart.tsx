import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

interface BarChartProps {
  data: { day: string; value: number }[];
  color: string;
  goal?: number;
}

function AnimatedBar({
  value,
  maxValue,
  color,
  index,
}: {
  value: number;
  maxValue: number;
  color: string;
  index: number;
}) {
  const height = useSharedValue(0);

  useEffect(() => {
    height.value = withDelay(
      index * 80,
      withTiming((value / maxValue) * 100, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: `${height.value}%`,
  }));

  return (
    <View style={barStyles.barContainer}>
      <Animated.View
        style={[barStyles.bar, { backgroundColor: color }, animatedStyle]}
      />
    </View>
  );
}

export function BarChart({ data, color, goal }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), goal || 0) * 1.1;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.barsRow}>
        {data.map((item, index) => (
          <View key={item.day} style={barStyles.barWrapper}>
            <AnimatedBar
              value={item.value}
              maxValue={maxValue}
              color={color}
              index={index}
            />
            <Text style={barStyles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
      {goal && (
        <View
          style={[
            barStyles.goalLine,
            { bottom: `${(goal / maxValue) * 100}%` },
          ]}
        >
          <View style={barStyles.goalDash} />
        </View>
      )}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: {
    height: 160,
    position: "relative" as const,
  },
  barsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    height: 140,
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center" as const,
    height: "100%" as const,
  },
  barContainer: {
    flex: 1,
    width: 28,
    justifyContent: "flex-end" as const,
    borderRadius: 6,
    overflow: "hidden" as const,
  },
  bar: {
    width: "100%" as const,
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    color: Colors.lightGray,
    fontSize: 11,
    marginTop: 6,
    fontFamily: "Outfit_400Regular",
    letterSpacing: 0.5,
  },
  goalLine: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    height: 1,
  },
  goalDash: {
    height: 1,
    backgroundColor: Colors.goldDim,
    opacity: 0.4,
  },
});
