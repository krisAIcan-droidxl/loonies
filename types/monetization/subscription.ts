import { Identifiable, Timestamped, FullyTimestamped } from '../shared/base';
import { SubscriptionPlanType, SubscriptionStatus, BillingCycle, VenueCategory, TransactionType, PaymentStatus } from '../shared/enums';

export interface SubscriptionPlan extends Identifiable, Timestamped {
  name: SubscriptionPlanType;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: PlanFeatures;
  is_active: boolean;
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
  venue_discounts: boolean;
  safety_pack: boolean;
  can_create_paid_lobbies: boolean;
  max_lobby_size: number;
}

export interface UserSubscription extends Identifiable, FullyTimestamped {
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  started_at: string;
  expires_at?: string;
  cancelled_at?: string;
  auto_renew: boolean;
  stripe_subscription_id?: string;
  plan?: SubscriptionPlan;
}

export interface UsageLimits extends Identifiable, FullyTimestamped {
  user_id: string;
  daily_pings_used: number;
  daily_pings_limit: number;
  boost_active_until?: string;
  boost_pings_remaining: number;
  visibility_radius_km: number;
  chat_duration_hours: number;
  last_reset_date: string;
}

export interface PartnerVenue extends Identifiable, Timestamped {
  name: string;
  category: VenueCategory;
  description?: string;
  address: string;
  location: { latitude: number; longitude: number };
  discount_code?: string;
  discount_description?: string;
  is_featured: boolean;
  featured_until?: string;
  logo_url?: string;
  photos: string[];
  contact_email?: string;
  phone?: string;
  website_url?: string;
}

export interface Transaction extends Identifiable, Timestamped {
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  metadata: Record<string, unknown>;
}
