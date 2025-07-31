# Firebase Setup Guide for Inner Orbit

## Prerequisites
1. A Google account
2. Node.js and npm installed
3. Firebase CLI (optional, for advanced features)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "inner-orbit-app")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database (choose the closest to your users)
5. Click "Done"

## Step 3: Create a Web App

1. In your Firebase project console, click on the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "Inner Orbit Web App")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in the `.env` file:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Set Up Firestore Security Rules (Optional)

1. In your Firebase console, go to Firestore Database
2. Click on the "Rules" tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all users under any document
    // WARNING: This is for development only. Secure your rules for production.
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Important**: These rules allow anyone to read and write to your database. For production, you should implement proper authentication and security rules.

## Step 6: Test the Setup

1. Start your React app:
   ```bash
   npm start
   ```

2. Open the browser console and check for Firebase connection messages
3. Try adding a contact - it should now be saved to Firestore
4. Check your Firebase console to see the data being created

## Step 7: Production Considerations

### Security Rules
For production, implement proper security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Authentication
Consider adding Firebase Authentication for user management.

### Backup Strategy
The app automatically falls back to localStorage if Firebase is unavailable, but consider implementing a more robust backup strategy for production.

## Troubleshooting

### Common Issues

1. **"Firebase not configured" error**
   - Check that all environment variables are set correctly
   - Ensure the `.env` file is in the root directory
   - Restart your development server after changing environment variables

2. **"Permission denied" error**
   - Check your Firestore security rules
   - Ensure your database is in test mode for development

3. **Real-time updates not working**
   - Check that Firebase is properly configured
   - Look for console warnings about subscriptions

### Debug Mode
To enable debug logging, add this to your `.env` file:
```env
REACT_APP_FIREBASE_DEBUG=true
```

## Data Migration

If you have existing data in localStorage, you can sync it to Firebase:

1. Open the browser console
2. Run: `HybridStorageService.syncToFirebase()`

This will copy all your localStorage data to Firebase.

## Support

For Firebase-specific issues, refer to the [Firebase Documentation](https://firebase.google.com/docs). 