import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  StatusBar,
  useColorScheme,
  Dimensions,
  Easing,
  Vibration,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

/* ---------- Colour System ---------- */

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
  tip: '#fef3c7',
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
  tip: '#374151',
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
  tip: string;
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
    tip: palette.tip,
  };
};

/* ---------- Enhanced Floating Particles ---------- */

const FloatingParticles: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
  const particles = Array.from({ length: 30 }, (_, i) => {
    const animValue = useRef(new Animated.Value(0));
    const pulseValue = useRef(new Animated.Value(0));
    
    const anim = animValue.current;
    const pulse = pulseValue.current;

    useEffect(() => {
      const delay = Math.random() * 3000;
      
      const startAnimations = () => {
        Animated.loop(
          Animated.timing(anim, {
            toValue: 1,
            duration: 6000 + Math.random() * 4000,
            useNativeDriver: true,
            easing: Easing.sin,
          }),
        ).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 1500 + Math.random() * 1000,
              useNativeDriver: true,
              easing: Easing.quad,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 1500 + Math.random() * 1000,
              useNativeDriver: true,
              easing: Easing.quad,
            }),
          ])
        ).start();
      };

      const timer = setTimeout(startAnimations, delay);
      return () => clearTimeout(timer);
    }, [anim, pulse]);

    const colors = [theme.accentA, theme.accentB, theme.accentC, theme.accentD];
    const particleColor = colors[i % colors.length];

    return (
      <Animated.View
        key={i}
        style={[
          {
            position: 'absolute',
            left: Math.random() * (width - 20),
            top: Math.random() * (height - 100),
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            borderRadius: 6,
            backgroundColor: particleColor,
          },
          {
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -120 - Math.random() * 80],
                }),
              },
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1.5],
                }),
              },
            ],
            opacity: anim.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 0.7, 0.7, 0],
            }),
          },
        ]}
      />
    );
  });

  return (
    <View style={{ position: 'absolute', width, height }} pointerEvents="none">
      {particles}
    </View>
  );
};

/* ---------- Interactive Tip Card ---------- */

interface TipCardProps {
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  delay?: number;
}

const TipCard: React.FC<TipCardProps> = ({ title, description, color, onPress, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 100,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [scaleAnim, delay]);

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(20);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.tipCard,
          {
            backgroundColor: color,
            borderColor: isPressed ? 'rgba(255,255,255,0.3)' : 'transparent',
            borderWidth: 2,
          },
        ]}
      >
        <Text style={styles.tipTitle}>{title}</Text>
        <Text style={styles.tipDescription}>{description}</Text>
      </Pressable>
    </Animated.View>
  );
};

/* ---------- Role Switcher ---------- */

interface RoleSwitcherProps {
  role: 'seller' | 'buyer';
  onToggle: () => void;
  theme: ThemeColors;
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ role, onToggle, theme }) => {
  const slideAnim = useRef(new Animated.Value(role === 'seller' ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: role === 'seller' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
  }, [role, slideAnim]);

  const handlePress = () => {
    Vibration.vibrate(30);
    onToggle();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.roleSwitcher,
          {
            shadowColor: theme.shadow,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.roleSwitcherInner,
            {
              backgroundColor: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [theme.accentA, theme.accentB],
              }),
            },
          ]}
        >
          <Text style={styles.roleSwitcherText}>
            Switch to {role === 'seller' ? 'Buyer' : 'Seller'} Mode
          </Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

/* ---------- Action Card ---------- */

interface ActionCardProps {
  title: string;
  subtitle: string;
  gradient: readonly [string, string];
  onPress: () => void;
  delay?: number;
  theme: ThemeColors;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  title, 
  subtitle, 
  gradient, 
  onPress, 
  delay = 0, 
  theme 
}) => {
  const riseAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.spring(riseAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 120,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [riseAnim, delay]);

  const handlePressIn = () => {
    setIsPressed(true);
    Vibration.vibrate(25);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateY: riseAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            { scale: isPressed ? 0.98 : 1 },
          ],
          opacity: riseAnim,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradient}
          style={[
            styles.actionCard,
            {
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

/* ---------- Bottom Navigation ---------- */

interface BottomNavigationProps {
  router: any;
  theme: ThemeColors;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ router, theme }) => {
  const [activeTab, setActiveTab] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Enhanced navigation items with custom home icon
  const navItems = [
    { 
      label: 'Home', 
      route: null, 
      icon: 'custom' // Special identifier for custom icon
    },
    { 
      label: 'Chats', 
      route: '/chats', 
      icon: '💬' 
    },
    { 
      label: 'Alerts', 
      route: '/notifications', 
      icon: '⚪' 
    },
    { 
      label: 'Settings', 
      route: '/settings', 
      icon: '⚙️' 
    },
  ];

  // Smooth back animation effect
  useFocusEffect(
    React.useCallback(() => {
      // When dashboard comes into focus, animate back to home
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 100,
      }).start();
      setActiveTab(0);
    }, [slideAnim])
  );

  const handleTabPress = (index: number, route: string | null) => {
    setActiveTab(index);
    Vibration.vibrate(20);
    
    // Smooth animation with enhanced easing
    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: false,
      friction: 8,
      tension: 120,
    }).start();
    
    if (route) router.push(route);
  };

  return (
    <View style={[styles.bottomNav, { 
      backgroundColor: theme.navBg, 
      borderTopColor: theme.navBorder,
      shadowColor: theme.shadow,
    }]}>
      {/* Enhanced indicator with smooth animation */}
      <Animated.View
        style={[
          styles.navIndicator,
          {
            backgroundColor: theme.accentA,
            left: slideAnim.interpolate({
              inputRange: [0, 1, 2, 3],
              outputRange: [
                width * 0.125 - 20,
                width * 0.375 - 20,
                width * 0.625 - 20,
                width * 0.875 - 20,
              ],
            }),
            // Add pulsing effect for active indicator
            transform: [{
              scale: slideAnim.interpolate({
                inputRange: [0, 1, 2, 3],
                outputRange: [1.2, 1, 1, 1],
              })
            }]
          },
        ]}
      />
      
      {navItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          onPress={() => handleTabPress(index, item.route)}
          activeOpacity={0.7}
        >
          {item.icon === 'custom' ? (
            // Custom home icon with white square and black plus
            <Animated.View
              style={[
                styles.customIconContainer,
                {
                  transform: [{
                    scale: activeTab === index ? 1.1 : 1
                  }]
                }
              ]}
            >
              <Text style={[
                styles.customIconBase, 
                { opacity: activeTab === index ? 1 : 0.5 }
              ]}>
                ⬜
              </Text>
              <Text style={[
                styles.customIconOverlay,
                { opacity: activeTab === index ? 1 : 0.7 }
              ]}>
                +
              </Text>
            </Animated.View>
          ) : (
            <Animated.Text
              style={[
                styles.navIcon,
                { 
                  opacity: activeTab === index ? 1 : 0.5,
                  transform: [{
                    scale: activeTab === index ? 1.1 : 1
                  }]
                }
              ]}
            >
              {item.icon}
            </Animated.Text>
          )}
          <Text
            style={[
              styles.navLabel,
              {
                color: activeTab === index ? theme.accentA : theme.textSub,
                fontWeight: activeTab === index ? '600' : '500',
              }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ---------- Main Dashboard ---------- */

export default function Dashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark' ? 'dark' : 'light');

  const [role, setRole] = useState<'seller' | 'buyer'>('seller');
  const [loading, setLoading] = useState(true);

  const sellerTips = [
    {
      title: 'Complete Your Profile',
      description: 'Add detailed descriptions and showcase your best work to attract clients',
      color: theme.accentC,
    },
    {
      title: 'Respond Quickly',
      description: 'Fast response times build trust and improve your reputation score',
      color: theme.accentD,
    },
    {
      title: 'Set Competitive Prices',
      description: 'Research market rates and price your services competitively',
      color: theme.accentE,
    },
  ];

  const buyerTips = [
    {
      title: 'Be Specific',
      description: 'Clear project descriptions help you find the right professionals faster',
      color: theme.accentC,
    },
    {
      title: 'Check Reviews',
      description: 'Read previous client feedback to make informed hiring decisions',
      color: theme.accentD,
    },
    {
      title: 'Communicate Clearly',
      description: 'Detailed briefs and expectations lead to better project outcomes',
      color: theme.accentE,
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleTipPress = (title: string) => {
    Vibration.vibrate(15);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <View style={[styles.loadingIcon, { backgroundColor: theme.accentA, shadowColor: theme.shadow }]}>
          <Text style={styles.loadingText}>WC</Text>
        </View>
        <Text style={[styles.loadingLabel, { color: theme.text }]}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        translucent 
        backgroundColor="transparent" 
      />
      <FloatingParticles theme={theme} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>WorkConnect</Text>
        <Text style={[styles.headerSub, { color: theme.textSub }]}>
          {role === 'seller' ? (
            <>
              <Text style={{ fontWeight: '700' }}>Seller</Text> Dashboard
            </>
          ) : (
            <>
              <Text style={{ fontWeight: '700' }}>Buyer</Text> Dashboard
            </>
          )}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <RoleSwitcher 
          role={role} 
          onToggle={() => setRole(role === 'seller' ? 'buyer' : 'seller')} 
          theme={theme} 
        />

        <View style={styles.actionContainer}>
          {role === 'seller' ? (
            <ActionCard
              title="Manage Services"
              subtitle="Create, edit, and optimize your service offerings to attract more clients"
              gradient={theme.gradient}
              onPress={() => router.push('/createGig')}
              theme={theme}
            />
          ) : (
            <ActionCard
              title="Find Talent"
              subtitle="Browse and discover skilled professionals perfect for your project needs"
              gradient={[theme.accentB, theme.accentA] as const}
              onPress={() => router.push('/search')}
              theme={theme}
            />
          )}
        </View>

        <View style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>
            {role === 'seller' ? 'Seller Tips' : 'Buyer Tips'}
          </Text>
          <View style={styles.tipsGrid}>
            {(role === 'seller' ? sellerTips : buyerTips).map((tip, index) => (
              <TipCard
                key={index}
                title={tip.title}
                description={tip.description}
                color={tip.color}
                onPress={() => handleTipPress(tip.title)}
                delay={index * 100}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation router={router} theme={theme} />
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
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingLabel: {
    marginTop: 20,
    fontSize: 16,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  roleSwitcher: {
    height: 56,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 24,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  roleSwitcherInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleSwitcherText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionContainer: {
    marginBottom: 30,
  },
  actionCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    height: 160,
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsGrid: {
    gap: 12,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  tipDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingBottom: 20,
    position: 'relative',
    elevation: 8,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navIndicator: {
    position: 'absolute',
    top: 6,
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  // Custom icon styles for the home button
  customIconContainer: {
    position: 'relative',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  customIconBase: {
    fontSize: 20,
    position: 'absolute',
  },
  customIconOverlay: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '900',
    position: 'absolute',
    zIndex: 1,
    top: -1, // Fine-tune positioning
  },
});
