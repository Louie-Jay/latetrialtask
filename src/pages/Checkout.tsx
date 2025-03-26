import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Shield, ChevronRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createPaymentIntent } from '../lib/stripe';
import { StripeProvider } from '../components/StripeElements';

type CheckoutState = {
  eventId: string;
  ticketType: 'individual' | 'group';
  quantity: number;
  useReward: boolean;
  subtotal: number;
  serviceFee: number;
  total: number;
};

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Get checkout data from location state
  const checkoutData = location.state as CheckoutState;

  useEffect(() => {
    if (!checkoutData) {
      navigate('/events');
      return;
    }

    initializePayment();
  }, [checkoutData, navigate]);

  const initializePayment = async () => {
    try {
      // Create payment intent
      const { clientSecret } = await createPaymentIntent(checkoutData.total);
      setClientSecret(clientSecret);
    } catch (err) {
      console.error('Payment initialization error:', err);
      setError('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/confirmation', { 
      state: {
        eventId: checkoutData.eventId,
        ticketType: checkoutData.ticketType,
        quantity: checkoutData.quantity
      }
    });
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  if (!checkoutData || !clientSecret) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 flex items-center mb-4"
        >
          <ChevronRight className="h-5 w-5 mr-2" />
          Back
        </button>
        <h1 className="text-4xl font-bold text-gradient">Secure Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <StripeProvider
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>

          {error && (
            <div className="mt-4 glass-effect rounded-xl p-4 border border-red-500/20 bg-red-900/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:sticky lg:top-24 space-y-8">
          <div className="glass-effect rounded-xl p-6 border border-gray-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>${checkoutData.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-gray-300">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Service Fee
                </span>
                <span>${checkoutData.serviceFee.toFixed(2)}</span>
              </div>

              {checkoutData.useReward && (
                <div className="flex justify-between text-purple-400">
                  <span>Rewards Discount</span>
                  <span>-$10.00</span>
                </div>
              )}
              
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between text-white">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">${checkoutData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-sm text-gray-400 mb-2">
                <Lock className="h-4 w-4 mr-1" />
                Secure Payment
              </div>
              <p className="text-xs text-gray-500">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}