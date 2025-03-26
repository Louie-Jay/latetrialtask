import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music, MapPin, Calendar, Users, Filter, Loader, Instagram, Youtube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';
import SearchBar from '../components/SearchBar';
import MobileFilters from '../components/MobileFilters';

type Member = User & {
  full_name: string;
  bio: string;
  avatar_url: string | null;
  member_type: string;
  genres: string[];
  followers_count: number;
  events_count: number;
  instagram_handle: string;
  youtube_handle?: string;
  featured_event?: {
    id: string;
    name: string;
    event_date: string;
    venue: string;
    image_url: string;
  };
};

function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // Fetch members from Supabase
      const { data: membersData, error: membersError } = await supabase
        .from('users')
        .select(`
          *,
          events!events_user_id_fkey (
            id,
            name,
            event_date,
            venue,
            image_url
          )
        `)
        .in('role', ['dj', 'promoter'])
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;

      // Transform data to include featured event
      const transformedMembers = membersData?.map(member => ({
        ...member,
        featured_event: member.events?.[0]
      })) || [];

      // Get unique genres
      const allGenres = transformedMembers.reduce((acc: string[], member) => {
        if (member.genres) {
          acc.push(...member.genres);
        }
        return acc;
      }, []);
      
      const uniqueGenres = [...new Set(allGenres)];
      setGenres(uniqueGenres);
      setMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || member.role === selectedType;
    const matchesGenre = !selectedGenre || member.genres?.includes(selectedGenre);
    
    return matchesSearch && matchesType && matchesGenre;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getDefaultAvatar = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`;
  };

  const getInstagramUrl = (handle: string) => {
    return `https://instagram.com/${handle.replace('@', '')}`;
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedGenre('');
  };

  const handleFilterChange = (section: string, value: string) => {
    switch (section) {
      case 'type':
        setSelectedType(value);
        break;
      case 'genre':
        setSelectedGenre(value);
        break;
    }
  };

  const filterSections = [
    {
      label: 'Type',
      value: 'type',
      icon: Music,
      options: [
        { label: 'DJs', value: 'dj' },
        { label: 'Promoters', value: 'promoter' }
      ]
    },
    {
      label: 'Genre',
      value: 'genre',
      icon: Music,
      options: genres.map(genre => ({
        label: genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        value: genre
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
        <h1 className="text-5xl font-bold text-gradient mb-4">DJs & Promoters</h1>
        <p className="text-gray-300 text-lg">Discover and follow your favorite artists and event organizers</p>
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
              placeholder="Search DJs & Promoters..."
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Music className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="input-field pl-12 appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="dj">DJs</option>
                <option value="promoter">Promoters</option>
              </select>
            </div>
            
            <div className="relative">
              <Music className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                className="input-field pl-12 appearance-none"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
          type: selectedType,
          genre: selectedGenre
        }}
      />

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="premium-card group"
          >
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <img
                  src={member.avatar_url || getDefaultAvatar(member.full_name)}
                  alt={member.full_name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-purple-500/20"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-gradient transition-colors">
                    {member.full_name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300">
                      {member.member_type === 'dj' ? 'DJ' : 'Promoter'}
                    </span>
                    {member.instagram_handle && (
                      <a
                        href={getInstagramUrl(member.instagram_handle)}
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

              <p className="mt-4 text-gray-400 text-sm line-clamp-2">{member.bio}</p>

              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{member.followers_count.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{member.events_count} events</span>
                </div>
              </div>

              {member.genres && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {member.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800/50 text-gray-300"
                    >
                      {genre.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>
              )}

              {member.featured_event && (
                <div className="mt-4 glass-effect rounded-lg overflow-hidden">
                  <div className="relative h-32">
                    <img
                      src={member.featured_event.image_url}
                      alt={member.featured_event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="text-xs font-medium text-purple-400 mb-1">Next Event</div>
                      <Link
                        to={`/events/${member.featured_event.id}`}
                        className="block group-hover:text-purple-400 transition-colors"
                      >
                        <div className="font-medium text-white text-sm">{member.featured_event.name}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(member.featured_event.event_date)}</span>
                          <MapPin className="h-3 w-3 ml-3 mr-1" />
                          <span>{member.featured_event.venue}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center space-x-3">
                {member.instagram_handle && (
                  <a
                    href={`https://instagram.com/${member.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center p-0 bg-gradient-to-tr from-[#FF7A00] via-[#FF0169] to-[#D300C5] hover:from-[#FF7A00]/90 hover:via-[#FF0169]/90 hover:to-[#D300C5]/90 rounded-full transition-all"
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </a>
                )}
                {member.youtube_handle && (
                  <a
                    href={`https://youtube.com/${member.youtube_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center p-0 bg-[#FF0000] hover:bg-[#FF0000]/90 rounded-full shadow-lg shadow-red-500/20 transition-all"
                  >
                    <Youtube className="h-6 w-6 text-white" />
                  </a>
                )}
                <Link
                  to={`/members/${member.id}`}
                  className="secondary-button h-12 flex-1 flex items-center justify-center space-x-2 text-sm font-medium"
                >
                  <Music className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-lg font-medium text-white">No members found</h3>
          <p className="mt-1 text-gray-400">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

export default Members;