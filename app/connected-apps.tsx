import React, { useState, useEffect } from "react";
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  generateConnectedApps,
  type ConnectedApp,
} from "@/lib/health-data";

function timeSince(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AppTile({ app, index }: { app: ConnectedApp; index: number }) {
  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (app.id === "apple-health") {
      router.push("/apple-health");
    } else if (app.id === "strava") {
      router.push("/strava");
    } else if (app.id === "hevy") {
      router.push("/workout-imports");
    } else if (app.id === "nutrifactor") {
      router.push("/nutrition-sync");
    } else if (app.id === "body-scanner") {
      router.push({ pathname: "/smart-scanner", params: { context: "body" } });
    } else if (app.id === "apple-workout") {
      router.push("/apple-workout");
    } else if (app.id === "macrofactor") {
      router.push("/macrofactor");
    } else if (app.id === "myfitnesspal") {
      router.push("/myfitnesspal");
    } else if (app.id === "garmin") {
      router.push("/garmin");
    } else if (app.id === "oura") {
      router.push("/oura-ring");
    } else if (app.id === "runna") {
      router.push("/runna");
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.appTile,
          pressed && { opacity: 0.6 },
        ]}
      >
        <View style={styles.appTileHeader}>
          <View style={styles.appIconContainer}>
            <Ionicons name={app.icon as any} size={20} color={app.accentColor} />
          </View>
          <View style={styles.appStatusContainer}>
            {app.connected ? (
              <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
            ) : (
              <View style={[styles.statusDot, { backgroundColor: Colors.muted }]} />
            )}
          </View>
        </View>

        <View style={styles.appTileBody}>
          <Text style={styles.appName}>{app.name}</Text>
          <Text style={styles.appDescription} numberOfLines={2}>
            {app.description}
          </Text>
        </View>

        <View style={styles.appTileFooter}>
          {app.connected && app.lastSync ? (
            <Text style={styles.syncTime}>Synced {timeSince(app.lastSync)}</Text>
          ) : (
            <Text style={[styles.syncTime, { color: Colors.muted }]}>Not connected</Text>
          )}
          <View style={styles.dataTypesRow}>
            {app.dataTypes.slice(0, 2).map((dt) => (
              <View key={dt} style={styles.dataTypeBadge}>
                <Text style={styles.dataTypeText}>{dt}</Text>
              </View>
            ))}
            {app.dataTypes.length > 2 && (
              <Text style={styles.moreTypes}>+{app.dataTypes.length - 2}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function ConnectedAppsScreen() {
  const insets = useSafeAreaInsets();
  const [apps, setApps] = useState<ConnectedApp[]>([]);
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  useEffect(() => {
    setApps(generateConnectedApps());
  }, []);

  const connected = apps.filter((a) => a.connected);
  const available = apps.filter((a) => !a.connected);

  const categories = [
    { key: "health", label: "HEALTH" },
    { key: "fitness", label: "FITNESS" },
    { key: "nutrition", label: "NUTRITION" },
    { key: "wearable", label: "WEARABLES" },
  ];

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
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={Colors.white} />
            </Pressable>
            <Text style={styles.headerTitle}>CONNECTED APPS</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{connected.length}</Text>
                <Text style={styles.summaryLabel}>ACTIVE</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {connected.reduce((s, a) => s + a.dataTypes.length, 0)}
                </Text>
                <Text style={styles.summaryLabel}>DATA TYPES</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{available.length}</Text>
                <Text style={styles.summaryLabel}>AVAILABLE</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {categories.map((cat) => {
            const catApps = apps.filter((a) => a.category === cat.key);
            if (catApps.length === 0) return null;
            return (
              <View key={cat.key} style={styles.categorySection}>
                <Text style={styles.sectionLabel}>{cat.label}</Text>
                {catApps.map((app, i) => (
                  <AppTile key={app.id} app={app} index={i} />
                ))}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
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
    marginBottom: 32,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
  },
  summarySection: {
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    alignItems: "center" as const,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 6,
  },
  summaryValue: {
    fontSize: 28,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
    letterSpacing: -0.5,
  },
  summaryLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
  summaryDivider: {
    width: 0.5,
    height: 32,
    backgroundColor: Colors.border,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  categorySection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 3,
    marginBottom: 16,
  },
  appTile: {
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    marginBottom: 10,
  },
  appTileHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 14,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  appStatusContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  appTileBody: {
    gap: 6,
    marginBottom: 14,
  },
  appName: {
    fontSize: 18,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: -0.3,
  },
  appDescription: {
    fontSize: 13,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  appTileFooter: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  syncTime: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 0.5,
  },
  dataTypesRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  dataTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  dataTypeText: {
    fontSize: 8,
    fontFamily: "Outfit_300Light",
    color: Colors.lightText,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  moreTypes: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 0.5,
  },
});
