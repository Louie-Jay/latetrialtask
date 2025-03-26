import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  Loader,
  ArrowLeft,
  Info,
  Save,
  X,
  Volume2,
  Lightbulb,
  Wine,
  Crown,
  Cigarette,
  Car,
  Shield,
  Shirt,
  Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Venue } from '../../types/database';
import ImageUpload from '../../components/ImageUpload';

export default function VenueForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Venue>>({
    name: '',
    description: '',
    address: '',
    capacity: 0,
    image_url: '',
    amenities: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('venues')
        .insert([formData]);

      if (error) throw error;
      navigate('/admin');
    } catch (err) {
      console.error('Error creating venue:', err);
      setError('Failed to create venue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked
        ? [...(prev.amenities || []), value]
        : (prev.amenities || []).filter(a => a !== value)
    }));
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin');
    }
  };

  const amenityOptions = [
    { value: 'sound-system', label: 'Professional Sound System', icon: Volume2 },
    { value: 'lighting', label: 'Stage Lighting', icon: Lightbulb },
    { value: 'bar', label: 'Full Bar', icon: Wine },
    { value: 'vip', label: 'VIP Areas', icon: Crown },
    { value: 'smoking', label: 'Smoking Area', icon: Cigarette },
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'coat-check', label: 'Coat Check', icon: Shirt }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin')}
        className="text-purple-400 hover:text-purple-300 mb-6 flex items-center"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>
      <h1 className="text-4xl font-bold text-gradient mb-2">Create New Venue</h1>
      <p className="text-gray-400">Fill in the details below to create a new venue</p>

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {/* Preview Card */}
        <div className="glass-effect rounded-xl border border-gray-800/50 overflow-hidden">
          <div className="relative h-64">
            {formData.image_url ? (
              <img
                src={formData.image_url}
                alt="Venue Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                <Building className="h-16 w-16 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {formData.name || 'Venue Name'}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{formData.address || 'Address TBD'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{formData.capacity ? `${formData.capacity} capacity` : 'Capacity TBD'}</span>
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
                  Venue Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter venue name"
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
                  placeholder="Describe your venue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue Image
                </label>
                <ImageUpload
                  value={formData.image_url || ''}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  bucket="venues"
                  path="images"
                />
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Building className="h-5 w-5 mr-2 text-purple-400" />
              Venue Details
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="input-field w-full pl-10"
                    placeholder="Enter venue address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="input-field w-full pl-10"
                    placeholder="Enter maximum capacity"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {amenityOptions.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                        formData.amenities?.includes(amenity.value)
                          ? 'border-purple-500 bg-purple-900/20 text-white'
                          : 'border-gray-800 text-gray-400 hover:border-purple-500/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={amenity.value}
                        checked={formData.amenities?.includes(amenity.value)}
                        onChange={handleAmenitiesChange}
                        className="sr-only"
                      />
                      <amenity.icon className="h-5 w-5 mr-2" />
                      <span className="text-sm">{amenity.label}</span>
                    </label>
                  ))}
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
                Creating Venue...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="h-5 w-5 mr-2" />
                Create Venue
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}