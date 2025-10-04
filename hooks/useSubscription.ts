import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SubscriptionPlan, UserSubscription, UsageLimits } from '@/types/monetization';

export function useSubscription() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [usageLimits, setUsageLimits] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (subData) {
        setSubscription(subData);
        setPlan(subData.plan);
      } else {
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'free')
          .single();

        setPlan(freePlan);
      }

      const { data: limitsData } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (limitsData) {
        const today = new Date().toISOString().split('T')[0];
        if (limitsData.last_reset_date !== today) {
          const dailyLimit = plan?.features.daily_pings || 5;
          const { data: resetData } = await supabase
            .from('usage_limits')
            .update({
              daily_pings_used: 0,
              last_reset_date: today,
              daily_pings_limit: dailyLimit,
            })
            .eq('user_id', user.id)
            .select()
            .single();

          setUsageLimits(resetData);
        } else {
          setUsageLimits(limitsData);
        }
      } else {
        const dailyLimit = plan?.features.daily_pings || 5;
        const { data: newLimits } = await supabase
          .from('usage_limits')
          .insert({
            user_id: user.id,
            daily_pings_limit: dailyLimit,
            daily_pings_used: 0,
          })
          .select()
          .single();

        setUsageLimits(newLimits);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canSendPing = () => {
    if (!usageLimits || !plan) return false;
    if (plan.features.daily_pings === -1) return true;
    return usageLimits.daily_pings_used < usageLimits.daily_pings_limit;
  };

  const incrementPingUsage = async () => {
    if (!usageLimits) return;

    const { data } = await supabase
      .from('usage_limits')
      .update({ daily_pings_used: usageLimits.daily_pings_used + 1 })
      .eq('id', usageLimits.id)
      .select()
      .single();

    if (data) {
      setUsageLimits(data);
    }
  };

  const hasFeature = (feature: keyof SubscriptionPlan['features']) => {
    return plan?.features[feature] || false;
  };

  const isBoostActive = () => {
    if (!usageLimits?.boost_active_until) return false;
    return new Date(usageLimits.boost_active_until) > new Date();
  };

  return {
    subscription,
    plan,
    usageLimits,
    loading,
    canSendPing,
    incrementPingUsage,
    hasFeature,
    isBoostActive,
    refresh: fetchSubscription,
  };
}
