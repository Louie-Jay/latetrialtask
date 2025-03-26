import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode, Calendar, Users, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import TicketScanner from '../../components/TicketScanner';
import type { Event } from '../../types/database';

type EventWithStats = Event & {
  scanned_tickets?: number;
};

export default function ScannerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Fetch events based on user role
      const query = supabase
        .from('events')
        .select(`
          *,
          tickets (
            count
          )
        `)
        .gte('event_date', new Date().toISOString()) // Only upcoming events
        .order('event_date', { ascending: true });

      // If not admin, only show user's events
      if (userData.role !== 'admin') {
        query.eq('user_id', user.id);
      }

      const { data: events, error } = await query;

      if (error) throw error;

      // Transform data to include ticket counts
      const eventsWithStats = events?.map(event => ({
        ...event,
        scanned_tickets: event.tickets?.[0]?.count || 0
      })) || [];

      setEvents(eventsWithStats);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/portal/dashboard')}
        className="text-purple-400 hover:text-purple-300 mb-6 flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">Scan Tickets</h1>
        <p className="text-gray-400">Validate guest tickets for your events</p>
      </div>

      {/* Event Selection */}
      <div className="glass-effect rounded-xl p-6 border border-gray-800/50 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Select Event</h2>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="input-field w-full"
        >
          <option value="">Choose an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} - {formatDate(event.event_date)}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>
                {events.find(e => e.id === selectedEvent)?.tickets_sold || 0} tickets sold
              </span>
            </div>
            <div className="flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              <span>
                {events.find(e => e.id === selectedEvent)?.scanned_tickets || 0} tickets scanned
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scanner */}
      {selectedEvent && (
        <TicketScanner
          eventId={selectedEvent}
          onScanComplete={(success) => {
            if (success) {
              // Refresh event stats
              fetchEvents();
            }
          }}
        />
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-white">No Events Found</h3>
          <p className="mt-1 text-gray-400">Create an event to start scanning tickets</p>
        </div>
      )}
    </div>
  );
}