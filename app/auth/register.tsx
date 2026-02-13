import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useAuth } from '@/lib/auth-context';
import { type RegisterCredentials } from '@/lib/auth';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    email: '',
    password: '',
    name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterCredentials>>({});

  const handleRegister = async () => {
    // Validate input
    const newErrors: Partial<RegisterCredentials> = {};
    
    if (!credentials.name) {
      newErrors.name = 'Name is required';
    } else if (credentials.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    } else if (credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      await register(credentials);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'An error occurred');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(800)}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Vitality today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NAME</Text>
              <View style={[
                styles.inputContainer,
                errors.name && styles.inputError
              ]}>
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={errors.name ? Colors.red : Colors.muted} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.muted}
                  value={credentials.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <View style={[
                styles.inputContainer,
                errors.email && styles.inputError
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={errors.email ? Colors.red : Colors.muted} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.muted}
                  value={credentials.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[
                styles.inputContainer,
                errors.password && styles.inputError
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={errors.password ? Colors.red : Colors.muted} 
                />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.muted}
                  value={credentials.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => {
                    if (Platform.OS !== 'web') {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    setShowPassword(!showPassword);
                  }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.muted}
                  />
                </Pressable>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.registerButtonPressed,
                isLoading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Pressable>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                // TODO: Implement Apple Sign In
              }}
            >
              <Ionicons name="logo-apple" size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.socialButtonPressed,
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                // TODO: Implement Google Sign In
              }}
            >
              <Ionicons name="logo-google" size={20} color={Colors.white} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Pressable
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push('/auth/login');
              }}
            >
              <Text style={styles.linkText}>Sign In</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepBlack,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Outfit_300Light',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.red,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Outfit_300Light',
    color: Colors.red,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  registerButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonPressed: {
    opacity: 0.8,
  },
  registerButtonDisabled: {
    opacity: 0.5,
  },
  registerButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: Colors.deepBlack,
    letterSpacing: 0.5,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 12,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    letterSpacing: 0.5,
  },
  termsLink: {
    color: Colors.white,
    fontFamily: 'Outfit_400Regular',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 2,
    marginHorizontal: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  socialButtonPressed: {
    opacity: 0.7,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.muted,
    letterSpacing: 0.5,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
