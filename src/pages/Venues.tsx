import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Music, Users, Filter, Loader, Star, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Venue } from '../types/database';
import SearchBar from '../components/SearchBar';
import MobileFilters from '../components/MobileFilters';

function Venues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      // Fetch venues from Supabase
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true });

      if (venuesError) throw venuesError;
      setVenues(venuesData || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const getAmenityLabel = (amenity: string) => {
    return amenity.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = !selectedCapacity || 
      (selectedCapacity === 'small' && venue.capacity <= 200) ||
      (selectedCapacity === 'medium' && venue.capacity > 200 && venue.capacity <= 500) ||
      (selectedCapacity === 'large' && venue.capacity > 500);
    
    return matchesSearch && matchesCapacity;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCapacity('');
  };

  const handleFilterChange = (section: string, value: string) => {
    switch (section) {
      case 'capacity':
        setSelectedCapacity(value);
        break;
    }
  };

  const filterSections = [
    {
      label: 'Capacity',
      value: 'capacity',
      icon: Users,
      options: [
        { label: 'Small (≤ 200)', value: 'small' },
        { label: 'Medium (201-500)', value: 'medium' },
        { label: 'Large (500+)', value: 'large' }
      ]
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
        <h1 className="text-5xl font-bold text-gradient mb-4">Venues</h1>
        <p className="text-gray-300 text-lg">Discover the perfect venue for your next event</p>
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
              placeholder="Search venues..."
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="input-field pl-12 appearance-none"
                value={selectedCapacity}
                onChange={(e) => setSelectedCapacity(e.target.value)}
              >
                <option value="">All Capacities</option>
                <option value="small">Small (≤ 200)</option>
                <option value="medium">Medium (201-500)</option>
                <option value="large">Large (500+)</option>
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
          capacity: selectedCapacity
        }}
      />

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredVenues.map((venue) => (
          <Link
            key={venue.id}
            to={`/venues/${venue.id}`}
            className="premium-card card-hover group relative overflow-hidden"
          >
            {/* Venue Image Container */}
            <div className="relative h-[28rem] overflow-hidden">
              <div className="absolute inset-0 w-full h-full transform transition-transform duration-500 group-hover:scale-110">
                {venue.image_url ? (
                  <img
                    src={venue.image_url}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                    <Music className="h-16 w-16 text-white/20" />
                  </div>
                )}
                {/* Gradient Overlay - extends beyond image */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-premium-black opacity-90 group-hover:opacity-95 transition-opacity" />
              </div>

              {/* Capacity Badge */}
              <div className="absolute top-4 right-4 glass-effect rounded-lg px-4 py-2 text-white text-sm font-medium border border-purple-500/20 group-hover:border-purple-500/40 transition-colors z-10">
                <Users className="h-4 w-4 inline mr-2" />
                {venue.capacity.toLocaleString()} capacity
              </div>

              {/* Venue Details - Moved inside the image container for overlay effect */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors">
                  {venue.name}
                </h3>
                
                <div className="space-y-2 text-gray-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{venue.address}</span>
                  </div>
                </div>

                <p className="mt-3 text-gray-300 line-clamp-2">
                  {venue.description}
                </p>

                {/* Amenities */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {venue.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300"
                    >
                      {getAmenityLabel(amenity)}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center space-x-1 text-gray-300">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{venue.upcoming_events_count} upcoming events</span>
                    </div>
                    <span className="text-purple-400 flex items-center text-xs">
                      View Details
                      <ChevronRight className="h-3.5 w-3.5 ml-0.5 transform transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                  <div className="h-1 bg-gray-800/50 rounded-full overflow-hidden">
                    <div
                      className="h-full premium-gradient rounded-full transition-all duration-500 shadow-lg"
                      style={{
                        width: `${(venue.upcoming_events_count / 20) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-lg font-medium text-white">No venues found</h3>
          <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Venues;