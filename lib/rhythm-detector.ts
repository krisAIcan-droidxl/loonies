import { supabase } from './supabase';

export interface UserRhythm {
  userId: string;
  wakeTime: string | null;
  sleepTime: string | null;
  lunchTime: string | null;
  workoutPattern: any[];
  commutePattern: any[];
  socialPeaks: number[];
  rhythmType: 'early_bird' | 'night_owl' | 'flexible' | 'unknown';
  energyPeaks: number[];
  coffeeSpots: string[];
  favoriteVenues: string[];
  weekendRoutine: any;
}

export interface MirrorMatch {
  userId: string;
  overlapScore: number;
  sharedRoutines: string[];
  routineSimilarity: number;
  locationOverlap: number;
  timeOverlap: number;
  suggestedMeetup: string | null;
}

class RhythmDetector {
  async analyzeUserRhythm(userId: string): Promise<UserRhythm | null> {
    try {
      const activities = await this.getUserActivities(userId, 30);

      if (activities.length < 5) {
        return null;
      }

      const wakeTime = this.estimateWakeTime(activities);
      const sleepTime = this.estimateSleepTime(activities);
      const lunchTime = this.estimateLunchTime(activities);
      const socialPeaks = this.detectSocialPeaks(activities);
      const workoutPattern = this.detectWorkoutPattern(activities);
      const commutePattern = this.detectCommutePattern(activities);
      const rhythmType = this.classifyRhythmType(wakeTime, sleepTime, socialPeaks);
      const coffeeSpots = this.extractCoffeeSpots(activities);
      const favoriteVenues = this.extractFavoriteVenues(activities);

      const rhythm: UserRhythm = {
        userId,
        wakeTime,
        sleepTime,
        lunchTime,
        workoutPattern,
        commutePattern,
        socialPeaks,
        rhythmType,
        energyPeaks: this.calculateEnergyPeaks(activities),
        coffeeSpots,
        favoriteVenues,
        weekendRoutine: this.analyzeWeekendRoutine(activities),
      };

      await this.saveRhythm(rhythm);
      return rhythm;
    } catch (error) {
      console.error('Failed to analyze user rhythm:', error);
      return null;
    }
  }

  private async getUserActivities(userId: string, days: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('detected_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: true });

    if (error) {
      console.error('Failed to get user activities:', error);
      return [];
    }

    return data || [];
  }

  private estimateWakeTime(activities: any[]): string | null {
    const morningActivities = activities.filter((a) => {
      const hour = new Date(a.detected_at).getHours();
      return hour >= 5 && hour <= 10;
    });

    if (morningActivities.length === 0) return null;

    const avgHour =
      morningActivities.reduce((sum, a) => {
        return sum + new Date(a.detected_at).getHours();
      }, 0) / morningActivities.length;

    const avgMinute =
      morningActivities.reduce((sum, a) => {
        return sum + new Date(a.detected_at).getMinutes();
      }, 0) / morningActivities.length;

    return `${Math.floor(avgHour).toString().padStart(2, '0')}:${Math.floor(avgMinute).toString().padStart(2, '0')}:00`;
  }

  private estimateSleepTime(activities: any[]): string | null {
    const nightActivities = activities.filter((a) => {
      const hour = new Date(a.detected_at).getHours();
      return hour >= 22 || hour <= 2;
    });

    if (nightActivities.length === 0) return null;

    const avgHour =
      nightActivities.reduce((sum, a) => {
        const hour = new Date(a.detected_at).getHours();
        return sum + (hour < 12 ? hour + 24 : hour);
      }, 0) / nightActivities.length;

    const normalizedHour = avgHour >= 24 ? avgHour - 24 : avgHour;

    return `${Math.floor(normalizedHour).toString().padStart(2, '0')}:00:00`;
  }

  private estimateLunchTime(activities: any[]): string | null {
    const lunchActivities = activities.filter((a) => {
      const hour = new Date(a.detected_at).getHours();
      return (a.activity_type === 'lunch' || a.activity_type === 'coffee') && hour >= 11 && hour <= 15;
    });

    if (lunchActivities.length < 3) return null;

    const avgHour =
      lunchActivities.reduce((sum, a) => {
        return sum + new Date(a.detected_at).getHours();
      }, 0) / lunchActivities.length;

    return `${Math.floor(avgHour).toString().padStart(2, '0')}:00:00`;
  }

  private detectSocialPeaks(activities: any[]): number[] {
    const hourCounts: Record<number, number> = {};

    activities
      .filter((a) => ['coffee', 'lunch', 'dinner', 'social', 'leisure'].includes(a.activity_type))
      .forEach((a) => {
        const hour = new Date(a.detected_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

    const sortedHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour))
      .slice(0, 5);

    return sortedHours;
  }

  private detectWorkoutPattern(activities: any[]): any[] {
    const workouts = activities.filter((a) => a.activity_type === 'exercise');

    const pattern = workouts.map((w) => {
      const date = new Date(w.detected_at);
      return {
        dayOfWeek: date.getDay(),
        hour: date.getHours(),
        location: w.location_name,
      };
    });

    return pattern;
  }

  private detectCommutePattern(activities: any[]): any[] {
    const commutes = activities.filter((a) => a.activity_type === 'commute');

    const pattern = commutes.map((c) => {
      const date = new Date(c.detected_at);
      return {
        dayOfWeek: date.getDay(),
        hour: date.getHours(),
        direction: this.inferCommuteDirection(date.getHours()),
      };
    });

    return pattern;
  }

  private inferCommuteDirection(hour: number): 'to_work' | 'from_work' | 'other' {
    if (hour >= 6 && hour <= 10) return 'to_work';
    if (hour >= 15 && hour <= 19) return 'from_work';
    return 'other';
  }

  private classifyRhythmType(
    wakeTime: string | null,
    sleepTime: string | null,
    socialPeaks: number[]
  ): 'early_bird' | 'night_owl' | 'flexible' | 'unknown' {
    if (!wakeTime || !sleepTime) return 'unknown';

    const wakeHour = parseInt(wakeTime.split(':')[0]);
    const sleepHour = parseInt(sleepTime.split(':')[0]);

    if (wakeHour <= 6 && sleepHour <= 22) return 'early_bird';
    if (wakeHour >= 9 && (sleepHour >= 24 || sleepHour <= 2)) return 'night_owl';

    const hasEveningPeaks = socialPeaks.some((h) => h >= 20);
    const hasMorningPeaks = socialPeaks.some((h) => h <= 10);

    if (hasEveningPeaks && !hasMorningPeaks) return 'night_owl';
    if (hasMorningPeaks && !hasEveningPeaks) return 'early_bird';

    return 'flexible';
  }

  private calculateEnergyPeaks(activities: any[]): number[] {
    const hourActivity: Record<number, number> = {};

    activities.forEach((a) => {
      const hour = new Date(a.detected_at).getHours();
      hourActivity[hour] = (hourActivity[hour] || 0) + 1;
    });

    return Object.entries(hourActivity)
      .sort(([, a], [, b]) => b - a)
      .map(([hour]) => parseInt(hour))
      .slice(0, 3);
  }

  private extractCoffeeSpots(activities: any[]): string[] {
    const spots = activities
      .filter((a) => a.activity_type === 'coffee' && a.location_name)
      .map((a) => a.location_name);

    const uniqueSpots = [...new Set(spots)];
    return uniqueSpots.slice(0, 5);
  }

  private extractFavoriteVenues(activities: any[]): string[] {
    const venueCounts: Record<string, number> = {};

    activities
      .filter((a) => a.location_name)
      .forEach((a) => {
        venueCounts[a.location_name] = (venueCounts[a.location_name] || 0) + 1;
      });

    return Object.entries(venueCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([venue]) => venue)
      .slice(0, 10);
  }

  private analyzeWeekendRoutine(activities: any[]): any {
    const weekendActivities = activities.filter((a) => {
      const day = new Date(a.detected_at).getDay();
      return day === 0 || day === 6;
    });

    const activityTypes: Record<string, number> = {};
    weekendActivities.forEach((a) => {
      activityTypes[a.activity_type] = (activityTypes[a.activity_type] || 0) + 1;
    });

    return {
      mostCommonActivity: Object.entries(activityTypes).sort(([, a], [, b]) => b - a)[0]?.[0] || null,
      averageStartTime: this.calculateAverageTime(weekendActivities, 'start'),
      totalActivities: weekendActivities.length,
    };
  }

  private calculateAverageTime(activities: any[], type: 'start' | 'end'): string | null {
    if (activities.length === 0) return null;

    const avgHour =
      activities.reduce((sum, a) => sum + new Date(a.detected_at).getHours(), 0) /
      activities.length;

    return `${Math.floor(avgHour).toString().padStart(2, '0')}:00`;
  }

  private async saveRhythm(rhythm: UserRhythm): Promise<void> {
    try {
      await supabase.from('user_rhythms').upsert(
        {
          user_id: rhythm.userId,
          wake_time: rhythm.wakeTime,
          sleep_time: rhythm.sleepTime,
          lunch_time: rhythm.lunchTime,
          workout_pattern: rhythm.workoutPattern,
          commute_pattern: rhythm.commutePattern,
          social_peaks: rhythm.socialPeaks,
          rhythm_type: rhythm.rhythmType,
          energy_peaks: rhythm.energyPeaks,
          coffee_spots: rhythm.coffeeSpots,
          favorite_venues: rhythm.favoriteVenues,
          weekend_routine: rhythm.weekendRoutine,
          calculated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );
    } catch (error) {
      console.error('Failed to save rhythm:', error);
    }
  }

  async findMirrorMatches(userId: string): Promise<MirrorMatch[]> {
    try {
      const userRhythm = await this.getUserRhythm(userId);
      if (!userRhythm) {
        await this.analyzeUserRhythm(userId);
        return [];
      }

      const { data: otherRhythms, error } = await supabase
        .from('user_rhythms')
        .select('*')
        .neq('user_id', userId);

      if (error || !otherRhythms) {
        return [];
      }

      const matches: MirrorMatch[] = [];

      for (const other of otherRhythms) {
        const score = await this.calculateMirrorScore(userRhythm, other);

        if (score >= 0.6) {
          const sharedRoutines = this.identifySharedRoutines(userRhythm, other);

          matches.push({
            userId: other.user_id,
            overlapScore: score,
            sharedRoutines,
            routineSimilarity: this.calculateRoutineSimilarity(userRhythm, other),
            locationOverlap: this.calculateLocationOverlap(userRhythm, other),
            timeOverlap: this.calculateTimeOverlap(userRhythm, other),
            suggestedMeetup: this.generateMeetupSuggestion(userRhythm, other, sharedRoutines),
          });

          await this.saveMirrorMatch(userId, other.user_id, score, sharedRoutines);
        }
      }

      return matches.sort((a, b) => b.overlapScore - a.overlapScore);
    } catch (error) {
      console.error('Failed to find mirror matches:', error);
      return [];
    }
  }

  private async getUserRhythm(userId: string): Promise<any | null> {
    const { data } = await supabase
      .from('user_rhythms')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return data;
  }

  private async calculateMirrorScore(rhythm1: any, rhythm2: any): Promise<number> {
    const { data } = await supabase.rpc('calculate_rhythm_compatibility', {
      p_user1_id: rhythm1.user_id,
      p_user2_id: rhythm2.user_id,
    });

    return data || 0;
  }

  private calculateRoutineSimilarity(rhythm1: any, rhythm2: any): number {
    let score = 0;

    if (rhythm1.rhythm_type === rhythm2.rhythm_type) score += 0.4;

    const socialOverlap =
      rhythm1.social_peaks.filter((p: number) => rhythm2.social_peaks.includes(p)).length /
      Math.max(rhythm1.social_peaks.length, rhythm2.social_peaks.length, 1);
    score += socialOverlap * 0.3;

    const venueOverlap =
      rhythm1.favorite_venues.filter((v: string) => rhythm2.favorite_venues.includes(v))
        .length / Math.max(rhythm1.favorite_venues.length, rhythm2.favorite_venues.length, 1);
    score += venueOverlap * 0.3;

    return Math.min(score, 1.0);
  }

  private calculateLocationOverlap(rhythm1: any, rhythm2: any): number {
    const sharedVenues = rhythm1.favorite_venues.filter((v: string) =>
      rhythm2.favorite_venues.includes(v)
    );

    return sharedVenues.length / Math.max(rhythm1.favorite_venues.length, rhythm2.favorite_venues.length, 1);
  }

  private calculateTimeOverlap(rhythm1: any, rhythm2: any): number {
    const sharedPeaks = rhythm1.social_peaks.filter((p: number) =>
      rhythm2.social_peaks.includes(p)
    );

    return sharedPeaks.length / Math.max(rhythm1.social_peaks.length, rhythm2.social_peaks.length, 1);
  }

  private identifySharedRoutines(rhythm1: any, rhythm2: any): string[] {
    const routines: string[] = [];

    if (rhythm1.rhythm_type === rhythm2.rhythm_type) {
      routines.push(`Both are ${rhythm1.rhythm_type}s`);
    }

    const sharedVenues = rhythm1.favorite_venues.filter((v: string) =>
      rhythm2.favorite_venues.includes(v)
    );
    if (sharedVenues.length > 0) {
      routines.push(`Visit same venues: ${sharedVenues.slice(0, 3).join(', ')}`);
    }

    const sharedCoffee = rhythm1.coffee_spots.filter((c: string) =>
      rhythm2.coffee_spots.includes(c)
    );
    if (sharedCoffee.length > 0) {
      routines.push(`Same coffee spots: ${sharedCoffee[0]}`);
    }

    return routines;
  }

  private generateMeetupSuggestion(rhythm1: any, rhythm2: any, sharedRoutines: string[]): string | null {
    if (sharedRoutines.length === 0) return null;

    const sharedVenues = rhythm1.favorite_venues.filter((v: string) =>
      rhythm2.favorite_venues.includes(v)
    );

    if (sharedVenues.length > 0) {
      const sharedPeaks = rhythm1.social_peaks.filter((p: number) =>
        rhythm2.social_peaks.includes(p)
      );
      const bestTime = sharedPeaks[0] || 12;

      return `Meet at ${sharedVenues[0]} around ${bestTime}:00`;
    }

    return 'Coffee together at mutual favorite time';
  }

  private async saveMirrorMatch(
    userA: string,
    userB: string,
    score: number,
    routines: string[]
  ): Promise<void> {
    try {
      await supabase.from('mirror_matches').upsert(
        {
          user_a: userA,
          user_b: userB,
          overlap_score: score,
          shared_routines: routines,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: 'user_a,user_b',
        }
      );
    } catch (error) {
      console.error('Failed to save mirror match:', error);
    }
  }
}

export const rhythmDetector = new RhythmDetector();
