import React, { useRef, useEffect, useState } from 'react';
import { Contact, Interaction } from '../types';
import { User, Users, MapPin, Globe } from 'lucide-react';

interface NetworkGraphProps {
  contacts: Contact[];
  interactions: Interaction[];
}

interface ContactNode {
  contact: Contact;
  x: number;
  y: number;
  radius: number;
  color: string;
  interactionCount: number;
  averageEnergy: number;
  daysSinceLastInteraction: number;
  frequencyPerMonth: number;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ contacts, interactions }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<ContactNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ContactNode | null>(null);
  const [locationMode, setLocationMode] = useState(false);

  // Calculate contact statistics
  const getContactStats = (contactId: string) => {
    const contactInteractions = interactions.filter(i => i.contactId === contactId);
    const totalInteractions = contactInteractions.length;
    const averageEnergy = totalInteractions > 0 
      ? contactInteractions.reduce((sum, i) => sum + i.energyLevel, 0) / totalInteractions 
      : 0;
    
    // Calculate last interaction time (in days ago)
    const lastInteraction = contactInteractions.length > 0 
      ? Math.max(...contactInteractions.map(i => i.timestamp.getTime()))
      : 0;
    const daysSinceLastInteraction = lastInteraction > 0 
      ? (Date.now() - lastInteraction) / (1000 * 60 * 60 * 24)
      : 365; // Default to 1 year if no interactions
    
    // Calculate frequency in last year (interactions per month)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const interactionsLastYear = contactInteractions.filter(i => i.timestamp >= oneYearAgo).length;
    const frequencyPerMonth = interactionsLastYear / 12;
    
    return { 
      totalInteractions, 
      averageEnergy, 
      daysSinceLastInteraction,
      frequencyPerMonth 
    };
  };

  // Generate energy-based color (light and modern)
  const getEnergyColor = (energy: number) => {
    if (energy >= 8) return '#dcfce7'; // Light green
    if (energy >= 6) return '#bbf7d0'; // Soft green
    if (energy >= 4) return '#fef3c7'; // Light yellow
    if (energy >= 2) return '#fed7aa'; // Light orange
    return '#fecaca'; // Light red
  };

  // Determine if a contact is local based on location
  const isLocalContact = (contact: Contact): boolean => {
    if (!contact.location) return false;
    
    const location = contact.location.toLowerCase();
    const localKeywords = [
      'san francisco', 'sf', 'bay area', 'oakland', 'berkeley', 'palo alto',
      'mountain view', 'san mateo', 'redwood city', 'menlo park', 'sunnyvale',
      'santa clara', 'san jose', 'fremont', 'hayward', 'dublin', 'pleasanton',
      'livermore', 'walnut creek', 'concord', 'san rafael', 'novato', 'petaluma',
      'napa', 'sonoma', 'marin', 'contra costa', 'alameda', 'santa clara county'
    ];
    
    return localKeywords.some(keyword => location.includes(keyword));
  };

  // Calculate node positions
  const calculateNodePositions = (): ContactNode[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(rect.width, rect.height) * 0.3;
    const minRadius = Math.min(rect.width, rect.height) * 0.15;

    return contacts.map((contact, index) => {
      const stats = getContactStats(contact.id);
      const interactionCount = stats.totalInteractions;
      const averageEnergy = stats.averageEnergy;
      const daysSinceLastInteraction = stats.daysSinceLastInteraction;
      const frequencyPerMonth = stats.frequencyPerMonth;

      // Calculate distance from center based on recency and frequency
      // More recent interactions and higher frequency = closer to center
      const maxDaysSinceLast = Math.max(...contacts.map(c => getContactStats(c.id).daysSinceLastInteraction));
      const maxFrequency = Math.max(...contacts.map(c => getContactStats(c.id).frequencyPerMonth));
      
      // Normalize recency (0 = very recent, 1 = very old)
      const normalizedRecency = maxDaysSinceLast > 0 ? daysSinceLastInteraction / maxDaysSinceLast : 0;
      
      // Normalize frequency (0 = low frequency, 1 = high frequency)
      const normalizedFrequency = maxFrequency > 0 ? frequencyPerMonth / maxFrequency : 0;
      
      // Combine recency and frequency (recency has more weight)
      const combinedScore = (0.7 * (1 - normalizedRecency)) + (0.3 * normalizedFrequency);
      
      let distance: number;
      
      if (locationMode) {
        // In location mode, separate local vs non-local contacts
        const isLocal = isLocalContact(contact);
        const localBoundary = (maxRadius + minRadius) / 2; // Boundary circle
        
        if (isLocal) {
          // Local contacts: inside the boundary circle, positioned by recency/frequency
          const localMaxRadius = localBoundary;
          distance = localMaxRadius - (combinedScore * (localMaxRadius - minRadius));
        } else {
          // Non-local contacts: outside the boundary circle, positioned by recency/frequency
          const outerMinRadius = localBoundary + 20; // Gap between local and non-local
          const outerMaxRadius = maxRadius;
          distance = outerMinRadius + (combinedScore * (outerMaxRadius - outerMinRadius));
        }
      } else {
        // Normal mode: all contacts positioned by recency/frequency
        distance = maxRadius - (combinedScore * (maxRadius - minRadius));
      }

      // Calculate angle (distribute evenly around the circle)
      const angle = (index / contacts.length) * 2 * Math.PI;

      // Calculate position
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      // Calculate node radius based on frequency (more frequent = larger)
      const radius = Math.max(25, Math.min(45, 25 + frequencyPerMonth * 8));

      return {
        contact,
        x,
        y,
        radius,
        color: getEnergyColor(averageEnergy),
        interactionCount,
        averageEnergy,
        daysSinceLastInteraction,
        frequencyPerMonth,
      };
    });
  };

  // Draw the network graph
  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high DPI rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual size in memory (scaled up for high DPI)
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(dpr, dpr);
    
    // Set the display size (CSS pixels)
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const nodes = calculateNodePositions();
    if (nodes.length === 0) return;
    
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    
    const canvasRect = canvasElement.getBoundingClientRect();
    const centerX = canvasRect.width / 2;
    const centerY = canvasRect.height / 2;

    // Draw location boundary circle in location mode
    if (locationMode) {
      const canvasRect = canvasElement.getBoundingClientRect();
      const maxRadius = Math.min(canvasRect.width, canvasRect.height) * 0.3;
      const minRadius = Math.min(canvasRect.width, canvasRect.height) * 0.15;
      const localBoundary = (maxRadius + minRadius) / 2;
      
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, localBoundary, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw connections (lines from center to each node) - more subtle
    ctx.strokeStyle = 'rgba(156, 163, 175, 0.12)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(node.x, node.y);
      ctx.stroke();
    });

    // Draw center node (user) - modern and light with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32, 0, 2 * Math.PI);
    ctx.fill();

    // Draw center node border
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw center node text
    ctx.fillStyle = '#374151';
    ctx.font = '600 15px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('You', centerX, centerY);

    // Draw contact nodes
    nodes.forEach(node => {
      // Add shadow for depth
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      // Draw node with gradient-like effect
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();

      // Remove shadow for border
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      // Draw node border - subtle
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw contact first name with better contrast
      const firstName = node.contact.name.split(' ')[0];
      const fontSize = Math.max(13, Math.min(18, node.radius / 2.5));

      ctx.fillStyle = '#1f2937';
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(firstName, node.x, node.y);

      // Highlight hovered node - modern style with glow
      if (hoveredNode && hoveredNode.contact.id === node.contact.id) {
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
  };

  // Handle mouse events
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodes = calculateNodePositions();
    const hovered = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius;
    });

    setHoveredNode(hovered || null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const nodes = calculateNodePositions();
    const clicked = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.radius;
    });

    setSelectedNode(clicked || null);
  };

  // Redraw when data changes
  useEffect(() => {
    drawNetwork();
  }, [contacts, interactions, hoveredNode, locationMode]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      drawNetwork();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [contacts, interactions, locationMode]);

  const nodes = calculateNodePositions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">Relationship Network</h2>
        </div>
        
        {/* Location Mode Toggle */}
        <button
          onClick={() => setLocationMode(!locationMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
            locationMode
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          {locationMode ? (
            <>
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Location Mode</span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span className="text-sm">Network Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Network Graph */}
      <div className="glass-effect rounded-2xl p-6 card-shadow">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto border border-white/20 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50/50 to-white/50"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
            style={{ minHeight: '500px' }}
          />
          
          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-3 border border-white/20">
            <h4 className="font-medium text-gray-700 text-sm">Energy Levels</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
                <span className="text-xs text-gray-600">Very Energizing (8-10)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-200 border border-green-300"></div>
                <span className="text-xs text-gray-600">Energizing (6-7)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></div>
                <span className="text-xs text-gray-600">Neutral (4-5)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></div>
                <span className="text-xs text-gray-600">Depleting (2-3)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                <span className="text-xs text-gray-600">Very Depleting (0-1)</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-2">
              <h4 className="font-medium text-gray-700 text-sm mb-1">Positioning</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Closer = More recent & frequent</p>
                <p>• Larger = Higher frequency</p>
                <p>• Recency: 70% weight</p>
                <p>• Frequency: 30% weight</p>
                {locationMode && (
                  <>
                    <p className="mt-2 font-medium">Location Mode:</p>
                    <p>• Inside circle = Local contacts</p>
                    <p>• Outside circle = Non-local</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredNode && (
          <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
            <h3 className="font-semibold text-gray-800">{hoveredNode.contact.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Interactions: {hoveredNode.interactionCount}</p>
              <p>Average Energy: {hoveredNode.averageEnergy.toFixed(1)}/10</p>
              <p>Last Seen: {hoveredNode.daysSinceLastInteraction < 1 ? 'Today' : 
                hoveredNode.daysSinceLastInteraction < 7 ? `${Math.round(hoveredNode.daysSinceLastInteraction)} days ago` :
                hoveredNode.daysSinceLastInteraction < 30 ? `${Math.round(hoveredNode.daysSinceLastInteraction / 7)} weeks ago` :
                `${Math.round(hoveredNode.daysSinceLastInteraction / 30)} months ago`}</p>
              <p>Frequency: {hoveredNode.frequencyPerMonth.toFixed(1)} interactions/month</p>
              {hoveredNode.contact.location && (
                <p>Location: {hoveredNode.contact.location}</p>
              )}
            </div>
          </div>
        )}

        {/* Selected Contact Details */}
        {selectedNode && (
          <div className="mt-4 p-4 bg-indigo-50/80 backdrop-blur-sm rounded-xl border border-indigo-200/50">
            <h3 className="font-semibold text-indigo-800 mb-2">
              Selected: {selectedNode.contact.name}
            </h3>
            <div className="text-sm text-indigo-700 space-y-1">
              <p>Total Interactions: {selectedNode.interactionCount}</p>
              <p>Average Energy Level: {selectedNode.averageEnergy.toFixed(1)}/10</p>
              <p>Last Seen: {selectedNode.daysSinceLastInteraction < 1 ? 'Today' : 
                selectedNode.daysSinceLastInteraction < 7 ? `${Math.round(selectedNode.daysSinceLastInteraction)} days ago` :
                selectedNode.daysSinceLastInteraction < 30 ? `${Math.round(selectedNode.daysSinceLastInteraction / 7)} weeks ago` :
                `${Math.round(selectedNode.daysSinceLastInteraction / 30)} months ago`}</p>
              <p>Frequency: {selectedNode.frequencyPerMonth.toFixed(1)} interactions/month</p>
              {selectedNode.contact.email && <p>Email: {selectedNode.contact.email}</p>}
              {selectedNode.contact.phone && <p>Phone: {selectedNode.contact.phone}</p>}
              {selectedNode.contact.location && <p>Location: {selectedNode.contact.location}</p>}
              {selectedNode.contact.notes && <p>Notes: {selectedNode.contact.notes}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-xl p-4 card-shadow">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{contacts.length}</p>
            <p className="text-sm text-gray-600">Total Contacts</p>
          </div>
        </div>
        <div className="glass-effect rounded-xl p-4 card-shadow">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{interactions.length}</p>
            <p className="text-sm text-gray-600">Total Interactions</p>
          </div>
        </div>
        <div className="glass-effect rounded-xl p-4 card-shadow">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">
              {interactions.length > 0 
                ? (interactions.reduce((sum, i) => sum + i.energyLevel, 0) / interactions.length).toFixed(1)
                : '0.0'
              }
            </p>
            <p className="text-sm text-gray-600">Average Energy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph; 