import React, { useState } from 'react';
import { X, Send, Share2, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Ticket } from '../types/database';

type TicketShareModalProps = {
  ticket: Ticket;
  onClose: () => void;
  onShare: () => void;
};

export default function TicketShareModal({ ticket, onClose, onShare }: TicketShareModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: shareError } = await supabase
        .from('ticket_shares')
        .insert({
          ticket_id: ticket.id,
          shared_by: ticket.user_id,
          shared_to: email,
          bonus_points: 100
        });

      if (shareError) throw shareError;

      setSuccess(true);
      onShare();
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error('Error sharing ticket:', err);
      setError('Failed to share ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialShare = async (platform: string) => {
    try {
      const shareUrl = `https://reallive.app/tickets/${ticket.id}`;
      const { error } = await supabase
        .from('social_shares')
        .insert({
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          platform,
          share_url: shareUrl,
          points_earned: 50
        });

      if (error) throw error;

      const text = `Join me at ${ticket.event?.name}!`;
      const url = encodeURIComponent(shareUrl);
      
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
          break;
        case 'instagram':
          alert('Copy the ticket link to share on Instagram!');
          navigator.clipboard.writeText(shareUrl);
          break;
      }
    } catch (err) {
      console.error('Error sharing on social media:', err);
      setError('Failed to share on social media. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="premium-card max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Share Ticket</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-900">
              <Send className="h-6 w-6 text-purple-300" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-white">Ticket Shared!</h3>
            <p className="mt-1 text-sm text-gray-400">
              The recipient will receive an email with the ticket details.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  Recipient's Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter email address"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="premium-button w-full"
              >
                {loading ? 'Sharing...' : 'Share Ticket'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-premium-black text-gray-400">
                    Or share on social media
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {['twitter', 'facebook', 'instagram'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleSocialShare(platform)}
                    className="secondary-button py-2 px-4 capitalize"
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}