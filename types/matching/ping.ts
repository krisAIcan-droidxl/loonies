import { Identifiable, Timestamped } from '../shared/base';
import { PingStatus, ActivityTag } from '../shared/enums';
import { PublicProfile } from '../core/user';
import { SocialGroup } from '../core/group';

export interface Ping extends Identifiable, Timestamped {
  from_user_id: string;
  from_group_id?: string;
  to_user_id: string;
  to_group_id?: string;
  activity_tag: ActivityTag;
  message: string;
  suggested_time?: string;
  suggested_location?: string;
  status: PingStatus;
  expires_at: string;
  responded_at?: string;
  from_user?: PublicProfile;
  to_user?: PublicProfile;
  from_group?: SocialGroup;
  to_group?: SocialGroup;
}

export interface PingResponse {
  ping_id: string;
  user_id: string;
  action: 'accept' | 'decline';
  responded_at: string;
}

export interface CreatePingRequest {
  to_user_id: string;
  to_group_id?: string;
  activity_tag: ActivityTag;
  message: string;
  suggested_time?: string;
  suggested_location?: string;
}

export { PingStatus };
