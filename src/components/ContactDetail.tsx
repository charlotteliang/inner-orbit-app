import React, { useState } from 'react';
import { Contact, Interaction, InteractionType, DurationUnit } from '../types';
import { 
  Mail, 
  Phone, 
  FileText, 
  Plus, 
  MessageCircle, 
  Phone as PhoneIcon, 
  Video, 
  Users,
  Calendar,
  Clock,
  Battery,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AddInteractionModal from './AddInteractionModal';
import EditInteractionModal from './EditInteractionModal';

interface ContactDetailProps {
  contact: Contact;
  interactions: Interaction[];
  onAddInteraction: (interaction: Omit<Interaction, 'id' | 'userId'>) => void;
  onUpdateInteraction: (interaction: Interaction) => void;
  onUpdateContact: (contact: Contact) => void;
}

const ContactDetail: React.FC<ContactDetailProps> = ({
  contact,
  interactions,
  onAddInteraction,
  onUpdateInteraction,
  onUpdateContact,
}) => {
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="w-4 h-4" />;
      case 'call':
        return <PhoneIcon className="w-4 h-4" />;
      case 'facetime':
        return <Video className="w-4 h-4" />;
      case 'in-person':
        return <Users className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return 'text-green-600 bg-green-100';
    if (energy >= 6) return 'text-blue-600 bg-blue-100';
    if (energy >= 4) return 'text-yellow-600 bg-yellow-100';
    if (energy >= 2) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getEnergyLabel = (energy: number) => {
    if (energy >= 8) return 'Very Energizing';
    if (energy >= 6) return 'Energizing';
    if (energy >= 4) return 'Neutral';
    if (energy >= 2) return 'Depleting';
    return 'Very Depleting';
  };

  const formatDuration = (duration?: { value: number; unit: DurationUnit }) => {
    if (!duration) return '';
    return `${duration.value} ${duration.unit}`;
  };

  const getDurationInMinutes = (duration: { value: number; unit: DurationUnit }) => {
    switch (duration.unit) {
      case 'seconds':
        return duration.value / 60;
      case 'minutes':
        return duration.value;
      case 'hours':
        return duration.value * 60;
      case 'days':
        return duration.value * 24 * 60;
      case 'weeks':
        return duration.value * 7 * 24 * 60;
      default:
        return 0;
    }
  };

  // Prepare data for the timeline chart
  const timelineData = interactions
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .map((interaction, index) => {
      // Calculate dot size based on duration
      let dotSize = 'small'; // Default size for no duration
      if (interaction.duration) {
        const durationInMinutes = getDurationInMinutes(interaction.duration);
        if (durationInMinutes >= 1440) { // 24 hours or more
          dotSize = 'extra-large';
        } else if (durationInMinutes >= 60) { // 1 hour or more
          dotSize = 'large';
        } else if (durationInMinutes >= 5) { // 5 minutes or more
          dotSize = 'medium';
        } else {
          dotSize = 'small'; // Less than 5 minutes
        }
      }
      
      return {
        date: format(interaction.timestamp, 'MMM dd'),
        energyLevel: interaction.energyLevel,
        interactionCount: index + 1,
        dotSize: dotSize,
        interaction: interaction, // Store the full interaction object
      };
    });

  const averageEnergy = interactions.length > 0 
    ? interactions.reduce((sum, i) => sum + i.energyLevel, 0) / interactions.length 
    : 0;

  const lastInteraction = interactions.length > 0 ? interactions[0] : null;

  return (
    <div className="space-y-6">
      {/* Contact Header */}
      <div className="glass-effect rounded-2xl p-6 card-shadow">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {getInitials(contact.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{contact.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                {contact.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddInteraction(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add Interaction</span>
          </button>
        </div>

        {contact.notes && (
          <div className="flex items-start space-x-2 p-4 bg-white/30 rounded-lg">
            <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
            <p className="text-gray-700">{contact.notes}</p>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-xl p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-2xl font-bold text-gray-800">{interactions.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Battery className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Energy</p>
              <p className="text-2xl font-bold text-gray-800">
                {averageEnergy > 0 ? averageEnergy.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6 card-shadow">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Interaction</p>
              <p className="text-lg font-semibold text-gray-800">
                {lastInteraction 
                  ? formatDistanceToNow(lastInteraction.timestamp, { addSuffix: true })
                  : 'Never'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Relationship Timeline */}
      {interactions.length > 0 && (
        <div className="glass-effect rounded-2xl p-6 card-shadow">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">Relationship Timeline</h2>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  domain={[0, 12]}
                  tickCount={7}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                  formatter={(value: any, name: any, props: any) => {
                    const interaction = props.payload.interaction;
                    const durationText = interaction.duration ? formatDuration(interaction.duration) : 'No duration';
                    const energyLabel = getEnergyLabel(interaction.energyLevel);
                    
                    return [
                      <div key="tooltip-content">
                        <div className="font-semibold text-gray-800 mb-2">
                          {interaction.type.replace('-', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📅 {format(interaction.timestamp, 'MMM dd, yyyy • h:mm a')}</div>
                          <div>⏱️ Duration: {durationText}</div>
                          <div>⚡ Energy: {interaction.energyLevel}/10 ({energyLabel})</div>
                          {interaction.notes && (
                            <div>📝 {interaction.notes}</div>
                          )}
                        </div>
                      </div>,
                      'Interaction Details'
                    ];
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="energyLevel" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    let radius = 4; // default small
                    if (payload.dotSize === 'medium') radius = 6;
                    if (payload.dotSize === 'large') radius = 8;
                    if (payload.dotSize === 'extra-large') radius = 12;
                    
                    return (
                      <circle
                        key={`dot-${payload.interaction.id}`}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="#0ea5e9"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInteraction(payload.interaction);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.fill = '#0284c7';
                          e.currentTarget.style.stroke = '#0284c7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.fill = '#0ea5e9';
                          e.currentTarget.style.stroke = '#0ea5e9';
                        }}
                      />
                    );
                  }}
                  activeDot={(props: any) => {
                    const { cx, cy, payload } = props;
                    let radius = 6; // default small + 2
                    if (payload.dotSize === 'medium') radius = 8;
                    if (payload.dotSize === 'large') radius = 10;
                    if (payload.dotSize === 'extra-large') radius = 14;
                    
                    return (
                      <circle
                        key={`active-dot-${payload.interaction.id}`}
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="#0ea5e9"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingInteraction(payload.interaction);
                        }}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 text-center space-y-2">
            <div>Energy level over time (0 = Very Depleting, 10 = Very Energizing)</div>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>Short interaction</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span>Medium interaction</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                <span>Long interaction</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Interactions */}
      <div className="glass-effect rounded-2xl p-6 card-shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Interactions</h2>
        
        {interactions.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No interactions yet. Start building your relationship!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.slice(0, 10).map((interaction) => (
              <div key={interaction.id} className="flex items-center justify-between p-4 bg-white/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    {getInteractionIcon(interaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800 capitalize">
                        {interaction.type.replace('-', ' ')}
                      </span>
                      {interaction.duration && (
                        <span className="text-sm text-gray-600">
                          • {formatDuration(interaction.duration)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {format(interaction.timestamp, 'MMM dd, yyyy • h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getEnergyColor(interaction.energyLevel)}`}>
                    {interaction.energyLevel}/10
                  </div>
                  <span className="text-sm text-gray-600">
                    {getEnergyLabel(interaction.energyLevel)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddInteraction && (
        <AddInteractionModal
          contact={contact}
          onClose={() => setShowAddInteraction(false)}
          onAdd={onAddInteraction}
        />
      )}

      {editingInteraction && (
        <EditInteractionModal
          contact={contact}
          interaction={editingInteraction}
          onClose={() => setEditingInteraction(null)}
          onSave={(updatedInteraction) => {
            onUpdateInteraction(updatedInteraction);
            setEditingInteraction(null);
          }}
        />
      )}
    </div>
  );
};

export default ContactDetail; 