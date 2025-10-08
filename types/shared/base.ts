export interface Identifiable {
  id: string;
}

export interface Timestamped {
  created_at: string;
}

export interface FullyTimestamped extends Timestamped {
  updated_at: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface TimestampedLocation extends Coordinates {
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
  };
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retry_after?: number;
}
