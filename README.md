# Inner Orbit 🌟

A personal relationship management app that helps you cultivate and strengthen your most meaningful connections. By providing a clear, visual guide to your social interactions, it helps you understand the emotional quality of your relationships and intentionally nurture the ones that truly matter.

## 🚀 Live Demo

**Visit the app:** https://inner-orbit-app-2024.web.app

## ✨ Features

### 🔗 Curated Contact Management
- Focus on the people who are most important to you
- Manually add individuals to your network
- Add a name initially and fill in more details later
- Ensure you're tracking meaningful relationships rather than a cluttered contact list

### ⚡ Lightning-Fast Interaction Logging
- Effortless logging of social interactions
- Specify interaction type: messages, calls, FaceTime, or in-person meetings
- Rate energy levels on a 0-10 scale (very depleting to very energizing)
- Optional duration tracking (seconds, minutes, hours, days, weeks)

### 📊 Relationship Timeline Insights
- Visual representation of your emotional experience over time
- Graph plots energy levels against timeline
- Spot patterns and emotional turbulence
- Identify what makes relationships flourish or disconnect
- Interactive dots for quick editing of past interactions

### 🔐 Secure & Private
- Firebase Authentication with Google Sign-In
- User-specific data isolation
- Real-time synchronization
- Offline capability with localStorage fallback

## 🛠 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom glass morphism effects
- **Charts**: Recharts for relationship timeline visualization
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Storage**: Hybrid system (Firebase + localStorage fallback)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd networkproject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (Google Sign-In)
   - Create a web app and get your configuration

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your Firebase configuration in `.env`:
   ```bash
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id_optional
   ```

5. **Start development server**
   ```bash
   npm start
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🔧 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `inner-orbit-app-2024`
4. Follow the setup wizard

### 2. Enable Firestore
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (us-central1 recommended)

### 3. Enable Authentication
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add your authorized domain

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

## 📱 Usage

1. **Sign In**: Use Google Sign-In to access your account
2. **Add Contacts**: Click "Add Contact" to add people to your network
3. **Log Interactions**: Click the "+" button on contact cards to log interactions
4. **View Timeline**: Click on a contact to see your relationship timeline
5. **Edit Interactions**: Click on timeline dots to edit past interactions

## 🔒 Security

- All data is user-specific and isolated
- Firebase security rules ensure users can only access their own data
- API keys are stored in environment variables
- No sensitive data is committed to the repository

## 🏗 Project Structure

```
src/
├── components/          # React components
│   ├── AddContactModal.tsx
│   ├── AddInteractionModal.tsx
│   ├── ContactCard.tsx
│   ├── ContactDetail.tsx
│   ├── ContactList.tsx
│   ├── EditContactModal.tsx
│   ├── EditInteractionModal.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── LoginPage.tsx
│   └── StorageStatus.tsx
├── config/
│   └── firebase.ts     # Firebase configuration
├── services/
│   ├── authService.ts  # Authentication service
│   ├── firebaseService.ts # Firebase operations
│   ├── hybridStorage.ts # Hybrid storage system
│   └── storage.ts      # Local storage operations
├── types/
│   └── index.ts        # TypeScript interfaces
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and Firebase
- Icons from Lucide React
- Charts powered by Recharts
- Styled with Tailwind CSS

---

**Inner Orbit** - Nurturing meaningful relationships, one interaction at a time. 🌟 