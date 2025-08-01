import React from 'react';
import { Contact } from '../types';
import { MessageCircle, Calendar, Edit, Trash2, Plus, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContactStats {
  totalInteractions: number;
  averageEnergy: number;
  lastInteraction: Date | null;
}

interface ContactCardProps {
  contact: Contact;
  stats: ContactStats;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddInteraction: () => void;
  energyColor: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  stats,
  onSelect,
  onEdit,
  onDelete,
  onAddInteraction,
  energyColor,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="glass-effect rounded-xl p-6 card-shadow hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(contact.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{contact.name}</h3>
            {contact.email && (
              <p className="text-sm text-gray-600">{contact.email}</p>
            )}
            {contact.location && (
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{contact.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddInteraction();
            }}
            className="p-2 rounded-lg bg-white/20 hover:bg-primary-100 transition-colors duration-200"
            aria-label="Add interaction"
          >
            <Plus className="w-4 h-4 text-primary-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors duration-200"
            aria-label="Edit contact"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg bg-white/20 hover:bg-red-100 transition-colors duration-200"
            aria-label="Delete contact"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {/* Interaction Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>{stats.totalInteractions} interactions</span>
          </div>
          {stats.averageEnergy > 0 && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${energyColor}`}>
              {stats.averageEnergy.toFixed(1)} energy
            </div>
          )}
        </div>

        {/* Last Interaction */}
        {stats.lastInteraction && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Last: {formatDistanceToNow(stats.lastInteraction, { addSuffix: true })}</span>
          </div>
        )}

        {/* Notes Preview */}
        {contact.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {contact.notes}
          </p>
        )}
      </div>

      <div 
        className="mt-4 pt-4 border-t border-white/20"
        onClick={onSelect}
      >
        <button className="w-full text-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors duration-200">
          View Details
        </button>
      </div>
    </div>
  );
};

export default ContactCard; 