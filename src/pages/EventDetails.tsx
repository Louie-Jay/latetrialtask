import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Clock, 
  ArrowLeft, 
  Loader,
  Info,
  DollarSign,
  Percent,
  Music,
  Star,
  Crown,
  X,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { processPayment } from '../lib/payment';
import type { Event } from '../types/database';

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketType, setTicketType] = useState<'individual' | 'group'>('individual');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPointsPreview, setShowPointsPreview] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      // Simulated event data
      const dummyEvent: Event = {
        id: '1',
        name: 'Neon Dreams Festival',
        description: 'Experience the ultimate electronic music festival with world-class DJs and immersive light shows.',
        venue: 'Warehouse 23',
        event_date: '2024-03-15T20:00:00Z',
        individual_price: 89.99,
        group_price: 299.99,
        discount_code: 'NEON20',
        image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
        tickets_sold: 750,
        capacity: 1000,
        created_at: new Date().toISOString()
      };

      setEvent(dummyEvent);
      setError(null);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!event) return;
    
    setProcessingPayment(true);
    setPaymentError(null);

    try {
      // Validate user is authenticated (in a real app)
      const userId = 'user_123'; // This would come from auth context

      // Validate quantity
      if (remainingTickets < ticketQuantity) {
        throw new Error('Not enough tickets available');
      }

      const result = await processPayment(
        event.id,
        totalPrice,
        userId
      );

      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }

      // Success - redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Payment processing error:', err);
      setPaymentError(
        err instanceof Error 
          ? err.message 
          : 'Failed to process payment. Please try again.'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculatePoints = () => {
    const basePoints = Math.floor(totalPrice);
    const bonusPoints = ticketType === 'group' ? Math.floor(totalPrice * 0.1) : 0; // 10% bonus for group tickets
    return {
      base: basePoints,
      bonus: bonusPoints,
      total: basePoints + bonusPoints
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Error</h2>
          <p className="mt-2 text-gray-400">{error || 'Event not found'}</p>
          <button
            onClick={() => navigate('/events')}
            className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const remainingTickets = event.capacity - event.tickets_sold;
  const soldPercentage = (event.tickets_sold / event.capacity) * 100;
  const basePrice = ticketType === 'group' ? (event.group_price || 0) : event.individual_price;
  const totalPrice = basePrice * ticketQuantity;
  const points = calculatePoints();

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image */}
          <div className="relative h-[400px] rounded-xl overflow-hidden">
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <Music className="h-24 w-24 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            {/* Event Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-4xl font-bold text-white mb-4">{event.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.venue}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-400" />
                  <div className="pulse-dot" />
                  <span>{remainingTickets} spots left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-4">About This Event</h2>
            <p className="text-gray-300">{event.description}</p>
          </div>

          {/* Stats Section */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h2 className="text-xl font-semibold text-white mb-6">Event Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-900/20">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Capacity</p>
                  <p className="text-lg font-semibold text-white">
                    {event.capacity.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-900/20">
                  <Ticket className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Tickets Sold</p>
                  <p className="text-lg font-semibold text-white">
                    {event.tickets_sold.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-900/20">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Event Duration</p>
                  <p className="text-lg font-semibold text-white">4 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Purchase Section */}
        <div>
          {/* Pricing Card */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50 lg:sticky lg:top-24">
            <h2 className="text-xl font-semibold text-white mb-6">Get Your Tickets</h2>

            {/* Points Preview Card */}
            <div 
              className="mb-6 glass-effect rounded-xl p-6 border border-gray-800/50 overflow-hidden points-card group"
              onMouseEnter={() => setShowPointsPreview(true)}
              onMouseLeave={() => setShowPointsPreview(false)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-white">Points Earned</span>
                </div>
                <div className="text-2xl font-bold points-value">
                  <span className="text-gradient">+{points.total}</span>
                </div>
              </div>

              {/* Points Breakdown - Only show bonus if applicable */}
              {points.bonus > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-400">
                    <Crown className="h-4 w-4 mr-2" />
                    <span>Group Bonus</span>
                  </div>
                  <span className="text-white points-value">+{points.bonus}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full premium-gradient rounded-full transition-all duration-1000 md:w-0 w-full ${
                      showPointsPreview ? 'md:w-full' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Ticket Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ticket Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTicketType('individual')}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    ticketType === 'individual'
                      ? 'border-purple-500 bg-purple-900/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  <div className="font-medium mb-1">Individual</div>
                  <div className="text-sm opacity-75">
                    {formatPrice(event.individual_price)}
                  </div>
                </button>
                {event.group_price && (
                  <button
                    onClick={() => setTicketType('group')}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      ticketType === 'group'
                        ? 'border-purple-500 bg-purple-900/20 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="font-medium mb-1">Group</div>
                    <div className="text-sm opacity-75">
                      {formatPrice(event.group_price)}
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <select
                value={ticketQuantity}
                onChange={(e) => setTicketQuantity(Number(e.target.value))}
                className="input-field w-full"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'ticket' : 'tickets'}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="stats-badge">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  <div className="pulse-dot" />
                  <span className="value">{remainingTickets} spots left</span>
                </div>
                <span className="text-purple-400">{Math.round(soldPercentage)}% Sold</span>
              </div>
              <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full premium-gradient rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${soldPercentage}%` }}
                />
              </div>
            </div>

            {/* Payment Error Message */}
            {paymentError && (
              <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                <p className="text-sm text-red-400 flex items-center">
                  <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                  {paymentError}
                </p>
              </div>
            )}

            {/* Total Price */}
            <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-800">
              <span className="text-base text-gray-300">Total Price</span>
              <span className="text-2xl font-bold text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Purchase Button */}
            <button
              onClick={handlePurchase}
              disabled={processingPayment || remainingTickets === 0 || remainingTickets < ticketQuantity}
              className="premium-button w-full py-4 flex items-center justify-center text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPayment ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : remainingTickets === 0 ? (
                'Sold Out'
              ) : remainingTickets < ticketQuantity ? (
                'Not Enough Tickets Available'
              ) : (
                <>
                  <Ticket className="h-5 w-5 mr-2" />
                  Get Tickets
                </>
              )}
            </button>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Secure payment powered by Stripe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}