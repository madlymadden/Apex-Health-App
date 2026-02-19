import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import Colors from "@/constants/colors";
import { getApiUrl } from "@/lib/query-client";

type ScanContext = "general" | "body" | "nutrition" | "supplement" | "workout";

interface ScanResult {
  detected_type: string;
  confidence: number;
  title: string;
  extracted_data: { label: string; value: string; unit: string }[];
  summary: string;
  suggestions: string[];
}

const CONTEXT_CONFIG: Record<ScanContext, { label: string; icon: keyof typeof Ionicons.glyphMap; hint: string; color: string }> = {
  general: {
    label: "AUTO-DETECT",
    icon: "sparkles-outline",
    hint: "Point at anything health or fitness related",
    color: Colors.teal,
  },
  body: {
    label: "BODY & WEIGHT",
    icon: "body-outline",
    hint: "Scan scales, InBody, EquiFit, or DEXA reports",
    color: "#5AC8D4",
  },
  nutrition: {
    label: "NUTRITION",
    icon: "nutrition-outline",
    hint: "Scan food labels, menus, or meal containers",
    color: "#4CD964",
  },
  supplement: {
    label: "SUPPLEMENTS",
    icon: "medical-outline",
    hint: "Scan supplement bottles or vitamin labels",
    color: "#D4AF37",
  },
  workout: {
    label: "EQUIPMENT",
    icon: "barbell-outline",
    hint: "Scan gym equipment displays or weight settings",
    color: "#FF6B35",
  },
};

const CONTEXT_ORDER: ScanContext[] = ["general", "body", "nutrition", "supplement", "workout"];

const RECENT_SCANS = [
  { id: "1", type: "Nutrition Label", date: "2 hrs ago", icon: "nutrition-outline" as const, summary: "Protein Bar — 210 cal, 20g protein" },
  { id: "2", type: "Weight Scale", date: "Yesterday", icon: "scale-outline" as const, summary: "185.4 lbs — down 0.6 lbs" },
  { id: "3", type: "InBody Report", date: "3 days ago", icon: "body-outline" as const, summary: "14.2% BF, 82.3 lbs SMM" },
  { id: "4", type: "Supplement Label", date: "5 days ago", icon: "medical-outline" as const, summary: "Vitamin D3 — 5000 IU per serving" },
  { id: "5", type: "Treadmill Display", date: "1 week ago", icon: "fitness-outline" as const, summary: "3.2 mi, 32:15, 320 cal burned" },
];

const TYPE_LABELS: Record<string, string> = {
  scale_reading: "Weight Scale",
  body_comp_report: "Body Composition Report",
  nutrition_label: "Nutrition Label",
  supplement_label: "Supplement Label",
  equipment_display: "Equipment Display",
  food_item: "Food Item",
  menu: "Menu",
  fitness_tracker: "Fitness Tracker",
  unknown: "Unrecognized",
};

export default function SmartScannerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ context?: string }>();
  const initialContext = (params.context as ScanContext) || "general";
  const [scanContext, setScanContext] = useState<ScanContext>(initialContext);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const config = CONTEXT_CONFIG[scanContext];

  const handleCapture = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (!cameraRef.current) return;

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo?.base64) {
        setError("Failed to capture image");
        setAnalyzing(false);
        return;
      }

      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/scan/analyze", baseUrl).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photo.base64,
          context: scanContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data: ScanResult = await response.json();
      setResult(data);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      setError("Could not analyze image. Try again.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setAnalyzing(false);
    }
  }, [scanContext]);

  const handleDismissResult = () => {
    setResult(null);
    setError(null);
  };

  const handleOpenSettings = async () => {
    if (Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch {}
    }
  };

  const permissionGranted = permission?.granted;
  const permissionDenied = permission?.status === "denied" && !permission?.canAskAgain;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              hitSlop={12}
            >
              <Ionicons name="close" size={26} color={Colors.white} />
            </Pressable>
            <View style={styles.aiIndicator}>
              <Ionicons name="sparkles" size={14} color={Colors.teal} />
              <Text style={styles.aiLabel}>AI SCANNER</Text>
            </View>
          </View>
          <Text style={styles.title}>Smart Scanner</Text>
          <Text style={styles.subtitle}>Point your camera at anything health-related</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.contextScroll}
          >
            {CONTEXT_ORDER.map((ctx) => {
              const cfg = CONTEXT_CONFIG[ctx];
              const active = scanContext === ctx;
              return (
                <Pressable
                  key={ctx}
                  style={[styles.contextChip, active && { borderColor: cfg.color }]}
                  onPress={() => {
                    setScanContext(ctx);
                    setResult(null);
                    setError(null);
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons
                    name={cfg.icon}
                    size={14}
                    color={active ? cfg.color : Colors.muted}
                  />
                  <Text style={[styles.contextChipText, active && { color: cfg.color }]}>
                    {cfg.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {!permissionGranted ? (
          <Animated.View entering={FadeIn.duration(600)} style={styles.permissionContainer}>
            <View style={styles.permissionIconWrap}>
              <Ionicons name="camera" size={48} color={Colors.teal} />
            </View>
            <Text style={styles.permissionTitle}>CAMERA ACCESS REQUIRED</Text>
            <Text style={styles.permissionDesc}>
              Smart Scanner uses AI to analyze what your camera sees and automatically extract health and fitness data.
            </Text>
            {permissionDenied ? (
              Platform.OS !== "web" ? (
                <Pressable style={styles.permissionButton} onPress={handleOpenSettings}>
                  <Text style={styles.permissionButtonText}>OPEN SETTINGS</Text>
                </Pressable>
              ) : (
                <Text style={[styles.permissionDesc, { marginTop: 16 }]}>
                  Camera access was denied. Please enable it in your browser settings.
                </Text>
              )
            ) : (
              <Pressable style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>GRANT CAMERA ACCESS</Text>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(400)} style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.cameraOverlay}>
                <View style={styles.contextBadge}>
                  <Ionicons name={config.icon} size={12} color={config.color} />
                  <Text style={[styles.contextBadgeText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>

                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.cornerTL, { borderColor: config.color }]} />
                  <View style={[styles.corner, styles.cornerTR, { borderColor: config.color }]} />
                  <View style={[styles.corner, styles.cornerBL, { borderColor: config.color }]} />
                  <View style={[styles.corner, styles.cornerBR, { borderColor: config.color }]} />
                </View>

                <Text style={styles.scanHint}>{config.hint}</Text>

                {analyzing && (
                  <View style={styles.analyzingOverlay}>
                    <ActivityIndicator size="large" color={Colors.teal} />
                    <Text style={styles.analyzingText}>AI ANALYZING...</Text>
                  </View>
                )}
              </View>
            </CameraView>

            <Pressable
              style={[styles.captureButton, analyzing && { opacity: 0.4 }]}
              onPress={handleCapture}
              disabled={analyzing}
            >
              <View style={styles.captureOuter}>
                <View style={[styles.captureInner, { backgroundColor: config.color }]}>
                  <Ionicons name="scan" size={28} color={Colors.deepBlack} />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {result && (
          <Animated.View entering={FadeInUp.duration(500)} style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.green} />
                <Text style={styles.resultTitle}>{result.title}</Text>
              </View>
              <Pressable onPress={handleDismissResult} hitSlop={12}>
                <Ionicons name="close" size={20} color={Colors.muted} />
              </Pressable>
            </View>

            <View style={styles.resultTypeBadge}>
              <Text style={styles.resultTypeText}>
                {TYPE_LABELS[result.detected_type] || result.detected_type}
              </Text>
              <Text style={styles.resultConfidence}>
                {Math.round(result.confidence * 100)}% CONFIDENCE
              </Text>
            </View>

            <Text style={styles.resultSummary}>{result.summary}</Text>

            {result.extracted_data.length > 0 && (
              <>
                <View style={styles.resultDivider} />
                <Text style={styles.resultSectionLabel}>EXTRACTED DATA</Text>
                <View style={styles.extractedGrid}>
                  {result.extracted_data.map((item, i) => (
                    <View key={i} style={styles.extractedItem}>
                      <Text style={styles.extractedLabel}>{item.label.toUpperCase()}</Text>
                      <Text style={styles.extractedValue}>
                        {item.value}
                        {item.unit ? <Text style={styles.extractedUnit}> {item.unit}</Text> : null}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {result.suggestions.length > 0 && (
              <>
                <View style={styles.resultDivider} />
                <Text style={styles.resultSectionLabel}>AI SUGGESTIONS</Text>
                {result.suggestions.map((s, i) => (
                  <View key={i} style={styles.suggestionRow}>
                    <Ionicons name="sparkles" size={12} color={Colors.teal} />
                    <Text style={styles.suggestionText}>{s}</Text>
                  </View>
                ))}
              </>
            )}

            <Pressable
              style={styles.saveButton}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleDismissResult();
              }}
            >
              <Text style={styles.saveButtonText}>SAVE TO VITALITY</Text>
            </Pressable>
          </Animated.View>
        )}

        {error && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.red} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={handleDismissResult}>
              <Text style={styles.errorRetry}>TAP TO RETRY</Text>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>WHAT AI CAN DETECT</Text>
          <View style={styles.detectGrid}>
            {[
              { icon: "scale-outline" as const, label: "WEIGHT SCALES" },
              { icon: "body-outline" as const, label: "BODY COMP" },
              { icon: "nutrition-outline" as const, label: "FOOD LABELS" },
              { icon: "medical-outline" as const, label: "SUPPLEMENTS" },
              { icon: "fitness-outline" as const, label: "EQUIPMENT" },
              { icon: "restaurant-outline" as const, label: "MENUS" },
              { icon: "document-text-outline" as const, label: "REPORTS" },
              { icon: "watch-outline" as const, label: "TRACKERS" },
            ].map((item) => (
              <View key={item.label} style={styles.detectItem}>
                <Ionicons name={item.icon} size={22} color={Colors.teal} />
                <Text style={styles.detectLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>RECENT SCANS</Text>
          {RECENT_SCANS.map((scan) => (
            <View key={scan.id} style={styles.recentRow}>
              <View style={styles.recentIconWrap}>
                <Ionicons name={scan.icon} size={18} color={Colors.teal} />
              </View>
              <View style={styles.recentInfo}>
                <Text style={styles.recentType}>{scan.type}</Text>
                <Text style={styles.recentSummary}>{scan.summary}</Text>
              </View>
              <Text style={styles.recentDate}>{scan.date}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>TOTAL SCANS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>TYPES DETECTED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>94%</Text>
            <Text style={styles.statLabel}>ACCURACY</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  aiIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(90,200,212,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiLabel: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.teal,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.muted,
    paddingHorizontal: 24,
    marginTop: 4,
    marginBottom: 20,
  },
  contextScroll: {
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  contextChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.charcoal,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contextChipText: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
  },
  permissionContainer: {
    marginHorizontal: 20,
    height: 360,
    backgroundColor: Colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  permissionIconWrap: {
    width: 80,
    height: 80,
    backgroundColor: Colors.deepBlack,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  permissionTitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.white,
    marginBottom: 12,
    textAlign: "center",
  },
  permissionDesc: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: Colors.teal,
  },
  permissionButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.deepBlack,
  },
  cameraContainer: {
    marginHorizontal: 20,
    height: 420,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  contextBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  contextBadgeText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 9,
    letterSpacing: 2,
  },
  scanFrame: {
    width: 260,
    height: 200,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  scanHint: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: Colors.white,
    marginTop: 20,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  analyzingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(13,13,13,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.teal,
    marginTop: 16,
  },
  captureButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderWidth: 3,
    borderColor: Colors.white,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.charcoal,
    padding: 20,
    borderLeftWidth: 2,
    borderLeftColor: Colors.teal,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  resultTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  resultTitle: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    color: Colors.white,
    flex: 1,
  },
  resultTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  resultTypeText: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.teal,
    backgroundColor: "rgba(90,200,212,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  resultConfidence: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
  },
  resultSummary: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.lightText,
    lineHeight: 22,
    marginTop: 12,
  },
  resultDivider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  resultSectionLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 3,
    color: Colors.muted,
    marginBottom: 12,
  },
  extractedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  extractedItem: {
    minWidth: "44%",
  },
  extractedLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
    marginBottom: 2,
  },
  extractedValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 16,
    color: Colors.white,
  },
  extractedUnit: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.muted,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: Colors.lightText,
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  saveButtonText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.deepBlack,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.charcoal,
    padding: 20,
    alignItems: "center",
    gap: 8,
    borderLeftWidth: 2,
    borderLeftColor: Colors.red,
  },
  errorText: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.lightText,
  },
  errorRetry: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.teal,
    marginTop: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  detectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 20,
    gap: 8,
  },
  detectItem: {
    width: "23%",
    backgroundColor: Colors.charcoal,
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },
  detectLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 8,
    letterSpacing: 1.5,
    color: Colors.muted,
    textAlign: "center",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  recentIconWrap: {
    width: 40,
    height: 40,
    backgroundColor: Colors.charcoal,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  recentInfo: {
    flex: 1,
  },
  recentType: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.white,
  },
  recentSummary: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.muted,
    marginTop: 2,
  },
  recentDate: {
    fontFamily: "Outfit_300Light",
    fontSize: 11,
    color: Colors.muted,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 20,
    backgroundColor: Colors.charcoal,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "Outfit_300Light",
    fontSize: 24,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 8,
    letterSpacing: 2,
    color: Colors.muted,
    marginTop: 4,
  },
  statDivider: {
    width: 0.5,
    height: 36,
    backgroundColor: Colors.border,
  },
});
