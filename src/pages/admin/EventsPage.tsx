import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Loader,
  Music,
  Clock,
  DollarSign,
  MoreVertical,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ticket
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../types/database';

type ExtendedEvent = Event & {
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
};

export default function EventsPage() {
  const [events, setEvents] = useState<ExtendedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [venueFilter, setVenueFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'event_date' | 'tickets_sold'>('event_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Simulated events data
      const dummyEvents: ExtendedEvent[] = [
        {
          id: '1',
          name: 'Neon Dreams Festival',
          description: 'Experience the ultimate electronic music festival',
          venue: 'Warehouse 23',
          event_date: '2024-03-15T20:00:00Z',
          individual_price: 89.99,
          group_price: 299.99,
          discount_code: 'NEON20',
          image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80',
          tickets_sold: 750,
          capacity: 1000,
          status: 'upcoming',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Deep House Sessions',
          description: 'An intimate night of deep house music',
          venue: 'Club Nova',
          event_date: '2024-03-20T21:00:00Z',
          individual_price: 49.99,
          group_price: 179.99,
          discount_code: 'DEEP10',
          image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80',
          tickets_sold: 180,
          capacity: 300,
          status: 'upcoming',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Techno Underground',
          description: 'Raw and unfiltered techno music',
          venue: 'The Basement',
          event_date: '2024-03-25T22:00:00Z',
          individual_price: 39.99,
          group_price: 139.99,
          discount_code: 'TECHNO15',
          image_url: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?auto=format&fit=crop&q=80',
          tickets_sold: 220,
          capacity: 400,
          status: 'live',
          created_at: new Date().toISOString()
        }
      ];

      setEvents(dummyEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'live':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || event.status === statusFilter;
    const matchesVenue = !venueFilter || event.venue === venueFilter;
    
    return matchesSearch && matchesStatus && matchesVenue;
  }).sort((a, b) => {
    if (sortBy === 'event_date') {
      return sortOrder === 'asc'
        ? new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
        : new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
    }
    return sortOrder === 'asc'
      ? a.tickets_sold - b.tickets_sold
      : b.tickets_sold - a.tickets_sold;
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
        <h3 className="mt-2 text-lg font-medium text-white">Error Loading Events</h3>
        <p className="mt-1 text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Event Management</h2>
        <Link
          to="/admin/events/new"
          className="premium-button flex items-center space-x-2"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Create Event</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Events',
            value: events.length,
            icon: Calendar,
            color: 'text-purple-400',
            bg: 'bg-purple-900/20'
          },
          {
            label: 'Live Events',
            value: events.filter(e => e.status === 'live').length,
            icon: Music,
            color: 'text-green-400',
            bg: 'bg-green-900/20'
          },
          {
            label: 'Total Tickets',
            value: events.reduce((sum, e) => sum + e.tickets_sold, 0),
            icon: Ticket,
            color: 'text-blue-400',
            bg: 'bg-blue-900/20'
          },
          {
            label: 'Total Revenue',
            value: formatPrice(events.reduce((sum, e) => sum + (e.tickets_sold * e.individual_price), 0)),
            icon: DollarSign,
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Venue Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={venueFilter}
              onChange={(e) => setVenueFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="">All Venues</option>
              {Array.from(new Set(events.map(e => e.venue))).map(venue => (
                <option key={venue} value={venue}>{venue}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'event_date' | 'tickets_sold');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="event_date-asc">Date (Earliest First)</option>
              <option value="event_date-desc">Date (Latest First)</option>
              <option value="tickets_sold-desc">Most Tickets Sold</option>
              <option value="tickets_sold-asc">Least Tickets Sold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Event</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Venue</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Tickets</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Price</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="group hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.name}
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
                          {event.name}
                        </div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{event.venue}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatDate(event.event_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <span className={`text-sm capitalize ${
                        event.status === 'live' ? 'text-green-400' :
                        event.status === 'upcoming' ? 'text-blue-400' :
                        event.status === 'cancelled' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        {event.tickets_sold}/{event.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatPrice(event.individual_price)}
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

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No events found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}