import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, MapPin, Calendar, Users, Star, Clock, ChevronRight, Loader, Ticket as TicketIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { RewardTier, RewardBenefit, Ticket, User, Event } from '../types/database';
import TicketCard from '../components/TicketCard';
import RewardsProgress from '../components/RewardsProgress';

function Dashboard() {
  // console.log("reached");
  
  const [user, setUser] = useState<User | null>(null);
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [benefits, setBenefits] = useState<RewardBenefit[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [nextEvent, setNextEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   // fetchDashboardData();
  // }, []);

  const fetchDashboardData = async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      setUser(profile);

      // Get reward tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('reward_tiers')
        .select('*')
        .order('points_threshold', { ascending: true });

      if (tiersError) throw tiersError;
      setTiers(tiersData);

      // Get reward benefits
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('reward_benefits')
        .select('*');

      if (benefitsError) throw benefitsError;
      setBenefits(benefitsData);

      // Get user's tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events (
            name,
            event_date,
            venue
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;
      setTickets(ticketsData);

      // Get next upcoming event
      const { data: nextEventData, error: nextEventError } = await supabase
        .from('events')
        .select('*')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(1)
        .single();

      if (nextEventError && nextEventError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine
        throw nextEventError;
      }
      setNextEvent(nextEventData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTier = () => {
    if (!user || !tiers.length) return null;
    return tiers.reduce((prev, current) => {
      if (user.points >= current.points_threshold) return current;
      return prev;
    });
  };

  const handleTicketShare = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Update user points
      const { error: updateError } = await supabase
        .from('users')
        .update({ points: (user?.points || 0) + 50 })
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      // Refresh user data
      const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (userError) throw userError;
      setUser(updatedUser);
    } catch (err) {
      console.error('Error updating points:', err);
    }
  };

  const getTierGradient = (tierName: string) => {
    switch (tierName?.toLowerCase()) {
      case 'bronze':
        return 'bg-gradient-radial from-amber-900/20 via-black to-black';
      case 'silver':
        return 'bg-gradient-radial from-gray-800/20 via-black to-black';
      case 'gold':
        return 'bg-gradient-radial from-yellow-900/20 via-black to-black';
      case 'platinum':
        return 'bg-gradient-radial from-sky-900/20 via-black to-black';
      default:
        return 'bg-gradient-radial from-purple-900/20 via-black to-black';
    }
  };

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    return `${eventDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} • ${eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const currentTier = getCurrentTier();
  // const backgroundGradient = getTierGradient(currentTier?.name);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-white">Error Loading Dashboard</h3>
          <p className="mt-1 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => setLoading(false)}
            className="mt-4 premium-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dynamic Background */}
      {/* <div className={`fixed inset-0 ${backgroundGradient} transition-colors duration-1000`} /> */}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gradient mb-4">Your Dashboard</h1>
          <p className="text-gray-300 text-lg">Manage your tickets, rewards, and upcoming events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Rewards Progress */}
          <div className="lg:col-span-2">
            <RewardsProgress
              currentPoints={user?.points || 0}
              tiers={tiers}
              benefits={benefits}
              currentTier={currentTier}
            />
          </div>

          {/* Quick Stats */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-base font-semibold text-white mb-4">Activity Summary</h2>
            <div className="space-y-3 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TicketIcon className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Active Tickets</span>
                </div>
                <span className="text-sm font-medium text-white">{tickets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Total Points</span>
                </div>
                <span className="text-sm font-medium text-white">{user?.points || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Music className="h-4 w-4 text-purple-400 mr-2" />
                  <span className="text-sm text-gray-300">Current Tier</span>
                </div>
                <span className="text-sm font-medium text-white">{currentTier?.name || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tickets Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-white">Your Tickets</h2>
            <Link
              to="/tickets"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
            >
              View all
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-6">
            {tickets.length === 0 ? (
              <div className="text-center py-12">
                <TicketIcon className="mx-auto h-10 w-10 text-gray-600" />
                <h3 className="mt-2 text-base font-medium text-white">No tickets yet</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Browse our events and get your first ticket!
                </p>
                <Link
                  to="/events"
                  className="mt-4 premium-button inline-block text-sm"
                >
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onShare={handleTicketShare}
                  />
                ))}

                {/* Next Event Preview */}
                {nextEvent && (
                  <Link
                    to={`/events/${nextEvent.id}`}
                    className="glass-effect rounded-xl border border-gray-800/50 group overflow-hidden"
                  >
                    <div className="relative h-48">
                      <div className="relative h-full w-full transform transition-transform duration-500 group-hover:scale-110">
                        {nextEvent.image_url ? (
                          <img
                            src={nextEvent.image_url}
                            alt={nextEvent.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                            <Music className="h-16 w-16 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      </div>
                      
                      {/* Early Access Badge */}
                      <div className="absolute top-4 right-4 glass-effect rounded-full px-4 py-2 text-purple-400 text-sm font-medium border border-purple-500/20">
                        <Star className="h-4 w-4 inline mr-2" />
                        Early Access
                      </div>

                      {/* Event Details */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="text-sm text-purple-400 mb-2">Next Event</div>
                        <h3 className="text-xl font-bold text-white group-hover:text-gradient transition-colors">
                          {nextEvent.name}
                        </h3>
                        <div className="mt-2 space-y-2 text-gray-300">
                          <div className="flex items-center text-sm space-x-2">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(nextEvent.event_date)}</span>
                          </div>
                          <div className="flex items-center text-sm space-x-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{nextEvent.venue}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Capacity */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="stats-badge">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <div className="pulse-dot" />
                        <span className="value">{nextEvent.capacity - nextEvent.tickets_sold} spots left</span>
                      </div>
                      <div className="flex items-center text-purple-400 font-medium">
                        From {formatPrice(nextEvent.individual_price)}
                        <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;