import { Identifiable, Timestamped, FullyTimestamped, Coordinates } from '../shared/base';
import { ActivityTag } from '../shared/enums';
import { PublicProfile } from './user';

export interface SocialGroup extends Identifiable, FullyTimestamped {
  name: string;
  description?: string;
  member_ids: string[];
  size: number;
  created_by: string;
  visibility: 'public' | 'private';
  activity_tags: ActivityTag[];
  is_active: boolean;
  current_location?: Coordinates;
  invite_code?: string;
  invite_qr_url?: string;
  members?: PublicProfile[];
}

export interface GroupMember extends Identifiable, Timestamped {
  group_id: string;
  user_id: string;
  role: 'creator' | 'member';
  joined_at: string;
  left_at?: string;
  is_active: boolean;
}

export interface GroupInvite extends Identifiable, Timestamped {
  group_id: string;
  invited_by: string;
  invite_code: string;
  expires_at: string;
  max_uses?: number;
  used_count: number;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  activity_tags: ActivityTag[];
}
