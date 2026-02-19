import React, { useState, useCallback } from "react";
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
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "achievement",
    title: "Achievement Unlocked",
    message: "You've completed 100 total workouts! Century Club badge earned.",
    read: false,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    icon: "trophy" as const,
    accentColor: Colors.gold,
  },
  {
    id: "2",
    type: "streak",
    title: "Streak Alert",
    message: "You're on a 14-day workout streak. Don't break the chain!",
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    icon: "flame" as const,
    accentColor: "#FF6B35",
  },
  {
    id: "3",
    type: "insight",
    title: "AI Insight",
    message: "Your sleep quality improved 12% this week. Keep maintaining your 10:30 PM bedtime.",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    icon: "sparkles" as const,
    accentColor: Colors.teal,
  },
  {
    id: "4",
    type: "milestone",
    title: "New Personal Record",
    message: "You just set a new squat PR at 245 lbs! That's 20 lbs above your previous best.",
    read: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    icon: "medal" as const,
    accentColor: Colors.green,
  },
  {
    id: "5",
    type: "reminder",
    title: "Rest Day Reminder",
    message: "Your recovery score is 52. Consider taking today as a rest day.",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    icon: "leaf" as const,
    accentColor: "#9C27B0",
  },
  {
    id: "6",
    type: "social",
    title: "Challenge Update",
    message: "Alex just logged a 5K run in the February Challenge. You're now in 2nd place.",
    read: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    icon: "people" as const,
    accentColor: Colors.white,
  },
  {
    id: "7",
    type: "hydration",
    title: "Hydration Check",
    message: "You've had 3 glasses today. Drink 5 more to hit your goal.",
    read: true,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    icon: "water" as const,
    accentColor: "#2196F3",
  },
  {
    id: "8",
    type: "weekly",
    title: "Weekly Report Ready",
    message: "Your weekly performance report is ready. Consistency score: 88/100.",
    read: false,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    icon: "stats-chart" as const,
    accentColor: Colors.teal,
  },
];

function formatTimeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function SpringPress({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        if (Platform.OS !== "web")
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      onPress={onPress}
      style={style}
    >
      <Animated.View style={animStyle}>{children}</Animated.View>
    </Pressable>
  );
}

function NotificationItem({
  notification,
  index,
  onToggleRead,
}: {
  notification: Notification;
  index: number;
  onToggleRead: (id: string) => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400).springify()}>
      <SpringPress onPress={() => onToggleRead(notification.id)}>
        <View
          style={[
            styles.notificationCard,
            {
              backgroundColor: notification.read ? "#1A1A1A" : "#1A1A1F",
            },
          ]}
        >
          {!notification.read && <View style={styles.unreadDot} />}

          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${notification.accentColor}18` },
            ]}
          >
            <Ionicons
              name={notification.icon as any}
              size={16}
              color={notification.accentColor}
            />
          </View>

          <View style={styles.notificationContent}>
            <Text
              style={[
                styles.notificationTitle,
                !notification.read && styles.notificationTitleUnread,
              ]}
            >
              {notification.title}
            </Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {notification.message}
            </Text>
            <Text style={styles.notificationTime}>
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>
        </View>
      </SpringPress>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const allRead = unreadCount === 0;

  const toggleRead = useCallback((id: string) => {
    if (Platform.OS !== "web")
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    if (Platform.OS !== "web")
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.headerBar,
          { paddingTop: insets.top + webTopInset + 12 },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (Platform.OS !== "web")
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          hitSlop={16}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.white} />
        </Pressable>

        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>

        {!allRead ? (
          <Pressable
            style={styles.markAllButton}
            onPress={markAllRead}
            hitSlop={12}
          >
            <Text style={styles.markAllText}>MARK ALL READ</Text>
          </Pressable>
        ) : (
          <View style={styles.markAllButton} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {allRead ? (
          <Animated.View
            entering={FadeInDown.duration(500).springify()}
            style={styles.emptyState}
          >
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="checkmark-circle"
                size={40}
                color={Colors.green}
              />
            </View>
            <Text style={styles.emptyTitle}>ALL CAUGHT UP</Text>
            <Text style={styles.emptyMessage}>
              No unread notifications. You're on top of everything.
            </Text>
          </Animated.View>
        ) : null}

        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            onToggleRead={toggleRead}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 9,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    letterSpacing: 4,
    textAlign: "center",
  },
  markAllButton: {
    minWidth: 80,
    alignItems: "flex-end",
  },
  markAllText: {
    fontSize: 9,
    fontFamily: "Outfit_400Regular",
    color: Colors.teal,
    letterSpacing: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    position: "relative",
    gap: 12,
  },
  unreadDot: {
    position: "absolute",
    left: 4,
    top: "50%",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.teal,
    marginTop: -3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: 4,
  },
  notificationTitle: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    color: Colors.lightText,
    letterSpacing: 1,
  },
  notificationTitleUnread: {
    fontFamily: "Outfit_500Medium",
    color: Colors.white,
  },
  notificationMessage: {
    fontSize: 11,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    lineHeight: 16,
  },
  notificationTime: {
    fontSize: 10,
    fontFamily: "Outfit_300Light",
    color: "rgba(255,255,255,0.25)",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 40,
    gap: 16,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(76, 217, 100, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 11,
    fontFamily: "Outfit_400Regular",
    color: Colors.white,
    letterSpacing: 4,
  },
  emptyMessage: {
    fontSize: 12,
    fontFamily: "Outfit_300Light",
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 240,
  },
});
