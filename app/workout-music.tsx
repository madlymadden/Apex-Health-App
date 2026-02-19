import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

type VibeName = "INTENSITY" | "POWER" | "FLOW" | "GRIND" | "ZEN" | "CLASSIC";

interface Vibe {
  name: VibeName;
  icon: keyof typeof Ionicons.glyphMap;
  bpm: string;
  genre: string;
}

interface Track {
  title: string;
  artist: string;
  duration: string;
  bpm: number;
}

const VIBES: Vibe[] = [
  { name: "INTENSITY", icon: "flash-outline", bpm: "150-180", genre: "EDM / Drum & Bass" },
  { name: "POWER", icon: "barbell-outline", bpm: "130-150", genre: "Hip Hop / Trap" },
  { name: "FLOW", icon: "water-outline", bpm: "120-140", genre: "House / Deep House" },
  { name: "GRIND", icon: "hammer-outline", bpm: "140-160", genre: "Metal / Rock" },
  { name: "ZEN", icon: "leaf-outline", bpm: "80-100", genre: "Ambient / Lo-Fi" },
  { name: "CLASSIC", icon: "musical-notes-outline", bpm: "110-130", genre: "Pop / R&B" },
];

const TRACKS_BY_VIBE: Record<VibeName, Track[]> = {
  INTENSITY: [
    { title: "Adrenaline Rush", artist: "Neon Pulse", duration: "3:42", bpm: 172 },
    { title: "Break the Limit", artist: "Bassweight", duration: "4:15", bpm: 168 },
    { title: "Overdrive", artist: "Synth Fury", duration: "3:28", bpm: 175 },
    { title: "Voltage", artist: "Drop Zone", duration: "3:55", bpm: 160 },
    { title: "Shockwave", artist: "Neural Bass", duration: "4:02", bpm: 155 },
    { title: "Maximum Output", artist: "Circuit Break", duration: "3:38", bpm: 178 },
  ],
  POWER: [
    { title: "No Mercy", artist: "King Pharaoh", duration: "3:18", bpm: 140 },
    { title: "Beast Mode", artist: "Savage Collective", duration: "3:45", bpm: 135 },
    { title: "Iron Will", artist: "Apex Predator", duration: "4:02", bpm: 145 },
    { title: "War Cry", artist: "Titan Sound", duration: "3:30", bpm: 138 },
    { title: "Unstoppable", artist: "Black Rhino", duration: "3:52", bpm: 142 },
    { title: "Crown Heavy", artist: "Metro King", duration: "3:22", bpm: 132 },
  ],
  FLOW: [
    { title: "Midnight Groove", artist: "Velvet Deep", duration: "5:12", bpm: 124 },
    { title: "Liquid Motion", artist: "Oceanwave", duration: "4:48", bpm: 128 },
    { title: "Drift Away", artist: "Solar House", duration: "5:30", bpm: 122 },
    { title: "Golden Hour", artist: "Sunset Audio", duration: "4:55", bpm: 126 },
    { title: "Smooth Operator", artist: "Deep Current", duration: "5:08", bpm: 130 },
    { title: "Silk Road", artist: "Eastern Flow", duration: "4:42", bpm: 135 },
  ],
  GRIND: [
    { title: "Forge Ahead", artist: "Iron Temple", duration: "3:15", bpm: 155 },
    { title: "Break Chains", artist: "Sledgehammer", duration: "3:42", bpm: 148 },
    { title: "Relentless", artist: "Anvil Core", duration: "4:10", bpm: 152 },
    { title: "Burn It Down", artist: "Molten Steel", duration: "3:28", bpm: 158 },
    { title: "Raw Power", artist: "Granite Fist", duration: "3:50", bpm: 145 },
    { title: "No Retreat", artist: "War Machine", duration: "3:35", bpm: 150 },
  ],
  ZEN: [
    { title: "Still Water", artist: "Cloud Atlas", duration: "6:20", bpm: 85 },
    { title: "Morning Light", artist: "Bamboo Sound", duration: "5:45", bpm: 90 },
    { title: "Inner Peace", artist: "Lotus Drift", duration: "6:10", bpm: 82 },
    { title: "Breathe Easy", artist: "Wind Chime", duration: "5:30", bpm: 88 },
    { title: "Temple Garden", artist: "Moss & Stone", duration: "6:40", bpm: 80 },
    { title: "Quiet Strength", artist: "Dawn Walker", duration: "5:55", bpm: 95 },
  ],
  CLASSIC: [
    { title: "Feel the Beat", artist: "Nova Star", duration: "3:35", bpm: 120 },
    { title: "Electric Love", artist: "Crystal Wave", duration: "3:48", bpm: 118 },
    { title: "On Top", artist: "Velvet Rose", duration: "3:22", bpm: 125 },
    { title: "Shine Bright", artist: "Golden Era", duration: "4:05", bpm: 115 },
    { title: "Move It", artist: "Rhythm Queen", duration: "3:40", bpm: 128 },
    { title: "Saturday Night", artist: "Disco Noir", duration: "3:55", bpm: 122 },
  ],
};

export default function WorkoutMusicScreen() {
  const insets = useSafeAreaInsets();
  const [selectedVibe, setSelectedVibe] = useState<VibeName | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [matchToWorkout, setMatchToWorkout] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleVibeSelect = (vibe: VibeName) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVibe(vibe);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPlaying(!isPlaying);
  };

  const skipTrack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleMatchToWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMatchToWorkout(!matchToWorkout);
  };

  const currentTracks = selectedVibe ? TRACKS_BY_VIBE[selectedVibe] : [];
  const nowPlaying = currentTracks.length > 0 ? currentTracks[0] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: (insets.top || webTopInset) + 16,
          paddingBottom: (insets.bottom || webBottomInset) + 40,
        }}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => {
          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.title}>Music</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.sectionLabel}>SELECT YOUR VIBE</Text>
          <View style={styles.vibeGrid}>
            {VIBES.map((vibe, index) => {
              const isSelected = selectedVibe === vibe.name;
              return (
                <Animated.View
                  key={vibe.name}
                  entering={FadeInDown.duration(400).delay(150 + index * 80)}
                  style={{ width: "48%" }}
                >
                  <Pressable
                    onPress={() => handleVibeSelect(vibe.name)}
                    style={[
                      styles.vibeCard,
                      isSelected && styles.vibeCardSelected,
                    ]}
                  >
                    <Ionicons
                      name={vibe.icon}
                      size={32}
                      color={isSelected ? Colors.gold : Colors.muted}
                    />
                    <Text style={styles.vibeName}>{vibe.name}</Text>
                    <Text style={styles.vibeBpm}>{vibe.bpm} BPM</Text>
                    <Text style={styles.vibeGenre}>{vibe.genre}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {selectedVibe && nowPlaying && (
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>NOW PLAYING</Text>
            <View style={styles.nowPlayingCard}>
              <View style={styles.nowPlayingInfo}>
                <Text style={styles.nowPlayingTitle}>{nowPlaying.title}</Text>
                <Text style={styles.nowPlayingArtist}>{nowPlaying.artist}</Text>
                <View style={styles.bpmBadgeSmall}>
                  <Text style={styles.bpmBadgeText}>{nowPlaying.bpm} BPM</Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <Animated.View
                  entering={FadeIn.duration(1000)}
                  style={styles.progressBarFill}
                />
              </View>
              <View style={styles.playerControls}>
                <Pressable onPress={skipTrack} hitSlop={10}>
                  <Ionicons name="play-skip-back" size={22} color={Colors.white} />
                </Pressable>
                <Pressable onPress={togglePlay} style={styles.playButton} hitSlop={10}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={28}
                    color={Colors.deepBlack}
                  />
                </Pressable>
                <Pressable onPress={skipTrack} hitSlop={10}>
                  <Ionicons name="play-skip-forward" size={22} color={Colors.white} />
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {selectedVibe && currentTracks.length > 0 && (
          <Animated.View entering={FadeInDown.duration(500).delay(200)}>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>SUGGESTED TRACKS</Text>
            {currentTracks.map((track, index) => (
              <Animated.View
                key={track.title}
                entering={FadeInDown.duration(300).delay(250 + index * 60)}
              >
                <View style={styles.trackRow}>
                  <Text style={styles.trackNumber}>{String(index + 1).padStart(2, "0")}</Text>
                  <View style={styles.trackInfo}>
                    <Text style={styles.trackTitle}>{track.title}</Text>
                    <Text style={styles.trackArtist}>{track.artist}</Text>
                  </View>
                  <Text style={styles.trackDuration}>{track.duration}</Text>
                  <View style={styles.bpmBadge}>
                    <Text style={styles.bpmBadgeText}>{track.bpm}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>MATCH TO WORKOUT</Text>
          <Pressable onPress={toggleMatchToWorkout} style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleTitle}>Auto-Select Vibe</Text>
              <Text style={styles.toggleSubtitle}>Match music to your workout type</Text>
            </View>
            <View style={[styles.toggle, matchToWorkout && styles.toggleActive]}>
              <View
                style={[
                  styles.toggleThumb,
                  matchToWorkout && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>VOLUME / INTENSITY</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={styles.sliderFill} />
            </View>
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>LOW</Text>
              <Text style={styles.sliderLabel}>HIGH</Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontFamily: "Outfit_300Light",
    color: Colors.white,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: Colors.muted,
    fontFamily: "Outfit_400Regular",
    marginBottom: 16,
  },
  vibeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  vibeCard: {
    backgroundColor: Colors.charcoal,
    padding: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
  vibeCardSelected: {
    borderColor: Colors.white,
  },
  vibeName: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 2,
    marginTop: 12,
  },
  vibeBpm: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 4,
  },
  vibeGenre: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 28,
  },
  nowPlayingCard: {
    backgroundColor: Colors.charcoal,
    padding: 24,
  },
  nowPlayingInfo: {
    marginBottom: 16,
  },
  nowPlayingTitle: {
    fontSize: 20,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  nowPlayingArtist: {
    fontSize: 14,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 4,
  },
  bpmBadgeSmall: {
    backgroundColor: Colors.elevated,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 8,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.elevated,
    marginBottom: 20,
  },
  progressBarFill: {
    height: 3,
    width: "35%",
    backgroundColor: Colors.gold,
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  playButton: {
    width: 52,
    height: 52,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  trackRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  trackNumber: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    width: 24,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  trackArtist: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
  },
  bpmBadge: {
    backgroundColor: Colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bpmBadgeText: {
    fontSize: 10,
    fontFamily: "Outfit_400Regular",
    color: Colors.gold,
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.charcoal,
    padding: 20,
  },
  toggleTitle: {
    fontSize: 15,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
  },
  toggleSubtitle: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 26,
    backgroundColor: Colors.elevated,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: Colors.gold,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: Colors.muted,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
    backgroundColor: Colors.white,
  },
  sliderContainer: {
    backgroundColor: Colors.charcoal,
    padding: 24,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.elevated,
  },
  sliderFill: {
    height: 4,
    width: "65%",
    backgroundColor: Colors.gold,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 2,
  },
});
