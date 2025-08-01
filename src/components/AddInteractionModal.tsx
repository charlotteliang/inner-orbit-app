import React, { useState } from 'react';
import { X, MessageCircle, Phone, Video, Users } from 'lucide-react';
import { Contact, InteractionType, DurationUnit } from '../types';

interface AddInteractionModalProps {
  contact: Contact;
  onClose: () => void;
  onAdd: (interaction: Omit<import('../types').Interaction, 'id' | 'userId'>) => void;
}

const AddInteractionModal: React.FC<AddInteractionModalProps> = ({ contact, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: 'message' as InteractionType,
    timestamp: new Date(),
    energyLevel: 5,
    duration: {
      value: 1,
      unit: 'hours' as DurationUnit,
    },
    notes: '',
  });

  // Helper function to format date for date input
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to format time for time input (hours only)
  const formatTimeForInput = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    return `${hours}:00`;
  };
  const [showDuration, setShowDuration] = useState(false);

  const interactionTypes = [
    { value: 'message', label: 'Message', icon: MessageCircle },
    { value: 'call', label: 'Call', icon: Phone },
    { value: 'facetime', label: 'FaceTime', icon: Video },
    { value: 'in-person', label: 'In Person', icon: Users },
  ];

  const durationUnits = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      contactId: contact.id,
      type: formData.type,
      timestamp: formData.timestamp,
      energyLevel: formData.energyLevel,
      duration: showDuration ? formData.duration : undefined,
      notes: formData.notes.trim() || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    onClose();
  };

  const getEnergyLabel = (energy: number) => {
    if (energy >= 8) return 'Very Energizing';
    if (energy >= 6) return 'Energizing';
    if (energy >= 4) return 'Neutral';
    if (energy >= 2) return 'Depleting';
    return 'Very Depleting';
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'bg-green-500';
    if (energy >= 6) return 'bg-blue-500';
    if (energy >= 4) return 'bg-yellow-500';
    if (energy >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="glass-effect rounded-2xl p-6 w-full max-w-md card-shadow animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Add Interaction</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="p-4 bg-white/30 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Adding interaction for</p>
            <p className="font-semibold text-gray-800">{contact.name}</p>
          </div>

          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Interaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {interactionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.value as InteractionType }))}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When did this happen?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                id="interaction-date"
                name="date"
                type="date"
                value={formatDateForInput(formData.timestamp)}
                onChange={(e) => {
                  const currentTime = formData.timestamp;
                  const [year, month, day] = e.target.value.split('-').map(Number);
                  const newDate = new Date(year, month - 1, day); // month is 0-indexed
                  newDate.setHours(currentTime.getHours());
                  setFormData(prev => ({ ...prev, timestamp: newDate }));
                }}
                className="px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <input
                id="interaction-time"
                name="time"
                type="time"
                step="3600"
                value={formatTimeForInput(formData.timestamp)}
                onChange={(e) => {
                  const currentDate = formData.timestamp;
                  const [hours] = e.target.value.split(':');
                  const newTime = new Date(currentDate);
                  newTime.setHours(parseInt(hours) || 0, 0, 0, 0);
                  setFormData(prev => ({ ...prev, timestamp: newTime }));
                }}
                className="px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="showDuration"
                checked={showDuration}
                onChange={(e) => setShowDuration(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="showDuration" className="text-sm font-medium text-gray-700">
                Track duration
              </label>
            </div>
            
            {showDuration && (
              <div className="flex space-x-3">
                <input
                  id="interaction-duration-value"
                  name="durationValue"
                  type="number"
                  min="1"
                  value={formData.duration.value}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: { ...prev.duration, value: parseInt(e.target.value) || 1 }
                  }))}
                  className="flex-1 px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  id="interaction-duration-unit"
                  name="durationUnit"
                  value={formData.duration.unit}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    duration: { ...prev.duration, unit: e.target.value as DurationUnit }
                  }))}
                  className="px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {durationUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How energizing was this interaction?
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Very Depleting</span>
                <span className="text-sm text-gray-600">Very Energizing</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.energyLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEnergyColor(formData.energyLevel)} text-white`}>
                  {formData.energyLevel}/10
                </span>
                <span className="text-sm text-gray-600">
                  {getEnergyLabel(formData.energyLevel)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Add any notes about this interaction..."
            />
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
              Add Interaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInteractionModal; 