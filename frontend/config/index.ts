import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database"; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

const firebaseConfig = {
  apiKey: "AIzaSyCHKzxlxjMJJL5lThfrsGs1K8wsryCvEJ0",
  authDomain: "sweet-sour-39dd2.firebaseapp.com",
  projectId: "sweet-sour-39dd2",
  storageBucket: "sweet-sour-39dd2.appspot.com",
  messagingSenderId: "886189618543",
  appId: "1:886189618543:web:c568ac3e059366649b249a",
  measurementId: "G-TNNXR8NLLB"
};

// Inicialize o Firebase app
const app = initializeApp(firebaseConfig);

// Inicialize Firestore
export const db = getFirestore(app);

// Inicialize o Firebase Auth com persistência
export const authFirebase = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage), // Configurar AsyncStorage para persistência
});

// Inicialize o Firebase Storage
export const storage = getStorage(app);

// Inicialize o Firebase Realtime Database
export const database = getDatabase(app);