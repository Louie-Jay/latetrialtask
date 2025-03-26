import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  CheckCircle,
  Calendar,
  MapPin,
  QrCode,
  Share2,
  Download,
  Star,
  Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';

type ConfirmationState = {
  eventId: string;
  ticketType: 'individual' | 'group';
  quantity: number;
};

export default function TicketConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const confirmationData = location.state as ConfirmationState;

  useEffect(() => {
    // Redirect to home if no ticket data
    if (!confirmationData) {
      navigate('/');
      return;
    }

    // Fetch event details
    const fetchEvent = async () => {
      try {
        const { data: event, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', confirmationData.eventId)
          .single();

        if (error) throw error;
        setEvent(event);
      } catch (err) {
        console.error('Error fetching event:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [confirmationData, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-6">
          <CheckCircle className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-gradient mb-4">Purchase Complete!</h1>
        <p className="text-gray-400">
          Your tickets have been sent to your email and are available in your account
        </p>
      </div>

      {/* Ticket Preview */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">{event.name}</h2>
            <div className="text-sm text-purple-400">
              <Star className="h-4 w-4 inline mr-1" />
              +100 points earned
            </div>
          </div>

          <div className="space-y-4 text-gray-300">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.venue}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="p-4 bg-white rounded-lg">
              <QrCode className="h-32 w-32 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/dashboard"
          className="premium-button flex items-center justify-center py-4"
        >
          <QrCode className="h-5 w-5 mr-2" />
          View Tickets
        </Link>

        <button className="secondary-button flex items-center justify-center py-4">
          <Share2 className="h-5 w-5 mr-2" />
          Share Event
        </button>
      </div>

      {/* Download Instructions */}
      <div className="mt-8 text-center">
        <button className="text-purple-400 hover:text-purple-300 flex items-center justify-center mx-auto">
          <Download className="h-5 w-5 mr-2" />
          Download PDF Ticket
        </button>
      </div>
    </div>
  );
}