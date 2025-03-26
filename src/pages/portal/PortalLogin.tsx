import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Star, Lock, Mail, Loader, ArrowRight, AlertCircle, Ticket } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { handleAuthError } from '../../lib/supabase';

export default function PortalLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) throw loginError;
      if (!user) throw new Error('Login failed');

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile || !['dj', 'promoter', 'admin'].includes(profile.role)) {
        throw new Error('Access denied. DJ or Promoter privileges required.');
      }

      navigate('/portal/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-black">
      <div className="max-w-md w-full mx-4">
        {/* Branded Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
            <Ticket className="relative z-10 mx-auto h-16 w-16 text-purple-400 transform -rotate-12" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gradient">Artist Portal</h2>
          <p className="mt-3 text-gray-400">Sign in to manage your events and analytics</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="glass-effect rounded-xl p-8 border border-gray-800/50 shadow-2xl">
          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                  placeholder="artist@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-500/20">
                <p className="text-sm text-red-400 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="premium-button w-full py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Star className="h-5 w-5 mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-4">
          <Link
            to="/forgot-password"
            className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
          >
            Forgot your password?
          </Link>
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-gray-400">Want to join as an artist?</span>
            <Link
              to="/account"
              className="text-purple-400 hover:text-purple-300 flex items-center transition-colors"
            >
              Apply now
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}