import React, { useState } from "react";
import { reloadAppAsync } from "expo";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Text,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { handleClientError } from "@/lib/error-handling";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const insets = useSafeAreaInsets();
  const [showDetails, setShowDetails] = useState(false);

  const userFriendlyMessage = handleClientError(error);

  const handleRetry = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    resetError();
  };

  const handleReload = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    try {
      await reloadAppAsync();
    } catch (reloadError) {
      console.error('Failed to reload app:', reloadError);
      resetError();
    }
  };

  const handleToggleDetails = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowDetails(!showDetails);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="warning-outline" size={64} color={Colors.red} />
        </View>

        <Text style={styles.title}>Oops! Something went wrong</Text>
        
        <Text style={styles.message}>{userFriendlyMessage}</Text>

        <View style={styles.actionsContainer}>
          <Pressable style={styles.retryButton} onPress={handleRetry}>
            <Ionicons name="refresh-outline" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable style={styles.reloadButton} onPress={handleReload}>
            <Ionicons name="reload-outline" size={20} color={Colors.white} />
            <Text style={styles.reloadButtonText}>Reload App</Text>
          </Pressable>

          <Pressable 
            style={styles.detailsButton} 
            onPress={handleToggleDetails}
          >
            <Ionicons 
              name={showDetails ? "chevron-up-outline" : "chevron-down-outline"} 
              size={20} 
              color={Colors.white} 
            />
            <Text style={styles.detailsButtonText}>
              {showDetails ? 'Hide' : 'Show'} Details
            </Text>
          </Pressable>
        </View>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Error Details</Text>
            <Text style={styles.errorText}>{error.message}</Text>
            {error.stack && (
              <Text style={styles.stackTrace}>{error.stack}</Text>
            )}
          </View>
        )}

        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If this problem persists, please contact support or restart the app.
          </Text>
        </View>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.teal,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  reloadButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
  },
  detailsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 32,
  },
  detailsTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.muted,
    backgroundColor: Colors.charcoal,
    padding: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  helpContainer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  helpTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: Colors.white,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    fontFamily: 'Outfit_300Light',
    color: Colors.lightText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
