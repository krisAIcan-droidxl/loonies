import { Identifiable, Timestamped, Coordinates } from '../shared/base';
import { VenueCategory } from '../shared/enums';
import { PublicProfile } from '../core/user';

export interface ChatSession extends Identifiable, Timestamped {
  ping_id: string;
  participant_user_ids: string[];
  participant_group_ids?: string[];
  is_active: boolean;
  expires_at: string;
  deleted_at?: string;
  meetup_scheduled_at?: string;
  meetup_location_id?: string;
  participants?: PublicProfile[];
  messages?: ChatMessage[];
  meetup_location?: MeetupLocation;
}

export interface ChatMessage extends Identifiable, Timestamped {
  session_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'system' | 'location_share';
  is_deleted: boolean;
  deleted_at?: string;
  sender?: PublicProfile;
}

export interface MeetupLocation extends Identifiable, Timestamped {
  session_id: string;
  ping_id: string;
  venue_name: string;
  address: string;
  location: Coordinates;
  is_public_place: boolean;
  is_partner_venue: boolean;
  venue_category?: VenueCategory;
  suggested_by: string;
  live_sharing_enabled: boolean;
  live_sharing_expires_at?: string;
}

export interface SendMessageRequest {
  session_id: string;
  content: string;
  message_type?: 'text' | 'location_share';
}

export interface TypingIndicator {
  session_id: string;
  user_id: string;
  is_typing: boolean;
}
