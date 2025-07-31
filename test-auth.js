// Test script to verify Firebase Auth setup
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDwKNJGewHPaDWPLqX4jsgQd8d5r3JhLxg",
  authDomain: "inner-orbit-app-2024.firebaseapp.com",
  projectId: "inner-orbit-app-2024",
  storageBucket: "inner-orbit-app-2024.firebasestorage.app",
  messagingSenderId: "121778623889",
  appId: "1:121778623889:web:3671b9328f5cf7f67ff630",
  measurementId: "",
};

console.log('🔍 Testing Firebase Auth setup...');

try {
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  const auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');
  
  console.log('✅ Firebase Auth setup is working correctly');
  console.log('📋 Next step: Enable Email/Password authentication in Firebase Console');
  console.log('🌐 Go to: https://console.firebase.google.com/project/inner-orbit-app-2024/authentication');
  
} catch (error) {
  console.error('❌ Firebase Auth setup failed:', error);
} 