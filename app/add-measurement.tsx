import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  placeholder: string;
}

const FIELDS: MeasurementField[] = [
  { key: "weight", label: "Weight", unit: "lbs", placeholder: "172.4" },
  { key: "bodyFat", label: "Body Fat", unit: "%", placeholder: "18.2" },
  { key: "chest", label: "Chest", unit: "in", placeholder: "42.0" },
  { key: "waist", label: "Waist", unit: "in", placeholder: "33.5" },
  { key: "hips", label: "Hips", unit: "in", placeholder: "38.0" },
  { key: "biceps", label: "Biceps", unit: "in", placeholder: "15.0" },
  { key: "thighs", label: "Thighs", unit: "in", placeholder: "24.0" },
  { key: "neck", label: "Neck", unit: "in", placeholder: "16.0" },
];

export default function AddMeasurementScreen() {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleSave = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaved(true);
    setTimeout(() => router.back(), 800);
  };

  const hasValues = Object.values(values).some((v) => v.trim() !== "");

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
        keyboardShouldPersistTaps="handled"
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
              <Ionicons name="close" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>LOG MEASUREMENT</Text>
            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, !hasValues && { opacity: 0.3 }]}
              disabled={!hasValues}
            >
              <Ionicons name="checkmark" size={22} color={hasValues ? Colors.teal : Colors.muted} />
            </Pressable>
          </View>

          {saved ? (
            <View style={styles.savedState}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.green} />
              <Text style={styles.savedText}>Measurement Logged</Text>
            </View>
          ) : (
            <>
              <Text style={styles.dateLabel}>{dateString.toUpperCase()}</Text>

              <View style={styles.divider} />

              {FIELDS.map((field, i) => (
                <Animated.View key={field.key} entering={FadeInDown.delay(i * 40).duration(300)}>
                  <View style={styles.fieldRow}>
                    <View style={styles.fieldLeft}>
                      <Text style={styles.fieldLabel}>{field.label.toUpperCase()}</Text>
                      <Text style={styles.fieldUnit}>{field.unit}</Text>
                    </View>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder={field.placeholder}
                      placeholderTextColor={Colors.border}
                      keyboardType="decimal-pad"
                      value={values[field.key] || ""}
                      onChangeText={(text) =>
                        setValues((prev) => ({ ...prev, [field.key]: text }))
                      }
                    />
                  </View>
                  {i < FIELDS.length - 1 && <View style={styles.rowDivider} />}
                </Animated.View>
              ))}

              <View style={styles.divider} />

              <View style={styles.tipSection}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>
                  Measure at the same time each day for the most consistent tracking. Morning measurements after waking are recommended.
                </Text>
              </View>
            </>
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
  saveButton: { width: 32, height: 32, alignItems: "center" as const, justifyContent: "center" as const },
  dateLabel: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted, letterSpacing: 2, textAlign: "center" as const, marginBottom: 8 },
  divider: { height: 0.5, backgroundColor: Colors.border, marginVertical: 24 },
  fieldRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: 14 },
  fieldLeft: { flexDirection: "row" as const, alignItems: "baseline" as const, gap: 6 },
  fieldLabel: { fontSize: 11, fontFamily: "Outfit_300Light", color: Colors.lightText, letterSpacing: 2 },
  fieldUnit: { fontSize: 10, fontFamily: "Outfit_300Light", color: Colors.muted },
  fieldInput: { fontSize: 22, fontFamily: "Outfit_300Light", color: Colors.white, textAlign: "right" as const, minWidth: 80, letterSpacing: -0.5 },
  rowDivider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.06)" },
  savedState: { alignItems: "center" as const, justifyContent: "center" as const, paddingVertical: 80, gap: 16 },
  savedText: { fontSize: 18, fontFamily: "Outfit_300Light", color: Colors.white, letterSpacing: -0.3 },
  tipSection: { flexDirection: "row" as const, gap: 10, alignItems: "flex-start" as const },
  tipDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.teal, marginTop: 6 },
  tipText: { fontSize: 13, fontFamily: "Outfit_300Light", color: Colors.muted, lineHeight: 20, flex: 1, letterSpacing: 0.2 },
});
