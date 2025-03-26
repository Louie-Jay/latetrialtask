import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      console.error('Error sending reset email:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-premium-black">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
            <Mail className="relative z-10 mx-auto h-16 w-16 text-purple-400" />
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gradient">Reset Password</h2>
          <p className="mt-3 text-gray-400">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <div className="glass-effect rounded-xl p-8 border border-gray-800/50 shadow-2xl">
          {success ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Check Your Email</h3>
              <p className="text-gray-400 mb-6">
                We've sent you instructions to reset your password. Please check your inbox.
              </p>
              <Link
                to="/account"
                className="secondary-button inline-flex items-center"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 w-full transition-all focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full py-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader className="animate-spin h-5 w-5 mr-2" />
                    Sending...
                  </span>
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/account"
            className="text-gray-400 hover:text-purple-400 text-sm transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}