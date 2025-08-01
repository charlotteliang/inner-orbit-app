import React from 'react';
import { HybridStorageService } from '../services/hybridStorage';

const DebugInfo: React.FC = () => {
  const clearLocalStorage = () => {
    HybridStorageService.clearLocalStorage();
    window.location.reload();
  };

  const testFirebase = async () => {
    try {
      console.log('🧪 Testing Firebase connection...');
      const { FirebaseService } = await import('../services/firebaseService');
      await FirebaseService.testConnection();
      console.log('✅ Firebase connection successful');
      alert('Firebase connection successful!');
    } catch (error) {
      console.error('❌ Firebase connection failed:', error);
      alert(`Firebase connection failed: ${error}`);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <div>API Key exists: {process.env.REACT_APP_FIREBASE_API_KEY ? '✅' : '❌'}</div>
      <div>Project ID: {process.env.REACT_APP_FIREBASE_PROJECT_ID || 'Not set'}</div>
      <div>Auth Domain: {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'Not set'}</div>
      <div>App ID exists: {process.env.REACT_APP_FIREBASE_APP_ID ? '✅' : '❌'}</div>
      <div>Storage Bucket: {process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'Not set'}</div>
      <div>Messaging Sender ID: {process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || 'Not set'}</div>
      <hr style={{ margin: '8px 0', borderColor: '#666' }} />
      <button 
        onClick={clearLocalStorage}
        style={{ 
          background: '#dc2626', 
          color: 'white', 
          border: 'none', 
          padding: '4px 8px', 
          borderRadius: '3px', 
          fontSize: '10px',
          marginRight: '5px',
          cursor: 'pointer'
        }}
      >
        Clear localStorage
      </button>
      <button 
        onClick={testFirebase}
        style={{ 
          background: '#059669', 
          color: 'white', 
          border: 'none', 
          padding: '4px 8px', 
          borderRadius: '3px', 
          fontSize: '10px',
          cursor: 'pointer'
        }}
      >
        Test Firebase
      </button>
    </div>
  );
};

export default DebugInfo; 