export interface User {
  id: string;
  firstName: string;
  age: number;
  gender?: string;
  photo?: string;
  activities: string[];
  mode: 'solo' | 'duo' | 'group';
  isOnline: boolean;
  isAvailable: boolean;
  availableUntil?: Date;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  isVerified: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: User[];
  activities: string[];
  isPublic: boolean;
  maxSize: number;
  createdBy: string;
  location: {
    latitude: number;
    longitude: number;
  };
  isOnline: boolean;
  createdAt: Date;
}

export interface Ping {
  id: string;
  fromUserId: string;
  toUserId?: string;
  toGroupId?: string;
  activity: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface ChatSession {
  id: string;
  participants: string[];
  messages: Message[];
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface SafetyFeature {
  id: string;
  userId: string;
  type: 'check_in' | 'sos' | 'location_share';
  status: 'active' | 'inactive';
  expiresAt?: Date;
  metadata?: Record<string, any>;
}