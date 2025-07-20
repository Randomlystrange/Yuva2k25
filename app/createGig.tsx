import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
  useColorScheme,
  Animated,
  Easing,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  doc,
  getFirestore,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth } from '../firebase';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Checkbox from 'expo-checkbox';

const { width, height } = Dimensions.get('window');
const OPENCAGE_API_KEY = '5bccfdbf9b1841c5a2f3fa69710f6d3c';

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
  border: '#e5e7eb',
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
  border: '#4b5563',
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
  border: string;
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
    border: palette.border,
    shadow: palette.shadow,
  };
};

/* ---------- Floating Particles ---------- */

const FloatingParticles: React.FC<{ theme: ThemeColors }> = ({ theme }) => {
  const particles = Array.from({ length: 20 }, (_, i) => {
    const animValue = useRef(new Animated.Value(0));
    const anim = animValue.current;

    useEffect(() => {
      const delay = Math.random() * 3000;
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

/* ---------- Animated Input Component ---------- */

interface AnimatedInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'number-pad';
  theme: ThemeColors;
  delay?: number;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  theme,
  delay = 0,
}) => {
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
      }}
    >
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            color: theme.text,
            shadowColor: theme.shadow,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSub}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </Animated.View>
  );
};

/* ---------- Main Component ---------- */

export default function CreateGig() {
  const db = getFirestore();
  const router = useRouter();
  const uid = auth.currentUser?.uid;
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark' ? 'dark' : 'light');

  const [role, setRole] = useState<'seller' | 'buyer'>('seller');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [workingDays, setWorkingDays] = useState('');
  const [category, setCategory] = useState('cook');
  const [visible, setVisible] = useState(true);
  const [location, setLocation] = useState<{ city: string; lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const sellerRef = doc(db, 'Sellers', uid);
        const buyerRef = doc(db, 'Buyers', uid);

        const sellerSnap = await getDoc(sellerRef);
        const buyerSnap = await getDoc(buyerRef);

        if (sellerSnap.exists()) {
          const data = sellerSnap.data();
          setRole('seller');
          setName(data.name || '');
          setAge(String(data.age || ''));
          setPrice(String(data.price || ''));
          setWorkingDays(String(data.workingDays || ''));
          setCategory(data.category || 'cook');
          setVisible(data.visible !== false);
        } else if (buyerSnap.exists()) {
          const data = buyerSnap.data();
          setRole('buyer');
          setName(data.name || '');
          setAge(String(data.age || ''));
          setPrice(String(data.price || ''));
          setWorkingDays(String(data.workingDays || ''));
          setCategory(data.category || 'cook');
          setVisible(data.visible !== false);
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required');
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;

        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}`
        );
        const geo = await res.json();
        const components = geo?.results?.[0]?.components || {};
        const city =
          components.city ||
          components.town ||
          components.village ||
          components.state_district ||
          components.state ||
          '';

        if (!city) {
          Alert.alert('Location Error', 'Could not detect city');
        }

        setLocation({ city: city.toLowerCase(), lat, lon });
      } catch (err) {
        console.error('Error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, [uid]);

  const handleSave = async () => {
    if (!uid || !location) return;

    Vibration.vibrate(25);

    const gigData = {
      name,
      age: Number(age),
      price: Number(price),
      workingDays: Number(workingDays),
      category,
      visible,
      location
    };

    const ref = doc(db, role === 'seller' ? 'Sellers' : 'Buyers', uid);

    try {
      await setDoc(ref, gigData, { merge: true });
      Alert.alert('Success', 'Your gig has been saved');
      router.replace('/dashboard');
    } catch (err) {
      Alert.alert('Error', 'Could not save gig');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Gig',
      'Are you sure you want to delete your gig? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!uid) return;
            Vibration.vibrate(30);
            const ref = doc(db, role === 'seller' ? 'Sellers' : 'Buyers', uid);

            try {
              await deleteDoc(ref);
              Alert.alert('Deleted', 'Your gig has been removed.');
              router.replace('/dashboard');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete gig.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />
      
      <FloatingParticles theme={theme} />

      {/* Header - Simplified without back button */}
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {role === 'seller' ? 'Manage Services' : 'Find Services'}
        </Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Input Fields */}
        <AnimatedInput
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
          theme={theme}
          delay={0}
        />

        <AnimatedInput
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          theme={theme}
          delay={100}
        />

        <AnimatedInput
          placeholder="Price (₹)"
          value={price}
          onChangeText={setPrice}
          keyboardType="number-pad"
          theme={theme}
          delay={200}
        />

        <AnimatedInput
          placeholder="Working Days/Month"
          value={workingDays}
          onChangeText={setWorkingDays}
          keyboardType="number-pad"
          theme={theme}
          delay={300}
        />

        {/* Category Picker */}
        <Animated.View
          style={{
            transform: [
              {
                translateX: new Animated.Value(-50).interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
            opacity: 1,
          }}
        >
          <Text style={[styles.label, { color: theme.text }]}>Select Category</Text>
          <View style={[
            styles.pickerWrapper,
            {
              backgroundColor: theme.cardBg,
              borderColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}>
            <Picker
              selectedValue={category}
              onValueChange={(value) => {
                Vibration.vibrate(15);
                setCategory(value);
              }}
              style={[styles.picker, { color: theme.text }]}
            >
              <Picker.Item label="Cook" value="cook" />
              <Picker.Item label="Driver" value="driver" />
              <Picker.Item label="Cleaner" value="cleaner" />
              <Picker.Item label="Mechanic" value="mechanic" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>
        </Animated.View>

        {/* Visibility Checkbox - Ultra minimal padding */}
        <View style={styles.checkboxRow}>
          <Checkbox
            value={visible}
            onValueChange={(value) => {
              Vibration.vibrate(15);
              setVisible(value);
            }}
            color={visible ? theme.accentC : theme.border}
          />
          <Text style={[styles.checkboxLabel, { color: theme.text }]}>
            Gig is visible to others
          </Text>
        </View>

        {/* Location Display */}
        <View style={[
          styles.locationBox,
          {
            backgroundColor: theme.cardBg,
            shadowColor: theme.shadow,
          },
        ]}>
          <Text style={[styles.locationText, { color: theme.text }]}>
            Location: {location?.city || 'Detecting city...'}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButtonContainer}
        >
          <LinearGradient
            colors={theme.gradient}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Gig'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {!loading && (
          <TouchableOpacity
            onPress={handleDelete}
            style={[styles.deleteButton, { backgroundColor: theme.accentE }]}
          >
            <Text style={styles.deleteButtonText}>Delete Gig</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 4, // Reduced even further
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 160 : 48,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4, // Reduced from 8 to 4
    paddingHorizontal: 4,
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  locationBox: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  saveButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
