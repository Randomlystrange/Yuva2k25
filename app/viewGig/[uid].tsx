import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEffect, useState } from 'react'
import { getDoc, doc, setDoc, getFirestore } from 'firebase/firestore'
import { auth } from '../../firebase'

export default function ViewGig() {
  const { uid } = useLocalSearchParams()
  const router = useRouter()
  const db = getFirestore()
  const currentUser = auth.currentUser?.uid

  const [gig, setGig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const loadGig = async () => {
      try {
        const ref = doc(db, 'Sellers', uid as string)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
          Alert.alert('Error', 'Gig not found')
          router.back()
          return
        }

        setGig(snap.data())
      } catch (err) {
        Alert.alert('Error', 'Failed to load gig')
      } finally {
        setLoading(false)
      }
    }

    loadGig()
  }, [uid])

  const handleAction = async (status: 'accepted' | 'rejected') => {
    if (!uid || !currentUser) return

    const message = {
      from: currentUser,
      to: uid,
      type: status,
      timestamp: Date.now()
    }

    try {
      await setDoc(
        doc(db, 'Notifications', uid as string, 'messages', Date.now().toString()),
        message
      )
      Alert.alert('Success', `Gig ${status}`)
      router.replace('/dashboard')
    } catch (err) {
      Alert.alert('Error', 'Failed to send notification')
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>{gig?.name}</Text>
        <Text style={styles.label}>Age: {gig?.age}</Text>
        <Text style={styles.label}>Price: ₹{gig?.price}</Text>
        <Text style={styles.label}>Working Days: {gig?.workingDays}</Text>
        <Text style={styles.label}>City: {gig?.location?.city}</Text>

        {currentUser !== uid && (
          <>
            <TouchableOpacity
              style={[styles.button, styles.accept]}
              onPress={() => handleAction('accepted')}
            >
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.reject]}
              onPress={() => handleAction('rejected')}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scroll: {
    padding: 20
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 10
  },
  button: {
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center'
  },
  accept: {
    backgroundColor: '#22c55e'
  },
  reject: {
    backgroundColor: '#ef4444'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
