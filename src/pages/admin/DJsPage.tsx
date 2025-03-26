import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Music,
  Users,
  Search,
  Filter,
  Loader,
  Calendar,
  Instagram,
  Youtube,
  Globe,
  MoreVertical,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  DollarSign,
  Headphones,
  Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/database';

type ExtendedDJ = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  genres: string[];
  followers_count: number;
  events_count: number;
  instagram_handle: string;
  youtube_handle?: string;
  website_url?: string;
  rating: number;
  reviews_count: number;
  status: 'active' | 'pending' | 'inactive';
  upcoming_events: number;
  total_revenue: number;
  average_event_attendance: number;
  preferred_venues: string[];
};

export default function DJsPage() {
  const [djs, setDJs] = useState<ExtendedDJ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'events'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchDJs();
  }, []);

  const fetchDJs = async () => {
    try {
      // Simulated DJs data
      const dummyDJs: ExtendedDJ[] = [
        {
          id: '1',
          email: 'dj.nova@example.com',
          role: 'dj',
          points: 2500,
          created_at: new Date().toISOString(),
          full_name: 'DJ Nova',
          bio: 'International DJ known for deep house and techno sets',
          avatar_url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80',
          genres: ['house', 'techno', 'deep-house'],
          followers_count: 25000,
          events_count: 150,
          instagram_handle: '@djnova',
          youtube_handle: '@djnova_official',
          website_url: 'https://djnova.com',
          rating: 4.9,
          reviews_count: 320,
          status: 'active',
          upcoming_events: 8,
          total_revenue: 450000,
          average_event_attendance: 800,
          preferred_venues: ['Club Nova', 'Warehouse 23', 'The Loft']
        },
        {
          id: '2',
          email: 'techno.master@example.com',
          role: 'dj',
          points: 1800,
          created_at: new Date().toISOString(),
          full_name: 'Techno Master',
          bio: 'Underground techno producer and DJ',
          avatar_url: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80',
          genres: ['techno', 'industrial', 'experimental'],
          followers_count: 15000,
          events_count: 85,
          instagram_handle: '@technomaster',
          youtube_handle: '@technomaster_official',
          website_url: 'https://technomaster.com',
          rating: 4.7,
          reviews_count: 180,
          status: 'active',
          upcoming_events: 5,
          total_revenue: 280000,
          average_event_attendance: 500,
          preferred_venues: ['The Basement', 'Factory Hall']
        }
      ];

      setDJs(dummyDJs);
      setError(null);
    } catch (err) {
      console.error('Error fetching DJs:', err);
      setError('Failed to load DJs');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const filteredDJs = djs.filter(dj => {
    const matchesSearch = 
      dj.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dj.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !genreFilter || dj.genres.includes(genreFilter);
    const matchesStatus = !statusFilter || dj.status === statusFilter;
    
    return matchesSearch && matchesGenre && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.full_name.localeCompare(b.full_name)
        : b.full_name.localeCompare(a.full_name);
    }
    const aValue = sortBy === 'rating' ? a.rating : a.events_count;
    const bValue = sortBy === 'rating' ? b.rating : b.events_count;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading DJs</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">DJ Management</h2>
        <Link
          to="/admin/djs/new"
          className="premium-button flex items-center space-x-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add DJ</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total DJs',
            value: djs.length,
            icon: Music,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20'
          },
          {
            label: 'Active DJs',
            value: djs.filter(dj => dj.status === 'active').length,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-900/20'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(djs.reduce((sum, dj) => sum + dj.total_revenue, 0)),
            icon: DollarSign,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20'
          },
          {
            label: 'Upcoming Events',
            value: djs.reduce((sum, dj) => sum + dj.upcoming_events, 0),
            icon: Calendar,
            color: 'text-yellow-400',
            bg: 'bg-yellow-900/20'
          }
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass-effect rounded-xl p-4 border border-gray-800/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-effect rounded-xl p-4 border border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search DJs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Genres</option>
              <option value="house">House</option>
              <option value="techno">Techno</option>
              <option value="deep-house">Deep House</option>
              <option value="industrial">Industrial</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'rating' | 'events');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="events-desc">Most Events</option>
              <option value="events-asc">Least Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* DJs Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">DJ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Genres</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Venues</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Revenue</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredDJs.map((dj) => (
                <tr key={dj.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {dj.avatar_url ? (
                          <img
                            src={dj.avatar_url}
                            alt={dj.full_name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                            <Music className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {dj.full_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {dj.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {dj.genres.map((genre) => (
                        <span
                          key={genre}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/30 text-gray-300"
                        >
                          {genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{dj.events_count} events</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-gray-300">{dj.rating} ({dj.reviews_count} reviews)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{dj.followers_count.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {dj.preferred_venues.map((venue) => (
                        <span
                          key={venue}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/30 text-gray-300"
                        >
                          <Building className="h-3 w-3 mr-1" />
                          {venue}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(dj.status)}
                      <span className={`text-sm capitalize ${
                        dj.status === 'active' ? 'text-green-400' :
                        dj.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {dj.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatCurrency(dj.total_revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative inline-block text-left">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDJs.length === 0 && (
          <div className="text-center py-12">
            <Music className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No DJs found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}