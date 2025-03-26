import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Palette, MapPin, Calendar, Users, Filter, Loader, Instagram, Youtube, Globe, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';
import SearchBar from '../components/SearchBar';
import MobileFilters from '../components/MobileFilters';

type Creative = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  specialties: string[];
  followers_count: number;
  projects_count: number;
  instagram_handle: string;
  youtube_handle?: string;
  website_url?: string;
  featured_work?: {
    id: string;
    title: string;
    description: string;
    image_url: string;
  };
};

function Creatives() {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchCreatives();
  }, []);

  const fetchCreatives = async () => {
    try {
      // Fetch creatives from Supabase
      const { data: creativesData, error: creativesError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'creator')
        .order('created_at', { ascending: false });

      if (creativesError) throw creativesError;

      // Get unique specialties
      const allSpecialties = creativesData?.reduce((acc: string[], creative) => {
        if (creative.specialties) {
          acc.push(...creative.specialties);
        }
        return acc;
      }, []) || [];
      
      const uniqueSpecialties = [...new Set(allSpecialties)];
      setSpecialties(uniqueSpecialties);
      setCreatives(creativesData || []);
    } catch (err) {
      console.error('Error fetching creatives:', err);
      setError('Failed to load creatives');
    } finally {
      setLoading(false);
    }
  };

  const filteredCreatives = creatives.filter(creative => {
    const matchesSearch = creative.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         creative.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || creative.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const getDefaultAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
  };

  const getInstagramUrl = (handle: string) => {
    return `https://instagram.com/${handle.replace('@', '')}`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
  };

  const handleFilterChange = (section: string, value: string) => {
    switch (section) {
      case 'specialty':
        setSelectedSpecialty(value);
        break;
    }
  };

  const filterSections = [
    {
      label: 'Specialty',
      value: 'specialty',
      icon: Palette,
      options: specialties.map(specialty => ({
        label: specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: specialty
      }))
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
        <h1 className="text-5xl font-bold text-gradient mb-4">Creatives</h1>
        <p className="text-gray-300 text-lg">Discover talented visual artists, stage designers, and more</p>
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
              placeholder="Search creatives..."
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Palette className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="input-field pl-12 appearance-none"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
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
          specialty: selectedSpecialty
        }}
      />

      {/* Creatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatives.map((creative) => (
          <div
            key={creative.id}
            className="premium-card group"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={creative.avatar_url || getDefaultAvatar(creative.full_name)}
                  alt={creative.full_name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-gradient transition-colors">
                    {creative.full_name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-900/50 text-pink-300">
                      Creative
                    </span>
                    {creative.instagram_handle && (
                      <a
                        href={getInstagramUrl(creative.instagram_handle)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        <Instagram className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-gray-400 text-sm line-clamp-2">{creative.bio}</p>

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{creative.followers_count.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  <span>{creative.projects_count} projects</span>
                </div>
              </div>

              {creative.specialties && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {creative.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300"
                    >
                      {specialty.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>
              )}

              {creative.featured_work && (
                <div className="mt-4 glass-effect rounded-lg overflow-hidden">
                  <div className="relative h-32">
                    <img
                      src={creative.featured_work.image_url}
                      alt={creative.featured_work.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-xs font-medium text-purple-400 mb-1">Featured Work</div>
                      <div className="font-medium text-white text-sm">{creative.featured_work.title}</div>
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {creative.featured_work.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center space-x-3">
                {creative.instagram_handle && (
                  <a
                    href={`https://instagram.com/${creative.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center p-0 bg-gradient-to-tr from-[#FF7A00] via-[#FF0169] to-[#D300C5] hover:from-[#FF7A00]/90 hover:via-[#FF0169]/90 hover:to-[#D300C5]/90 rounded-full transition-all"
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </a>
                )}
                {creative.youtube_handle && (
                  <a
                    href={`https://youtube.com/${creative.youtube_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center p-0 bg-[#FF0000] hover:bg-[#FF0000]/90 rounded-full shadow-lg shadow-red-500/20 transition-all"
                  >
                    <Youtube className="h-6 w-6 text-white" />
                  </a>
                )}
                <Link
                  to={`/creatives/${creative.id}`}
                  className="secondary-button h-12 flex-1 flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <Palette className="h-5 w-5" />
                  <span>View Portfolio</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCreatives.length === 0 && (
        <div className="text-center py-12">
          <Palette className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-lg font-medium text-white">No creatives found</h3>
          <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Creatives;