import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import { config } from './config';
import { logger } from './logging';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(config.stripe.publishableKey);
  }
  return stripePromise;
};

// Create payment intent
export const createPaymentIntent = async (amount: number) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }
    return await response.json();
  } catch (err) {
    logger.error('Error creating payment intent:', err);
    throw err;
  }
};

// Create Stripe Connect account
export const createStripeAccount = async () => {
  try {
    const response = await fetch('/api/create-connect-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create Stripe account');
    }
    return await response.json();
  } catch (err) {
    logger.error('Error creating Stripe account:', err);
    throw err;
  }
};

// Get Stripe Connect account link
export const getStripeAccountLink = async () => {
  try {
    const response = await fetch('/api/create-account-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get account link');
    }
    const { url } = await response.json();
    return url;
  } catch (err) {
    logger.error('Error getting account link:', err);
    throw err;
  }
};

// Get Stripe account status
export const getStripeAccountStatus = async () => {
  try {
    const response = await fetch('/api/stripe-account-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get account status');
    }
    return await response.json();
  } catch (err) {
    logger.error('Error getting account status:', err);
    throw err;
  }
};