import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Loader,
  ArrowLeft,
  Ticket,
  Info,
  Percent,
  Save,
  X,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Event } from '../../types/database';
import ImageUpload from '../../components/ImageUpload';

export default function EventForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('events')
        .insert([formData]);

      if (error) throw error;
      navigate('/admin');
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
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

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/admin')}
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
                <Ticket className="h-16 w-16 text-white/20" />
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
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  required
                  className="input-field w-full"
                  placeholder="Enter venue name"
                />
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
                    value={formData.discount_code}
                    onChange={handleChange}
                    className="input-field w-full pl-10"
                    placeholder="Enter discount code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Stats */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-purple-400" />
              Preview Stats
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-purple-400 mr-3" />
                  <span className="text-gray-300">Initial Capacity</span>
                </div>
                <span className="text-white font-medium">
                  {formData.capacity.toLocaleString()} spots
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                <div className="flex items-center">
                  <Ticket className="h-5 w-5 text-purple-400 mr-3" />
                  <span className="text-gray-300">Individual Price</span>
                </div>
                <span className="text-white font-medium">
                  ${formData.individual_price.toFixed(2)}
                </span>
              </div>

              {formData.group_price && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-300">Group Price</span>
                  </div>
                  <span className="text-white font-medium">
                    ${formData.group_price.toFixed(2)}
                  </span>
                </div>
              )}

              {formData.discount_code && (
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30">
                  <div className="flex items-center">
                    <Percent className="h-5 w-5 text-purple-400 mr-3" />
                    <span className="text-gray-300">Discount Code</span>
                  </div>
                  <span className="text-white font-medium">
                    {formData.discount_code}
                  </span>
                </div>
              )}
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
    </div>
  );
}