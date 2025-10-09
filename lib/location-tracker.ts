import * as Location from 'expo-location';
import { supabase } from './supabase';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: number;
}

export interface ActivityDetection {
  activityType: 'coffee' | 'lunch' | 'dinner' | 'commute' | 'exercise' | 'leisure' | 'work' | 'shopping' | 'social';
  venueType?: 'cafe' | 'restaurant' | 'bar' | 'gym' | 'park' | 'coworking' | 'cinema' | 'shop' | 'venue' | 'outdoor' | 'transit' | 'home';
  confidence: number;
  locationName?: string;
}

class LocationTracker {
  private watchSubscription: Location.LocationSubscription | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastLocation: UserLocation | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        return false;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      return backgroundStatus === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }

  async startTracking(userId: string): Promise<boolean> {
    if (this.isTracking) {
      return true;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return false;
    }

    try {
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000,
          distanceInterval: 50,
        },
        async (location) => {
          this.lastLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };

          await this.updateUserPresence(userId, this.lastLocation);
        }
      );

      this.updateInterval = setInterval(async () => {
        if (this.lastLocation) {
          await this.detectAndLogActivity(userId, this.lastLocation);
        }
      }, 120000);

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start tracking:', error);
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
  }

  private async updateUserPresence(userId: string, location: UserLocation): Promise<void> {
    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: userId,
          current_latitude: location.latitude,
          current_longitude: location.longitude,
          location_updated_at: new Date().toISOString(),
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Failed to update user presence:', error);
    }
  }

  private async detectAndLogActivity(userId: string, location: UserLocation): Promise<void> {
    const detection = await this.detectActivity(location);

    if (detection && detection.confidence > 0.6) {
      await this.logActivity(userId, location, detection);
    }
  }

  private async detectActivity(location: UserLocation): Promise<ActivityDetection | null> {
    const speed = location.speed || 0;
    const hour = new Date().getHours();

    if (speed > 1.5) {
      return {
        activityType: 'commute',
        venueType: 'transit',
        confidence: 0.8,
      };
    }

    if (hour >= 7 && hour <= 10) {
      if (speed < 0.5) {
        return {
          activityType: 'coffee',
          venueType: 'cafe',
          confidence: 0.7,
        };
      }
    }

    if (hour >= 11 && hour <= 14) {
      return {
        activityType: 'lunch',
        venueType: 'restaurant',
        confidence: 0.75,
      };
    }

    if (hour >= 17 && hour <= 21) {
      return {
        activityType: 'dinner',
        venueType: 'restaurant',
        confidence: 0.75,
      };
    }

    if (hour >= 6 && hour <= 9 && speed > 1.0 && speed < 3.0) {
      return {
        activityType: 'exercise',
        venueType: 'outdoor',
        confidence: 0.8,
      };
    }

    return {
      activityType: 'leisure',
      confidence: 0.5,
    };
  }

  private async logActivity(
    userId: string,
    location: UserLocation,
    detection: ActivityDetection
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: detection.activityType,
          venue_type: detection.venueType,
          latitude: location.latitude,
          longitude: location.longitude,
          location: `POINT(${location.longitude} ${location.latitude})`,
          confidence: detection.confidence,
          speed: location.speed || 0,
          location_name: detection.locationName,
        });

      if (error) {
        console.error('Failed to log activity:', error);
      } else {
        await this.updateActivityPattern(userId, detection);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  private async updateActivityPattern(
    userId: string,
    detection: ActivityDetection
  ): Promise<void> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const timeSlot = `${now.getHours().toString().padStart(2, '0')}:00`;

    try {
      const { data: existing } = await supabase
        .from('activity_patterns')
        .select('*')
        .eq('user_id', userId)
        .eq('day_of_week', dayOfWeek)
        .eq('time_slot', timeSlot)
        .eq('activity_type', detection.activityType)
        .maybeSingle();

      if (existing) {
        const newOccurrenceCount = existing.occurrence_count + 1;
        const newFrequency = Math.min(newOccurrenceCount / 20, 1);

        await supabase
          .from('activity_patterns')
          .update({
            frequency: newFrequency,
            occurrence_count: newOccurrenceCount,
            last_occurred: now.toISOString(),
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('activity_patterns')
          .insert({
            user_id: userId,
            day_of_week: dayOfWeek,
            time_slot: timeSlot,
            activity_type: detection.activityType,
            frequency: 0.05,
            occurrence_count: 1,
            last_occurred: now.toISOString(),
          });
      }
    } catch (error) {
      console.error('Failed to update activity pattern:', error);
    }
  }

  getLastLocation(): UserLocation | null {
    return this.lastLocation;
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}

export const locationTracker = new LocationTracker();
