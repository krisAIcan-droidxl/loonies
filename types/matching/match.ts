import { UserMode, ActivityTag } from '../shared/enums';
import { PublicProfile } from '../core/user';
import { SocialGroup } from '../core/group';

export interface MatchFilter {
  user_id: string;
  max_distance_km: 2;
  required_mode: UserMode;
  required_tags?: ActivityTag[];
  only_online: true;
}

export interface NearbyUser {
  user_id: string;
  profile: PublicProfile;
  distance_meters: number;
  estimated_walk_time_min: number;
  estimated_bike_time_min: number;
  shared_tags: ActivityTag[];
  tag_overlap_count: number;
  mode: UserMode;
  group?: SocialGroup;
  is_online: boolean;
  last_seen: string;
}

export interface MatchScore {
  user_id: string;
  score: number;
  factors: {
    distance_score: number;
    tag_overlap_score: number;
    recent_activity_score: number;
    verification_bonus: number;
  };
}

export interface SearchNearbyRequest {
  max_distance_km?: number;
  activity_tags?: ActivityTag[];
  mode?: UserMode;
}
