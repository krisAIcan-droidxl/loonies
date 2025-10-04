import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Gift, ExternalLink, Star } from 'lucide-react-native';
import { PartnerVenue } from '@/types/monetization';
import { useTheme } from '@/hooks/useTheme';

interface VenueCardProps {
  venue: PartnerVenue;
  onPress: () => void;
}

export default function VenueCard({ venue, onPress }: VenueCardProps) {
  const { colors } = useTheme();

  const categoryColors: Record<string, string> = {
    cafe: '#F59E0B',
    coworking: '#3B82F6',
    cinema: '#8B5CF6',
    restaurant: '#EF4444',
    experience: '#10B981',
    entertainment: '#EC4899',
  };

  const categoryColor = categoryColors[venue.category] || '#6B7280';

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.cardBackground }]} onPress={onPress}>
      {venue.is_featured && (
        <LinearGradient
          colors={['#FF6B6B', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.featuredBadge}
        >
          <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.featuredText}>FREMHÆVET</Text>
        </LinearGradient>
      )}

      <View style={styles.content}>
        {venue.logo_url ? (
          <Image source={{ uri: venue.logo_url }} style={styles.logo} />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: categoryColor }]}>
            <Text style={styles.logoText}>{venue.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {venue.name}
          </Text>

          <View style={[styles.categoryBadge, { backgroundColor: colors.chipBackground }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {venue.category.toUpperCase()}
            </Text>
          </View>

          {venue.address && (
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
                {venue.address}
              </Text>
            </View>
          )}

          {venue.discount_description && (
            <View style={styles.discountRow}>
              <Gift size={14} color={colors.success} />
              <Text style={[styles.discountText, { color: colors.success }]} numberOfLines={1}>
                {venue.discount_description}
              </Text>
            </View>
          )}
        </View>

        <ExternalLink size={20} color={colors.textSecondary} />
      </View>

      {venue.discount_code && (
        <View style={[styles.footer, { backgroundColor: colors.chipBackground, borderTopColor: colors.border }]}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Brug kode:</Text>
          <View style={[styles.codeBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{venue.discount_code}</Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    gap: 6,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  discountText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  codeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
});
