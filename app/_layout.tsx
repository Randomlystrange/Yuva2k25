import React, { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { ActivityIndicator, View } from 'react-native'

export default function Layout() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, () => setLoading(false))
    return unsub
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
