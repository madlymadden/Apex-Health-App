import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import { analyticsService, type WeeklyReport, type MonthlyTrend, type AnalyticsInsight, type PersonalizedRecommendation } from "@/lib/analytics";
import { BarChart } from "@/components/BarChart";
import { LineChart } from "@/components/LineChart";

function InsightCard({ insight, onPress }: { insight: AnalyticsInsight; onPress: () => void }) {
  const getIconAndColor = () => {
    switch (insight.type) {
      case 'achievement':
        return { icon: 'trophy-outline', color: Colors.teal };
      case 'warning':
        return { icon: 'warning-outline', color: Colors.red };
      case 'recommendation':
        return { icon: 'bulb-outline', color: Colors.yellow };
      default:
        return { icon: 'trending-up-outline', color: Colors.white };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.insightCard,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={styles.insightHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={[styles.insightType, { color }]}>{insight.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.insightTitle}>{insight.title}</Text>
      <Text style={styles.insightDescription}>{insight.description}</Text>
      {insight.value !== undefined && insight.target !== undefined && (
        <View style={styles.insightProgress}>
          <Text style={styles.insightValue}>{insight.value}</Text>
          <Text style={styles.insightTarget}>/ {insight.target}</Text>
        </View>
      )}
    </Pressable>
  );
}

function RecommendationCard({ recommendation }: { recommendation: PersonalizedRecommendation }) {
  const getCategoryIcon = () => {
    switch (recommendation.category) {
      case 'workout':
        return 'fitness-outline';
      case 'nutrition':
        return 'nutrition-outline';
      case 'recovery':
        return 'bed-outline';
      default:
        return 'person-outline';
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return Colors.red;
      case 'medium':
        return Colors.yellow;
      default:
        return Colors.muted;
    }
  };

  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Ionicons name={getCategoryIcon() as any} size={20} color={Colors.white} />
        <Text style={styles.recommendationCategory}>{recommendation.category.toUpperCase()}</Text>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
          <Text style={styles.priorityText}>{recommendation.priority}</Text>
        </View>
      </View>
      <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
      <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
      <View style={styles.actionItems}>
        {recommendation.actionItems.slice(0, 3).map((item, index) => (
          <View key={index} style={styles.actionItem}>
            <Ionicons name="checkmark-circle-outline" size={16} color={Colors.teal} />
            <Text style={styles.actionItemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'insights' | 'recommendations'>('overview');

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of current week
      
      const [weeklyData, trendsData, insightsData, recommendationsData] = await Promise.all([
        analyticsService.generateWeeklyReport(user.id, weekStart),
        analyticsService.generateMonthlyTrends(user.id, 6),
        analyticsService.generateInsights(user.id),
        analyticsService.generatePersonalizedRecommendations(user.id),
      ]);

      setWeeklyReport(weeklyData);
      setMonthlyTrends(trendsData);
      setInsights(insightsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleInsightPress = (insight: AnalyticsInsight) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: Show detailed insight view
  };

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.white} />
      }
    >
      {weeklyReport && (
        <Animated.View entering={FadeInDown.duration(600).delay(100)}>
          <View style={styles.weeklyReportCard}>
            <Text style={styles.sectionLabel}>WEEKLY REPORT</Text>
            <Text style={styles.weeklyPeriod}>
              {weeklyReport.weekStart.toLocaleDateString()} - {weeklyReport.weekEnd.toLocaleDateString()}
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyReport.totalWorkouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyReport.totalDuration}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{weeklyReport.totalCalories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.scoresRow}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Nutrition</Text>
                <Text style={styles.scoreValue}>{weeklyReport.nutritionScore}%</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Recovery</Text>
                <Text style={styles.scoreValue}>{weeklyReport.recoveryScore}%</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>Consistency</Text>
                <Text style={styles.scoreValue}>{weeklyReport.consistencyScore}%</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {insights.length > 0 && (
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Text style={styles.sectionLabel}>KEY INSIGHTS</Text>
          {insights.slice(0, 3).map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onPress={() => handleInsightPress(insight)}
            />
          ))}
        </Animated.View>
      )}
    </ScrollView>
  );

  const renderTrendsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Animated.View entering={FadeInDown.duration(600)}>
        <Text style={styles.sectionLabel}>6-MONTH TRENDS</Text>
        {monthlyTrends.length > 0 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={monthlyTrends.map(trend => ({
                label: trend.month,
                value: trend.workouts,
              }))}
              width={320}
              height={200}
              color={Colors.teal}
              label="Workouts per Month"
            />
          </View>
        )}
        
        <View style={styles.trendsGrid}>
          {monthlyTrends.slice(0, 3).map((trend, index) => (
            <View key={index} style={styles.trendCard}>
              <Text style={styles.trendMonth}>{trend.month}</Text>
              <Text style={styles.trendValue}>{trend.workouts}</Text>
              <Text style={styles.trendLabel}>Workouts</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );

  const renderInsightsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Animated.View entering={FadeInDown.duration(600)}>
        <Text style={styles.sectionLabel}>ALL INSIGHTS</Text>
        {insights.map((insight: AnalyticsInsight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            onPress={() => handleInsightPress(insight)}
          />
        ))}
        {insights.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyStateText}>No insights available yet</Text>
            <Text style={styles.emptyStateSubtext}>Keep tracking your activities to see insights</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );

  const renderRecommendationsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Animated.View entering={FadeInDown.duration(600)}>
        <Text style={styles.sectionLabel}>PERSONALIZED RECOMMENDATIONS</Text>
        {recommendations.map((recommendation: PersonalizedRecommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
        {recommendations.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyStateText}>No recommendations at this time</Text>
            <Text style={styles.emptyStateSubtext}>You're doing great! Check back later for new insights</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Analytics</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={24} color={Colors.white} />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {(['overview', 'trends', 'insights', 'recommendations'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && styles.activeTab,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSelectedTab(tab);
            }}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText,
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedTab === 'overview' && renderOverviewTab()}
      {selectedTab === 'trends' && renderTrendsTab()}
      {selectedTab === 'insights' && renderInsightsTab()}
      {selectedTab === 'recommendations' && renderRecommendationsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
    letterSpacing: -1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: Colors.muted,
    letterSpacing: 1,
  },
  activeTabText: {
    color: Colors.white,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 3,
    marginTop: 24,
    marginBottom: 16,
  },
  weeklyReportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  weeklyPeriod: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.deepBlack,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 1,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
  },
  insightCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightType: {
    fontSize: 10,
    fontFamily: 'Outfit_400Regular',
    letterSpacing: 1,
    marginLeft: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    lineHeight: 20,
    marginBottom: 12,
  },
  insightProgress: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  insightValue: {
    fontSize: 18,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
  },
  insightTarget: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    marginLeft: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  trendsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  trendMonth: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  trendValue: {
    fontSize: 20,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
    marginBottom: 4,
  },
  trendLabel: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 1,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recommendationCategory: {
    fontSize: 10,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    letterSpacing: 1,
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 8,
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  recommendationTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionItems: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItemText: {
    fontSize: 12,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    marginLeft: 8,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
