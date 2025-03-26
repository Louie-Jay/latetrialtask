import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Music, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Clock,
  ChevronRight,
  Youtube,
  Instagram,
  Link as LinkIcon,
  Headphones,
  BookOpen,
  Mail
} from 'lucide-react';
import type { User } from '../types/database';

type MemberProfile = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  member_type: string;
  genres: string[];
  followers_count: number;
  events_count: number;
  instagram_handle: string;
  youtube_handle?: string;
  website_url?: string;
  rating: number;
  reviews_count: number;
  upcoming_events: Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    image_url: string;
  }>;
  past_events: Array<{
    id: string;
    name: string;
    date: string;
    venue: string;
    image_url: string;
    attendees: number;
  }>;
};

export default function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    message: '',
    budget: ''
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowBookingModal(false);
  };

  useEffect(() => {
    // Simulated profile data
    const dummyProfile: MemberProfile = {
      id: '1',
      email: 'dj.nova@example.com',
      role: 'dj',
      points: 0,
      created_at: new Date().toISOString(),
      full_name: 'DJ Nova',
      bio: 'International DJ known for deep house and techno sets. Resident DJ at Club Nova with over 10 years of experience crafting unforgettable nights.',
      avatar_url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80',
      member_type: 'dj',
      genres: ['house', 'techno', 'deep-house'],
      followers_count: 15000,
      events_count: 120,
      instagram_handle: '@djnova',
      youtube_handle: '@djnova_official',
      website_url: 'https://djnova.com',
      rating: 4.8,
      reviews_count: 256,
      upcoming_events: [
        {
          id: '1',
          name: 'Deep House Sessions',
          date: '2024-03-20T21:00:00Z',
          venue: 'Club Nova',
          image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80'
        },
        {
          id: '2',
          name: 'Techno Night',
          date: '2024-04-15T22:00:00Z',
          venue: 'Warehouse 23',
          image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80'
        }
      ],
      past_events: [
        {
          id: '3',
          name: 'Summer Vibes Festival',
          date: '2024-02-15T20:00:00Z',
          venue: 'Beach Club',
          image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
          attendees: 1200
        },
        {
          id: '4',
          name: 'Underground Beats',
          date: '2024-02-01T21:00:00Z',
          venue: 'The Basement',
          image_url: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&q=80',
          attendees: 400
        }
      ]
    };

    setProfile(dummyProfile);
  }, [id]);

  if (!profile) {
    return null;
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[400px] rounded-xl overflow-hidden mb-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-premium-black" />
          <img
            src={profile.upcoming_events[0]?.image_url}
            alt="Profile Cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end space-x-6">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=6366f1&color=fff`}
              alt={profile.full_name}
              className="w-32 h-32 rounded-xl object-cover ring-4 ring-purple-500/20"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold text-white">{profile.full_name}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-900/50 text-purple-300">
                  {profile.member_type === 'dj' ? 'DJ' : 'Promoter'}
                </span>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl">{profile.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Condensed for Mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
        {[
          { icon: Users, label: 'Followers', value: profile.followers_count.toLocaleString() },
          { icon: Calendar, label: 'Events', value: profile.events_count.toString() },
          { icon: Star, label: 'Rating', value: profile.rating.toString() },
          { icon: Headphones, label: 'Reviews', value: profile.reviews_count.toLocaleString() }
        ].map((stat) => (
          <div key={stat.label} className="glass-effect rounded-xl p-3 md:p-4 border border-gray-800/50">
            <div className="flex md:items-center flex-col md:flex-row md:space-x-3">
              <div className="p-2 rounded-lg bg-purple-900/20 mb-2 md:mb-0">
                <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-gray-400">{stat.label}</p>
                <p className="text-base md:text-lg font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        {profile.instagram_handle && (
          <a
            href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center p-0 bg-gradient-to-tr from-[#FF7A00] via-[#FF0169] to-[#D300C5] hover:from-[#FF7A00]/90 hover:via-[#FF0169]/90 hover:to-[#D300C5]/90 rounded-full transition-all"
          >
            <Instagram className="h-6 w-6 text-white" />
          </a>
        )}
        {profile.youtube_handle && (
          <a
            href={`https://youtube.com/${profile.youtube_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 flex items-center justify-center p-0 bg-[#FF0000] hover:bg-[#FF0000]/90 rounded-full shadow-lg shadow-red-500/20 transition-all"
          >
            <Youtube className="h-6 w-6 text-white" />
          </a>
        )}
        {profile.website_url && (
          <a
            href={profile.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 secondary-button flex items-center justify-center p-0"
          >
            <LinkIcon className="h-6 w-6" />
          </a>
        )}

        {/* Book Now Button */}
        <button
          onClick={() => setShowBookingModal(true)}
          className="premium-button flex items-center space-x-2 ml-auto"
        >
          <BookOpen className="h-5 w-5" />
          <span>Book Now</span>
        </button>
      </div>

      {/* Genres */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Genres</h2>
        <div className="flex flex-wrap gap-2">
          {profile.genres.map((genre) => (
            <span
              key={genre}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-900/20 text-purple-300 border border-purple-500/20"
            >
              {genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Events Tabs */}
      <div className="mb-4">
        <div className="flex space-x-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'upcoming'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'past'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-gray-300'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeTab === 'upcoming' ? profile.upcoming_events : profile.past_events).map((event) => (
          <div key={event.id} className="glass-effect rounded-xl overflow-hidden group">
            <div className="relative h-48">
              <img
                src={event.image_url}
                alt={event.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-gradient transition-colors">
                  {event.name}
                </h3>
                <div className="mt-2 flex items-center text-sm text-gray-300 space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Book {profile.full_name}</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                    className="input-field w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Budget Range
                  </label>
                  <select
                    value={bookingForm.budget}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, budget: e.target.value }))}
                    className="input-field w-full"
                    required
                  >
                    <option value="">Select a range</option>
                    <option value="500-1000">$500 - $1,000</option>
                    <option value="1000-2500">$1,000 - $2,500</option>
                    <option value="2500-5000">$2,500 - $5,000</option>
                    <option value="5000+">$5,000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input-field w-full"
                    rows={4}
                    placeholder="Tell us about your event..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="premium-button w-full py-3 flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Send Booking Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}