import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, ListFilter as Filter } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { PartnerVenue } from '@/types/monetization';
import VenueCard from '@/components/VenueCard';
import { useSubscription } from '@/hooks/useSubscription';

const categories = ['all', 'cafe', 'restaurant', 'coworking', 'cinema', 'experience', 'entertainment'];

export default function VenuesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [venues, setVenues] = useState<PartnerVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { plan } = useSubscription();

  useEffect(() => {
    fetchVenues();
  }, [selectedCategory]);

  const fetchVenues = async () => {
    try {
      let query = supabase.from('partner_venues').select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.order('is_featured', { ascending: false });

      if (error) throw error;
      if (data) setVenues(data);
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVenues();
  };

  const handleVenuePress = (venue: PartnerVenue) => {
    if (!plan?.features.venue_discounts && venue.discount_code) {
      Alert.alert(
        'Premium Feature',
        'Upgrade to Loonie Plus to access partner venue discounts and exclusive deals.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => {} },
        ]
      );
      return;
    }

    if (venue.website_url) {
      Linking.openURL(venue.website_url);
    }
  };

  const hasAccess = plan?.features.venue_discounts || false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>{t('venues.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {hasAccess ? t('venues.subtitle') : t('venues.subtitleUpgrade')}
          </Text>
        </View>
        <MapPin size={24} color={colors.primary} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesScroll, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <Pressable
            key={category}
            style={[
              styles.categoryChip,
              { backgroundColor: colors.chipBackground, borderColor: colors.border },
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            {selectedCategory === category ? (
              <LinearGradient
                colors={colors.primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryChipGradient}
              >
                <Text style={styles.categoryChipTextActive}>
                  {t(`venues.categories.${category}`)}
                </Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.categoryChipText, { color: colors.textSecondary }]}>
                {t(`venues.categories.${category}`)}
              </Text>
            )}
          </Pressable>
        ))}
      </ScrollView>

      {!hasAccess && (
        <View style={[styles.premiumBanner, { backgroundColor: colors.warningBackground }]}>
          <Text style={[styles.premiumBannerTitle, { color: colors.warning }]}>{t('venues.unlockDiscounts')}</Text>
          <Text style={[styles.premiumBannerText, { color: colors.warning }]}>
            {t('venues.unlockDescription')}
          </Text>
          <Pressable style={styles.premiumButton}>
            <LinearGradient
              colors={colors.secondaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumButtonGradient}
            >
              <Text style={styles.premiumButtonText}>{t('venues.upgradeNow')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('venues.loading')}</Text>
          </View>
        ) : venues.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('venues.noVenues')}</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('venues.noVenuesDescription')}</Text>
          </View>
        ) : (
          venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onPress={() => handleVenuePress(venue)} />
          ))
        )}

        <View style={[styles.footer, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>{t('venues.becomePartner')}</Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            {t('venues.becomePartnerDescription')}
          </Text>
          <Pressable style={styles.partnerButton}>
            <LinearGradient
              colors={colors.primaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.partnerButtonGradient}
            >
              <Text style={styles.partnerButtonText}>{t('venues.partnerWithUs')}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '400',
  },
  categoriesScroll: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryChipActive: {
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryChipGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  premiumBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  premiumBannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  premiumBannerText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '400',
  },
  premiumButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  premiumButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  footerTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  footerText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
  },
  partnerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  partnerButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  partnerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
