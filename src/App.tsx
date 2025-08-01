import React, { useState, useEffect } from 'react';
import { Contact, Interaction } from './types';
import { HybridStorageService } from './services/hybridStorage';
import { AuthService, AuthUser } from './services/authService';
import Header from './components/Header';
import ContactList from './components/ContactList';
import ContactDetail from './components/ContactDetail';
import NetworkGraph from './components/NetworkGraph';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './components/LoginPage';


function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [view, setView] = useState<'list' | 'detail' | 'network'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [hasClearedData, setHasClearedData] = useState(false);

  useEffect(() => {
    // Set up authentication state listener
    const unsubscribeAuth = AuthService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        setUser(null);
        setContacts([]);
        setInteractions([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Initialize hybrid storage and load data when user is authenticated
    const initializeApp = async () => {
      if (!user) return;

      try {
        await HybridStorageService.initialize();
        
        // Load initial data
        const savedContacts = await HybridStorageService.getContacts();
        const savedInteractions = await HybridStorageService.getInteractions();
        setContacts(savedContacts);
        setInteractions(savedInteractions);
        
        // Set up real-time subscriptions if Firebase is available
        const unsubscribeContacts = HybridStorageService.subscribeToContacts((updatedContacts) => {
          setContacts(updatedContacts);
        });
        
        const unsubscribeInteractions = HybridStorageService.subscribeToInteractions((updatedInteractions) => {
          setInteractions(updatedInteractions);
        });
        
        // Cleanup subscriptions on unmount
        return () => {
          unsubscribeContacts();
          unsubscribeInteractions();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
  }, [user]);

  const handleAddContact = async (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      await HybridStorageService.addContact(contactData);
      // Note: Real-time subscription will automatically update the contacts list
    } catch (error) {
      console.error('Error adding contact:', error);
      // You could add a toast notification here
    }
  };

  const handleUpdateContact = async (updatedContact: Contact) => {
    try {
      const contactWithUpdatedTimestamp = {
        ...updatedContact,
        updatedAt: new Date(),
      };
      
      await HybridStorageService.updateContact(contactWithUpdatedTimestamp);
      // Note: Real-time subscription will automatically update the contacts list
      
      if (selectedContact?.id === updatedContact.id) {
        setSelectedContact(contactWithUpdatedTimestamp);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      // You could add a toast notification here
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await HybridStorageService.deleteContact(contactId);
      // Note: Real-time subscription will automatically update the contacts list
      setInteractions(prev => prev.filter(i => i.contactId !== contactId));
      
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
        setView('list');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      // You could add a toast notification here
    }
  };

  const handleAddInteraction = async (interactionData: Omit<Interaction, 'id' | 'userId'>) => {
    try {
      await HybridStorageService.addInteraction(interactionData);
      // Note: Real-time subscription will automatically update the interactions list
    } catch (error) {
      console.error('Error adding interaction:', error);
      // You could add a toast notification here
    }
  };

  const handleUpdateInteraction = async (updatedInteraction: Interaction) => {
    try {
      await HybridStorageService.updateInteraction(updatedInteraction);
      // Note: Real-time subscription will automatically update the interactions list
    } catch (error) {
      console.error('Error updating interaction:', error);
      // You could add a toast notification here
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setView('detail');
  };

  const handleBackToList = () => {
    setSelectedContact(null);
    setView('list');
  };

  const handleViewChange = (newView: 'list' | 'detail' | 'network') => {
    if (newView === 'detail' && selectedContact) {
      setView('detail');
    } else if (newView === 'list') {
      setSelectedContact(null);
      setView('list');
    } else if (newView === 'network') {
      setSelectedContact(null);
      setView('network');
    }
  };

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      const user = await AuthService.signInWithGoogle();
      setUser(user);
      
      // Clear existing data on first sign-in for encryption migration
      if (!hasClearedData) {
        try {
          await HybridStorageService.clearAllData();
          setHasClearedData(true);
          console.log('✅ Existing data cleared for encryption migration');
        } catch (error) {
          console.error('Failed to clear existing data:', error);
        }
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <LoginPage
        onSignIn={handleSignIn}
        isLoading={isAuthLoading}
        error={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header 
        currentView={view}
        onViewChange={handleViewChange}
        onBackToList={view === 'detail' ? handleBackToList : undefined}
        onSignOut={handleSignOut}
        title={view === 'detail' ? selectedContact?.name || 'Contact Details' : 'Inner Orbit'}
        user={user}
      />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {view === 'list' && (
          <ContactList
            contacts={contacts}
            interactions={interactions}
            onContactSelect={handleContactSelect}
            onUpdateContact={handleUpdateContact}
            onDeleteContact={handleDeleteContact}
            onAddContact={handleAddContact}
            onAddInteraction={handleAddInteraction}
          />
        )}
        {view === 'detail' && selectedContact && (
          <ContactDetail
            contact={selectedContact}
            interactions={interactions.filter(i => i.contactId === selectedContact.id)}
            onAddInteraction={handleAddInteraction}
            onUpdateInteraction={handleUpdateInteraction}
            onUpdateContact={handleUpdateContact}
          />
        )}
        {view === 'network' && (
          <NetworkGraph
            contacts={contacts}
            interactions={interactions}
          />
        )}
      </main>


    </div>
  );
}

export default App; 