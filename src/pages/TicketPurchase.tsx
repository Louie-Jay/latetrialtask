import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Ticket, 
  Users, 
  Clock, 
  Calendar,
  MapPin,
  Info,
  Star,
  ChevronRight,
  Shield
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';

export default function TicketPurchase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketType, setTicketType] = useState<'individual' | 'group'>('individual');
  const [quantity, setQuantity] = useState(1);
  const [rewardSelected, setRewardSelected] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (eventError) throw eventError;
      setEvent(event);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!event) return 0;
    const basePrice = ticketType === 'group' ? (event.group_price || 0) : event.individual_price;
    const subtotal = basePrice * quantity;
    const serviceFee = subtotal * 0.1; // 10% service fee
    return {
      subtotal,
      serviceFee,
      total: subtotal + serviceFee
    };
  };

  const handleProceedToCheckout = () => {
    if (!event) return;
    
    navigate('/checkout', {
      state: {
        eventId: event.id,
        ticketType,
        quantity,
        useReward: rewardSelected,
        ...calculateTotal()
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Error</h2>
          <p className="mt-2 text-gray-400">{error || 'Event not found'}</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ChevronRight className="h-5 w-5 mr-2" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const { subtotal, serviceFee, total } = calculateTotal();
  const remainingTickets = event.capacity - event.tickets_sold;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="text-purple-400 hover:text-purple-300 flex items-center mb-4"
        >
          <ChevronRight className="h-5 w-5 mr-2" />
          Back to Event
        </button>
        <h1 className="text-4xl font-bold text-gradient">Get Your Tickets</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Selection */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Summary */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">{event.name}</h2>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>
                  {new Date(event.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  {new Date(event.event_date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Ticket Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Select Ticket Type</h3>
            
            {/* Individual Ticket */}
            <button
              onClick={() => setTicketType('individual')}
              className={`w-full p-6 rounded-xl border transition-colors ${
                ticketType === 'individual'
                  ? 'border-purple-500 bg-purple-900/20'
                  : 'border-gray-800/50 hover:border-purple-500/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="text-left">
                  <div className="text-lg font-semibold text-white">Individual Ticket</div>
                  <div className="text-sm text-gray-400">Single entry ticket</div>
                </div>
                <div className="text-xl font-bold text-white">
                  ${event.individual_price.toFixed(2)}
                </div>
              </div>
            </button>

            {/* Group Ticket */}
            {event.group_price && (
              <button
                onClick={() => setTicketType('group')}
                className={`w-full p-6 rounded-xl border transition-colors ${
                  ticketType === 'group'
                    ? 'border-purple-500 bg-purple-900/20'
                    : 'border-gray-800/50 hover:border-purple-500/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="text-lg font-semibold text-white">Group Ticket</div>
                    <div className="text-sm text-gray-400">Special rate for groups</div>
                  </div>
                  <div className="text-xl font-bold text-white">
                    ${event.group_price.toFixed(2)}
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Quantity Selection */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Quantity</h3>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="input-field w-full"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'ticket' : 'tickets'}
                </option>
              ))}
            </select>

            {/* Remaining Tickets Warning */}
            {remainingTickets < 50 && (
              <div className="mt-4 flex items-center text-yellow-400 text-sm">
                <Info className="h-4 w-4 mr-2" />
                Only {remainingTickets} tickets remaining!
              </div>
            )}
          </div>

          {/* Rewards Section */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">Use Rewards</h3>
                <p className="text-sm text-gray-400">Apply your rewards for special perks</p>
              </div>
              <button
                onClick={() => setRewardSelected(!rewardSelected)}
                className={`premium-button flex items-center space-x-2 ${
                  rewardSelected ? 'bg-green-500' : ''
                }`}
              >
                <Star className="h-5 w-5" />
                <span>{rewardSelected ? 'Applied' : 'Apply'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 space-y-8">
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Service Fee
                </span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>

              {rewardSelected && (
                <div className="flex justify-between text-purple-400">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Rewards Discount
                  </span>
                  <span>-$10.00</span>
                </div>
              )}
              
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between text-white">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="premium-button w-full mt-6 py-4"
            >
              Proceed to Checkout
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}