import { Identifiable, FullyTimestamped, TimestampedLocation } from '../shared/base';

export interface UserPresence extends Identifiable, FullyTimestamped {
  user_id: string;
  is_online: boolean;
  last_seen: string;
  is_available: boolean;
  availability_preset?: 30 | 60 | 90;
  availability_expires_at?: string;
  is_snoozed: boolean;
  current_location?: TimestampedLocation;
  websocket_connection_id?: string;
}

export interface AvailabilityPreset {
  duration_minutes: 30 | 60 | 90;
  label: string;
}

export interface UpdateAvailabilityRequest {
  is_available: boolean;
  availability_preset?: 30 | 60 | 90;
  is_snoozed?: boolean;
}

export interface UpdateLocationRequest {
  latitude: number;
  longitude: number;
}
