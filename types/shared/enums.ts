export enum UserMode {
  SOLO = 'solo',
  DUO = 'duo',
  GROUP = 'group'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ActivityTag {
  COFFEE = 'coffee',
  MOVIE = 'movie',
  GAMING = 'gaming',
  COOKING = 'cooking',
  BOARD_GAMES = 'board_games',
  WALKING = 'walking',
  SPORTS = 'sports',
  MUSEUM = 'museum',
  CONCERTS = 'concerts',
  DINNER = 'dinner',
  DRINKS = 'drinks',
  HIKING = 'hiking',
  GYM = 'gym',
  YOGA = 'yoga',
  PHOTOGRAPHY = 'photography',
  SHOPPING = 'shopping'
}

export enum PingStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export enum LobbyType {
  DINNER = 'dinner',
  SPORTS = 'sports',
  SOCIAL = 'social'
}

export enum LobbyStatus {
  OPEN = 'open',
  FULL = 'full',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum SubscriptionPlanType {
  FREE = 'free',
  PLUS = 'plus',
  PREMIUM = 'premium'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export enum VenueCategory {
  CAFE = 'cafe',
  COWORKING = 'coworking',
  CINEMA = 'cinema',
  RESTAURANT = 'restaurant',
  EXPERIENCE = 'experience',
  ENTERTAINMENT = 'entertainment',
  PARK = 'park',
  LIBRARY = 'library'
}

export enum TransactionType {
  SUBSCRIPTION = 'subscription',
  BOOST = 'boost',
  EXTRA_PINGS = 'extra_pings',
  SAFETY_PACK = 'safety_pack',
  GROUP_FEATURE = 'group_feature'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non_binary',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum ParticipantStatus {
  JOINED = 'joined',
  LEFT = 'left',
  KICKED = 'kicked'
}

export enum WebSocketEventType {
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',
  USER_LOCATION_UPDATE = 'user_location_update',
  PING_RECEIVED = 'ping_received',
  PING_ACCEPTED = 'ping_accepted',
  PING_DECLINED = 'ping_declined',
  PING_EXPIRED = 'ping_expired',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_DELETED = 'message_deleted',
  SESSION_EXPIRED = 'session_expired',
  TYPING_INDICATOR = 'typing_indicator',
  CHECKIN_DUE = 'checkin_due',
  CHECKIN_MISSED = 'checkin_missed',
  SOS_TRIGGERED = 'sos_triggered',
  GROUP_INVITE = 'group_invite',
  GROUP_MEMBER_JOINED = 'group_member_joined',
  GROUP_MEMBER_LEFT = 'group_member_left',
  LOBBY_PARTICIPANT_JOINED = 'lobby_participant_joined',
  LOBBY_PARTICIPANT_LEFT = 'lobby_participant_left',
  LOBBY_STATUS_CHANGED = 'lobby_status_changed',
  ACCOUNT_BANNED = 'account_banned',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
}

export enum ErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_OTP = 'INVALID_OTP',
  USER_BANNED = 'USER_BANNED',
  INVALID_INPUT = 'INVALID_INPUT',
  AGE_RESTRICTION = 'AGE_RESTRICTION',
  USER_OFFLINE = 'USER_OFFLINE',
  OUT_OF_RANGE = 'OUT_OF_RANGE',
  PING_EXPIRED = 'PING_EXPIRED',
  PING_ALREADY_RESPONDED = 'PING_ALREADY_RESPONDED',
  DAILY_PING_LIMIT_REACHED = 'DAILY_PING_LIMIT_REACHED',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_EXPIRED_ERROR = 'SESSION_EXPIRED_ERROR',
  MESSAGE_TOO_LONG = 'MESSAGE_TOO_LONG',
  LOCATION_REQUIRED = 'LOCATION_REQUIRED',
  PUBLIC_VENUE_REQUIRED = 'PUBLIC_VENUE_REQUIRED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export enum NotificationType {
  PING_RECEIVED = 'ping_received',
  PING_ACCEPTED = 'ping_accepted',
  MESSAGE_RECEIVED = 'message_received',
  MEETUP_REMINDER = 'meetup_reminder',
  CHECKIN_REMINDER = 'checkin_reminder',
  GROUP_INVITE = 'group_invite',
  LOBBY_STARTING = 'lobby_starting',
  VERIFICATION_APPROVED = 'verification_approved',
  VERIFICATION_REJECTED = 'verification_rejected',
}

export enum AnalyticsEvent {
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  PROFILE_COMPLETED = 'profile_completed',
  PING_SENT = 'ping_sent',
  PING_ACCEPTED = 'ping_accepted',
  PING_DECLINED = 'ping_declined',
  CHAT_STARTED = 'chat_started',
  MEETUP_CONFIRMED = 'meetup_confirmed',
  APP_OPENED = 'app_opened',
  NEARBY_VIEWED = 'nearby_viewed',
  PROFILE_VIEWED = 'profile_viewed',
  SOS_TRIGGERED = 'sos_triggered',
  CHECKIN_COMPLETED = 'checkin_completed',
  REPORT_SUBMITTED = 'report_submitted',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  VENUE_DISCOUNT_USED = 'venue_discount_used',
  GROUP_CREATED = 'group_created',
  GROUP_JOINED = 'group_joined',
  LOBBY_CREATED = 'lobby_created',
  LOBBY_JOINED = 'lobby_joined',
}
