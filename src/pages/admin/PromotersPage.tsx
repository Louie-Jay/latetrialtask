import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star,
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
  Crown,
  DollarSign,
  Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/database';

type ExtendedPromoter = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  company_name: string;
  event_types: string[];
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

export default function PromotersPage() {
  const [promoters, setPromoters] = useState<ExtendedPromoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'events'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchPromoters();
  }, []);

  const fetchPromoters = async () => {
    try {
      // Simulated promoters data
      const dummyPromoters: ExtendedPromoter[] = [
        {
          id: '1',
          email: 'events@nightlife.com',
          role: 'promoter',
          points: 2500,
          created_at: new Date().toISOString(),
          full_name: 'Sarah Johnson',
          bio: 'Premier event promoter specializing in electronic music events',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
          company_name: 'Nightlife Events',
          event_types: ['electronic', 'house', 'techno'],
          followers_count: 25000,
          events_count: 150,
          instagram_handle: '@nightlifeevents',
          youtube_handle: '@nightlife_official',
          website_url: 'https://nightlifeevents.com',
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
          email: 'underground@events.com',
          role: 'promoter',
          points: 1800,
          created_at: new Date().toISOString(),
          full_name: 'Mike Thompson',
          bio: 'Underground event curator focusing on techno and industrial',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80',
          company_name: 'Underground Events',
          event_types: ['techno', 'industrial', 'experimental'],
          followers_count: 15000,
          events_count: 85,
          instagram_handle: '@underground_events',
          youtube_handle: '@underground_official',
          website_url: 'https://undergroundevents.com',
          rating: 4.7,
          reviews_count: 180,
          status: 'active',
          upcoming_events: 5,
          total_revenue: 280000,
          average_event_attendance: 500,
          preferred_venues: ['The Basement', 'Factory Hall']
        }
      ];

      setPromoters(dummyPromoters);
      setError(null);
    } catch (err) {
      console.error('Error fetching promoters:', err);
      setError('Failed to load promoters');
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

  const filteredPromoters = promoters.filter(promoter => {
    const matchesSearch = 
      promoter.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promoter.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType = !eventTypeFilter || promoter.event_types.includes(eventTypeFilter);
    const matchesStatus = !statusFilter || promoter.status === statusFilter;
    
    return matchesSearch && matchesEventType && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.company_name.localeCompare(b.company_name)
        : b.company_name.localeCompare(a.company_name);
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
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading Promoters</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Promoter Management</h2>
        <Link
          to="/admin/promoters/new"
          className="premium-button flex items-center space-x-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Promoter</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Promoters',
            value: promoters.length,
            icon: Star,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20'
          },
          {
            label: 'Active Promoters',
            value: promoters.filter(p => p.status === 'active').length,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-900/20'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(promoters.reduce((sum, p) => sum + p.total_revenue, 0)),
            icon: DollarSign,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20'
          },
          {
            label: 'Upcoming Events',
            value: promoters.reduce((sum, p) => sum + p.upcoming_events, 0),
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
              placeholder="Search promoters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Event Type Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Event Types</option>
              <option value="electronic">Electronic</option>
              <option value="house">House</option>
              <option value="techno">Techno</option>
              <option value="industrial">Industrial</option>
              <option value="experimental">Experimental</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Crown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
              <option value="name-asc">Company (A-Z)</option>
              <option value="name-desc">Company (Z-A)</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
              <option value="events-desc">Most Events</option>
              <option value="events-asc">Least Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Promoters Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Promoter</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Event Types</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Venues</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Revenue</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredPromoters.map((promoter) => (
                <tr key={promoter.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {promoter.avatar_url ? (
                          <img
                            src={promoter.avatar_url}
                            alt={promoter.full_name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                            <Star className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {promoter.company_name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {promoter.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {promoter.event_types.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/30 text-gray-300"
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{promoter.events_count} events</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-gray-300">{promoter.rating} ({promoter.reviews_count} reviews)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{promoter.followers_count.toLocaleString()} followers</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {promoter.preferred_venues.map((venue) => (
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
                      {getStatusIcon(promoter.status)}
                      <span className={`text-sm capitalize ${
                        promoter.status === 'active' ? 'text-green-400' :
                        promoter.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {promoter.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatCurrency(promoter.total_revenue)}
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

        {filteredPromoters.length === 0 && (
          <div className="text-center py-12">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No promoters found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}