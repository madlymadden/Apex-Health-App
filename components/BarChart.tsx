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
  width?: number;
  height?: number;
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
      index * 60,
      withTiming((value / maxValue) * 100, {
        duration: 900,
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
  const maxValue = Math.max(...data.map((d) => d.value), goal || 0) * 1.15;

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
    height: 180,
    position: "relative" as const,
  },
  barsRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
    height: 160,
    paddingHorizontal: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center" as const,
    height: "100%" as const,
  },
  barContainer: {
    flex: 1,
    width: 24,
    justifyContent: "flex-end" as const,
  },
  bar: {
    width: "100%" as const,
    minHeight: 2,
  },
  dayLabel: {
    color: Colors.muted,
    fontSize: 10,
    marginTop: 8,
    fontFamily: "Outfit_300Light",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  goalLine: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    height: 1,
  },
  goalDash: {
    height: 1,
    backgroundColor: Colors.muted,
    opacity: 0.3,
  },
});
