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

// Convert Contact to Firestore document
const contactToFirestore = (contact: Omit<Contact, 'id'>) => {
  // Filter out undefined values before sending to Firestore
  const cleanContact = Object.fromEntries(
    Object.entries(contact).filter(([_, value]) => value !== undefined)
  );
  
  return {
    ...cleanContact,
    createdAt: dateToTimestamp(contact.createdAt),
    updatedAt: dateToTimestamp(contact.updatedAt),
  };
};

// Convert Firestore document to Contact
const firestoreToContact = (doc: any): Contact => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

// Convert Interaction to Firestore document
const interactionToFirestore = (interaction: Omit<Interaction, 'id'>) => {
  // Filter out undefined values before sending to Firestore
  const cleanInteraction = Object.fromEntries(
    Object.entries(interaction).filter(([_, value]) => value !== undefined)
  );
  
  return {
    ...cleanInteraction,
    timestamp: dateToTimestamp(interaction.timestamp),
    createdAt: dateToTimestamp(interaction.createdAt),
    updatedAt: dateToTimestamp(interaction.updatedAt),
  };
};

// Convert Firestore document to Interaction
const firestoreToInteraction = (doc: any): Interaction => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    timestamp: timestampToDate(data.timestamp),
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
};

export class FirebaseService {
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
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(firestoreToContact);
    } catch (error) {
      console.error('Error fetching contacts from Firebase:', error);
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
      const contactData = {
        ...contact,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'contacts'), contactToFirestore(contactData));
      return {
        ...contactData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error adding contact to Firebase:', error);
      throw error;
    }
  }

  static async updateContact(contact: Contact): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    try {
      const contactRef = doc(db, 'contacts', contact.id);
      const { id, ...contactData } = contact;
      await updateDoc(contactRef, {
        ...contactToFirestore({ ...contactData, updatedAt: new Date() }),
      });
    } catch (error) {
      console.error('Error updating contact in Firebase:', error);
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
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(firestoreToInteraction);
    } catch (error) {
      console.error('Error fetching interactions from Firebase:', error);
      throw error;
    }
  }

  static async getInteractionsForContact(contactId: string): Promise<Interaction[]> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    try {
      const q = query(
        collection(db, 'interactions'),
        where('contactId', '==', contactId),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(firestoreToInteraction);
    } catch (error) {
      console.error('Error fetching interactions for contact from Firebase:', error);
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
      const interactionData = {
        ...interaction,
        userId: user.uid,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, 'interactions'), interactionToFirestore(interactionData));
      return {
        ...interactionData,
        id: docRef.id,
      };
    } catch (error) {
      console.error('Error adding interaction to Firebase:', error);
      throw error;
    }
  }

  static async updateInteraction(interaction: Interaction): Promise<void> {
    if (!isFirebaseAvailable()) {
      throw new Error('Firebase not configured');
    }

    try {
      const interactionRef = doc(db, 'interactions', interaction.id);
      const { id, ...interactionData } = interaction;
      await updateDoc(interactionRef, {
        ...interactionToFirestore({ ...interactionData, updatedAt: new Date() }),
      });
    } catch (error) {
      console.error('Error updating interaction in Firebase:', error);
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
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const contacts = snapshot.docs.map(firestoreToContact);
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
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const interactions = snapshot.docs.map(firestoreToInteraction);
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
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const interactions = snapshot.docs.map(firestoreToInteraction);
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