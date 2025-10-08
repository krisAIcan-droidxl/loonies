import { supabase } from './supabase';
import { Ping, PingStatus, ActivityTag, CreatePingRequest } from '@/types';

/**
 * Send et ping til en anden bruger
 */
export async function sendPing(
  toUserId: string,
  activity: ActivityTag = ActivityTag.COFFEE,
  message: string = 'Lad os mødes!'
): Promise<{ data: Ping | null; error: Error | null }> {
  try {
    // Tjek om der allerede er et aktivt ping til denne bruger
    const { data: existingPings } = await supabase
      .from('pings')
      .select('*')
      .eq('to_user_id', toUserId)
      .eq('activity_tag', activity)
      .eq('status', PingStatus.PENDING)
      .gt('expires_at', new Date().toISOString());

    if (existingPings && existingPings.length > 0) {
      return {
        data: null,
        error: new Error('Du har allerede sendt et aktivt ping til denne bruger'),
      };
    }

    // Opret nyt ping
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Ikke logget ind') };
    }

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const { data, error } = await supabase
      .from('pings')
      .insert({
        from_user_id: user.user.id,
        to_user_id: toUserId,
        activity_tag: activity,
        message,
        status: PingStatus.PENDING,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Ping, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Acceptér et indgående ping
 */
export async function acceptPing(
  pingId: string
): Promise<{ data: any | null; error: Error | null }> {
  try {
    // Hent ping
    const { data: ping, error: pingError } = await supabase
      .from('pings')
      .select('*')
      .eq('id', pingId)
      .single();

    if (pingError || !ping) {
      return { data: null, error: new Error('Ping ikke fundet') };
    }

    // Tjek om pinget er udløbet
    if (new Date(ping.expires_at) < new Date()) {
      await supabase
        .from('pings')
        .update({ status: PingStatus.EXPIRED })
        .eq('id', pingId);
      return { data: null, error: new Error('Pinget er udløbet') };
    }

    // Opdater ping status
    const { error: updateError } = await supabase
      .from('pings')
      .update({
        status: PingStatus.ACCEPTED,
        responded_at: new Date().toISOString()
      })
      .eq('id', pingId);

    if (updateError) {
      return { data: null, error: new Error(updateError.message) };
    }

    // Opret match med 24h udløb
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        user_a: ping.from_user_id,
        user_b: ping.to_user_id,
        ping_id: pingId,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (matchError) {
      return { data: null, error: new Error(matchError.message) };
    }

    return { data: match, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Ignorér et indgående ping
 */
export async function declinePing(
  pingId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('pings')
      .update({
        status: PingStatus.DECLINED,
        responded_at: new Date().toISOString()
      })
      .eq('id', pingId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Hent alle aktive pings for nuværende bruger
 */
export async function getActivePings(): Promise<{
  data: Ping[] | null;
  error: Error | null;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Ikke logget ind') };
    }

    const { data, error } = await supabase
      .from('pings')
      .select('*')
      .or(`from_user_id.eq.${user.user.id},to_user_id.eq.${user.user.id}`)
      .in('status', [PingStatus.PENDING, PingStatus.ACCEPTED])
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Ping[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Hent aktive matches for nuværende bruger
 */
export async function getActiveMatches(): Promise<{
  data: Match[] | null;
  error: Error | null;
}> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { data: null, error: new Error('Ikke logget ind') };
    }

    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_a.eq.${user.user.id},user_b.eq.${user.user.id}`)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Match[], error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

/**
 * Markér udløbne pings som expired
 */
export async function expireOldPings(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('pings')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (err) {
    return { error: err as Error };
  }
}
