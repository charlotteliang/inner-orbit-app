export interface Contact {
  id: string;
  userId: string; // Add user ID for security
  name: string;
  email?: string;
  phone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  contactId: string;
  userId: string; // Add user ID for security
  type: InteractionType;
  timestamp: Date;
  energyLevel: number; // 0-10 scale
  duration?: Duration;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type InteractionType = 'message' | 'call' | 'facetime' | 'in-person';

export interface Duration {
  value: number;
  unit: DurationUnit;
}

export type DurationUnit = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

export interface EnergyDataPoint {
  date: Date;
  energyLevel: number;
  interactionCount: number;
}

export interface ContactWithInteractions extends Contact {
  interactions: Interaction[];
  lastInteraction?: Date;
  averageEnergyLevel: number;
  totalInteractions: number;
} 