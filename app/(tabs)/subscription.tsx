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
import { useTheme } from '@/hooks/useTheme';

export default function SubscriptionScreen() {
  const { subscription, plan, usageLimits, loading } = useSubscription();
  const { colors, isDark } = useTheme();
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
      'Betalingsintegration påkrævet',
      'Denne funktion kræver betalingsintegration. I produktion ville dette forbinde til en betalingsudbyder som Stripe eller RevenueCat.',
      [{ text: 'OK' }]
    );
  };

  const pingsUsedPercent = usageLimits
    ? (usageLimits.daily_pings_used / usageLimits.daily_pings_limit) * 100
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <Crown size={32} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.text }]}>Opgrader din oplevelse</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Få flere pings, avancerede funktioner og prioriteret placering
          </Text>
        </View>

        {!loading && plan && (
          <View style={[styles.currentPlanCard, { backgroundColor: colors.cardBackground, borderColor: '#F97316' }]}>
            <View style={styles.currentPlanHeader}>
              <Text style={[styles.currentPlanTitle, { color: colors.textSecondary }]}>Nuværende Plan</Text>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{plan.display_name}</Text>
              </View>
            </View>

            {usageLimits && (
              <View style={styles.usageSection}>
                <View style={styles.usageRow}>
                  <Zap size={18} color="#F97316" />
                  <Text style={[styles.usageLabel, { color: colors.text }]}>Daglige Pings</Text>
                </View>
                {plan.features.daily_pings === -1 ? (
                  <Text style={styles.unlimitedText}>Ubegrænset</Text>
                ) : (
                  <>
                    <Text style={[styles.usageText, { color: colors.textSecondary }]}>
                      {usageLimits.daily_pings_used} / {usageLimits.daily_pings_limit} brugt
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: isDark ? '#2D3748' : '#E5E7EB' }]}>
                      <View
                        style={[styles.progressFill, { width: `${pingsUsedPercent}%` }]}
                      />
                    </View>
                  </>
                )}
              </View>
            )}

            <View style={[styles.featuresList, { borderTopColor: colors.border }]}>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={[styles.featureItemText, { color: colors.textSecondary }]}>
                  {plan.features.visibility_radius_km}km synlighedsradius
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureBullet}>•</Text>
                <Text style={[styles.featureItemText, { color: colors.textSecondary }]}>
                  {plan.features.chat_duration_hours === -1
                    ? 'Ubegrænset'
                    : `${plan.features.chat_duration_hours}t`}{' '}
                  chat varighed
                </Text>
              </View>
              {plan.features.verification_badge && (
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>•</Text>
                  <Text style={[styles.featureItemText, { color: colors.textSecondary }]}>Trusted Loonie badge</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={[styles.billingToggle, { backgroundColor: isDark ? '#252538' : '#E5E7EB' }]}>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'monthly' && { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                { color: billingCycle === 'monthly' ? colors.text : colors.textSecondary },
              ]}
            >
              Månedligt
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'yearly' && { backgroundColor: colors.cardBackground },
            ]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                { color: billingCycle === 'yearly' ? colors.text : colors.textSecondary },
              ]}
            >
              Årligt
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Spar 17%</Text>
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

        <View style={[styles.boostSection, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.boostHeader}>
            <Zap size={24} color="#F97316" />
            <Text style={[styles.boostTitle, { color: colors.text }]}>Engangboosts</Text>
          </View>
          <Text style={[styles.boostSubtitle, { color: colors.textSecondary }]}>
            Få øjeblikkelig synlighed eller ekstra pings uden abonnement
          </Text>

          <View style={styles.boostOptions}>
            <Pressable style={[styles.boostCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Zap size={20} color="#F97316" />
              <Text style={[styles.boostCardTitle, { color: colors.text }]}>60min Top Placering</Text>
              <Text style={styles.boostCardPrice}>€2.99</Text>
              <Text style={[styles.boostCardDescription, { color: colors.textSecondary }]}>
                Vær øverst på listen i 1 time
              </Text>
            </Pressable>

            <Pressable style={[styles.boostCard, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
              <Zap size={20} color="#F97316" />
              <Text style={[styles.boostCardTitle, { color: colors.text }]}>5 Ekstra Pings</Text>
              <Text style={styles.boostCardPrice}>€1.99</Text>
              <Text style={[styles.boostCardDescription, { color: colors.textSecondary }]}>
                Brug i dag når du har brug for dem
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.safetySection, { backgroundColor: isDark ? '#1E3A2E' : '#D1FAE5' }]}>
          <View style={styles.safetyHeader}>
            <Shield size={24} color="#10B981" />
            <Text style={[styles.safetyTitle, { color: isDark ? '#4ADE80' : '#065F46' }]}>Safety Pack Tilføjelse</Text>
          </View>
          <Text style={[styles.safetyDescription, { color: isDark ? '#86EFAC' : '#065F46' }]}>
            SOS-knap, udvidede check-ins og nødcenter forbindelse
          </Text>
          <View style={styles.safetyPrice}>
            <Text style={[styles.safetyPriceText, { color: isDark ? '#4ADE80' : '#065F46' }]}>€3.99/måned</Text>
            <Pressable style={styles.safetyButton}>
              <Text style={styles.safetyButtonText}>Tilføj til Plan</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Alle planer inkluderer kernefunktioner: se personer i nærheden, send pings og 24t chat
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  currentPlanCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
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
  },
  usageText: {
    fontSize: 14,
    marginBottom: 8,
  },
  unlimitedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
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
    lineHeight: 20,
  },
  billingToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
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
  billingButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
  },
  boostSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  boostOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  boostCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  boostCardTitle: {
    fontSize: 15,
    fontWeight: '600',
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
    lineHeight: 18,
  },
  safetySection: {
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
  },
  safetyDescription: {
    fontSize: 15,
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
    textAlign: 'center',
    lineHeight: 20,
  },
});
