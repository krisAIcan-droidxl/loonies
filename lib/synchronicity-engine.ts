import { supabase } from './supabase';

export interface Synchronicity {
  id: string;
  userIds: string[];
  activityType: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  syncScore: number;
  distanceMeters: number;
  lobbyCreated: boolean;
  lobbyId: string | null;
  expiresAt: string;
  notifiedAt: string | null;
  createdAt: string;
}

export interface NearbyUser {
  userId: string;
  distanceMeters: number;
  activityType: string;
  locationName: string | null;
  detectedAt: string;
}

class SynchronicityEngine {
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanning = false;

  startScanning(userId: string, intervalMs: number = 120000): void {
    if (this.isScanning) {
      return;
    }

    this.scanInterval = setInterval(async () => {
      await this.scanForSynchronicities(userId);
    }, intervalMs);

    this.isScanning = true;
    this.scanForSynchronicities(userId);
  }

  stopScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.isScanning = false;
  }

  async scanForSynchronicities(userId: string): Promise<Synchronicity[]> {
    try {
      const userActivity = await this.getCurrentUserActivity(userId);
      if (!userActivity) {
        return [];
      }

      const nearbyUsers = await this.findNearbyUsers(
        userId,
        userActivity.latitude,
        userActivity.longitude,
        500
      );

      const matchingUsers = nearbyUsers.filter(
        (user) => user.activityType === userActivity.activityType
      );

      if (matchingUsers.length >= 1) {
        const synchronicity = await this.createSynchronicity(
          userId,
          userActivity,
          matchingUsers
        );
        return synchronicity ? [synchronicity] : [];
      }

      return [];
    } catch (error) {
      console.error('Failed to scan for synchronicities:', error);
      return [];
    }
  }

  private async getCurrentUserActivity(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('detected_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Failed to get current user activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get current user activity:', error);
      return null;
    }
  }

  private async findNearbyUsers(
    userId: string,
    latitude: number,
    longitude: number,
    radiusMeters: number = 500
  ): Promise<NearbyUser[]> {
    try {
      const { data, error } = await supabase.rpc('find_nearby_users', {
        p_user_id: userId,
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_meters: radiusMeters,
      });

      if (error) {
        console.error('Failed to find nearby users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to find nearby users:', error);
      return [];
    }
  }

  private async createSynchronicity(
    userId: string,
    userActivity: any,
    matchingUsers: NearbyUser[]
  ): Promise<Synchronicity | null> {
    try {
      const allUserIds = [userId, ...matchingUsers.map((u) => u.userId)];

      const existing = await this.checkExistingSynchronicity(allUserIds, userActivity.activity_type);
      if (existing) {
        return existing;
      }

      const avgDistance =
        matchingUsers.reduce((sum, user) => sum + user.distanceMeters, 0) /
        matchingUsers.length;

      const syncScore = await this.calculateSyncScore(
        userId,
        userActivity,
        matchingUsers
      );

      const { data, error } = await supabase
        .from('synchronicities')
        .insert({
          user_ids: allUserIds,
          activity_type: userActivity.activity_type,
          location_name: userActivity.location_name,
          latitude: userActivity.latitude,
          longitude: userActivity.longitude,
          sync_score: syncScore,
          distance_meters: avgDistance,
          lobby_created: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create synchronicity:', error);
        return null;
      }

      return this.mapSynchronicity(data);
    } catch (error) {
      console.error('Failed to create synchronicity:', error);
      return null;
    }
  }

  private async checkExistingSynchronicity(
    userIds: string[],
    activityType: string
  ): Promise<Synchronicity | null> {
    try {
      const { data, error } = await supabase
        .from('synchronicities')
        .select('*')
        .contains('user_ids', userIds)
        .eq('activity_type', activityType)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return this.mapSynchronicity(data);
    } catch (error) {
      return null;
    }
  }

  private async calculateSyncScore(
    userId: string,
    userActivity: any,
    matchingUsers: NearbyUser[]
  ): Promise<number> {
    let score = 0.5;

    const avgDistance =
      matchingUsers.reduce((sum, user) => sum + user.distanceMeters, 0) /
      matchingUsers.length;

    if (avgDistance < 100) score += 0.3;
    else if (avgDistance < 300) score += 0.2;
    else if (avgDistance < 500) score += 0.1;

    const now = new Date();
    const timeDiffs = await Promise.all(
      matchingUsers.map(async (user) => {
        const detected = new Date(user.detectedAt);
        return Math.abs(now.getTime() - detected.getTime()) / 1000 / 60;
      })
    );

    const avgTimeDiff = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;

    if (avgTimeDiff < 5) score += 0.2;
    else if (avgTimeDiff < 15) score += 0.1;

    const patterns = await this.getUserPatterns(userId, userActivity.activity_type);
    if (patterns && patterns.frequency > 0.5) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private async getUserPatterns(userId: string, activityType: string): Promise<any> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;

    try {
      const { data } = await supabase
        .from('activity_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('day_of_week', dayOfWeek)
        .eq('time_slot', timeSlot)
        .eq('activity_type', activityType)
        .maybeSingle();

      return data;
    } catch (error) {
      return null;
    }
  }

  async getSynchronicitiesForUser(userId: string): Promise<Synchronicity[]> {
    try {
      const { data, error } = await supabase
        .from('synchronicities')
        .select('*')
        .contains('user_ids', [userId])
        .gt('expires_at', new Date().toISOString())
        .order('sync_score', { ascending: false });

      if (error) {
        console.error('Failed to get synchronicities:', error);
        return [];
      }

      return data.map((s) => this.mapSynchronicity(s));
    } catch (error) {
      console.error('Failed to get synchronicities:', error);
      return [];
    }
  }

  async markAsNotified(synchronicityId: string): Promise<void> {
    try {
      await supabase
        .from('synchronicities')
        .update({ notified_at: new Date().toISOString() })
        .eq('id', synchronicityId);
    } catch (error) {
      console.error('Failed to mark as notified:', error);
    }
  }

  private mapSynchronicity(data: any): Synchronicity {
    return {
      id: data.id,
      userIds: data.user_ids,
      activityType: data.activity_type,
      locationName: data.location_name,
      latitude: data.latitude,
      longitude: data.longitude,
      syncScore: data.sync_score,
      distanceMeters: data.distance_meters,
      lobbyCreated: data.lobby_created,
      lobbyId: data.lobby_id,
      expiresAt: data.expires_at,
      notifiedAt: data.notified_at,
      createdAt: data.created_at,
    };
  }

  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }
}

export const synchronicityEngine = new SynchronicityEngine();
