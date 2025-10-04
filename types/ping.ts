export type PingStatus = 'pending' | 'accepted' | 'ignored' | 'expired';

export type PingActivity = 'coffee' | 'gaming' | 'sports' | 'dinner';

export interface Ping {
  id: string;
  from_user: string;
  to_user: string;
  activity: PingActivity;
  created_at: string;
  expires_at: string;
  status: PingStatus;
  from_profile?: {
    id: string;
    first_name: string;
    age: number;
    photo_url: string | null;
  };
  to_profile?: {
    id: string;
    first_name: string;
    age: number;
    photo_url: string | null;
  };
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  activity: PingActivity;
  created_at: string;
  expires_at: string;
  profile_a?: {
    id: string;
    first_name: string;
    age: number;
    photo_url: string | null;
  };
  profile_b?: {
    id: string;
    first_name: string;
    age: number;
    photo_url: string | null;
  };
}

export interface ChatMessage {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
