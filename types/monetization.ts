export interface SubscriptionPlan {
  id: string;
  name: 'free' | 'plus' | 'premium';
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: PlanFeatures;
  is_active: boolean;
  created_at: string;
}

export interface PlanFeatures {
  daily_pings: number;
  visibility_radius_km: number;
  chat_duration_hours: number;
  advanced_filters: boolean;
  priority_placement: boolean;
  verification_badge: boolean;
  max_group_size: number;
  featured_groups: number;
  venue_discounts?: boolean;
  safety_pack?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  billing_cycle: 'monthly' | 'yearly';
  started_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface UsageLimits {
  id: string;
  user_id: string;
  daily_pings_used: number;
  daily_pings_limit: number;
  boost_active_until: string | null;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerVenue {
  id: string;
  name: string;
  category: 'cafe' | 'coworking' | 'cinema' | 'restaurant' | 'experience' | 'entertainment';
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  discount_code: string | null;
  discount_description: string | null;
  is_featured: boolean;
  featured_until: string | null;
  logo_url: string | null;
  contact_email: string | null;
  phone: string | null;
  website_url: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'subscription' | 'boost' | 'extra_pings' | 'safety_pack' | 'group_feature';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: Record<string, any>;
  created_at: string;
}
