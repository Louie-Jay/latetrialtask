import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Ticket,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { processRefund } from '../../lib/payment';

export default function RefundTickets() {
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [refundFees, setRefundFees] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTickets.length) return;

    setLoading(true);
    setError(null);

    try {
      const result = await processRefund({
        ticketIds: selectedTickets,
        reason,
        refundFees
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to process refund');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/portal/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Refund error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/portal/dashboard')}
        className="text-purple-400 hover:text-purple-300 flex items-center mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <h1 className="text-4xl font-bold text-gradient mb-2">Process Refunds</h1>
      <p className="text-gray-400 mb-8">Refund tickets for your event</p>

      {success ? (
        <div className="glass-effect rounded-xl p-8 border border-gray-800/50 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Refunds Processed</h2>
          <p className="text-gray-400">
            The selected tickets have been refunded and customers have been notified
          </p>
        </div>
      ) : (
        <form onSubmit={handleRefund} className="space-y-8">
          {/* Ticket Selection */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-purple-400" />
              Select Tickets to Refund
            </h3>

            <div className="space-y-4">
              {/* Ticket selection UI would go here */}
              <p className="text-gray-400">
                Select the tickets you want to refund from the list below
              </p>
            </div>
          </div>

          {/* Refund Details */}
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-6">Refund Details</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason for Refund
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field w-full"
                  rows={4}
                  placeholder="Explain why you're refunding these tickets"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="refundFees"
                  checked={refundFees}
                  onChange={(e) => setRefundFees(e.target.checked)}
                  className="rounded border-gray-700 text-purple-500 focus:ring-purple-500 bg-transparent"
                />
                <label htmlFor="refundFees" className="ml-2 text-gray-300">
                  Refund service fees
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="glass-effect rounded-xl p-4 border border-red-500/20 bg-red-900/20">
              <div className="flex items-center text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/portal/dashboard')}
              className="secondary-button px-6 py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTickets.length}
              className="premium-button px-6 py-3 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Process Refunds
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}