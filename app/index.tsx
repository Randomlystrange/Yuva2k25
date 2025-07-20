import React from 'react';
import type { ColorValue } from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const lightColors = {
  background: '#ffffff',
  gradientStart: '#4c51bf', // Much darker purple
  gradientEnd: '#553c9a', // Much darker purple
  heroGradientStart: '#d53f8c', // Much darker pink
  heroGradientEnd: '#c53030', // Much darker red
  cardGradientStart: '#2b6cb0', // Much darker blue
  cardGradientEnd: '#1a365d', // Much darker blue
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textLight: '#ffffff',
  accent: '#38a169', // Lighter green (just a smidge darker than previous)
  accentSecondary: '#319795', // Lighter teal (just a smidge darker than previous)
};

const darkColors = {
  background: '#1a202c',
  gradientStart: '#2d3748',
  gradientEnd: '#1a202c',
  heroGradientStart: '#667eea',
  heroGradientEnd: '#764ba2',
  cardGradientStart: '#2d3748',
  cardGradientEnd: '#4a5568',
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
  textLight: '#ffffff',
  accent: '#68d391',
  accentSecondary: '#4fd1c7',
};

export default function WelcomePage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const features: {
    icon: string;
    title: string;
    description: string;
    gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
  }[] = [
    {
      icon: '📍',
      title: 'Local Opportunities',
      description: 'Browse nearby jobs effortlessly in just a few taps.',
      gradient: colorScheme === 'dark' 
        ? ['#ff9a9e', '#fecfef'] 
        : ['#c53030', '#e53e3e'], // Much darker red gradient for light mode
    },
    {
      icon: '👤',
      title: 'Professional Profile',
      description: 'Showcase your experience and attract potential employers.',
      gradient: colorScheme === 'dark' 
        ? ['#a8edea', '#fed6e3'] 
        : ['#319795', '#2c5282'], // Much darker teal to blue gradient for light mode
    },
    {
      icon: '💬',
      title: 'Instant Communication',
      description: 'Message and schedule with employers directly from the app.',
      gradient: colorScheme === 'dark' 
        ? ['#ffecd2', '#fcb69f'] 
        : ['#d69e2e', '#c05621'], // Much darker yellow to orange gradient for light mode
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.logo}>WorkConnect</Text>
            <Text style={styles.tagline}>Find work. Build your future.</Text>
          </View>
        </LinearGradient>

        {/* Hero Section with Gradient Background */}
        <LinearGradient
          colors={[colors.heroGradientStart, colors.heroGradientEnd]}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>🚀</Text>
            </View>
            <Text style={styles.heroTitle}>
              Discover flexible jobs that fit your lifestyle
            </Text>
            <Text style={styles.heroSubtitle}>
              Explore local opportunities and grow your career with ease
            </Text>
          </View>
        </LinearGradient>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose WorkConnect?</Text>
          
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              activeOpacity={0.8}
              accessibilityLabel={`${feature.title}: ${feature.description}`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={feature.gradient}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Section with Gradient */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.ctaSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>Get Started Today</Text>
            <Text style={styles.ctaSubtitle}>
              Create your profile to begin exploring new opportunities
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/signup')}
              activeOpacity={0.8}
              accessibilityLabel="Create Your Profile"
              accessibilityRole="button"
            >
              <LinearGradient
                colors={[colors.accent, colors.accentSecondary]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Create Your Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/signin')}
              activeOpacity={0.8}
              accessibilityLabel="Sign in to existing account"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

interface ThemeColors {
  background: string;
  gradientStart: string;
  gradientEnd: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  cardGradientStart: string;
  cardGradientEnd: string;
  textPrimary: string;
  textSecondary: string;
  textLight: string;
  accent: string;
  accentSecondary: string;
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },

    // Header
    header: {
      paddingTop: height * 0.02,
      paddingBottom: height * 0.04,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerContent: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
    },
    logo: {
      fontSize: 36,
      fontWeight: '800',
      color: colors.textLight,
      marginBottom: 8,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    tagline: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      fontWeight: '500',
      opacity: 0.9,
    },

    // Hero Section
    heroSection: {
      marginHorizontal: width * 0.05,
      marginTop: height * 0.03,
      borderRadius: 25,
      overflow: 'hidden',
    },
    heroContent: {
      alignItems: 'center',
      padding: width * 0.08,
    },
    heroIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 40,
      padding: 20,
      marginBottom: 24,
    },
    heroIcon: {
      fontSize: 48,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 34,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
    heroSubtitle: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      fontWeight: '400',
      opacity: 0.9,
      lineHeight: 24,
    },

    // Features Section
    featuresSection: {
      paddingHorizontal: width * 0.05,
      paddingVertical: height * 0.05,
    },
    sectionTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 32,
    },
    featureCard: {
      marginBottom: 20,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    featureGradient: {
      flexDirection: 'row',
      padding: 24,
      alignItems: 'center',
    },
    featureIconContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 25,
      padding: 16,
      marginRight: 20,
    },
    featureIcon: {
      fontSize: 32,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textLight,
      marginBottom: 8,
    },
    featureDescription: {
      fontSize: 16,
      color: colors.textLight,
      opacity: 0.9,
      lineHeight: 22,
    },

    // CTA Section
    ctaSection: {
      marginTop: height * 0.02,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
    },
    ctaContent: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.05,
      paddingBottom: height * 0.08,
    },
    ctaTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 12,
    },
    ctaSubtitle: {
      fontSize: 18,
      color: colors.textLight,
      textAlign: 'center',
      marginBottom: 32,
      opacity: 0.9,
      lineHeight: 24,
    },
    primaryButton: {
      width: '100%',
      marginBottom: 16,
      borderRadius: 15,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    buttonGradient: {
      paddingVertical: 18,
      paddingHorizontal: 32,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: colors.textLight,
      fontSize: 18,
      fontWeight: '600',
    },
    secondaryButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      width: '100%',
      alignItems: 'center',
      borderRadius: 15,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryButtonText: {
      color: colors.textLight,
      fontSize: 16,
      fontWeight: '500',
      opacity: 0.9,
    },
  });
}
