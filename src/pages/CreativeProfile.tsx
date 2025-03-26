import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Palette, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  ArrowLeft, 
  Loader,
  Instagram,
  Youtube,
  Globe,
  Link as LinkIcon,
  Eye,
  Heart,
  MessageCircle,
  BookOpen,
  Mail,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';

type CreativeProfile = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  specialties: string[];
  followers_count: number;
  projects_count: number;
  instagram_handle: string;
  youtube_handle?: string;
  website_url?: string;
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    category: string;
    likes: number;
    views: number;
    comments: number;
    created_at: string;
  }>;
};

export default function CreativeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CreativeProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'about'>('portfolio');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    message: '',
    budget: ''
  });

  useEffect(() => {
    fetchCreativeProfile();
  }, [id]);

  const fetchCreativeProfile = async () => {
    try {
      // Simulated profile data
      const dummyProfile: CreativeProfile = {
        id: '1',
        email: 'visual.artist@example.com',
        role: 'creator',
        points: 0,
        created_at: new Date().toISOString(),
        full_name: 'Visual Artist',
        bio: 'Visual artist specializing in immersive digital experiences and live event visuals. With over a decade of experience in the electronic music scene, I create mesmerizing visual experiences that complement and enhance the music.\n\nMy work combines real-time generative art, projection mapping, and interactive installations to create unforgettable moments. I believe in pushing the boundaries of what\'s possible in live visual performance.',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
        specialties: ['visual-art', 'projection-mapping', 'motion-graphics', '3d-animation', 'live-performance'],
        followers_count: 15000,
        projects_count: 45,
        instagram_handle: '@visualartist',
        youtube_handle: '@visualartist_official',
        website_url: 'https://visualartist.com',
        portfolio: [
          {
            id: '1',
            title: 'Neon Dreams Festival',
            description: 'Main stage visuals for electronic music festival',
            image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80',
            category: 'live-performance',
            likes: 2500,
            views: 12000,
            comments: 180,
            created_at: '2024-02-15T20:00:00Z'
          },
          {
            id: '2',
            title: 'Digital Dystopia',
            description: 'Projection mapping installation exploring urban futures',
            image_url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?auto=format&fit=crop&q=80',
            category: 'projection-mapping',
            likes: 1800,
            views: 8500,
            comments: 120,
            created_at: '2024-02-01T21:00:00Z'
          },
          {
            id: '3',
            title: 'Cyberpunk Dreams',
            description: '3D animation series inspired by retro-futurism',
            image_url: 'https://images.unsplash.com/photo-1550684374-ccc45b6d5424?auto=format&fit=crop&q=80',
            category: '3d-animation',
            likes: 3200,
            views: 15000,
            comments: 250,
            created_at: '2024-01-15T22:00:00Z'
          }
        ]
      };

      setProfile(dummyProfile);
      setError(null);
    } catch (err) {
      console.error('Error fetching creative profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowBookingModal(false);
  };

  const getCategories = () => {
    if (!profile) return [];
    const categories = profile.portfolio.map(item => item.category);
    return ['all', ...new Set(categories)];
  };

  const filteredPortfolio = profile?.portfolio.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Error</h2>
          <p className="mt-2 text-gray-400">{error || 'Profile not found'}</p>
          <button
            onClick={() => navigate('/creatives')}
            className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Creatives
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/creatives')}
        className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Creatives
      </button>

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[400px] rounded-xl overflow-hidden mb-8">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-premium-black" />
          <img
            src={profile.portfolio[0]?.image_url}
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
              className="w-32 h-32 rounded-xl object-cover ring-4 ring-pink-500/20"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold text-white">{profile.full_name}</h1>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-900/50 text-pink-300">
                  Creative
                </span>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl">{profile.bio.split('\n')[0]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-8">
        {[
          { icon: Users, label: 'Followers', value: profile.followers_count.toLocaleString() },
          { icon: Star, label: 'Projects', value: profile.projects_count.toString() },
          { icon: Eye, label: 'Total Views', value: profile.portfolio.reduce((sum, item) => sum + item.views, 0).toLocaleString() },
          { icon: Heart, label: 'Total Likes', value: profile.portfolio.reduce((sum, item) => sum + item.likes, 0).toLocaleString() }
        ].map((stat) => (
          <div key={stat.label} className="glass-effect rounded-xl p-3 md:p-4 border border-gray-800/50">
            <div className="flex md:items-center flex-col md:flex-row md:space-x-3">
              <div className="p-2 rounded-lg bg-pink-900/20 mb-2 md:mb-0">
                <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-pink-400" />
              </div>
              <div className="text-center md:text-left">
                <p className="text-xs md:text-sm text-gray-400">{stat.label}</p>
                <p className="text-base md:text-lg font-semibold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Links and Book Now Button */}
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
            <Globe className="h-6 w-6" />
          </a>
        )}

        <button
          onClick={() => setShowBookingModal(true)}
          className="premium-button flex items-center space-x-2 ml-auto"
        >
          <BookOpen className="h-5 w-5" />
          <span>Book Now</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-800 mb-8">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'portfolio'
              ? 'text-pink-400 border-pink-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            activeTab === 'about'
              ? 'text-pink-400 border-pink-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          About
        </button>
      </div>

      {/* Content */}
      {activeTab === 'portfolio' ? (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {getCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-pink-900/50 text-pink-300 border border-pink-500/20'
                    : 'bg-gray-800/30 text-gray-300 border border-gray-700 hover:border-pink-500/20'
                }`}
              >
                {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolio.map((item) => (
              <div key={item.id} className="glass-effect rounded-xl overflow-hidden group">
                <div className="relative h-64">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-gradient transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{item.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        <span>{item.comments.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                {profile.bio.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-300 mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-8">
            <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
              <h2 className="text-xl font-semibold text-white mb-4">Specialties</h2>
              <div className="space-y-2">
                {profile.specialties.map((specialty) => (
                  <div
                    key={specialty}
                    className="glass-effect rounded-lg p-3 border border-pink-500/20 group hover:border-pink-500/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-pink-900/20 group-hover:scale-110 transition-transform">
                        <Palette className="h-4 w-4 text-pink-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-300">
                        {specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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