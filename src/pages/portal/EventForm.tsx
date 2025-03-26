import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Loader,
  ArrowLeft,
  Music,
  Info,
  Save,
  X,
  Search,
  Plus,
  Percent,
  Clock,
  UserPlus,
  Palette,
  Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event, User } from '../../types/database';
import ImageUpload from '../../components/ImageUpload';

type Collaborator = {
  id: string;
  full_name: string;
  role: 'dj' | 'promoter' | 'creator';
  avatar_url?: string | null;
};

type CollaboratorInvite = {
  userId: string;
  role: 'dj' | 'promoter' | 'creator';
  revenueShare?: number;
};

export default function EventForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<{ id: string; name: string; }[]>([]);
  const [collaborators, setCollaborators] = useState<CollaboratorInvite[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Collaborator[]>([]);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'dj' | 'promoter' | 'creator'>('dj');
  const [revenueShare, setRevenueShare] = useState<number>(0);
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    description: '',
    venue: '',
    event_date: '',
    individual_price: 0,
    group_price: null,
    discount_code: '',
    image_url: '',
    capacity: 0
  });

  useEffect(() => {
    fetchVenues();
    fetchPotentialCollaborators();
  }, [searchTerm, selectedRole]);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name');

      if (error) throw error;
      setVenues(data || []);
    } catch (err) {
      console.error('Error fetching venues:', err);
    }
  };

  const fetchPotentialCollaborators = async () => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, role, avatar_url')
        .eq('role', selectedRole)
        .ilike('full_name', `%${searchTerm}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data as Collaborator[]);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Add collaborators
      if (collaborators.length > 0) {
        const collaboratorPromises = collaborators.map(async (collab) => {
          // Create collaboration record
          const { error: collabError } = await supabase
            .from('event_collaborators')
            .insert({
              event_id: event.id,
              user_id: collab.userId,
              role: collab.role,
              status: 'pending'
            });

          if (collabError) throw collabError;

          // If creator, add revenue share
          if (collab.role === 'creator' && collab.revenueShare) {
            const { error: shareError } = await supabase
              .from('creator_revenue_shares')
              .insert({
                event_id: event.id,
                creator_id: collab.userId,
                share_percentage: collab.revenueShare
              });

            if (shareError) throw shareError;
          }
        });

        await Promise.all(collaboratorPromises);
      }

      navigate('/portal/dashboard');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCollaborator = (collaborator: Collaborator) => {
    if (!collaborators.find(c => c.userId === collaborator.id)) {
      setCollaborators(prev => [...prev, {
        userId: collaborator.id,
        role: selectedRole,
        revenueShare: selectedRole === 'creator' ? revenueShare : undefined
      }]);
      setSearchTerm('');
      setShowCollaboratorModal(false);
      setRevenueShare(0);
    }
  };

  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(prev => prev.filter(c => c.userId !== userId));
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/portal/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/portal/dashboard')}
        className="text-purple-400 hover:text-purple-300 mb-6 flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>
      <h1 className="text-4xl font-bold text-gradient mb-2">Create New Event</h1>
      <p className="text-gray-400">Fill in the details below to create a new event</p>

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {/* Preview Card */}
        <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="relative h-64">
            {formData.image_url ? (
              <img
                src={formData.image_url}
                alt="Event Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <Music className="h-16 w-16 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {formData.name || 'Event Name'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    {formData.event_date
                      ? new Date(formData.event_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Date TBD'}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{formData.venue || 'Venue TBD'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Info className="h-5 w-5 mr-2 text-purple-400" />
              Basic Information
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Describe your event"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Image
                </label>
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  bucket="events"
                  path="images"
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-400" />
              Event Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue
                </label>
                <select
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.name}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                  min="1"
                  className="input-field w-full"
                  placeholder="Enter maximum capacity"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-purple-400" />
              Pricing
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Individual Ticket Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="individual_price"
                    value={formData.individual_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Group Ticket Price (Optional)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="group_price"
                    value={formData.group_price || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input-field w-full pl-10"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Discount Code (Optional)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="discount_code"
                    value={formData.discount_code || ''}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="Enter discount code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collaborators Section */}
        <div className="glass-effect rounded-xl p-6 border border-gray-800/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Collaborators</h3>
            <button
              type="button"
              onClick={() => setShowCollaboratorModal(true)}
              className="secondary-button flex items-center space-x-2"
            >
              <UserPlus className="h-5 w-5" />
              <span>Add Collaborator</span>
            </button>
          </div>

          {/* Collaborator List */}
          <div className="space-y-4">
            {collaborators.map((collab) => {
              const collaborator = searchResults.find(r => r.id === collab.userId);
              return (
                <div
                  key={collab.userId}
                  className="flex items-center justify-between p-4 glass-effect rounded-lg border border-purple-500/20"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-purple-900/20">
                      {collab.role === 'dj' && <Music className="h-5 w-5 text-purple-400" />}
                      {collab.role === 'promoter' && <Star className="h-5 w-5 text-purple-400" />}
                      {collab.role === 'creator' && <Palette className="h-5 w-5 text-purple-400" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{collaborator?.full_name}</div>
                      <div className="text-sm text-gray-400 capitalize">{collab.role}</div>
                    </div>
                    {collab.revenueShare && (
                      <div className="text-sm text-purple-400">
                        {collab.revenueShare}% Revenue Share
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCollaborator(collab.userId)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}

            {collaborators.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No collaborators added yet</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="glass-effect rounded-xl p-4 border border-red-500/20 bg-red-900/20">
            <p className="text-red-400 text-sm flex items-center">
              <X className="h-4 w-4 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="secondary-button px-6 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="premium-button px-6 py-3"
          >
            {loading ? (
              <span className="flex items-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Creating Event...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Create Event
              </span>
            )}
          </button>
        </div>
      </form>

      {/* Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Add Collaborator</h3>
                <button
                  onClick={() => setShowCollaboratorModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Collaborator Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { role: 'dj' as const, icon: Music, label: 'DJ' },
                    { role: 'promoter' as const, icon: Star, label: 'Promoter' },
                    { role: 'creator' as const, icon: Palette, label: 'Creative' }
                  ].map((option) => (
                    <button
                      key={option.role}
                      type="button"
                      onClick={() => setSelectedRole(option.role)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        selectedRole === option.role
                          ? 'border-purple-500 bg-purple-900/20 text-white'
                          : 'border-gray-800 text-gray-400 hover:border-purple-500/50'
                      }`}
                    >
                      <option.icon className="h-5 w-5 mb-2" />
                      <div className="text-sm">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search {selectedRole === 'dj' ? 'DJs' : selectedRole === 'promoter' ? 'Promoters' : 'Creatives'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field w-full pl-10"
                    placeholder={`Search by name...`}
                  />
                </div>
              </div>

              {/* Revenue Share for Creators */}
              {selectedRole === 'creator' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Revenue Share Percentage
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={revenueShare}
                      onChange={(e) => setRevenueShare(Number(e.target.value))}
                      min="0"
                      max="100"
                      className="input-field w-full pl-10"
                      placeholder="Enter percentage"
                    />
                  </div>
                </div>
              )}

              {/* Search Results */}
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleAddCollaborator(result)}
                    className="w-full p-4 glass-effect rounded-lg border border-gray-800/50 hover:border-purple-500/20 transition-colors text-left"
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="font-medium text-white">{result.full_name}</div>
                        <div className="text-sm text-gray-400 capitalize">{result.role}</div>
                      </div>
                      <Plus className="h-5 w-5 text-purple-400" />
                    </div>
                  </button>
                ))}

                {searchTerm && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No results found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}