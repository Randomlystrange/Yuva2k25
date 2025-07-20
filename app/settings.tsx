import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  useColorScheme,
  Dimensions,
  Easing,
  Vibration,
  StyleSheet,
  Switch,
  Alert,
  Appearance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

/* ---------- Global Settings Storage ---------- */

// Storage keys
const STORAGE_KEYS = {
  HAPTICS_ENABLED: '@haptics_enabled',
  DARK_MODE_ENABLED: '@dark_mode_enabled',
};

// Global settings helper functions
export const GlobalSettings = {
  // Haptic settings
  async getHapticsEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.HAPTICS_ENABLED);
      return value !== null ? JSON.parse(value) : true; // Default to enabled
    } catch {
      return true; // Default to enabled on error
    }
  },

  async setHapticsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAPTICS_ENABLED, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to save haptics setting:', error);
    }
  },

  // Dark mode settings
  async getDarkModeEnabled(): Promise<boolean | null> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE_ENABLED);
      return value !== null ? JSON.parse(value) : null; // null means system default
    } catch {
      return null; // Default to system on error
    }
  },

  async setDarkModeEnabled(enabled: boolean | null): Promise<void> {
    try {
      if (enabled === null) {
        await AsyncStorage.removeItem(STORAGE_KEYS.DARK_MODE_ENABLED);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE_ENABLED, JSON.stringify(enabled));
      }
    } catch (error) {
      console.error('Failed to save dark mode setting:', error);
    }
  },

  // Utility function to trigger haptic feedback if enabled
  async vibrate(pattern?: number | number[]): Promise<void> {
    const hapticsEnabled = await this.getHapticsEnabled();
    if (hapticsEnabled) {
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern);
      } else {
        Vibration.vibrate(pattern || 20);
      }
    }
  },

  async getEffectiveTheme(): Promise<'light' | 'dark'> {
    const darkModeOverride = await this.getDarkModeEnabled();
    if (darkModeOverride !== null) {
      return darkModeOverride ? 'dark' : 'light';
    }
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  },
};

/* ---------- Theme System ---------- */

const lightPalette = {
  accentA: '#4c51bf',
  accentB: '#6366f1',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#ffffff',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#1f2937',
  textSub: '#6b7280',
  navBg: '#ffffff',
  navBorder: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

const darkPalette = {
  accentA: '#6366f1',
  accentB: '#8b5cf6',
  accentC: '#10b981',
  accentD: '#f59e0b',
  accentE: '#ef4444',
  surface: '#1f2937',
  background: '#111827',
  card: '#374151',
  text: '#ffffff',
  textSub: '#9ca3af',
  navBg: '#1f2937',
  navBorder: '#374151',
  shadow: 'rgba(0, 0, 0, 0.4)',
} as const;

interface ThemeColors {
  bg: string;
  surface: string;
  cardBg: string;
  text: string;
  textSub: string;
  gradient: readonly [string, string];
  accentA: string;
  accentB: string;
  accentC: string;
  accentD: string;
  accentE: string;
  navBg: string;
  navBorder: string;
  shadow: string;
}

const getTheme = (scheme: 'light' | 'dark'): ThemeColors => {
  const palette = scheme === 'dark' ? darkPalette : lightPalette;
  return {
    bg: palette.background,
    surface: palette.surface,
    cardBg: palette.card,
    text: palette.text,
    textSub: palette.textSub,
    gradient: [palette.accentA, palette.accentB] as const,
    accentA: palette.accentA,
    accentB: palette.accentB,
    accentC: palette.accentC,
    accentD: palette.accentD,
    accentE: palette.accentE,
    navBg: palette.navBg,
    navBorder: palette.navBorder,
    shadow: palette.shadow,
  };
};

/* ---------- Animated Settings Section ---------- */

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  delay?: number;
  theme: ThemeColors;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, delay = 0, theme }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [slideAnim, delay]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            }),
          },
        ],
        opacity: slideAnim,
        marginBottom: 24,
      }}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBg, shadowColor: theme.shadow }]}>
        {children}
      </View>
    </Animated.View>
  );
};

/* ---------- Settings Item Component ---------- */

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  theme: ThemeColors;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  theme,
  switchValue = false,
  onSwitchChange,
}) => {
  return (
    <View style={styles.settingsItem}>
      <View style={styles.settingsItemLeft}>
        <Text style={styles.settingsIcon}>{icon}</Text>
        <View style={styles.settingsTextContainer}>
          <Text style={[styles.settingsTitle, { color: theme.text }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: theme.textSub }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: theme.textSub, true: theme.accentC }}
        thumbColor={switchValue ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );
};

/* ---------- Floating Particles (Reduced for Settings) ---------- */

const FloatingParticles: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
  const particles = Array.from({ length: 15 }, (_, i) => {
    const animValue = useRef(new Animated.Value(0));
    const anim = animValue.current;

    useEffect(() => {
      const delay = Math.random() * 2000;
      const timer = setTimeout(() => {
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 8000 + Math.random() * 4000,
            useNativeDriver: true,
            easing: Easing.sin,
          }),
        ).start();
      }, delay);
      return () => clearTimeout(timer);
    }, [anim]);

    return (
      <Animated.View
        key={i}
        style={{
          position: 'absolute',
          left: Math.random() * width,
          top: Math.random() * height,
          width: 3 + Math.random() * 5,
          height: 3 + Math.random() * 5,
          borderRadius: 3,
          backgroundColor: theme.accentA,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -100 - Math.random() * 60],
              }),
            },
          ],
          opacity: anim.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 0.4, 0],
          }),
        }}
      />
    );
  });

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles}
    </View>
  );
};

/* ---------- Main Settings Component ---------- */

export default function Settings() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');
  const [darkModeOverride, setDarkModeOverride] = useState<boolean | null>(null);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const theme = getTheme(effectiveTheme);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [hapticsEnabled, darkModeEnabled, effectiveThemeValue] = await Promise.all([
          GlobalSettings.getHapticsEnabled(),
          GlobalSettings.getDarkModeEnabled(),
          GlobalSettings.getEffectiveTheme(),
        ]);

        setHapticFeedback(hapticsEnabled);
        setDarkModeOverride(darkModeEnabled);
        setEffectiveTheme(effectiveThemeValue);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Header animation
  useEffect(() => {
    if (!isLoading) {
      Animated.spring(headerAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    }
  }, [isLoading]);

  const handleBack = async () => {
    await GlobalSettings.vibrate(20);
    router.back();
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await GlobalSettings.vibrate(30);
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleDarkModeChange = async (value: boolean) => {
    await GlobalSettings.vibrate(15);
    
    const newOverride = value;
    setDarkModeOverride(newOverride);
    setEffectiveTheme(newOverride ? 'dark' : 'light');
    
    // Save to storage
    await GlobalSettings.setDarkModeEnabled(newOverride);
    
    // Update system appearance if possible
    try {
      Appearance.setColorScheme(newOverride ? 'dark' : 'light');
    } catch (error) {
      // Appearance.setColorScheme might not be available on all platforms
      console.log('Could not set system appearance:', error);
    }
  };

  const handleHapticChange = async (value: boolean) => {
    if (value) {
      await GlobalSettings.vibrate(15); // Give feedback when enabling
    }
    
    setHapticFeedback(value);
    await GlobalSettings.setHapticsEnabled(value);
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading Settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      
      <FloatingParticles theme={theme} />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            shadowColor: theme.shadow,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
            opacity: headerAnim,
          },
        ]}
      >
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <LinearGradient
            colors={theme.gradient}
            style={styles.backButtonGradient}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* App Preferences */}
        <SettingsSection title="App Preferences" theme={theme} delay={0}>
          <SettingsItem
            title="Dark Mode"
            subtitle={darkModeOverride === null 
              ? `Following system (currently ${systemColorScheme})` 
              : `Current mode: ${effectiveTheme === 'dark' ? 'Dark' : 'Light'}`
            }
            icon="🌙"
            switchValue={effectiveTheme === 'dark'}
            onSwitchChange={handleDarkModeChange}
            theme={theme}
          />
          <SettingsItem
            title="Haptic Feedback"
            subtitle="Enable vibration feedback for interactions"
            icon="📳"
            switchValue={hapticFeedback}
            onSwitchChange={handleHapticChange}
            theme={theme}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account" theme={theme} delay={100}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={[styles.signOutButton, { backgroundColor: theme.accentE }]}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 60,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
    textAlign: 'center',
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
