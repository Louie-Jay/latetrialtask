import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Music, Filter, Loader, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/database';
import SearchBar from '../components/SearchBar';
import MobileFilters from '../components/MobileFilters';

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [venues, setVenues] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Fetch events from Supabase
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .gt('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Get unique venues for filter
      const uniqueVenues = [...new Set((eventsData || []).map(event => event.venue))];
      setVenues(uniqueVenues);
      setEvents(eventsData || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || new Date(event.event_date).toLocaleDateString() === new Date(selectedDate).toLocaleDateString();
    const matchesVenue = !selectedVenue || event.venue === selectedVenue;
    
    return matchesSearch && matchesDate && matchesVenue;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: string) => {
    const eventDate = new Date(date);
    return `${eventDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })} • ${eventDate.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDate('');
    setSelectedVenue('');
  };

  const handleFilterChange = (section: string, value: string) => {
    switch (section) {
      case 'date':
        setSelectedDate(value);
        break;
      case 'venue':
        setSelectedVenue(value);
        break;
    }
  };

  const filterSections = [
    {
      label: 'Date',
      value: 'date',
      icon: Calendar,
      options: [
        { label: 'Today', value: new Date().toISOString().split('T')[0] },
        { label: 'Tomorrow', value: new Date(Date.now() + 86400000).toISOString().split('T')[0] },
        { label: 'This Week', value: 'week' },
        { label: 'This Month', value: 'month' }
      ]
    },
    {
      label: 'Venue',
      value: 'venue',
      icon: MapPin,
      options: venues.map(venue => ({ label: venue, value: venue }))
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gradient mb-4">Upcoming Events</h1>
        <p className="text-gray-300 text-lg">Discover the most exclusive events in your area</p>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search Bar - Visible on all screens */}
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onFilterClick={() => setShowMobileFilters(true)}
              placeholder="Search events..."
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                className="input-field pl-12"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="input-field pl-12 appearance-none"
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
              >
                <option value="">All Venues</option>
                {venues.map((venue) => (
                  <option key={venue} value={venue}>{venue}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleClearFilters}
              className="secondary-button flex items-center space-x-2"
            >
              <Filter className="h-5 w-5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      <MobileFilters
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        onClearFilters={handleClearFilters}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterSections={filterSections}
        onFilterChange={handleFilterChange}
        selectedFilters={{
          date: selectedDate,
          venue: selectedVenue
        }}
      />

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => (
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

              {/* Event Details */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  {event.name}
                </h3>
                
                <p className="text-gray-300 line-clamp-2 mb-4">
                  {event.description}
                </p>

                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center text-sm space-x-2">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center text-sm space-x-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Capacity Indicator */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="stats-badge">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <div className="pulse-dot" />
                      <span className="value">{event.capacity - event.tickets_sold} spots left</span>
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

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-lg font-medium text-white">No events found</h3>
          <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Events;