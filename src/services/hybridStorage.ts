import { FirebaseService } from './firebaseService';
import { StorageService } from './storage';
import { Contact, Interaction } from '../types';
import { EncryptionService } from './encryptionService';

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
        return await this.getContactsFromLocalStorage();
      }
    }
    return await this.getContactsFromLocalStorage();
  }

  private static async getContactsFromLocalStorage(): Promise<Contact[]> {
    const contacts = StorageService.getContacts();
    const decryptedContacts: Contact[] = [];
    
    for (const contact of contacts) {
      try {
        const decryptedContact = await EncryptionService.decryptObject(
          contact,
          ['name', 'email', 'phone', 'notes'],
          'local-user'
        );
        decryptedContacts.push(decryptedContact as Contact);
      } catch (error) {
        console.error('Failed to decrypt contact from localStorage:', error);
        // Skip contacts that can't be decrypted
      }
    }
    
    return decryptedContacts;
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
        return await this.addContactToLocalStorage(contact);
      }
    }
    return await this.addContactToLocalStorage(contact);
  }

  private static async addContactToLocalStorage(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Contact> {
    const now = new Date();
    const contactWithMetadata = {
      ...contact,
      id: crypto.randomUUID(),
      userId: 'local-user',
      createdAt: now,
      updatedAt: now,
    };

    // For localStorage, we'll store encrypted data as well
    const encryptedContact = await EncryptionService.encryptObject(
      contactWithMetadata,
      ['name', 'email', 'phone', 'notes'],
      'local-user'
    );

    StorageService.addContact(encryptedContact);
    return contactWithMetadata;
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
        return await this.getInteractionsFromLocalStorage();
      }
    }
    return await this.getInteractionsFromLocalStorage();
  }

  static async getInteractionsForContact(contactId: string): Promise<Interaction[]> {
    if (this.isFirebaseEnabled) {
      try {
        return await FirebaseService.getInteractionsForContact(contactId);
      } catch (error) {
        console.warn('Firebase failed, falling back to localStorage for contact interactions');
        this.isFirebaseEnabled = false;
        return await this.getInteractionsFromLocalStorage(contactId);
      }
    }
    return await this.getInteractionsFromLocalStorage(contactId);
  }

  private static async getInteractionsFromLocalStorage(contactId?: string): Promise<Interaction[]> {
    const interactions = contactId 
      ? StorageService.getInteractionsForContact(contactId)
      : StorageService.getInteractions();
    
    const decryptedInteractions: Interaction[] = [];
    
    for (const interaction of interactions) {
      try {
        const decryptedInteraction = await EncryptionService.decryptObject(
          interaction,
          ['notes'],
          'local-user'
        );
        decryptedInteractions.push(decryptedInteraction as Interaction);
      } catch (error) {
        console.error('Failed to decrypt interaction from localStorage:', error);
        // Skip interactions that can't be decrypted
      }
    }
    
    return decryptedInteractions;
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
        return await this.addInteractionToLocalStorage(interaction);
      }
    }
    return await this.addInteractionToLocalStorage(interaction);
  }

  private static async addInteractionToLocalStorage(interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Interaction> {
    const now = new Date();
    const interactionWithMetadata = {
      ...interaction,
      id: crypto.randomUUID(),
      userId: 'local-user',
      createdAt: now,
      updatedAt: now,
    };

    // For localStorage, we'll store encrypted data as well
    const encryptedInteraction = await EncryptionService.encryptObject(
      interactionWithMetadata,
      ['notes'],
      'local-user'
    );

    StorageService.addInteraction(encryptedInteraction);
    return interactionWithMetadata;
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

  // Clear all existing data (for migration to encryption)
  static async clearAllData(): Promise<void> {
    if (this.isFirebaseEnabled) {
      try {
        await FirebaseService.clearAllData();
      } catch (error) {
        console.error('Failed to clear Firebase data:', error);
      }
    }
    
    // Clear localStorage data
    try {
      localStorage.removeItem('contacts');
      localStorage.removeItem('interactions');
      console.log('✅ All existing data cleared for encryption migration');
    } catch (error) {
      console.error('Failed to clear localStorage data:', error);
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