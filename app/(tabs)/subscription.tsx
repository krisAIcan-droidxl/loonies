import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Crown, Zap, Shield, X } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionPlan } from '@/types/monetization';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function SubscriptionScreen() {
  const { subscription, plan, usageLimits, loading } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      if (data) setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleSelectPlan = async (selectedPlan: SubscriptionPlan) => {
    if (selectedPlan.name === plan?.name) return;

    Alert.alert(
      'Payment Integration Required',
      'This feature requires payment integration. In production, this would connect to a payment provider like Stripe or RevenueCat.',
      [{ text: 'OK' }]
    );
  };

  const pingsUsedPercent = usageLimits
    ? (usageLimits.daily_pings_used / usageLimits.daily_pings_limit) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Crown size={32} color="#F59E0B" />
          <Text style={styles.title}>Upgrade Your Experience</Text>
          <Text style={styles.subtitle}>
            Get more pings, advanced features, and priority placement
          </Text>
        </View>

        {!loading && plan && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Text style={styles.currentPlanTitle}>Current Plan</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.display_name}</Text>
              </View>
            </View>

            {usageLimits && (
              <View style={styles.usageSection}>
                <View style={styles.usageRow}>
                  <Zap size={18} color="#F97316" />
                  <Text style={styles.usageLabel}>Daily Pings</Text>
                </View>
                {plan.features.daily_pings === -1 ? (
                  <Text style={styles.unlimitedText}>Unlimited</Text>
                ) : (
                  <>
                    <Text style={styles.usageText}>
                      {usageLimits.daily_pings_used} / {usageLimits.daily_pings_limit} used
                    </Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[styles.progressFill, { width: `${pingsUsedPercent}%` }]}
                      />
                    </View>
                  </>
                )}
              </View>
            )}

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureItemText}>
                  {plan.features.visibility_radius_km}km visibility radius
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={styles.featureItemText}>
                  {plan.features.chat_duration_hours === -1
                    ? 'Unlimited'
                    : `${plan.features.chat_duration_hours}h`}{' '}
                  chat duration
                </Text>
              </View>
              {plan.features.verification_badge && (
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={styles.featureItemText}>Trusted Loonie badge</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.billingToggle}>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'monthly' && styles.billingButtonActive,
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                billingCycle === 'monthly' && styles.billingButtonTextActive,
              ]}
            >
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'yearly' && styles.billingButtonActive,
            ]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                billingCycle === 'yearly' && styles.billingButtonTextActive,
              ]}
            >
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 17%</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.plansContainer}>
          {plans.map((planItem) => (
            <SubscriptionCard
              key={planItem.id}
              plan={planItem}
              isCurrentPlan={planItem.name === plan?.name}
              onSelect={() => handleSelectPlan(planItem)}
              billingCycle={billingCycle}
            />
          ))}
        </View>

        <View style={styles.boostSection}>
          <View style={styles.boostHeader}>
            <Zap size={24} color="#F97316" />
            <Text style={styles.boostTitle}>One-Time Boosts</Text>
          </View>
          <Text style={styles.boostSubtitle}>
            Get instant visibility or extra pings without a subscription
          </Text>

          <View style={styles.boostOptions}>
            <Pressable style={styles.boostCard}>
              <Zap size={20} color="#F97316" />
              <Text style={styles.boostCardTitle}>60min Top Placement</Text>
              <Text style={styles.boostCardPrice}>€2.99</Text>
              <Text style={styles.boostCardDescription}>
                Be at the top of the list for 1 hour
              </Text>
            </Pressable>

            <Pressable style={styles.boostCard}>
              <Zap size={20} color="#F97316" />
              <Text style={styles.boostCardTitle}>5 Extra Pings</Text>
              <Text style={styles.boostCardPrice}>€1.99</Text>
              <Text style={styles.boostCardDescription}>
                Use today when you need them
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#10B981" />
            <Text style={styles.safetyTitle}>Safety Pack Add-on</Text>
          </View>
          <Text style={styles.safetyDescription}>
            SOS button, extended check-ins, and emergency center connection
          </Text>
          <View style={styles.safetyPrice}>
            <Text style={styles.safetyPriceText}>€3.99/month</Text>
            <Pressable style={styles.safetyButton}>
              <Text style={styles.safetyButtonText}>Add to Plan</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All plans include core features: see nearby people, send pings, and 24h chat
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  currentPlanCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F97316',
  },
  currentPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planBadge: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F97316',
  },
  usageSection: {
    marginBottom: 16,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  usageText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  featuresList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  featureBullet: {
    fontSize: 16,
    color: '#F97316',
    fontWeight: '600',
  },
  featureItemText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
  },
  billingButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  billingButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  billingButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  billingButtonTextActive: {
    color: '#1F2937',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  boostSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  boostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  boostTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  boostSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  boostOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  boostCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  boostCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  boostCardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 8,
  },
  boostCardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  safetySection: {
    backgroundColor: '#D1FAE5',
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#065F46',
  },
  safetyDescription: {
    fontSize: 15,
    color: '#065F46',
    marginBottom: 16,
    lineHeight: 22,
  },
  safetyPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  safetyPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },
  safetyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  safetyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
