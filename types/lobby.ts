export interface Profile {
  id: string;
  first_name: string;
  age: number | null;
  photo_url: string | null;
  activities: string[];
  is_verified_host: boolean;
  verification_status: 'unverified' | 'pending' | 'approved' | 'rejected';
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type LobbyType = 'dinner' | 'sports' | 'social';

export interface DinnerLobby {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  lobby_type: LobbyType;
  cuisine_type: string | null;
  activity_type: string | null;
  max_participants: number;
  current_participants: number;
  scheduled_time: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'open' | 'full' | 'started' | 'completed' | 'cancelled';
  is_paid: boolean;
  price_per_seat: number;
  currency: string;
  commission_rate: number;
  host_payout_amount: number | null;
  host_payout_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  host?: Profile;
  participants?: LobbyParticipant[];
}

export interface LobbyParticipant {
  id: string;
  lobby_id: string;
  user_id: string;
  joined_at: string;
  status: 'joined' | 'left' | 'kicked';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount: number | null;
  payment_intent_id: string | null;
  paid_at: string | null;
  profile?: Profile;
}

export interface HostVerification {
  id: string;
  user_id: string;
  id_document_url: string | null;
  selfie_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface LobbyRating {
  id: string;
  lobby_id: string;
  rater_id: string;
  rated_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface Payout {
  id: string;
  lobby_id: string;
  host_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_date: string | null;
  completed_date: string | null;
  created_at: string;
}
