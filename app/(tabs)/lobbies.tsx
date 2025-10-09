import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Sparkles } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { DinnerLobby, LobbyParticipant } from '@/types/lobby';
import LobbyCard from '@/components/LobbyCard';
import LobbyCardV2 from '@/components/LobbyCardV2';
import LobbiesHeader from '@/components/LobbiesHeader';
import CreateLobbyModal from '@/components/CreateLobbyModal';
import LobbyDetailsModal from '@/components/LobbyDetailsModal';
import type { LobbyFormData } from '@/components/CreateLobbyModal';

export default function LobbiesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [lobbies, setLobbies] = useState<DinnerLobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<DinnerLobby | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    getCurrentUser();
    fetchLobbies();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchLobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('dinner_lobbies')
        .select(`
          *,
          host:profiles!dinner_lobbies_host_id_fkey(
            id,
            first_name,
            age,
            photo_url,
            activities
          ),
          participants:lobby_participants(
            id,
            user_id,
            joined_at,
            status,
            profile:profiles(
              id,
              first_name,
              age,
              photo_url
            )
          )
        `)
        .in('status', ['open', 'full'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLobbies = data?.map((lobby) => ({
        ...lobby,
        participants: lobby.participants?.filter((p: LobbyParticipant) => p.status === 'joined') || [],
      })) || [];

      setLobbies(formattedLobbies);
    } catch (error) {
      console.error('Error fetching lobbies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLobbies();
  };

  const handleCreateLobby = async (lobbyData: LobbyFormData) => {
    try {
      console.log('Creating lobby with data:', lobbyData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(t('alerts.error'), t('alerts.mustBeLoggedIn'));
        return;
      }

      console.log('User ID:', user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        console.log('Creating profile for user');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            first_name: 'User',
            activities: [],
          });

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }
      }

      const commissionRate = 0.15;
      const hostPayoutAmount = lobbyData.is_paid
        ? lobbyData.price_per_seat * (1 - commissionRate)
        : null;

      const lobbyInsertData = {
        host_id: user.id,
        title: lobbyData.title,
        description: lobbyData.description || '',
        lobby_type: lobbyData.lobby_type,
        cuisine_type: lobbyData.cuisine_type || null,
        activity_type: lobbyData.activity_type || null,
        max_participants: lobbyData.max_participants,
        scheduled_time: lobbyData.scheduled_time.toISOString(),
        location_name: lobbyData.location_name || '',
        status: 'open',
        is_paid: lobbyData.is_paid,
        price_per_seat: lobbyData.price_per_seat,
        currency: 'EUR',
        commission_rate: commissionRate,
        host_payout_amount: hostPayoutAmount,
        host_payout_status: 'pending',
      };

      console.log('Inserting lobby:', lobbyInsertData);

      const { data: lobby, error } = await supabase
        .from('dinner_lobbies')
        .insert(lobbyInsertData)
        .select()
        .single();

      if (error) {
        console.error('Lobby insert error:', error);
        throw error;
      }

      console.log('Lobby created:', lobby);

      const { error: participantError } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: lobby.id,
          user_id: user.id,
          status: 'joined',
          payment_status: lobbyData.is_paid ? 'completed' : 'pending',
          payment_amount: lobbyData.is_paid ? 0 : null,
        });

      if (participantError) {
        console.error('Participant error:', participantError);
        throw participantError;
      }

      console.log('Participant added');

      setCreateModalVisible(false);
      Alert.alert(t('alerts.success'), t('alerts.lobbyCreated'));
      await fetchLobbies();
    } catch (error: any) {
      console.error('Error creating lobby:', error);
      Alert.alert(
        t('alerts.error'),
        error.message || t('alerts.failedToCreate')
      );
    }
  };

  const handleJoinLobby = async () => {
    if (!selectedLobby) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'You must be logged in to join a lobby');
        return;
      }

      const { error } = await supabase
        .from('lobby_participants')
        .insert({
          lobby_id: selectedLobby.id,
          user_id: user.id,
          status: 'joined',
        });

      if (error) throw error;

      await supabase
        .from('dinner_lobbies')
        .update({
          current_participants: selectedLobby.current_participants + 1,
          status: selectedLobby.current_participants + 1 >= selectedLobby.max_participants ? 'full' : 'open',
        })
        .eq('id', selectedLobby.id);

      setDetailsModalVisible(false);
      fetchLobbies();
    } catch (error: any) {
      console.error('Error joining lobby:', error);
      Alert.alert('Error', 'Failed to join lobby. Please try again.');
    }
  };

  const handleLeaveLobby = async () => {
    if (!selectedLobby) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('lobby_participants')
        .update({ status: 'left' })
        .eq('lobby_id', selectedLobby.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await supabase
        .from('dinner_lobbies')
        .update({
          current_participants: Math.max(1, selectedLobby.current_participants - 1),
          status: 'open',
        })
        .eq('id', selectedLobby.id);

      setDetailsModalVisible(false);
      fetchLobbies();
    } catch (error: any) {
      console.error('Error leaving lobby:', error);
      Alert.alert('Error', 'Failed to leave lobby. Please try again.');
    }
  };

  const handleLobbyPress = (lobby: DinnerLobby) => {
    setSelectedLobby(lobby);
    setDetailsModalVisible(true);
  };

  const isUserParticipant = (lobby: DinnerLobby): boolean => {
    return lobby.participants?.some(
      (p) => p.user_id === currentUserId && p.status === 'joined'
    ) || false;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0B0B16', '#12121F']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <LobbiesHeader onCreatePress={() => setCreateModalVisible(true)} />

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B7FFF" />
            }
          >
            {loading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('common.loading')}</Text>
              </View>
            ) : lobbies.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{t('lobbies.noLobbies')}</Text>
                <Text style={styles.emptyText}>{t('lobbies.noLobbiesDescription')}</Text>
              </View>
            ) : (
              lobbies.map((lobby) => (
                <LobbyCardV2
                  key={lobby.id}
                  lobby={{
                    id: lobby.id,
                    title: lobby.title,
                    description: lobby.description || '',
                    host: {
                      name: lobby.host?.first_name || 'Ukendt',
                      photo: lobby.host?.photo_url || 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                      isVerified: true,
                    },
                    activityTags: [lobby.lobby_type, lobby.cuisine_type || lobby.activity_type].filter(Boolean) as string[],
                    currentParticipants: lobby.current_participants || 0,
                    maxParticipants: lobby.max_participants || 4,
                    isPaid: lobby.is_paid || false,
                    pricePerSeat: lobby.price_per_seat ? Number(lobby.price_per_seat) : undefined,
                    currency: lobby.currency || 'DKK',
                    scheduledTime: lobby.scheduled_time,
                    locationName: lobby.location_name || undefined,
                    status: lobby.status as any,
                  }}
                  onPress={() => handleLobbyPress(lobby)}
                  onJoinPress={() => handleJoinLobby()}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <CreateLobbyModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateLobby}
      />

      <LobbyDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        lobby={selectedLobby}
        onJoin={handleJoinLobby}
        onLeave={handleLeaveLobby}
        isParticipant={selectedLobby ? isUserParticipant(selectedLobby) : false}
        currentUserId={currentUserId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B16',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8B7FFF',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontWeight: '500',
  },
});
