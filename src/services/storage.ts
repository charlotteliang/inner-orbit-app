import { Contact, Interaction } from '../types';

const CONTACTS_KEY = 'inner-orbit-contacts';
const INTERACTIONS_KEY = 'inner-orbit-interactions';

export class StorageService {
  static getContacts(): Contact[] {
    try {
      const data = localStorage.getItem(CONTACTS_KEY);
      if (!data) return [];
      
      const contacts = JSON.parse(data);
      return contacts.map((contact: any) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading contacts:', error);
      return [];
    }
  }

  static saveContacts(contacts: Contact[]): void {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
    } catch (error) {
      console.error('Error saving contacts:', error);
    }
  }

  static getInteractions(): Interaction[] {
    try {
      const data = localStorage.getItem(INTERACTIONS_KEY);
      if (!data) return [];
      
      const interactions = JSON.parse(data);
      return interactions.map((interaction: any) => ({
        ...interaction,
        timestamp: new Date(interaction.timestamp),
        createdAt: new Date(interaction.createdAt || interaction.timestamp),
        updatedAt: new Date(interaction.updatedAt || interaction.timestamp),
      }));
    } catch (error) {
      console.error('Error loading interactions:', error);
      return [];
    }
  }

  static saveInteractions(interactions: Interaction[]): void {
    try {
      localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
    } catch (error) {
      console.error('Error saving interactions:', error);
    }
  }

  static addContact(contact: Contact): void {
    const contacts = this.getContacts();
    contacts.push(contact);
    this.saveContacts(contacts);
  }

  static updateContact(updatedContact: Contact): void {
    const contacts = this.getContacts();
    const index = contacts.findIndex(c => c.id === updatedContact.id);
    if (index !== -1) {
      contacts[index] = updatedContact;
      this.saveContacts(contacts);
    }
  }

  static deleteContact(contactId: string): void {
    const contacts = this.getContacts();
    const filteredContacts = contacts.filter(c => c.id !== contactId);
    this.saveContacts(filteredContacts);
    
    // Also delete related interactions
    const interactions = this.getInteractions();
    const filteredInteractions = interactions.filter(i => i.contactId !== contactId);
    this.saveInteractions(filteredInteractions);
  }

  static addInteraction(interaction: Interaction): void {
    const interactions = this.getInteractions();
    interactions.push(interaction);
    this.saveInteractions(interactions);
  }

  static updateInteraction(updatedInteraction: Interaction): void {
    const interactions = this.getInteractions();
    const index = interactions.findIndex(i => i.id === updatedInteraction.id);
    if (index !== -1) {
      interactions[index] = updatedInteraction;
      this.saveInteractions(interactions);
    }
  }

  static getInteractionsForContact(contactId: string): Interaction[] {
    const interactions = this.getInteractions();
    return interactions
      .filter(i => i.contactId === contactId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
} 