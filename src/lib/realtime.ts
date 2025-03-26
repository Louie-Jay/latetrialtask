import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

type SubscriptionCallback = (payload: any) => void;

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to ticket updates
  subscribeToTicket(ticketId: string, callback: SubscriptionCallback) {
    const channel = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(`ticket:${ticketId}`, channel);
    return () => this.unsubscribe(`ticket:${ticketId}`);
  }

  // Subscribe to event updates
  subscribeToEvent(eventId: string, callback: SubscriptionCallback) {
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(`event:${eventId}`, channel);
    return () => this.unsubscribe(`event:${eventId}`);
  }

  // Subscribe to user points/rewards
  subscribeToUserRewards(userId: string, callback: SubscriptionCallback) {
    const channel = supabase
      .channel(`user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    this.channels.set(`user:${userId}`, channel);
    return () => this.unsubscribe(`user:${userId}`);
  }

  // Unsubscribe from a channel
  private unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach(channel => channel.unsubscribe());
    this.channels.clear();
  }
}

export const realtime = new RealtimeManager();