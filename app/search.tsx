import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { collection, getDocs, query, where, getFirestore } from 'firebase/firestore'
import { useRouter } from 'expo-router'

const { width } = Dimensions.get('window')

export default function SearchPage() {
  const db = getFirestore()
  const router = useRouter()

  const [city, setCity] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!city.trim()) return

    setLoading(true)
    setResults([])

    try {
      const q = query(collection(db, 'Sellers'), where('location.city', '==', city.toLowerCase()))
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setResults(data)
    } catch (err) {
      console.error('Error searching:', err)
    }

    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.header}>Search Sellers</Text>

        <TextInput
          style={styles.input}
          placeholder='Enter city'
          value={city}
          onChangeText={setCity}
        />

        <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search'}</Text>
        </TouchableOpacity>

        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/viewGig/[uid]', params: { uid: item.id } })}
              style={styles.resultCard}
            >
              <Text style={styles.resultTitle}>{item.name || 'No name'}</Text>
              <Text style={styles.resultText}>Age: {item.age || 'N/A'}</Text>
              <Text style={styles.resultText}>Price: ₹{item.price || 'N/A'}</Text>
              <Text style={styles.resultText}>Category: {item.category || 'N/A'}</Text>
              <Text style={styles.resultText}>Working Days: {item.workingDays || 'N/A'}</Text>
              <Text style={styles.resultText}>City: {item.location?.city || 'Unknown'}</Text>
            </TouchableOpacity>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingHorizontal: width * 0.05 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#1f2937', textAlign: 'center', marginVertical: 20 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 12 },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resultCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 6 },
  resultText: { fontSize: 14, color: '#4b5563' }
})
