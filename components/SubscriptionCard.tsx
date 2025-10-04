import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Crown } from 'lucide-react-native';
import { SubscriptionPlan } from '@/types/monetization';

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  onSelect: () => void;
  billingCycle: 'monthly' | 'yearly';
}

export default function SubscriptionCard({
  plan,
  isCurrentPlan,
  onSelect,
  billingCycle,
}: SubscriptionCardProps) {
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const pricePerMonth = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : price;
  const isPremium = plan.name !== 'free';

  const features = [
    plan.features.daily_pings === -1
      ? 'Unlimited daily pings'
      : `${plan.features.daily_pings} pings per day`,
    `See people within ${plan.features.visibility_radius_km}km`,
    plan.features.chat_duration_hours === -1
      ? 'Unlimited chat duration'
      : `${plan.features.chat_duration_hours}h chat window`,
    ...(plan.features.advanced_filters ? ['Advanced activity filters'] : []),
    ...(plan.features.priority_placement ? ['Priority list placement'] : []),
    ...(plan.features.verification_badge ? ['"Trusted Loonie" badge'] : []),
    `Groups up to ${plan.features.max_group_size} people`,
    ...(plan.features.venue_discounts ? ['Partner venue discounts'] : []),
    ...(plan.features.safety_pack ? ['Safety Pack included'] : []),
  ];

  return (
    <View style={[styles.card, isPremium && styles.premiumCard]}>
      {plan.name === 'plus' && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}

      <View style={styles.header}>
        {isPremium && <Crown size={24} color="#F59E0B" />}
        <Text style={styles.planName}>{plan.display_name}</Text>
      </View>

      <View style={styles.priceContainer}>
        {plan.name === 'free' ? (
          <Text style={styles.price}>Free</Text>
        ) : (
          <>
            <View style={styles.priceRow}>
              <Text style={styles.currency}>€</Text>
              <Text style={styles.price}>{pricePerMonth}</Text>
              <Text style={styles.period}>/month</Text>
            </View>
            {billingCycle === 'yearly' && (
              <Text style={styles.billedYearly}>Billed €{price} yearly</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={18} color="#10B981" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {isCurrentPlan ? (
        <View style={styles.currentPlanBadge}>
          <Text style={styles.currentPlanText}>Current Plan</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.selectButton, isPremium && styles.premiumButton]}
          onPress={onSelect}
        >
          <Text style={[styles.selectButtonText, isPremium && styles.premiumButtonText]}>
            {plan.name === 'free' ? 'Downgrade' : 'Upgrade'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  premiumCard: {
    borderColor: '#F97316',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1F2937',
  },
  period: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 4,
  },
  billedYearly: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  features: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  selectButton: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  premiumButton: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  premiumButtonText: {
    color: '#FFFFFF',
  },
  currentPlanBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },
});
