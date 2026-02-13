import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart as LineChartComponent } from 'react-native-chart-kit';
import Colors from '@/constants/colors';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showDots?: boolean;
  bezier?: boolean;
}

export function LineChart({
  data,
  width,
  height,
  color = Colors.teal,
  backgroundColor = 'transparent',
  label,
  showDots = true,
  bezier = true,
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.muted, fontFamily: 'Outfit_300Light' }}>
          No data available
        </Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map(point => point.label),
    datasets: [
      {
        data: data.map(point => point.value),
        color: (opacity = 1) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor,
    backgroundGradientFrom: Colors.deepBlack,
    backgroundGradientTo: Colors.deepBlack,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: showDots ? '4' : '0',
      strokeWidth: '2',
      stroke: color,
    },
    propsForLabels: {
      fontFamily: 'Outfit_300Light',
      fontSize: 10,
    },
  };

  return (
    <View>
      {label && (
        <Text style={{
          color: Colors.white,
          fontFamily: 'Outfit_300Light',
          fontSize: 12,
          marginBottom: 8,
          textAlign: 'center',
        }}>
          {label}
        </Text>
      )}
      <LineChartComponent
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        bezier={bezier}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        segments={4}
      />
    </View>
  );
}
