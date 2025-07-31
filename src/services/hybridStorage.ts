import { FirebaseService } from './firebaseService';
import { StorageService } from './storage';
import { Contact, Interaction } from '../types';

export class HybridStorageService {
  private static isFirebaseEnabled = false;

  // Initialize the service and check Firebase availability
  static async initialize(): Promise<void> {
    try {
      console.log('🔍 Initializing HybridStorageService...');
      
      // Since we hardcoded the config, let's just test Firebase directly
      console.log('✅ Testing Firebase connection...');
      
      try {
        // Import the already initialized Firebase instance
        const { db } = await import('../config/firebase');
        console.log('✅ Firebase config imported:', db);
        
        // Test if the db instance is valid
        if (db) {
          this.isFirebaseEnabled = true;
          console.log('✅ Firebase is available and connected');
        } else {
          throw new Error('Firestore db instance is null');
        }
      } catch (firebaseError) {
        console.error('❌ Firebase import/initialization failed:', firebaseError);
        throw firebaseError;
      }
    } catch (error) {
      this.isFirebaseEnabled = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Firebase not available, falling back to localStorage:', errorMessage);
    }
  }

  // Contacts CRUD Operations
  static async getContacts(): Promise<Contact[]> {
    if (this.isFirebaseEnabled) {
      try {
        return await FirebaseService.getContacts();
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for contacts');
        this.isFirebaseEnabled = false;
        return StorageService.getContacts();
      }
    }
    return StorageService.getContacts();
  }

  static async addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Contact> {
    if (this.isFirebaseEnabled) {
      try {
        const newContact = await FirebaseService.addContact(contact);
        // Don't save to localStorage when Firebase is working to avoid duplicates
        return newContact;
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for adding contact');
        this.isFirebaseEnabled = false;
        const newContact: Contact = {
          ...contact,
          userId: 'local-user', // Fallback user ID for localStorage
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        StorageService.addContact(newContact);
        return newContact;
      }
    }
    const newContact: Contact = {
      ...contact,
      userId: 'local-user', // Fallback user ID for localStorage
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    StorageService.addContact(newContact);
    return newContact;
  }

  static async updateContact(contact: Contact): Promise<void> {
    if (this.isFirebaseEnabled) {
      try {
        await FirebaseService.updateContact(contact);
        // Also update localStorage as backup
        StorageService.updateContact(contact);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for updating contact');
        this.isFirebaseEnabled = false;
        StorageService.updateContact(contact);
      }
    } else {
      StorageService.updateContact(contact);
    }
  }

  static async deleteContact(contactId: string): Promise<void> {
    if (this.isFirebaseEnabled) {
      try {
        await FirebaseService.deleteContact(contactId);
        // Also delete from localStorage as backup
        StorageService.deleteContact(contactId);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for deleting contact');
        this.isFirebaseEnabled = false;
        StorageService.deleteContact(contactId);
      }
    } else {
      StorageService.deleteContact(contactId);
    }
  }

  // Interactions CRUD Operations
  static async getInteractions(): Promise<Interaction[]> {
    if (this.isFirebaseEnabled) {
      try {
        return await FirebaseService.getInteractions();
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for interactions');
        this.isFirebaseEnabled = false;
        return StorageService.getInteractions();
      }
    }
    return StorageService.getInteractions();
  }

  static async getInteractionsForContact(contactId: string): Promise<Interaction[]> {
    if (this.isFirebaseEnabled) {
      try {
        return await FirebaseService.getInteractionsForContact(contactId);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for contact interactions');
        this.isFirebaseEnabled = false;
        return StorageService.getInteractionsForContact(contactId);
      }
    }
    return StorageService.getInteractionsForContact(contactId);
  }

  static async addInteraction(interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Interaction> {
    if (this.isFirebaseEnabled) {
      try {
        const newInteraction = await FirebaseService.addInteraction(interaction);
        // Don't save to localStorage when Firebase is working to avoid duplicates
        return newInteraction;
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for adding interaction');
        this.isFirebaseEnabled = false;
        const newInteraction: Interaction = {
          ...interaction,
          userId: 'local-user', // Fallback user ID for localStorage
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        StorageService.addInteraction(newInteraction);
        return newInteraction;
      }
    }
    const newInteraction: Interaction = {
      ...interaction,
      userId: 'local-user', // Fallback user ID for localStorage
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    StorageService.addInteraction(newInteraction);
    return newInteraction;
  }

  static async updateInteraction(interaction: Interaction): Promise<void> {
    if (this.isFirebaseEnabled) {
      try {
        await FirebaseService.updateInteraction(interaction);
        // Also update localStorage as backup
        StorageService.updateInteraction(interaction);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for updating interaction');
        this.isFirebaseEnabled = false;
        StorageService.updateInteraction(interaction);
      }
    } else {
      StorageService.updateInteraction(interaction);
    }
  }

  static async deleteInteraction(interactionId: string): Promise<void> {
    if (this.isFirebaseEnabled) {
      try {
        await FirebaseService.deleteInteraction(interactionId);
        // Also delete from localStorage as backup
        // Note: StorageService doesn't have deleteInteraction, so we'll need to implement it
        const interactions = StorageService.getInteractions();
        const filteredInteractions = interactions.filter(i => i.id !== interactionId);
        StorageService.saveInteractions(filteredInteractions);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for deleting interaction');
        this.isFirebaseEnabled = false;
        const interactions = StorageService.getInteractions();
        const filteredInteractions = interactions.filter(i => i.id !== interactionId);
        StorageService.saveInteractions(filteredInteractions);
      }
    } else {
      const interactions = StorageService.getInteractions();
      const filteredInteractions = interactions.filter(i => i.id !== interactionId);
      StorageService.saveInteractions(filteredInteractions);
    }
  }

  // Real-time Subscriptions (Firebase only)
  static subscribeToContacts(callback: (contacts: Contact[]) => void): () => void {
    if (this.isFirebaseEnabled) {
      return FirebaseService.subscribeToContacts(callback);
    }
    // If Firebase is not available, return a no-op function
    console.warn('Real-time subscriptions require Firebase');
    return () => {};
  }

  static subscribeToInteractions(callback: (interactions: Interaction[]) => void): () => void {
    if (this.isFirebaseEnabled) {
      return FirebaseService.subscribeToInteractions(callback);
    }
    // If Firebase is not available, return a no-op function
    console.warn('Real-time subscriptions require Firebase');
    return () => {};
  }

  static subscribeToContactInteractions(
    contactId: string, 
    callback: (interactions: Interaction[]) => void
  ): () => void {
    if (this.isFirebaseEnabled) {
      return FirebaseService.subscribeToContactInteractions(contactId, callback);
    }
    // If Firebase is not available, return a no-op function
    console.warn('Real-time subscriptions require Firebase');
    return () => {};
  }

  // Sync data from localStorage to Firebase (useful for migration)
  static async syncToFirebase(): Promise<void> {
    if (!this.isFirebaseEnabled) {
      console.warn('Firebase not available, cannot sync');
      return;
    }

    try {
      const contacts = StorageService.getContacts();
      const interactions = StorageService.getInteractions();

      // Sync contacts
      for (const contact of contacts) {
        try {
          await FirebaseService.addContact(contact);
        } catch (error) {
          console.warn(`Failed to sync contact ${contact.id}:`, error);
        }
      }

      // Sync interactions
      for (const interaction of interactions) {
        try {
          await FirebaseService.addInteraction(interaction);
        } catch (error) {
          console.warn(`Failed to sync interaction ${interaction.id}:`, error);
        }
      }

      console.log('Sync to Firebase completed');
    } catch (error) {
      console.error('Error syncing to Firebase:', error);
    }
  }

  // Get storage status
  static getStorageStatus(): { isFirebaseEnabled: boolean; isLocalStorageAvailable: boolean } {
    return {
      isFirebaseEnabled: this.isFirebaseEnabled,
      isLocalStorageAvailable: typeof window !== 'undefined' && window.localStorage !== undefined,
    };
  }
} 