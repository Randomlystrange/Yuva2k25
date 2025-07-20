import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { auth } from '../firebase'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const { width } = Dimensions.get('window')

export default function NotificationsPage() {
  const uid = auth.currentUser?.uid
  const db = getFirestore()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return

    const fetchMessages = async () => {
      try {
        const ref = collection(db, 'Notifications', uid, 'messages')
        const snapshot = await getDocs(ref)

        const data = snapshot.docs
          .map(doc => doc.data())
          .sort((a, b) => b.timestamp - a.timestamp)

        setMessages(data)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }

      setLoading(false)
    }

    fetchMessages()
  }, [uid])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#2563eb' />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>
              Your gig was <Text style={{ fontWeight: 'bold' }}>{item.type}</Text> by a buyer.
            </Text>
            <Text style={styles.time}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: width * 0.05
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  text: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4
  },
  time: {
    fontSize: 12,
    color: '#6b7280'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
})