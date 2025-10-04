import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Check, Crown } from 'lucide-react-native';
import { SubscriptionPlan } from '@/types/monetization';
import { useTheme } from '@/hooks/useTheme';

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
  const { colors } = useTheme();
  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const pricePerMonth = billingCycle === 'yearly' ? (plan.price_yearly / 12).toFixed(2) : price;
  const isPremium = plan.name !== 'free';

  const features = [
    plan.features.daily_pings === -1
      ? 'Ubegrænsede daglige pings'
      : `${plan.features.daily_pings} pings per dag`,
    `Se personer inden for ${plan.features.visibility_radius_km}km`,
    plan.features.chat_duration_hours === -1
      ? 'Ubegrænset chat varighed'
      : `${plan.features.chat_duration_hours}t chat vindue`,
    ...(plan.features.advanced_filters ? ['Avancerede aktivitetsfiltre'] : []),
    ...(plan.features.priority_placement ? ['Prioriteret listeplacering'] : []),
    ...(plan.features.verification_badge ? ['"Trusted Loonie" badge'] : []),
    `Grupper op til ${plan.features.max_group_size} personer`,
    ...(plan.features.venue_discounts ? ['Partner venue rabatter'] : []),
    ...(plan.features.safety_pack ? ['Safety Pack inkluderet'] : []),
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: isPremium ? '#F97316' : colors.border }, isPremium && styles.premiumCard]}>
      {plan.name === 'plus' && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MEST POPULÆR</Text>
        </View>
      )}

      <View style={styles.header}>
        {isPremium && <Crown size={24} color="#F59E0B" />}
        <Text style={[styles.planName, { color: colors.text }]}>{plan.display_name}</Text>
      </View>

      <View style={styles.priceContainer}>
        {plan.name === 'free' ? (
          <Text style={[styles.price, { color: colors.text }]}>Gratis</Text>
        ) : (
          <>
            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: colors.text }]}>€</Text>
              <Text style={[styles.price, { color: colors.text }]}>{pricePerMonth}</Text>
              <Text style={[styles.period, { color: colors.textSecondary }]}>/måned</Text>
            </View>
            {billingCycle === 'yearly' && (
              <Text style={[styles.billedYearly, { color: colors.textSecondary }]}>Betales €{price} årligt</Text>
            )}
          </>
        )}
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Check size={18} color="#10B981" />
            <Text style={[styles.featureText, { color: colors.textSecondary }]}>{feature}</Text>
          </View>
        ))}
      </View>

      {isCurrentPlan ? (
        <View style={styles.currentPlanBadge}>
          <Text style={styles.currentPlanText}>Nuværende Plan</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.selectButton, { backgroundColor: isPremium ? '#F97316' : colors.inputBackground, borderColor: isPremium ? '#F97316' : colors.border }]}
          onPress={onSelect}
        >
          <Text style={[styles.selectButtonText, { color: isPremium ? '#FFFFFF' : colors.textSecondary }]}>
            {plan.name === 'free' ? 'Nedgrader' : 'Opgrader'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  premiumCard: {
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
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
  },
  billedYearly: {
    fontSize: 14,
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
    lineHeight: 22,
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
