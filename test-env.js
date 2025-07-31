// Test script to check environment variables
require('dotenv').config();

console.log('🔍 Testing environment variables...');
console.log('REACT_APP_FIREBASE_API_KEY:', process.env.REACT_APP_FIREBASE_API_KEY ? 'Set' : 'Not set');
console.log('REACT_APP_FIREBASE_PROJECT_ID:', process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log('REACT_APP_FIREBASE_APP_ID:', process.env.REACT_APP_FIREBASE_APP_ID);

if (process.env.REACT_APP_FIREBASE_API_KEY) {
  console.log('✅ Environment variables are loaded correctly');
} else {
  console.log('❌ Environment variables are not loaded');
} 