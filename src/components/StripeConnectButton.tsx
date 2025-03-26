import React, { useState, useEffect } from 'react';
import { Loader, Link as LinkIcon } from 'lucide-react';
import { createStripeAccount, getStripeAccountLink, getStripeAccountStatus } from '../lib/stripe';
import { supabase } from '../lib/supabase';

type StripeConnectButtonProps = {
  accountId?: string;
  accountStatus?: string;
  onConnect?: () => void;
};

export default function StripeConnectButton({ 
  accountId, 
  accountStatus,
  onConnect 
}: StripeConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();

      setIsAdmin(profile?.email === 'themvisionstudio@gmail.com');
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      if (accountId) {
        // Get onboarding link for existing account
        const accountLink = await getStripeAccountLink();
        window.location.href = accountLink;
      } else {
        // Create new Stripe account
        const { url } = await createStripeAccount();
        window.location.href = url;
      }
      if (onConnect) onConnect();
    } catch (err) {
      console.error('Error connecting Stripe account:', err);
      setError('Failed to connect Stripe account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (accountStatus) {
      case 'active':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'restricted':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Only show for admin or professional users
  if (!isAdmin && !['dj', 'promoter', 'creator'].includes(accountStatus || '')) {
    return null;
  }

  return (
    <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Stripe Connect
          </h3>
          <p className="text-sm text-gray-400">
            {accountId 
              ? 'Manage your connected Stripe account'
              : 'Connect your Stripe account to receive payments'}
          </p>
        </div>
        <button
          onClick={handleConnect}
          disabled={loading}
          className="premium-button flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader className="animate-spin h-5 w-5" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5" />
              <span>{accountId ? 'Manage Account' : 'Connect Stripe'}</span>
            </>
          )}
        </button>
      </div>

      {accountId && accountStatus && (
        <div className="mt-4 flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Status:</span>
          <span className={`capitalize ${getStatusColor()}`}>
            {accountStatus}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}