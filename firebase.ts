import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDHz130eJ_vGaKo-O2AvuePhoRBlFV8HH4",
  authDomain: "work-connect-333f5.firebaseapp.com",
  projectId: "work-connect-333f5",
  storageBucket: "work-connect-333f5.firebasestorage.app",
  messagingSenderId: "277833084769",
  appId: "1:277833084769:web:b51fa0e47bebec1aff5f20",
  measurementId: "G-0FLPXG9732"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
