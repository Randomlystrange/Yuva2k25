import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('window')

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.replace('/dashboard')
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your WorkConnect account</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder='Email'
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder='Password'
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: height * 0.05
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280'
  },
  form: {},
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
})
