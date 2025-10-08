export interface AppConfig {
  MAX_DISTANCE_KM: 2;
  DEFAULT_DISTANCE_KM: 2;
  PING_EXPIRY_MINUTES: 15;
  DAILY_FREE_PINGS: 10;
  CHAT_SESSION_DURATION_HOURS: 24;
  MAX_MESSAGE_LENGTH: 500;
  CHECKIN_INTERVAL_MINUTES: 30 | 60;
  LIVE_LOCATION_MAX_DURATION_MINUTES: 60;
  MIN_GROUP_SIZE: 3;
  MAX_GROUP_SIZE: 6;
  MIN_LOBBY_SIZE: 2;
  MAX_LOBBY_SIZE: 20;
  MIN_AGE: 18;
  MAX_PINGS_PER_HOUR: 20;
  MAX_MESSAGES_PER_MINUTE: 10;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  MAX_DISTANCE_KM: 2,
  DEFAULT_DISTANCE_KM: 2,
  PING_EXPIRY_MINUTES: 15,
  DAILY_FREE_PINGS: 10,
  CHAT_SESSION_DURATION_HOURS: 24,
  MAX_MESSAGE_LENGTH: 500,
  CHECKIN_INTERVAL_MINUTES: 30,
  LIVE_LOCATION_MAX_DURATION_MINUTES: 60,
  MIN_GROUP_SIZE: 3,
  MAX_GROUP_SIZE: 6,
  MIN_LOBBY_SIZE: 2,
  MAX_LOBBY_SIZE: 20,
  MIN_AGE: 18,
  MAX_PINGS_PER_HOUR: 20,
  MAX_MESSAGES_PER_MINUTE: 10,
};

export interface FeatureFlags {
  groups_enabled: boolean;
  lobbies_enabled: boolean;
  paid_lobbies_enabled: boolean;
  extended_radius_enabled: boolean;
  partner_venues_enabled: boolean;
  enhanced_verification_required: boolean;
  mandatory_checkins: boolean;
  ai_matching_enabled: boolean;
  video_verification_enabled: boolean;
}
