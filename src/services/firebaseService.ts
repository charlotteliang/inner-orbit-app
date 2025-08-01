import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { Contact, Interaction } from '../types';
import { EncryptionService } from './encryptionService';

// Check if Firebase is available
const isFirebaseAvailable = () => {
  return process.env.REACT_APP_FIREBASE_API_KEY && 
         process.env.REACT_APP_FIREBASE_PROJECT_ID &&
         process.env.REACT_APP_FIREBASE_API_KEY !== 'your_api_key_here';
};

// Convert Firestore Timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
};

// Convert Date to Firestore Timestamp
const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Sensitive fields that need encryption
const CONTACT_SENSITIVE_FIELDS = ['name', 'email', 'phone', 'notes'] as const;
const INTERACTION_SENSITIVE_FIELDS = ['notes'] as const;

// Convert Contact to Firestore document with encryption
const contactToFirestore = async (contact: Omit<Contact, 'id'>, userId: string) => {
  // Encrypt sensitive fields
  const encryptedContact = await EncryptionService.encryptObject(
    contact,
    CONTACT_SENSITIVE_FIELDS,
    userId
  );
  
  // Filter out undefined values and prepare for Firestore
  const cleanContact = Object.fromEntries(
    Object.entries(encryptedContact).filter(([_, value]) => value !== undefined)
  );
  
  return {
    ...cleanContact,
    createdAt: dateToTimestamp(contact.createdAt),
    updatedAt: dateToTimestamp(contact.updatedAt),
  };
};

// Convert Firestore document to Contact with decryption
const firestoreToContact = async (doc: any, userId: string): Promise<Contact> => {
  const data = doc.data();
  
  // Decrypt sensitive fields
  const decryptedData = await EncryptionService.decryptObject(
    data,
    CONTACT_SENSITIVE_FIELDS,
    userId
  );
  
  return {
    ...decryptedData,
    id: doc.id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

// Convert Interaction to Firestore document with encryption
const interactionToFirestore = async (interaction: Omit<Interaction, 'id'>, userId: string) => {
  // Encrypt sensitive fields
  const encryptedInteraction = await EncryptionService.encryptObject(
    interaction,
    INTERACTION_SENSITIVE_FIELDS,
    userId
  );
  
  // Filter out undefined values and prepare for Firestore
  const cleanInteraction = Object.fromEntries(
    Object.entries(encryptedInteraction).filter(([_, value]) => value !== undefined)
  );
  
  return {
    ...cleanInteraction,
    timestamp: dateToTimestamp(interaction.timestamp),
    createdAt: dateToTimestamp(interaction.createdAt),
    updatedAt: dateToTimestamp(interaction.updatedAt),
  };
};

// Convert Firestore document to Interaction with decryption
const firestoreToInteraction = async (doc: any, userId: string): Promise<Interaction> => {
  const data = doc.data();
  
  // Decrypt sensitive fields
  const decryptedData = await EncryptionService.decryptObject(
    data,
    INTERACTION_SENSITIVE_FIELDS,
    userId
  );
  
  return {
    ...decryptedData,
    id: doc.id,
    timestamp: timestampToDate(data.timestamp),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

export class FirebaseService {
  // Clear all existing data (for migration to encryption)
  static async clearAllData(): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const batch = writeBatch(db);
      
      // Clear contacts
      const contactsQuery = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid)
      );
      const contactsSnapshot = await getDocs(contactsQuery);
      contactsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Clear interactions
      const interactionsQuery = query(
        collection(db, 'interactions'),
        where('userId', '==', user.uid)
      );
      const interactionsSnapshot = await getDocs(interactionsQuery);
      interactionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log('✅ All existing data cleared for encryption migration');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }

  // Contacts CRUD Operations
  static async getContacts(): Promise<Contact[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const contacts: Contact[] = [];
      
      for (const doc of querySnapshot.docs) {
        try {
          const contact = await firestoreToContact(doc, user.uid);
          contacts.push(contact);
        } catch (error) {
          console.error('Failed to decrypt contact:', error);
          // Skip contacts that can't be decrypted
        }
      }
      
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  static async addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Contact> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const now = new Date();
      const contactWithMetadata = {
        ...contact,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const firestoreContact = await contactToFirestore(contactWithMetadata, user.uid);
      const docRef = await addDoc(collection(db, 'contacts'), firestoreContact);
      
      return {
        ...contactWithMetadata,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  static async updateContact(contact: Contact): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedContact = {
        ...contact,
        updatedAt: new Date(),
      };

      const firestoreContact = await contactToFirestore(updatedContact, user.uid);
      const docRef = doc(db, 'contacts', contact.id);
      await updateDoc(docRef, firestoreContact);
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  static async deleteContact(contactId: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    try {
      // Delete the contact
      await deleteDoc(doc(db, 'contacts', contactId));
      
      // Delete all interactions for this contact
      const interactionsQuery = query(
        collection(db, 'interactions'),
        where('contactId', '==', contactId)
      );
      const interactionsSnapshot = await getDocs(interactionsQuery);
      
      const batch = writeBatch(db);
      interactionsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (error) {
      console.error('Error deleting contact from Firebase:', error);
      throw error;
    }
  }

  // Interactions CRUD Operations
  static async getInteractions(): Promise<Interaction[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const q = query(
        collection(db, 'interactions'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const interactions: Interaction[] = [];
      
      for (const doc of querySnapshot.docs) {
        try {
          const interaction = await firestoreToInteraction(doc, user.uid);
          interactions.push(interaction);
        } catch (error) {
          console.error('Failed to decrypt interaction:', error);
          // Skip interactions that can't be decrypted
        }
      }
      
      return interactions;
    } catch (error) {
      console.error('Error getting interactions:', error);
      throw error;
    }
  }

  static async getInteractionsForContact(contactId: string): Promise<Interaction[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const q = query(
        collection(db, 'interactions'),
        where('contactId', '==', contactId),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const interactions: Interaction[] = [];
      
      for (const doc of querySnapshot.docs) {
        try {
          const interaction = await firestoreToInteraction(doc, user.uid);
          interactions.push(interaction);
        } catch (error) {
          console.error('Failed to decrypt interaction:', error);
          // Skip interactions that can't be decrypted
        }
      }
      
      return interactions;
    } catch (error) {
      console.error('Error getting interactions for contact:', error);
      throw error;
    }
  }

  static async addInteraction(interaction: Omit<Interaction, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Interaction> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const now = new Date();
      const interactionWithMetadata = {
        ...interaction,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const firestoreInteraction = await interactionToFirestore(interactionWithMetadata, user.uid);
      const docRef = await addDoc(collection(db, 'interactions'), firestoreInteraction);
      
      return {
        ...interactionWithMetadata,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error adding interaction:', error);
      throw error;
    }
  }

  static async updateInteraction(interaction: Interaction): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const updatedInteraction = {
        ...interaction,
        updatedAt: new Date(),
      };

      const firestoreInteraction = await interactionToFirestore(updatedInteraction, user.uid);
      const docRef = doc(db, 'interactions', interaction.id);
      await updateDoc(docRef, firestoreInteraction);
    } catch (error) {
      console.error('Error updating interaction:', error);
      throw error;
    }
  }

  static async deleteInteraction(interactionId: string): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    try {
      await deleteDoc(doc(db, 'interactions', interactionId));
    } catch (error) {
      console.error('Error deleting interaction from Firebase:', error);
      throw error;
    }
  }

  // Real-time Subscriptions
  static subscribeToContacts(callback: (contacts: Contact[]) => void): () => void {
    if (!isFirebaseAvailable()) {
      console.warn('Firebase not configured, real-time subscriptions disabled');
      return () => {};
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated, subscriptions disabled');
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'contacts'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const contacts: Contact[] = [];
        
        for (const doc of snapshot.docs) {
          try {
            const contact = await firestoreToContact(doc, user.uid);
            contacts.push(contact);
          } catch (error) {
            console.error('Failed to decrypt contact in subscription:', error);
            // Skip contacts that can't be decrypted
          }
        }
        
        callback(contacts);
      }, (error) => {
        console.error('Error in contacts subscription:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up contacts subscription:', error);
      return () => {};
    }
  }

  static subscribeToInteractions(callback: (interactions: Interaction[]) => void): () => void {
    if (!isFirebaseAvailable()) {
      console.warn('Firebase not configured, real-time subscriptions disabled');
      return () => {};
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated, subscriptions disabled');
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'interactions'),
        where('userId', '==', user.uid)
      );
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const interactions: Interaction[] = [];
        
        for (const doc of snapshot.docs) {
          try {
            const interaction = await firestoreToInteraction(doc, user.uid);
            interactions.push(interaction);
          } catch (error) {
            console.error('Failed to decrypt interaction in subscription:', error);
            // Skip interactions that can't be decrypted
          }
        }
        
        callback(interactions);
      }, (error) => {
        console.error('Error in interactions subscription:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up interactions subscription:', error);
      return () => {};
    }
  }

  static subscribeToContactInteractions(
    contactId: string, 
    callback: (interactions: Interaction[]) => void
  ): () => void {
    if (!isFirebaseAvailable()) {
      console.warn('Firebase not configured, real-time subscriptions disabled');
      return () => {};
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.warn('User not authenticated, subscriptions disabled');
      return () => {};
    }

    try {
      const q = query(
        collection(db, 'interactions'),
        where('contactId', '==', contactId),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const interactions: Interaction[] = [];
        
        for (const doc of snapshot.docs) {
          try {
            const interaction = await firestoreToInteraction(doc, user.uid);
            interactions.push(interaction);
          } catch (error) {
            console.error('Failed to decrypt interaction in contact interactions subscription:', error);
            // Skip interactions that can't be decrypted
          }
        }
        
        callback(interactions);
      }, (error) => {
        console.error('Error in contact interactions subscription:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up contact interactions subscription:', error);
      return () => {};
    }
  }
} 