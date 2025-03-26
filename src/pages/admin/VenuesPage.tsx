import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building,
  Users,
  Search,
  Filter,
  Loader,
  Calendar,
  MapPin,
  MoreVertical,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Music,
  Volume2,
  Lightbulb,
  Wine,
  Crown,
  Cigarette,
  Car,
  Shield,
  Shirt,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Venue } from '../../types/database';

type ExtendedVenue = Venue & {
  status: 'active' | 'maintenance' | 'closed';
  total_events: number;
  upcoming_events: number;
  total_revenue: number;
  average_attendance: number;
  last_event_date: string;
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<ExtendedVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [capacityFilter, setCapacityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'capacity' | 'events'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      // Simulated venues data
      const dummyVenues: ExtendedVenue[] = [
        {
          id: '1',
          name: 'Club Nova',
          description: 'Premium nightclub with state-of-the-art sound system',
          address: '123 Downtown Avenue',
          capacity: 800,
          image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80',
          amenities: ['sound-system', 'lighting', 'bar', 'vip', 'smoking', 'coat-check'],
          upcoming_events_count: 8,
          created_at: new Date().toISOString(),
          status: 'active',
          total_events: 150,
          upcoming_events: 8,
          total_revenue: 750000,
          average_attendance: 600,
          last_event_date: '2024-02-15T20:00:00Z'
        },
        {
          id: '2',
          name: 'Warehouse 23',
          description: 'Industrial space perfect for large events',
          address: '45 Industrial District',
          capacity: 2000,
          image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80',
          amenities: ['sound-system', 'lighting', 'bar', 'parking', 'security'],
          upcoming_events_count: 12,
          created_at: new Date().toISOString(),
          status: 'active',
          total_events: 85,
          upcoming_events: 12,
          total_revenue: 1250000,
          average_attendance: 1500,
          last_event_date: '2024-02-20T21:00:00Z'
        }
      ];

      setVenues(dummyVenues);
      setError(null);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues');
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
      case 'maintenance':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'sound-system':
        return <Volume2 className="h-4 w-4" />;
      case 'lighting':
        return <Lightbulb className="h-4 w-4" />;
      case 'bar':
        return <Wine className="h-4 w-4" />;
      case 'vip':
        return <Crown className="h-4 w-4" />;
      case 'smoking':
        return <Cigarette className="h-4 w-4" />;
      case 'parking':
        return <Car className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'coat-check':
        return <Shirt className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  const getAmenityLabel = (amenity: string) => {
    return amenity.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = !capacityFilter || 
      (capacityFilter === 'small' && venue.capacity <= 500) ||
      (capacityFilter === 'medium' && venue.capacity > 500 && venue.capacity <= 1000) ||
      (capacityFilter === 'large' && venue.capacity > 1000);
    const matchesStatus = !statusFilter || venue.status === statusFilter;
    
    return matchesSearch && matchesCapacity && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    const aValue = sortBy === 'capacity' ? a.capacity : a.total_events;
    const bValue = sortBy === 'capacity' ? b.capacity : b.total_events;
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
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading Venues</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Venue Management</h2>
        <Link
          to="/admin/venues/new"
          className="premium-button flex items-center space-x-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add Venue</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Venues',
            value: venues.length,
            icon: Building,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20'
          },
          {
            label: 'Active Venues',
            value: venues.filter(v => v.status === 'active').length,
            icon: CheckCircle,
            color: 'text-green-400',
            bg: 'bg-green-900/20'
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(venues.reduce((sum, v) => sum + v.total_revenue, 0)),
            icon: DollarSign,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20'
          },
          {
            label: 'Upcoming Events',
            value: venues.reduce((sum, v) => sum + v.upcoming_events, 0),
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
              placeholder="Search venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Capacity Filter */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Capacities</option>
              <option value="small">Small (≤ 500)</option>
              <option value="medium">Medium (501-1000)</option>
              <option value="large">Large (1000+)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'capacity' | 'events');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="capacity-desc">Highest Capacity</option>
              <option value="capacity-asc">Lowest Capacity</option>
              <option value="events-desc">Most Events</option>
              <option value="events-asc">Least Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Venues Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Venue</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Location</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amenities</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Revenue</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredVenues.map((venue) => (
                <tr key={venue.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {venue.image_url ? (
                          <img
                            src={venue.image_url}
                            alt={venue.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-purple-900/30 flex items-center justify-center">
                            <Building className="h-5 w-5 text-purple-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {venue.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {venue.capacity.toLocaleString()} capacity
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {venue.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity) => (
                        <span
                          key={amenity}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/30 text-gray-300"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="ml-1">{getAmenityLabel(amenity)}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{venue.total_events} total events</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{venue.average_attendance.toLocaleString()} avg. attendance</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Music className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-300">{venue.upcoming_events} upcoming</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(venue.status)}
                      <span className={`text-sm capitalize ${
                        venue.status === 'active' ? 'text-green-400' :
                        venue.status === 'maintenance' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {venue.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatCurrency(venue.total_revenue)}
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

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No venues found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}