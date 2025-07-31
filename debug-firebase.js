// Debug script to test Firebase connection
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, connectFirestoreEmulator } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDwKNJGewHPaDWPLqX4jsgQd8d5r3JhLxg",
  authDomain: "inner-orbit-app-2024.firebaseapp.com",
  projectId: "inner-orbit-app-2024",
  storageBucket: "inner-orbit-app-2024.firebasestorage.app",
  messagingSenderId: "121778623889",
  appId: "1:121778623889:web:3671b9328f5cf7f67ff630"
};

async function debugFirebase() {
  try {
    console.log('🔍 Debugging Firebase connection...');
    console.log('📋 Config:', JSON.stringify(firebaseConfig, null, 2));
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase app initialized');
    console.log('✅ Firestore instance created');
    
    // Test reading first (should work even if write fails)
    console.log('📖 Testing read access...');
    try {
      const contactsSnapshot = await getDocs(collection(db, 'contacts'));
      console.log('✅ Read test passed - Found', contactsSnapshot.size, 'contacts');
    } catch (readError) {
      console.error('❌ Read test failed:', readError.message);
    }
    
    // Test writing
    console.log('📝 Testing write access...');
    const testContact = {
      name: "Debug Test Contact",
      email: "debug@test.com",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const contactRef = await addDoc(collection(db, 'contacts'), testContact);
      console.log('✅ Write test passed - Contact created with ID:', contactRef.id);
    } catch (writeError) {
      console.error('❌ Write test failed:', writeError.message);
      console.error('❌ Error code:', writeError.code);
      console.error('❌ Full error:', writeError);
    }
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
  }
}

debugFirebase(); 