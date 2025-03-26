import Stripe from 'stripe';
import { supabase } from '../lib/supabase';
import { config } from '../lib/config';

const stripe = new Stripe(config.stripe.restrictedKey);

// Create payment intent with application fee
export async function createPaymentIntent(
  amount: number,
  transactionId: string,
  platformAccountId: string
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      application_fee_amount: Math.round(amount * 0.1 * 100), // 10% fee
      transfer_data: {
        destination: platformAccountId, // Platform admin's account
      },
      metadata: {
        transaction_id: transactionId
      }
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

// Create Stripe Connect account
export async function createConnectAccount() {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      }
    });

    return account;
  } catch (error) {
    console.error('Error creating Connect account:', error);
    throw error;
  }
}

// Get account link for onboarding/updates
export async function createAccountLink(accountId: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}/portal/dashboard?refresh=true`,
      return_url: `${returnUrl}/portal/dashboard`,
      type: 'account_onboarding'
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
}