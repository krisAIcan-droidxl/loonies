import { Identifiable, FullyTimestamped, Timestamped, Coordinates } from '../shared/base';
import { LobbyType, LobbyStatus, PaymentStatus, ActivityTag, ParticipantStatus } from '../shared/enums';
import { PublicProfile } from '../core/user';

export interface ActivityLobby extends Identifiable, FullyTimestamped {
  host_id: string;
  title: string;
  description?: string;
  lobby_type: LobbyType;
  activity_tag: ActivityTag;
  cuisine_type?: string;
  max_participants: number;
  current_participants: number;
  scheduled_time: string;
  time_flexibility?: 'now' | 'soon' | 'evening' | 'specific';
  location_name?: string;
  location: Coordinates;
  status: LobbyStatus;
  is_paid: boolean;
  price_per_seat: number;
  currency: string;
  commission_rate: number;
  host_payout_amount?: number;
  host_payout_status: PaymentStatus;
  host?: PublicProfile;
  participants?: LobbyParticipant[];
}

export interface LobbyParticipant extends Identifiable, Timestamped {
  lobby_id: string;
  user_id: string;
  status: ParticipantStatus;
  joined_at: string;
  left_at?: string;
  payment_status: PaymentStatus;
  payment_amount?: number;
  payment_intent_id?: string;
  paid_at?: string;
  profile?: PublicProfile;
}

export interface LobbyRating extends Identifiable, Timestamped {
  lobby_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment?: string;
  organization_rating?: number;
  friendliness_rating?: number;
  venue_rating?: number;
}

export interface CreateLobbyRequest {
  title: string;
  description?: string;
  lobby_type: LobbyType;
  activity_tag: ActivityTag;
  max_participants: number;
  scheduled_time: string;
  location_name?: string;
  latitude: number;
  longitude: number;
  is_paid: boolean;
  price_per_seat?: number;
  cuisine_type?: string;
}

export type DinnerLobby = ActivityLobby;
export { LobbyType, LobbyStatus, PaymentStatus };
