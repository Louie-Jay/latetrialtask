import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Music, 
  Users, 
  Calendar, 
  ArrowLeft, 
  Loader, 
  Star, 
  Clock, 
  ChevronRight, 
  Ticket, 
  Volume2, 
  Lightbulb, 
  Wine, 
  Crown, 
  Cigarette, 
  Car, 
  Shield,
  Shirt // Using Shirt icon instead of Coat
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Venue, Event } from '../types/database';

function VenueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'info'>('events');

  useEffect(() => {
    fetchVenueDetails();
  }, [id]);

  const fetchVenueDetails = async () => {
    try {
      // Simulated venue data
      const dummyVenue: Venue = {
        id: '1',
        name: 'Club Nova',
        description: 'Premium nightclub featuring state-of-the-art sound system, immersive lighting, and multiple dance floors. Home to world-renowned DJs and unforgettable nights.\n\nOur venue combines cutting-edge technology with sophisticated design to create the perfect atmosphere for electronic music events.\n\nThe main room features a custom-built sound system delivering crystal-clear audio across the entire frequency spectrum, while our intelligent lighting system creates immersive visual experiences that complement the music perfectly.\n\nIn addition to the main dance floor, we offer exclusive VIP areas, multiple bars serving premium drinks, and a dedicated smoking area. Our professional security team ensures a safe environment, while our coat check service provides convenience for our guests.',
        address: '123 Downtown Avenue, Nightlife District',
        capacity: 800,
        image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80',
        amenities: ['sound-system', 'lighting', 'bar', 'vip', 'smoking', 'parking', 'security', 'coat-check'],
        upcoming_events_count: 8,
        created_at: new Date().toISOString()
      };

      // Simulated upcoming events
      const dummyEvents: Event[] = [
        {
          id: '1',
          name: 'Deep House Sessions',
          description: 'An intimate night of deep house music featuring top underground DJs.',
          venue: 'Club Nova',
          event_date: '2024-03-20T21:00:00Z',
          individual_price: 49.99,
          group_price: 179.99,
          discount_code: 'DEEP10',
          image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
          tickets_sold: 180,
          capacity: 300,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Techno Night XL',
          description: 'A night of pounding techno beats and industrial vibes.',
          venue: 'Club Nova',
          event_date: '2024-03-25T22:00:00Z',
          individual_price: 39.99,
          group_price: 139.99,
          discount_code: 'TECHNO15',
          image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80',
          tickets_sold: 220,
          capacity: 400,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Trance Evolution',
          description: 'Journey through the best of trance music, past and present.',
          venue: 'Club Nova',
          event_date: '2024-04-01T20:00:00Z',
          individual_price: 54.99,
          group_price: 189.99,
          discount_code: 'TRANCE10',
          image_url: 'https://images.unsplash.com/photo-1574012716378-0ca6f4c18c08?auto=format&fit=crop&q=80',
          tickets_sold: 150,
          capacity: 200,
          created_at: new Date().toISOString()
        }
      ];

      setVenue(dummyVenue);
      setUpcomingEvents(dummyEvents);
      setError(null);
    } catch (error) {
      console.error('Error fetching venue:', error);
      setError('Failed to load venue details');
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'sound-system':
        return <Volume2 className="h-5 w-5" />;
      case 'lighting':
        return <Lightbulb className="h-5 w-5" />;
      case 'bar':
        return <Wine className="h-5 w-5" />;
      case 'vip':
        return <Crown className="h-5 w-5" />;
      case 'smoking':
        return <Cigarette className="h-5 w-5" />;
      case 'parking':
        return <Car className="h-5 w-5" />;
      case 'security':
        return <Shield className="h-5 w-5" />;
      case 'coat-check':
        return <Shirt className="h-5 w-5" />; // Using Shirt icon for coat check
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    return amenity.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Error</h2>
          <p className="mt-2 text-gray-400">{error || 'Venue not found'}</p>
          <button
            onClick={() => navigate('/venues')}
            className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/venues')}
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Venues
      </button>

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] rounded-xl overflow-hidden mb-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          {venue.image_url ? (
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
              <Music className="h-24 w-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-premium-black" />
        </div>

        {/* Venue Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-white mb-4">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                <span>{venue.capacity.toLocaleString()} capacity</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{venue.upcoming_events_count} upcoming events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'events'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'info'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Venue Information
        </button>
      </div>

      {/* Content */}
      {activeTab === 'events' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="premium-card card-hover group relative overflow-hidden"
            >
              {/* Event Image Container */}
              <div className="relative h-[28rem] overflow-hidden">
                <div className="absolute inset-0 w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                  {event.image_url ? (
                    <img
                      src={event.image_url}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                      <Music className="h-16 w-16 text-white/20" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-premium-black opacity-90 group-hover:opacity-95 transition-opacity" />
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4 premium-gradient rounded-full px-4 py-2 text-white font-semibold shadow-lg transform group-hover:scale-105 transition-transform z-10">
                  From {formatPrice(event.individual_price)}
                </div>

                {/* Event Details */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                    {event.name}
                  </h3>
                  
                  <p className="text-gray-300 line-clamp-2 mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-gray-300">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center text-gray-300">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        <span>{event.capacity - event.tickets_sold} spots left</span>
                      </div>
                      <span className="text-purple-400">
                        {Math.round((event.tickets_sold / event.capacity) * 100)}% Sold
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full premium-gradient rounded-full transition-all duration-500 shadow-lg"
                        style={{
                          width: `${(event.tickets_sold / event.capacity) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">About This Venue</h2>
              <div className="prose prose-invert max-w-none">
                {venue.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-300 mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {venue.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="glass-effect rounded-lg p-4 border border-purple-500/20 group hover:border-purple-500/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-purple-900/20 group-hover:scale-110 transition-transform">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        {getAmenityLabel(amenity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Stats */}
          <div className="space-y-8">
            {/* Location Card */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">Location</h2>
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-gray-800/30">
                  <MapPin className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{venue.name}</h3>
                  <p className="text-gray-400 mt-1">{venue.address}</p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">Venue Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-900/20">
                      <Users className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Capacity</span>
                  </div>
                  <span className="text-white font-medium">{venue.capacity.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-900/20">
                      <Calendar className="h-5 w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300">Upcoming Events</span>
                  </div>
                  <span className="text-white font-medium">{venue.upcoming_events_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenueDetails;