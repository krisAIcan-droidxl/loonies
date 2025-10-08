import { Identifiable, FullyTimestamped } from '../shared/base';
import { UserMode, Gender, VerificationStatus, ActivityTag } from '../shared/enums';

export interface User extends Identifiable, FullyTimestamped {
  first_name: string;
  age: number;
  gender?: Gender;
  date_of_birth: string;
  email: string;
  phone_number: string;
  photo_url?: string;
  bio?: string;
  current_mode: UserMode;
  activity_tags: ActivityTag[];
  duo_partner_id?: string;
  group_id?: string;
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_verified_host: boolean;
  rating_average: number;
  rating_count: number;
  connections_made: number;
  successful_meetups: number;
  is_active: boolean;
  is_banned: boolean;
  banned_until?: string;
}

export type PublicProfile = Pick<User,
  'id' |
  'first_name' |
  'age' |
  'gender' |
  'photo_url' |
  'bio' |
  'is_verified' |
  'is_verified_host' |
  'rating_average' |
  'rating_count' |
  'current_mode' |
  'activity_tags'
>;

export interface UserSettings extends Identifiable {
  user_id: string;
  push_enabled: boolean;
  email_notifications: boolean;
  marketing_emails: boolean;
  show_age: boolean;
  show_gender: boolean;
  preferred_distance_km: number;
  preferred_activities: ActivityTag[];
  emergency_contact_id?: string;
  auto_checkin_enabled: boolean;
  checkin_interval_minutes: 30 | 60;
  updated_at: string;
}
