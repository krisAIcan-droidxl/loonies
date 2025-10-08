import { User } from './core/user';
import { UserPresence } from './core/presence';
import { Ping } from './matching/ping';
import { ChatSession } from './chat/session';
import { ActivityLobby } from './lobby/lobby';
import { VerificationStatus } from './shared/enums';

export const isVerifiedUser = (user: User): boolean => {
  return user.verification_status === VerificationStatus.APPROVED && user.is_verified;
};

export const isVerifiedHost = (user: User): boolean => {
  return isVerifiedUser(user) && user.is_verified_host;
};

export const isPaidLobby = (lobby: ActivityLobby): boolean => {
  return lobby.is_paid && lobby.price_per_seat > 0;
};

export const isOnline = (presence: UserPresence): boolean => {
  return presence.is_online && presence.is_available && !presence.is_snoozed;
};

export const isPingExpired = (ping: Ping): boolean => {
  return new Date(ping.expires_at) < new Date();
};

export const isChatSessionActive = (session: ChatSession): boolean => {
  return session.is_active && new Date(session.expires_at) > new Date();
};
