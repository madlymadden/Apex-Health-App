import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAuth } from './auth-context';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  time: string; // HH:MM format
  days: string[]; // ['monday', 'tuesday', etc.]
  enabled: boolean;
  type: 'workout_reminder' | 'goal_reminder' | 'achievement' | 'insight';
}

export interface AchievementNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
      } else {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted' || status === 'undetermined';
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleNotification(schedule: NotificationSchedule): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return null;
      }

      // Cancel existing notification with same ID if it exists
      await this.cancelScheduledNotification(schedule.id);

      // Calculate next trigger times based on schedule
      const triggerDates = this.calculateTriggerDates(schedule.time, schedule.days);
      
      if (triggerDates.length === 0) {
        console.warn('No valid trigger dates found for schedule');
        return null;
      }

      // Schedule notifications for each trigger date
      const notificationIds: string[] = [];
      for (const trigger of triggerDates) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: schedule.title,
            body: schedule.body,
            data: {
              type: schedule.type,
              scheduleId: schedule.id,
            },
            sound: 'default',
          },
          trigger,
        });
        notificationIds.push(id);
      }

      // Store the notification IDs for later cancellation
      await this.storeNotificationIds(schedule.id, notificationIds);

      return schedule.id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  async cancelScheduledNotification(scheduleId: string): Promise<void> {
    try {
      const notificationIds = await this.getStoredNotificationIds(scheduleId);
      
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }

      // Clear stored IDs
      await this.clearStoredNotificationIds(scheduleId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async sendInstantNotification(notification: AchievementNotification): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error sending instant notification:', error);
    }
  }

  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      const scheduled = await this.getScheduledNotifications();
      for (const notification of scheduled) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Predefined notification schedules
  async scheduleDefaultWorkoutReminder(userId: string): Promise<void> {
    const schedule: NotificationSchedule = {
      id: `workout_reminder_${userId}`,
      title: 'Time to Move! 💪',
      body: 'Don\'t forget your workout today. You\'ve got this!',
      time: '09:00',
      days: ['monday', 'wednesday', 'friday'],
      enabled: true,
      type: 'workout_reminder',
    };

    await this.scheduleNotification(schedule);
  }

  async scheduleGoalReminder(userId: string): Promise<void> {
    const schedule: NotificationSchedule = {
      id: `goal_reminder_${userId}`,
      title: 'Daily Goals Check-in 🎯',
      body: 'How are you tracking with your goals today? Keep pushing forward!',
      time: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      enabled: true,
      type: 'goal_reminder',
    };

    await this.scheduleNotification(schedule);
  }

  async scheduleWeeklyProgressReport(userId: string): Promise<void> {
    const schedule: NotificationSchedule = {
      id: `weekly_report_${userId}`,
      title: 'Weekly Progress Report 📊',
      body: 'Check out your weekly analytics and celebrate your progress!',
      time: '10:00',
      days: ['sunday'],
      enabled: true,
      type: 'insight',
    };

    await this.scheduleNotification(schedule);
  }

  // Achievement notifications
  async notifyWorkoutStreak(streak: number): Promise<void> {
    const notification: AchievementNotification = {
      id: `workout_streak_${Date.now()}`,
      title: '🔥 Amazing Workout Streak!',
      body: `You've worked out ${streak} days in a row! Keep the momentum going!`,
      data: {
        type: 'achievement',
        streak,
      },
    };

    await this.sendInstantNotification(notification);
  }

  async notifyGoalAchievement(goalType: string, value: number): Promise<void> {
    const notification: AchievementNotification = {
      id: `goal_achievement_${Date.now()}`,
      title: '🎯 Goal Achieved!',
      body: `Congratulations! You've reached your ${goalType} goal of ${value}!`,
      data: {
        type: 'achievement',
        goalType,
        value,
      },
    };

    await this.sendInstantNotification(notification);
  }

  async notifyNewInsight(insightTitle: string): Promise<void> {
    const notification: AchievementNotification = {
      id: `new_insight_${Date.now()}`,
      title: '💡 New Insight Available',
      body: `Check out your analytics for a new insight: ${insightTitle}`,
      data: {
        type: 'insight',
        insightTitle,
      },
    };

    await this.sendInstantNotification(notification);
  }

  private calculateTriggerDates(time: string, days: string[]): Date[] {
    const triggerDates: Date[] = [];
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    for (const dayName of days) {
      const targetDay = dayMap[dayName.toLowerCase()];
      if (targetDay === undefined) continue;

      const triggerDate = new Date(now);
      const currentDay = now.getDay();
      
      // Calculate days to add to reach the target day
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Schedule for next week
      }

      triggerDate.setDate(now.getDate() + daysToAdd);
      triggerDate.setHours(hours, minutes, 0, 0);

      // Only add if the trigger date is in the future
      if (triggerDate > now) {
        triggerDates.push(triggerDate);
      }
    }

    return triggerDates.sort((a, b) => a.getTime() - b.getTime());
  }

  private async storeNotificationIds(scheduleId: string, notificationIds: string[]): Promise<void> {
    try {
      // In a real app, you'd store this in AsyncStorage or your database
      // For now, we'll use a simple in-memory approach
      if (typeof window !== 'undefined') {
        const key = `notification_ids_${scheduleId}`;
        localStorage.setItem(key, JSON.stringify(notificationIds));
      }
    } catch (error) {
      console.error('Error storing notification IDs:', error);
    }
  }

  private async getStoredNotificationIds(scheduleId: string): Promise<string[]> {
    try {
      if (typeof window !== 'undefined') {
        const key = `notification_ids_${scheduleId}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch (error) {
      console.error('Error getting stored notification IDs:', error);
      return [];
    }
  }

  private async clearStoredNotificationIds(scheduleId: string): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const key = `notification_ids_${scheduleId}`;
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing stored notification IDs:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();

// React hook for notifications
export function useNotifications() {
  const { user } = useAuth();

  const scheduleWorkoutReminder = async (time: string = '09:00', days: string[] = ['monday', 'wednesday', 'friday']) => {
    if (!user) return;

    const schedule: NotificationSchedule = {
      id: `workout_reminder_${user.id}`,
      title: 'Time to Move! 💪',
      body: 'Don\'t forget your workout today. You\'ve got this!',
      time,
      days,
      enabled: true,
      type: 'workout_reminder',
    };

    return await notificationService.scheduleNotification(schedule);
  };

  const scheduleGoalReminder = async (time: string = '18:00', days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']) => {
    if (!user) return;

    const schedule: NotificationSchedule = {
      id: `goal_reminder_${user.id}`,
      title: 'Daily Goals Check-in 🎯',
      body: 'How are you tracking with your goals today? Keep pushing forward!',
      time,
      days,
      enabled: true,
      type: 'goal_reminder',
    };

    return await notificationService.scheduleNotification(schedule);
  };

  const cancelAllReminders = async () => {
    if (!user) return;
    
    await notificationService.cancelScheduledNotification(`workout_reminder_${user.id}`);
    await notificationService.cancelScheduledNotification(`goal_reminder_${user.id}`);
    await notificationService.cancelScheduledNotification(`weekly_report_${user.id}`);
  };

  const sendAchievementNotification = async (type: 'streak' | 'goal' | 'insight', data: any) => {
    switch (type) {
      case 'streak':
        await notificationService.notifyWorkoutStreak(data.streak);
        break;
      case 'goal':
        await notificationService.notifyGoalAchievement(data.goalType, data.value);
        break;
      case 'insight':
        await notificationService.notifyNewInsight(data.insightTitle);
        break;
    }
  };

  return {
    scheduleWorkoutReminder,
    scheduleGoalReminder,
    cancelAllReminders,
    sendAchievementNotification,
    requestPermissions: notificationService.requestPermissions.bind(notificationService),
    getScheduledNotifications: notificationService.getScheduledNotifications.bind(notificationService),
    clearAllNotifications: notificationService.clearAllNotifications.bind(notificationService),
  };
}
