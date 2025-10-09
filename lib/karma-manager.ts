import { supabase } from './supabase';

export interface KarmaTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: 'help_given' | 'help_received' | 'request' | 'emergency' | 'bonus' | 'penalty' | 'reward';
  relatedUserId: string | null;
  description: string;
  multiplier: number;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface KarmaBalance {
  balance: number;
  level: number;
  levelName: string;
  nextLevelAt: number;
}

class KarmaManager {
  async getBalance(userId: string): Promise<KarmaBalance> {
    try {
      const { data } = await supabase.rpc('get_karma_balance', {
        p_user_id: userId,
      });

      const balance = data || 10;
      const level = this.calculateLevel(balance);
      const levelName = this.getLevelName(level);
      const nextLevelAt = this.getNextLevelThreshold(level);

      return {
        balance,
        level,
        levelName,
        nextLevelAt,
      };
    } catch (error) {
      console.error('Failed to get karma balance:', error);
      return {
        balance: 10,
        level: 1,
        levelName: 'Newcomer',
        nextLevelAt: 50,
      };
    }
  }

  async addKarma(
    userId: string,
    amount: number,
    type: KarmaTransaction['transactionType'],
    description: string,
    relatedUserId?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const multiplier = await this.calculateMultiplier(metadata);
      const finalAmount = Math.round(amount * multiplier);

      const { error } = await supabase.from('karma_transactions').insert({
        user_id: userId,
        amount: finalAmount,
        transaction_type: type,
        related_user_id: relatedUserId || null,
        description,
        multiplier,
        metadata: metadata || {},
      });

      if (error) {
        console.error('Failed to add karma:', error);
        return false;
      }

      await this.updateProfileKarmaBalance(userId);
      return true;
    } catch (error) {
      console.error('Failed to add karma:', error);
      return false;
    }
  }

  async helpNeighbor(
    helperId: string,
    helpedId: string,
    taskDescription: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<boolean> {
    const baseAmount = {
      easy: 2,
      medium: 5,
      hard: 10,
    }[difficulty];

    const helperSuccess = await this.addKarma(
      helperId,
      baseAmount,
      'help_given',
      `Helped neighbor: ${taskDescription}`,
      helpedId,
      { task: taskDescription, difficulty }
    );

    const helpedSuccess = await this.addKarma(
      helpedId,
      -Math.ceil(baseAmount / 2),
      'help_received',
      `Received help: ${taskDescription}`,
      helperId,
      { task: taskDescription, difficulty }
    );

    return helperSuccess && helpedSuccess;
  }

  async requestHelp(
    requesterId: string,
    task: string,
    karmaCost: number = 2
  ): Promise<boolean> {
    const { balance } = await this.getBalance(requesterId);

    if (balance < karmaCost) {
      return false;
    }

    return await this.addKarma(
      requesterId,
      -karmaCost,
      'request',
      `Requested help: ${task}`,
      undefined,
      { task }
    );
  }

  async emergencyHelp(
    helperId: string,
    helpedId: string,
    emergencyDescription: string
  ): Promise<boolean> {
    return await this.addKarma(
      helperId,
      15,
      'emergency',
      `Emergency help: ${emergencyDescription}`,
      helpedId,
      { emergency: true, description: emergencyDescription }
    );
  }

  async giveBonus(
    userId: string,
    reason: string,
    amount: number = 5
  ): Promise<boolean> {
    return await this.addKarma(
      userId,
      amount,
      'bonus',
      `Bonus: ${reason}`,
      undefined,
      { reason }
    );
  }

  async applyPenalty(
    userId: string,
    reason: string,
    amount: number = 5
  ): Promise<boolean> {
    return await this.addKarma(
      userId,
      -amount,
      'penalty',
      `Penalty: ${reason}`,
      undefined,
      { reason }
    );
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<KarmaTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('karma_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get transaction history:', error);
        return [];
      }

      return data.map((t) => ({
        id: t.id,
        userId: t.user_id,
        amount: t.amount,
        transactionType: t.transaction_type,
        relatedUserId: t.related_user_id,
        description: t.description,
        multiplier: t.multiplier,
        metadata: t.metadata,
        createdAt: t.created_at,
      }));
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  private async calculateMultiplier(metadata?: Record<string, any>): Promise<number> {
    let multiplier = 1.0;

    if (metadata?.emergency) {
      return 1.0;
    }

    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 6) {
      multiplier *= 2.0;
    }

    if (metadata?.weather === 'rain') {
      multiplier *= 1.5;
    }

    if (metadata?.weather === 'storm') {
      multiplier *= 2.0;
    }

    return multiplier;
  }

  private async updateProfileKarmaBalance(userId: string): Promise<void> {
    try {
      const { balance } = await this.getBalance(userId);

      await supabase
        .from('profiles')
        .update({ karma_balance: balance })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update profile karma balance:', error);
    }
  }

  private calculateLevel(karma: number): number {
    if (karma < 50) return 1;
    if (karma < 150) return 2;
    if (karma < 300) return 3;
    if (karma < 500) return 4;
    if (karma < 1000) return 5;
    if (karma < 2000) return 6;
    if (karma < 5000) return 7;
    if (karma < 10000) return 8;
    if (karma < 25000) return 9;
    return 10;
  }

  private getLevelName(level: number): string {
    const names = [
      'Newcomer',
      'Neighbor',
      'Friend',
      'Helper',
      'Guardian',
      'Champion',
      'Hero',
      'Legend',
      'Master',
      'Grandmaster',
    ];
    return names[level - 1] || 'Grandmaster';
  }

  private getNextLevelThreshold(level: number): number {
    const thresholds = [0, 50, 150, 300, 500, 1000, 2000, 5000, 10000, 25000, 50000];
    return thresholds[level] || 100000;
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{ userId: string; balance: number; level: number }>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, karma_balance, photo_url')
        .order('karma_balance', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get leaderboard:', error);
        return [];
      }

      return data.map((p) => ({
        userId: p.id,
        firstName: p.first_name,
        photoUrl: p.photo_url,
        balance: p.karma_balance || 10,
        level: this.calculateLevel(p.karma_balance || 10),
      }));
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      return [];
    }
  }
}

export const karmaManager = new KarmaManager();
