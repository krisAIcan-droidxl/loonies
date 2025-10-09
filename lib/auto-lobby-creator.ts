import { supabase } from './supabase';
import { Synchronicity } from './synchronicity-engine';

export interface AutoLobby {
  id: string;
  title: string;
  description: string;
  activityType: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  maxParticipants: number;
  minParticipants: number;
  scheduledTime: string;
  autoStartAt: string;
  synchronicityId: string;
  userIds: string[];
}

class AutoLobbyCreator {
  async shouldCreateLobby(synchronicity: Synchronicity): Promise<boolean> {
    if (synchronicity.lobbyCreated) {
      return false;
    }

    if (synchronicity.syncScore < 0.7) {
      return false;
    }

    if (synchronicity.userIds.length < 2) {
      return false;
    }

    const existingLobby = await this.findExistingLobby(synchronicity);
    return !existingLobby;
  }

  async createAutoLobby(synchronicity: Synchronicity): Promise<AutoLobby | null> {
    const canCreate = await this.shouldCreateLobby(synchronicity);
    if (!canCreate) {
      return null;
    }

    try {
      const hostId = synchronicity.userIds[0];
      const title = this.generateTitle(synchronicity);
      const description = this.generateDescription(synchronicity);
      const scheduledTime = this.calculateScheduledTime();
      const autoStartAt = this.calculateAutoStartTime();

      const { data: lobby, error } = await supabase
        .from('dinner_lobbies')
        .insert({
          host_id: hostId,
          title,
          description,
          activity_type: synchronicity.activityType,
          location_name: synchronicity.locationName || 'Nearby',
          latitude: synchronicity.latitude,
          longitude: synchronicity.longitude,
          max_participants: Math.min(synchronicity.userIds.length + 3, 6),
          min_participants: 2,
          current_participants: 0,
          scheduled_time: scheduledTime,
          status: 'open',
          lobby_type: this.mapActivityToLobbyType(synchronicity.activityType),
          is_auto_generated: true,
          synchronicity_id: synchronicity.id,
          auto_start_at: autoStartAt,
          is_paid: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create auto lobby:', error);
        return null;
      }

      await this.addInitialMembers(lobby.id, synchronicity.userIds);

      await supabase
        .from('synchronicities')
        .update({
          lobby_created: true,
          lobby_id: lobby.id,
        })
        .eq('id', synchronicity.id);

      return {
        id: lobby.id,
        title: lobby.title,
        description: lobby.description,
        activityType: lobby.activity_type,
        locationName: lobby.location_name,
        latitude: lobby.latitude,
        longitude: lobby.longitude,
        maxParticipants: lobby.max_participants,
        minParticipants: lobby.min_participants,
        scheduledTime: lobby.scheduled_time,
        autoStartAt: lobby.auto_start_at,
        synchronicityId: synchronicity.id,
        userIds: synchronicity.userIds,
      };
    } catch (error) {
      console.error('Failed to create auto lobby:', error);
      return null;
    }
  }

  private async findExistingLobby(synchronicity: Synchronicity): Promise<any> {
    try {
      const { data } = await supabase
        .from('dinner_lobbies')
        .select('*')
        .eq('synchronicity_id', synchronicity.id)
        .maybeSingle();

      return data;
    } catch (error) {
      return null;
    }
  }

  private async addInitialMembers(lobbyId: string, userIds: string[]): Promise<void> {
    try {
      const members = userIds.map((userId) => ({
        lobby_id: lobbyId,
        user_id: userId,
        status: 'joined',
        payment_status: 'completed',
      }));

      await supabase.from('lobby_participants').insert(members);

      await supabase
        .from('dinner_lobbies')
        .update({ current_participants: userIds.length })
        .eq('id', lobbyId);
    } catch (error) {
      console.error('Failed to add initial members:', error);
    }
  }

  private generateTitle(synchronicity: Synchronicity): string {
    const activity = synchronicity.activityType;
    const location = synchronicity.locationName || 'nearby';
    const userCount = synchronicity.userIds.length;

    const templates = {
      coffee: [
        `Coffee Meet-up @ ${location}`,
        `☕ Spontaneous Coffee ${location}`,
        `Coffee Break Together`,
      ],
      lunch: [
        `Lunch Squad @ ${location}`,
        `🍽️ Lunch Together ${location}`,
        `Spontaneous Lunch Meet`,
      ],
      dinner: [
        `Dinner Crew @ ${location}`,
        `🍴 Evening Dinner ${location}`,
        `Spontaneous Dinner`,
      ],
      exercise: [
        `Workout Buddies @ ${location}`,
        `💪 Exercise Together`,
        `Spontaneous Workout`,
      ],
      leisure: [
        `Hangout @ ${location}`,
        `Social Meet-up`,
        `Spontaneous Gathering`,
      ],
    };

    const activityTemplates = templates[activity as keyof typeof templates] || templates.leisure;
    const randomIndex = Math.floor(Math.random() * activityTemplates.length);
    return activityTemplates[randomIndex];
  }

  private generateDescription(synchronicity: Synchronicity): string {
    const activity = synchronicity.activityType;
    const userCount = synchronicity.userIds.length;
    const location = synchronicity.locationName || 'this area';

    const descriptions = {
      coffee: `${userCount} personer drikker kaffe lige nu ved ${location}! Join for en hyggelig snak og spontan connection.`,
      lunch: `${userCount} personer spiser frokost ved ${location}! Perfekt timing til at møde nye mennesker over mad.`,
      dinner: `${userCount} personer skal spise aftensmad ved ${location}! Join for god mad og social hygge.`,
      exercise: `${userCount} personer træner lige nu ved ${location}! Find workout buddies og hold dig motiveret.`,
      leisure: `${userCount} personer hænger ud ved ${location}! Spontan social aktivitet - kom og vær med!`,
      social: `${userCount} personer mødes ved ${location}! Perfect timing til ny connections.`,
    };

    return descriptions[activity as keyof typeof descriptions] ||
           `${userCount} personer er aktive ved ${location}! Join og lav nye connections.`;
  }

  private calculateScheduledTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    return now.toISOString();
  }

  private calculateAutoStartTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 60);
    return now.toISOString();
  }

  private mapActivityToLobbyType(activityType: string): 'dinner' | 'sports' | 'social' {
    const mapping: Record<string, 'dinner' | 'sports' | 'social'> = {
      coffee: 'social',
      lunch: 'dinner',
      dinner: 'dinner',
      exercise: 'sports',
      leisure: 'social',
      social: 'social',
      work: 'social',
      shopping: 'social',
      commute: 'social',
    };

    return mapping[activityType] || 'social';
  }

  async checkAndStartLobbies(): Promise<void> {
    try {
      const { data: lobbies } = await supabase
        .from('dinner_lobbies')
        .select('*')
        .eq('is_auto_generated', true)
        .eq('status', 'open')
        .lt('auto_start_at', new Date().toISOString());

      if (!lobbies || lobbies.length === 0) {
        return;
      }

      for (const lobby of lobbies) {
        if (lobby.current_participants >= lobby.min_participants) {
          await supabase
            .from('dinner_lobbies')
            .update({ status: 'started' })
            .eq('id', lobby.id);
        } else {
          await supabase
            .from('dinner_lobbies')
            .update({ status: 'cancelled' })
            .eq('id', lobby.id);
        }
      }
    } catch (error) {
      console.error('Failed to check and start lobbies:', error);
    }
  }

  async getAutoLobbiesNearby(
    latitude: number,
    longitude: number,
    radiusKm: number = 2
  ): Promise<AutoLobby[]> {
    try {
      const { data, error } = await supabase
        .from('dinner_lobbies')
        .select('*')
        .eq('is_auto_generated', true)
        .eq('status', 'open')
        .gt('auto_start_at', new Date().toISOString());

      if (error || !data) {
        return [];
      }

      const nearby = data.filter((lobby) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          lobby.latitude,
          lobby.longitude
        );
        return distance <= radiusKm;
      });

      return nearby.map((lobby) => ({
        id: lobby.id,
        title: lobby.title,
        description: lobby.description,
        activityType: lobby.activity_type,
        locationName: lobby.location_name,
        latitude: lobby.latitude,
        longitude: lobby.longitude,
        maxParticipants: lobby.max_participants,
        minParticipants: lobby.min_participants,
        scheduledTime: lobby.scheduled_time,
        autoStartAt: lobby.auto_start_at,
        synchronicityId: lobby.synchronicity_id,
        userIds: [],
      }));
    } catch (error) {
      console.error('Failed to get auto lobbies nearby:', error);
      return [];
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const autoLobbyCreator = new AutoLobbyCreator();
