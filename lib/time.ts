/**
 * Beregn tid tilbage fra nu til en dato
 */
export function getTimeRemaining(expiresAt: string): {
  total: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} {
  const total = new Date(expiresAt).getTime() - Date.now();
  const isExpired = total <= 0;

  if (isExpired) {
    return { total: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const minutes = Math.floor((total / 1000 / 60) % 60);
  const seconds = Math.floor((total / 1000) % 60);

  return { total, minutes, seconds, isExpired: false };
}

/**
 * Formatér tid tilbage som string
 */
export function formatTimeRemaining(expiresAt: string): string {
  const { minutes, seconds, isExpired } = getTimeRemaining(expiresAt);

  if (isExpired) {
    return 'Udløbet';
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formatér relativ tid (f.eks. "2 min siden")
 */
export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;

  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return 'Lige nu';
  } else if (minutes < 60) {
    return `${minutes} min siden`;
  } else if (hours < 24) {
    return `${hours} time${hours > 1 ? 'r' : ''} siden`;
  } else {
    return `${days} dag${days > 1 ? 'e' : ''} siden`;
  }
}

/**
 * Formatér absolut tid (f.eks. "14:30")
 */
export function formatAbsoluteTime(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
