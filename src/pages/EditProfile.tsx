import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  Mail, 
  Instagram, 
  Youtube,
  Globe,
  User,
  Save,
  ArrowLeft,
  Loader,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import ImageUpload from '../components/ImageUpload';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    avatar_url: '',
    genres: [] as string[],
    instagram_handle: '',
    youtube_handle: '',
    website_url: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        genres: profile.genres || [],
        instagram_handle: profile.instagram_handle || '',
        youtube_handle: profile.youtube_handle || '',
        website_url: profile.website_url || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('users')
        .update(formData)
        .eq('id', user.id);

      if (updateError) throw updateError;

      navigate('/account');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/account')}
        className="text-purple-400 hover:text-purple-300 mb-6 flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Account
      </button>

      <h1 className="text-4xl font-bold text-gradient mb-2">Edit Profile</h1>
      <p className="text-gray-400 mb-8">Update your profile information and social links</p>

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
                    <User className="h-8 w-8 text-white/20" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {formData.full_name || 'Your Name'}
              </h2>
              <p className="text-gray-400 mt-2 line-clamp-2">
                {formData.bio || 'Add a bio to tell people about yourself'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6">Basic Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="Enter your name"
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
                  placeholder="Tell people about yourself"
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
            <h3 className="text-lg font-semibold text-white mb-6">Professional Details</h3>
            
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
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
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
            onClick={() => navigate('/account')}
            className="secondary-button px-6 py-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="premium-button px-6 py-3"
          >
            {saving ? (
              <span className="flex items-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Saving Changes...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}