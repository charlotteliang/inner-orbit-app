import React, { useState } from 'react';
import { X, User, Mail, Phone, FileText } from 'lucide-react';
import { Contact } from '../types';

interface AddContactModalProps {
  onClose: () => void;
  onAdd: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAdd }) => {
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-md card-shadow animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Add New Contact</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="contact-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-white/30'
                }`}
                placeholder="Enter full name"
                required
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="contact-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-white/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-300' : 'border-white/30'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="contact-notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="contact-notes"
                name="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Add any notes about this person..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContactModal; 