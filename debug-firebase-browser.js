// Debug script to test Firebase in browser
console.log('🔍 Testing Firebase in browser...');

// Test if Firebase is available
try {
  console.log('Testing Firebase import...');
  const { initializeApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');
  
  const firebaseConfig = {
    apiKey: "AIzaSyDwKNJGewHPaDWPLqX4jsgQd8d5r3JhLxg",
    authDomain: "inner-orbit-app-2024.firebaseapp.com",
    projectId: "inner-orbit-app-2024",
    storageBucket: "inner-orbit-app-2024.firebasestorage.app",
    messagingSenderId: "121778623889",
    appId: "1:121778623889:web:3671b9328f5cf7f67ff630",
    measurementId: "",
  };
  
  console.log('Firebase config:', firebaseConfig);
  
  const app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized:', app);
  
  const db = getFirestore(app);
  console.log('Firestore initialized:', db);
  
  console.log('✅ Firebase test successful!');
} catch (error) {
  console.error('❌ Firebase test failed:', error);
} 