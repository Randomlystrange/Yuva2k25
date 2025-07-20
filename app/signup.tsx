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
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { useRouter } from 'expo-router'

const { width, height } = Dimensions.get('window')

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    setLoading(true)
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      Alert.alert('Success')
      router.replace('/signin')
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Join WorkConnect</Text>
          <Text style={styles.subtitle}>Create your account to get started</Text>
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
          <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Sign Up'}
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
