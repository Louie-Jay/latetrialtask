import { supabase } from './supabase';
import { logger } from './logging';
import { config } from './config';

// Process payment with proper fee routing
export async function processPayment(
  eventId: string,
  amount: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get platform admin account
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('email', 'themvisionstudio@gmail.com')
      .single();

    if (adminError) throw adminError;
    if (!adminUser?.stripe_account_id) {
      throw new Error('Platform admin Stripe account not configured');
    }

    // Calculate service fee (10%)
    const serviceFee = Math.round(amount * 0.1 * 100) / 100;
    const totalAmount = amount + serviceFee;

    // Create payment transaction record
    const { data: transaction, error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        ticket_id: eventId,
        user_id: userId,
        base_amount: amount,
        service_fee: serviceFee,
        status: 'processing',
        provider: 'stripe',
        platform_fee_account: adminUser.stripe_account_id
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create Stripe payment intent
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totalAmount,
        transaction_id: transaction.id,
        platform_account: adminUser.stripe_account_id
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return { success: true };
  } catch (error) {
    logger.error('Payment processing error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment'
    };
  }
}