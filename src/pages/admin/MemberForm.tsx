import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Mail, 
  Instagram, 
  Loader,
  ArrowLeft,
  User as UserIcon,
  Info,
  Save,
  X,
  Youtube,
  Link as LinkIcon,
  Hash
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/database';
import ImageUpload from '../../components/ImageUpload';

type MemberFormProps = {
  type: 'dj' | 'promoter';
};

export default function MemberForm({ type }: MemberFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    bio: '',
    avatar_url: '',
    member_type: type,
    genres: [] as string[],
    instagram_handle: '',
    youtube_handle: '',
    website_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
      });

      if (authError) throw authError;

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email: formData.email,
          role: type,
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          member_type: formData.member_type,
          genres: formData.genres,
          instagram_handle: formData.instagram_handle,
          youtube_handle: formData.youtube_handle,
          website_url: formData.website_url
        }]);

      if (profileError) throw profileError;

      navigate('/admin');
    } catch (err) {
      console.error('Error creating member:', err);
      setError('Failed to create member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenres = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      genres: selectedGenres
    }));
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="text-purple-400 hover:text-purple-300 mb-6 flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold text-gradient mb-2">
          Create New {type === 'dj' ? 'DJ' : 'Promoter'}
        </h1>
        <p className="text-gray-400">
          Fill in the details below to create a new {type === 'dj' ? 'DJ' : 'promoter'} profile
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Preview Card */}
        <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="p-6 flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl overflow-hidden">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt={formData.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-white">
                  {formData.full_name || 'Member Name'}
                </h2>
                <span className="px-3 py-1 text-sm font-medium bg-purple-900/50 text-purple-300 rounded-full">
                  {type === 'dj' ? 'DJ' : 'Promoter'}
                </span>
              </div>
              <p className="text-gray-400 mt-2 line-clamp-2">
                {formData.bio || 'Member bio will appear here'}
              </p>
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
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="input-field w-full"
                  placeholder="Write a brief bio"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Image
                </label>
                <ImageUpload
                  value={formData.avatar_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  bucket="profiles"
                  path="avatars"
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Music className="h-5 w-5 mr-2 text-purple-400" />
              Professional Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genres
                </label>
                <select
                  multiple
                  name="genres"
                  value={formData.genres}
                  onChange={handleGenreChange}
                  className="input-field w-full min-h-[120px]"
                >
                  <option value="house">House</option>
                  <option value="techno">Techno</option>
                  <option value="trance">Trance</option>
                  <option value="drum-and-bass">Drum and Bass</option>
                  <option value="dubstep">Dubstep</option>
                  <option value="hip-hop">Hip Hop</option>
                  <option value="rnb">R&B</option>
                </select>
                <p className="mt-2 text-xs text-gray-400">
                  Hold Ctrl/Cmd to select multiple genres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Instagram Handle
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  YouTube Handle
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="youtube_handle"
                    value={formData.youtube_handle}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="@channel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
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
                Creating Profile...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Create Profile
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}