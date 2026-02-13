import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to Vitality",
    subtitle: "Your Health Journey Starts Here",
    icon: "fitness-outline",
    description: "Track your daily metrics, monitor workouts, and achieve your fitness goals with our comprehensive health tracking platform."
  },
  {
    id: 2,
    title: "Personalized Insights",
    subtitle: "Data-Driven Health Analysis",
    icon: "analytics-outline",
    description: "Get personalized recommendations based on your health data. Track trends, set goals, and receive actionable insights."
  },
  {
    id: 3,
    title: "Connected Ecosystem",
    subtitle: "Sync All Your Health Data",
    icon: "link-outline",
    description: "Connect with Apple Health, Strava, and other fitness apps to centralize all your health information in one place."
  }
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(prev => prev + 1);
      translateX.value = withSpring(-(currentStep + 1) * width);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    handleGetStarted();
  };

  const handleGetStarted = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace('/auth/register');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setCurrentStep(prev => prev - 1);
      translateX.value = withSpring(-(currentStep - 1) * width);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Pressable
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentStep(index);
          }}
          scrollEnabled={false}
        >
          {onboardingSteps.map((step, index) => (
            <Animated.View
              key={step.id}
              entering={FadeIn.duration(800).delay(index * 200)}
              style={[styles.stepContainer, { width }]}
            >
              <View style={styles.iconContainer}>
                <Ionicons 
                  name={step.icon as any} 
                  size={80} 
                  color={Colors.white} 
                />
              </View>
              
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.subtitle}>{step.subtitle}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </Pressable>
          )}
          
          <Pressable
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.nextButtonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={Colors.deepBlack} 
            />
          </Pressable>
        </View>
      </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Outfit_400Regular',
    color: Colors.teal,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.white,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.deepBlack,
    letterSpacing: 0.5,
  },
});
