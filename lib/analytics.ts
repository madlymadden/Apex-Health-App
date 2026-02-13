import { 
  healthMetricsService, 
  workoutService, 
  bodyMeasurementsService, 
  nutritionService 
} from './database';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

interface WorkoutStatsSummary {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgHeartRate: number;
}

export interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'achievement' | 'recommendation' | 'warning';
  title: string;
  description: string;
  value?: number;
  target?: number;
  trend?: 'up' | 'down' | 'stable';
  priority: 'low' | 'medium' | 'high';
  category: 'fitness' | 'nutrition' | 'health' | 'recovery';
  date: Date;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  avgHeartRate: number;
  weightChange: number;
  bodyFatChange: number;
  nutritionScore: number;
  recoveryScore: number;
  consistencyScore: number;
  insights: AnalyticsInsight[];
}

export interface MonthlyTrend {
  month: string;
  workouts: number;
  calories: number;
  activeMinutes: number;
  weight: number;
  bodyFat: number;
  sleepHours: number;
}

export interface PersonalizedRecommendation {
  id: string;
  category: 'workout' | 'nutrition' | 'recovery' | 'lifestyle';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async generateWeeklyReport(userId: string, weekStart: Date): Promise<WeeklyReport> {
    const weekEnd = endOfDay(subDays(weekStart, -1));
    
    try {
      // Get workout data for the week
      const workoutStats = await workoutService.getWorkoutStats(userId, weekStart, weekEnd);
      
      // Get body measurements for weight change
      const measurements = await bodyMeasurementsService.getMeasurementsByUserId(userId, 10);
      const weekStartMeasurement = measurements.find(m => 
        new Date(m.date).toDateString() === weekStart.toDateString()
      );
      const weekEndMeasurement = measurements.find(m => 
        new Date(m.date).toDateString() === weekEnd.toDateString()
      );
      
      const weightChange = weekStartMeasurement && weekEndMeasurement 
        ? Number(weekEndMeasurement.weight) - Number(weekStartMeasurement.weight)
        : 0;
      
      const bodyFatChange = weekStartMeasurement && weekEndMeasurement
        ? Number(weekEndMeasurement.bodyFat) - Number(weekStartMeasurement.bodyFat)
        : 0;

      // Get nutrition data
      const nutritionData = await this.calculateWeeklyNutritionScore(userId, weekStart, weekEnd);
      
      // Generate insights
      const insights = await this.generateWeeklyInsights(userId, weekStart, weekEnd, workoutStats);

      return {
        weekStart,
        weekEnd,
        totalWorkouts: workoutStats.totalWorkouts,
        totalDuration: workoutStats.totalDuration,
        totalCalories: workoutStats.totalCalories,
        avgHeartRate: workoutStats.avgHeartRate,
        weightChange,
        bodyFatChange,
        nutritionScore: nutritionData.score,
        recoveryScore: await this.calculateRecoveryScore(userId, weekStart, weekEnd),
        consistencyScore: await this.calculateConsistencyScore(userId, weekStart, weekEnd),
        insights,
      };
    } catch (error) {
      console.error('Error generating weekly report:', error);
      throw new Error('Failed to generate weekly report');
    }
  }

  async generateMonthlyTrends(userId: string, months: number = 6): Promise<MonthlyTrend[]> {
    const trends: MonthlyTrend[] = [];
    const currentDate = new Date();

    for (let i = 0; i < months; i++) {
      const monthStart = startOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1));
      const monthEnd = endOfDay(new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0));
      
      try {
        const workoutStats = await workoutService.getWorkoutStats(userId, monthStart, monthEnd);
        const measurements = await bodyMeasurementsService.getMeasurementsByUserId(userId, 50);
        const monthMeasurements = measurements.filter(m => {
          const date = new Date(m.date);
          return date >= monthStart && date <= monthEnd;
        });

        const avgWeight = monthMeasurements.length > 0 
          ? monthMeasurements.reduce((sum, m) => sum + Number(m.weight), 0) / monthMeasurements.length
          : 0;

        const avgBodyFat = monthMeasurements.length > 0
          ? monthMeasurements.reduce((sum, m) => sum + Number(m.bodyFat || 0), 0) / monthMeasurements.length
          : 0;

        const avgSleep = await this.calculateAverageSleep(userId, monthStart, monthEnd);

        trends.push({
          month: format(monthStart, 'MMM yyyy'),
          workouts: workoutStats.totalWorkouts,
          calories: workoutStats.totalCalories,
          activeMinutes: workoutStats.totalDuration,
          weight: avgWeight,
          bodyFat: avgBodyFat,
          sleepHours: avgSleep,
        });
      } catch (error) {
        console.error(`Error generating trend for month ${i}:`, error);
      }
    }

    return trends.reverse(); // Most recent first
  }

  async generatePersonalizedRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    try {
      // Get recent data
      const recentWorkouts = await workoutService.getWorkoutsByUserId(userId, 10);
      const recentMeasurements = await bodyMeasurementsService.getMeasurementsByUserId(userId, 5);
      const recentMetrics = await healthMetricsService.getMetricsByUserId(userId, 7);

      // Workout recommendations
      if (recentWorkouts.length < 3) {
        recommendations.push({
          id: 'increase_workout_frequency',
          category: 'workout',
          title: 'Increase Workout Frequency',
          description: 'You\'ve been less active lately. Try to schedule at least 3 workouts this week.',
          actionItems: [
            'Schedule workouts in your calendar',
            'Try shorter, more frequent sessions',
            'Find a workout buddy for accountability'
          ],
          priority: 'medium',
          reasoning: 'Recent workout data shows less than 3 workouts in the past 10 days.'
        });
      }

      // Recovery recommendations
      const avgRestingHR = recentMetrics
        .filter(m => m.heartRateResting)
        .reduce((sum, m, _, arr) => sum + (m.heartRateResting || 0) / arr.length, 0);

      if (avgRestingHR > 65) {
        recommendations.push({
          id: 'improve_recovery',
          category: 'recovery',
          title: 'Focus on Recovery',
          description: 'Your resting heart rate is elevated, which may indicate overtraining or stress.',
          actionItems: [
            'Prioritize 7-9 hours of sleep',
            'Add active recovery sessions',
            'Practice stress management techniques'
          ],
          priority: 'high',
          reasoning: `Average resting heart rate is ${avgRestingHR.toFixed(0)} bpm, which is above optimal range.`
        });
      }

      // Nutrition recommendations
      const recentNutrition = await nutritionService.getNutritionEntriesByUserId(userId, 7);
      const avgProtein = recentNutrition.length > 0
        ? recentNutrition.reduce((sum, entry) => sum + Number(entry.protein || 0), 0) / recentNutrition.length
        : 0;

      if (avgProtein < 80) {
        recommendations.push({
          id: 'increase_protein',
          category: 'nutrition',
          title: 'Increase Protein Intake',
          description: 'Your protein intake may be insufficient for optimal muscle recovery and growth.',
          actionItems: [
            'Add protein source to each meal',
            'Consider protein supplements post-workout',
            'Include protein-rich snacks'
          ],
          priority: 'medium',
          reasoning: `Average daily protein intake is ${avgProtein.toFixed(0)}g, below recommended 80-120g.`
        });
      }

      // Weight management recommendations
      if (recentMeasurements.length >= 2) {
        const latestWeight = Number(recentMeasurements[0].weight);
        const previousWeight = Number(recentMeasurements[1].weight);
        const weightChange = latestWeight - previousWeight;

        if (Math.abs(weightChange) > 2) {
          recommendations.push({
            id: 'weight_management',
            category: 'lifestyle',
            title: weightChange > 0 ? 'Monitor Weight Gain' : 'Monitor Weight Loss',
            description: `You've experienced a ${Math.abs(weightChange).toFixed(1)} lb change recently.`,
            actionItems: weightChange > 0 ? [
              'Review caloric intake',
              'Increase cardio frequency',
              'Monitor portion sizes'
            ] : [
              'Ensure adequate caloric intake',
              'Focus on strength training',
              'Monitor for muscle loss'
            ],
            priority: 'medium',
            reasoning: `Recent weight change of ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} lbs requires attention.`
          });
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  async generateInsights(userId: string): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];
    
    try {
      const thirtyDaysAgo = subDays(new Date(), 30);
      const workoutStats = await workoutService.getWorkoutStats(userId, thirtyDaysAgo, new Date());
      const measurements = await bodyMeasurementsService.getMeasurementsByUserId(userId, 10);

      // Workout consistency insight
      if (workoutStats.totalWorkouts >= 12) {
        insights.push({
          id: 'workout_consistency',
          type: 'achievement',
          title: 'Excellent Workout Consistency',
          description: `You've completed ${workoutStats.totalWorkouts} workouts in the past 30 days!`,
          value: workoutStats.totalWorkouts,
          target: 12,
          priority: 'medium',
          category: 'fitness',
          date: new Date(),
        });
      }

      // Weight trend insight
      if (measurements.length >= 4) {
        const recentWeights = measurements.slice(0, 4).map(m => Number(m.weight));
        const weightTrend = this.calculateTrend(recentWeights);
        
        if (weightTrend === 'down' && Math.abs(recentWeights[0] - recentWeights[3]) > 1) {
          insights.push({
            id: 'weight_loss_progress',
            type: 'trend',
            title: 'Steady Weight Loss Progress',
            description: `You've lost ${(recentWeights[3] - recentWeights[0]).toFixed(1)} lbs over recent measurements.`,
            trend: 'down',
            priority: 'medium',
            category: 'health',
            date: new Date(),
          });
        }
      }

      // Calorie burn insight
      if (workoutStats.totalCalories >= 5000) {
        insights.push({
          id: 'high_calorie_burn',
          type: 'achievement',
          title: 'High Calorie Burn',
          description: `You've burned ${workoutStats.totalCalories.toLocaleString()} calories in workouts this month!`,
          value: workoutStats.totalCalories,
          priority: 'low',
          category: 'fitness',
          date: new Date(),
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      return [];
    }
  }

  private async generateWeeklyInsights(
    userId: string, 
    weekStart: Date, 
    weekEnd: Date, 
    workoutStats: WorkoutStatsSummary
  ): Promise<AnalyticsInsight[]> {
    const insights: AnalyticsInsight[] = [];

    // Workout frequency insight
    if (workoutStats.totalWorkouts >= 5) {
      insights.push({
        id: 'weekly_workout_goal',
        type: 'achievement',
        title: 'Weekly Workout Goal Achieved',
        description: `Great job! You completed ${workoutStats.totalWorkouts} workouts this week.`,
        value: workoutStats.totalWorkouts,
        target: 5,
        priority: 'medium',
        category: 'fitness',
        date: new Date(),
      });
    } else if (workoutStats.totalWorkouts < 3) {
      insights.push({
        id: 'low_workout_frequency',
        type: 'recommendation',
        title: 'Increase Workout Frequency',
        description: `You only completed ${workoutStats.totalWorkouts} workouts this week. Aim for at least 3-5.`,
        value: workoutStats.totalWorkouts,
        target: 3,
        priority: 'medium',
        category: 'fitness',
        date: new Date(),
      });
    }

    return insights;
  }

  private async calculateWeeklyNutritionScore(
    userId: string, 
    weekStart: Date, 
    weekEnd: Date
  ): Promise<{ score: number; details: any }> {
    try {
      const entries = await nutritionService.getNutritionByDateRange(userId, weekStart, weekEnd);
      
      if (entries.length === 0) {
        return { score: 0, details: { reason: 'No nutrition data' } };
      }

      const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
      const totalProtein = entries.reduce((sum, entry) => sum + Number(entry.protein || 0), 0);
      const avgDailyCalories = totalCalories / 7;
      const avgDailyProtein = totalProtein / 7;

      // Simple scoring algorithm
      let score = 50; // Base score
      
      // Protein score (0-25 points)
      if (avgDailyProtein >= 100) score += 25;
      else if (avgDailyProtein >= 80) score += 20;
      else if (avgDailyProtein >= 60) score += 15;
      else if (avgDailyProtein >= 40) score += 10;

      // Calorie consistency (0-25 points)
      if (avgDailyCalories >= 1800 && avgDailyCalories <= 2200) score += 25;
      else if (avgDailyCalories >= 1600 && avgDailyCalories <= 2400) score += 15;
      else if (avgDailyCalories >= 1400 && avgDailyCalories <= 2600) score += 5;

      return {
        score: Math.min(100, Math.max(0, score)),
        details: { avgDailyCalories, avgDailyProtein, entryCount: entries.length }
      };
    } catch (error) {
      return { score: 0, details: { error: error instanceof Error ? error.message : 'Unknown error' } };
    }
  }

  private async calculateRecoveryScore(
    userId: string, 
    weekStart: Date, 
    weekEnd: Date
  ): Promise<number> {
    try {
      const metrics = await healthMetricsService.getMetricsByDateRange(userId, weekStart, weekEnd);
      
      if (metrics.length === 0) return 50;

      const avgSleep = metrics.reduce((sum, m) => sum + Number(m.sleepHours || 0), 0) / metrics.length;
      const avgRestingHR = metrics.reduce((sum, m) => sum + (m.heartRateResting || 60), 0) / metrics.length;

      let score = 50; // Base score

      // Sleep score (0-30 points)
      if (avgSleep >= 8) score += 30;
      else if (avgSleep >= 7) score += 20;
      else if (avgSleep >= 6) score += 10;

      // Resting heart rate score (0-20 points)
      if (avgRestingHR <= 55) score += 20;
      else if (avgRestingHR <= 60) score += 15;
      else if (avgRestingHR <= 65) score += 10;

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      return 50;
    }
  }

  private async calculateConsistencyScore(
    userId: string, 
    weekStart: Date, 
    weekEnd: Date
  ): Promise<number> {
    try {
      const workouts = await workoutService.getWorkoutsByUserId(userId, 100);
      const weekWorkouts = workouts.filter(w => {
        const date = new Date(w.date);
        return date >= weekStart && date <= weekEnd;
      });

      // Simple consistency scoring based on workout distribution
      const workoutDays = new Set(weekWorkouts.map(w => new Date(w.date).toDateString())).size;
      
      let score = 0;
      if (workoutDays >= 6) score = 100;
      else if (workoutDays >= 5) score = 85;
      else if (workoutDays >= 4) score = 70;
      else if (workoutDays >= 3) score = 55;
      else if (workoutDays >= 2) score = 40;
      else if (workoutDays >= 1) score = 25;

      return score;
    } catch (error) {
      return 50;
    }
  }

  private calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const first = values[values.length - 1];
    const last = values[0];
    const change = last - first;
    const percentChange = Math.abs(change / first) * 100;

    if (percentChange < 2) return 'stable';
    return change > 0 ? 'up' : 'down';
  }

  private async calculateAverageSleep(userId: string, startDate: Date, endDate: Date): Promise<number> {
    try {
      const metrics = await healthMetricsService.getMetricsByDateRange(userId, startDate, endDate);
      if (metrics.length === 0) return 0;
      
      return metrics.reduce((sum, m) => sum + Number(m.sleepHours || 0), 0) / metrics.length;
    } catch (error) {
      return 0;
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
