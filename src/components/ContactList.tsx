import React, { useState } from 'react';
import { Contact, Interaction } from '../types';
import { User, Users, Plus } from 'lucide-react';
import ContactCard from './ContactCard';
import EditContactModal from './EditContactModal';
import AddContactModal from './AddContactModal';
import AddInteractionModal from './AddInteractionModal';

interface ContactListProps {
  contacts: Contact[];
  interactions: Interaction[];
  onContactSelect: (contact: Contact) => void;
  onUpdateContact: (contact: Contact) => void;
  onDeleteContact: (contactId: string) => void;
  onAddContact: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  onAddInteraction: (interaction: Omit<Interaction, 'id' | 'userId'>) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  interactions,
  onContactSelect,
  onUpdateContact,
  onDeleteContact,
  onAddContact,
  onAddInteraction,
}) => {

  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  
  // REMOVED: This was causing the modal to close automatically
  const [addingInteractionFor, setAddingInteractionFor] = useState<Contact | null>(null);

  const getContactStats = (contactId: string) => {
    const contactInteractions = interactions.filter(i => i.contactId === contactId);
    const totalInteractions = contactInteractions.length;
    const averageEnergy = contactInteractions.length > 0 
      ? contactInteractions.reduce((sum, i) => sum + i.energyLevel, 0) / contactInteractions.length 
      : 0;
    const lastInteraction = contactInteractions.length > 0 
      ? contactInteractions[0].timestamp 
      : null;

    return { totalInteractions, averageEnergy, lastInteraction };
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'text-green-600 bg-green-100';
    if (energy >= 6) return 'text-blue-600 bg-blue-100';
    if (energy >= 4) return 'text-yellow-600 bg-yellow-100';
    if (energy >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (contacts.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto card-shadow">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No contacts yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your meaningful relationships by adding your first contact.
            </p>
            <button
                          onClick={() => setShowAddContact(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Add Your First Contact
            </button>
          </div>
        </div>
        
        {/* Modals for empty state */}
        {showAddContact && (
          <AddContactModal
            onClose={() => setShowAddContact(false)}
            onAdd={async (contactData) => {
              try {
                await onAddContact(contactData);
                setShowAddContact(false);
              } catch (error) {
                console.error('Error adding contact from ContactList (empty state):', error);
              }
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Button */}
      <div className="glass-effect rounded-xl p-4 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Contacts</h2>
          <button
            onClick={() => setShowAddContact(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
            type="button"
          >
            <Plus className="w-5 h-5" />
            <span>Add Contact</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            id="contact-search"
            name="search"
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const stats = getContactStats(contact.id);
          
          return (
                         <ContactCard
               key={contact.id}
               contact={contact}
               stats={stats}
               onSelect={() => onContactSelect(contact)}
               onEdit={() => setEditingContact(contact)}
               onDelete={() => onDeleteContact(contact.id)}
               onAddInteraction={() => setAddingInteractionFor(contact)}
               energyColor={getEnergyColor(stats.averageEnergy)}
             />
          );
        })}
      </div>

      {filteredContacts.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-500">No contacts found matching "{searchTerm}"</p>
        </div>
      )}

      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSave={(updatedContact) => {
            onUpdateContact(updatedContact);
            setEditingContact(null);
          }}
        />
      )}

      {showAddContact && (
        <AddContactModal
          onClose={() => setShowAddContact(false)}
          onAdd={async (contactData) => {
            try {
              await onAddContact(contactData);
              setShowAddContact(false);
            } catch (error) {
              console.error('Error adding contact from ContactList (main state):', error);
            }
          }}
        />
      )}

      {addingInteractionFor && (
        <AddInteractionModal
          contact={addingInteractionFor}
          onClose={() => setAddingInteractionFor(null)}
          onAdd={(interactionData) => {
            onAddInteraction(interactionData);
            setAddingInteractionFor(null);
          }}
        />
      )}
    </div>
  );
};

export default ContactList; 