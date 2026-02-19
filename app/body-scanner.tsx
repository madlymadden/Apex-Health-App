import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import Colors from "@/constants/colors";

type ScanMode = "scale" | "bodycomp";

const MOCK_SCANS = [
  {
    id: "1",
    date: "Feb 12, 2026",
    type: "Scale" as const,
    values: { weight: "185.4 lbs" },
  },
  {
    id: "2",
    date: "Feb 10, 2026",
    type: "InBody" as const,
    values: { weight: "184.8 lbs", smm: "82.3 lbs", bodyFat: "14.2%", bmr: "1,842 kcal" },
  },
  {
    id: "3",
    date: "Feb 5, 2026",
    type: "EquiFit" as const,
    values: { bodyFat: "13.8%", leanMass: "159.2 lbs", bmi: "24.1", metabolicAge: "28" },
  },
  {
    id: "4",
    date: "Jan 28, 2026",
    type: "Scale" as const,
    values: { weight: "186.1 lbs" },
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Position your device camera", icon: "phone-portrait-outline" as const },
  { step: "02", title: "Align the reading in the guide frame", icon: "scan-outline" as const },
  { step: "03", title: "Tap capture to extract data", icon: "camera-outline" as const },
  { step: "04", title: "Review and confirm extracted metrics", icon: "checkmark-circle-outline" as const },
];

const SUPPORTED_SCANNERS = [
  { name: "INBODY", icon: "body-outline" as const },
  { name: "EQUIFIT", icon: "fitness-outline" as const },
  { name: "TANITA", icon: "scale-outline" as const },
  { name: "STYKU", icon: "cube-outline" as const },
];

export default function BodyScannerScreen() {
  const insets = useSafeAreaInsets();
  const [scanMode, setScanMode] = useState<ScanMode>("scale");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCapture = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

  const renderPermissionScreen = () => (
    <Animated.View entering={FadeIn.duration(600)} style={styles.permissionContainer}>
      <View style={styles.permissionIconWrap}>
        <Ionicons name="camera" size={48} color={Colors.teal} />
      </View>
      <Text style={styles.permissionTitle}>CAMERA ACCESS REQUIRED</Text>
      <Text style={styles.permissionDesc}>
        Body Scanner needs access to your camera to read weight scales and body composition reports.
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
  );

  const renderCamera = () => (
    <Animated.View entering={FadeIn.duration(400)} style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.cameraOverlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <Text style={styles.scanHint}>
            {scanMode === "scale"
              ? "Point at your scale display"
              : "Align the full report in frame"}
          </Text>
        </View>
      </CameraView>
      <Pressable style={styles.captureButton} onPress={handleCapture}>
        <View style={styles.captureOuter}>
          <View style={styles.captureInner}>
            <Ionicons name="camera" size={28} color={Colors.deepBlack} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderScanValues = (scan: (typeof MOCK_SCANS)[number]) => {
    if (scan.type === "Scale") {
      return <Text style={styles.scanValue}>{scan.values.weight}</Text>;
    }
    if (scan.type === "InBody") {
      return (
        <View style={styles.scanValuesGrid}>
          <View style={styles.scanValueItem}>
            <Text style={styles.scanValueLabel}>WEIGHT</Text>
            <Text style={styles.scanValue}>{scan.values.weight}</Text>
          </View>
          <View style={styles.scanValueItem}>
            <Text style={styles.scanValueLabel}>SMM</Text>
            <Text style={styles.scanValue}>{scan.values.smm}</Text>
          </View>
          <View style={styles.scanValueItem}>
            <Text style={styles.scanValueLabel}>BODY FAT</Text>
            <Text style={styles.scanValue}>{scan.values.bodyFat}</Text>
          </View>
          <View style={styles.scanValueItem}>
            <Text style={styles.scanValueLabel}>BMR</Text>
            <Text style={styles.scanValue}>{scan.values.bmr}</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.scanValuesGrid}>
        <View style={styles.scanValueItem}>
          <Text style={styles.scanValueLabel}>BODY FAT</Text>
          <Text style={styles.scanValue}>{scan.values.bodyFat}</Text>
        </View>
        <View style={styles.scanValueItem}>
          <Text style={styles.scanValueLabel}>LEAN MASS</Text>
          <Text style={styles.scanValue}>{scan.values.leanMass}</Text>
        </View>
        <View style={styles.scanValueItem}>
          <Text style={styles.scanValueLabel}>BMI</Text>
          <Text style={styles.scanValue}>{scan.values.bmi}</Text>
        </View>
        <View style={styles.scanValueItem}>
          <Text style={styles.scanValueLabel}>METABOLIC AGE</Text>
          <Text style={styles.scanValue}>{scan.values.metabolicAge}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </Pressable>
          </View>
          <Text style={styles.title}>Body Scanner</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.tabSelector}>
          <Pressable
            style={[styles.tab, scanMode === "scale" && styles.tabActive]}
            onPress={() => {
              setScanMode("scale");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tabText, scanMode === "scale" && styles.tabTextActive]}>
              SCALE READING
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, scanMode === "bodycomp" && styles.tabActive]}
            onPress={() => {
              setScanMode("bodycomp");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={[styles.tabText, scanMode === "bodycomp" && styles.tabTextActive]}>
              BODY COMP REPORT
            </Text>
          </Pressable>
        </Animated.View>

        {!permissionGranted ? renderPermissionScreen() : renderCamera()}

        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>SCANS COMPLETED</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>6</Text>
            <Text style={styles.statLabel}>MONTHS TRACKED</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>RECENT SCANS</Text>
          {MOCK_SCANS.map((scan) => (
            <View key={scan.id} style={styles.scanCard}>
              <View style={styles.scanCardHeader}>
                <View style={styles.scanTypeRow}>
                  <Ionicons
                    name={scan.type === "Scale" ? "scale-outline" : "body-outline"}
                    size={16}
                    color={Colors.teal}
                  />
                  <Text style={styles.scanType}>{scan.type}</Text>
                </View>
                <Text style={styles.scanDate}>{scan.date}</Text>
              </View>
              {renderScanValues(scan)}
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(600)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>HOW IT WORKS</Text>
          {HOW_IT_WORKS.map((item, index) => (
            <View key={item.step} style={styles.howCard}>
              <View style={styles.howStepWrap}>
                <Text style={styles.howStepNumber}>{item.step}</Text>
              </View>
              <Ionicons name={item.icon} size={20} color={Colors.teal} style={{ marginRight: 14 }} />
              <Text style={styles.howText}>{item.title}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(700)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>SUPPORTED SCANNERS</Text>
          <View style={styles.scannersGrid}>
            {SUPPORTED_SCANNERS.map((scanner) => (
              <View key={scanner.name} style={styles.scannerItem}>
                <View style={styles.scannerIconWrap}>
                  <Ionicons name={scanner.icon} size={28} color={Colors.teal} />
                </View>
                <Text style={styles.scannerName}>{scanner.name}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const CORNER_SIZE = 24;
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontFamily: "Outfit_300Light",
    fontSize: 36,
    color: Colors.white,
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  tabSelector: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: Colors.charcoal,
  },
  tabActive: {
    backgroundColor: Colors.deepBlack,
    borderBottomWidth: 2,
    borderBottomColor: Colors.teal,
  },
  tabText: {
    fontFamily: "Outfit_300Light",
    fontSize: 10,
    letterSpacing: 2,
    color: Colors.muted,
  },
  tabTextActive: {
    color: Colors.white,
    fontFamily: "Outfit_400Regular",
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
    borderColor: Colors.teal,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.teal,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderColor: Colors.teal,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderColor: Colors.teal,
  },
  scanHint: {
    fontFamily: "Outfit_300Light",
    fontSize: 13,
    color: Colors.white,
    marginTop: 24,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 28,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
    marginTop: 4,
  },
  statDivider: {
    width: 0.5,
    height: 40,
    backgroundColor: Colors.border,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scanCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.charcoal,
    padding: 16,
    marginBottom: 8,
  },
  scanCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  scanTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanType: {
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    color: Colors.white,
  },
  scanDate: {
    fontFamily: "Outfit_300Light",
    fontSize: 12,
    color: Colors.muted,
  },
  scanValuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  scanValueItem: {
    minWidth: "40%",
  },
  scanValueLabel: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
    marginBottom: 2,
  },
  scanValue: {
    fontFamily: "Outfit_400Regular",
    fontSize: 15,
    color: Colors.white,
  },
  howCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  howStepWrap: {
    width: 32,
    marginRight: 12,
  },
  howStepNumber: {
    fontFamily: "Outfit_300Light",
    fontSize: 20,
    color: Colors.teal,
  },
  howText: {
    fontFamily: "Outfit_300Light",
    fontSize: 14,
    color: Colors.white,
    flex: 1,
  },
  scannersGrid: {
    flexDirection: "row",
    marginHorizontal: 20,
    gap: 12,
  },
  scannerItem: {
    flex: 1,
    backgroundColor: Colors.charcoal,
    alignItems: "center",
    paddingVertical: 20,
  },
  scannerIconWrap: {
    width: 52,
    height: 52,
    backgroundColor: Colors.deepBlack,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  scannerName: {
    fontFamily: "Outfit_300Light",
    fontSize: 9,
    letterSpacing: 2,
    color: Colors.muted,
  },
});
