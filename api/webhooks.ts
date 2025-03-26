import Stripe from 'stripe';
import { supabase } from '../lib/supabase';

const stripe = new Stripe(process.env.VITE_STRIPE_RESTRICTED_KEY);
const endpointSecret = process.env.VITE_STRIPE_WEBHOOK_SECRET;

export async function handleWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !endpointSecret) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      endpointSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
      case 'account.updated':
        await handleAccountUpdate(event.data.object);
        break;
    }

    return new Response('Webhook handled', { status: 200 });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      { status: 400 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) throw error;
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { error } = await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      error_message: paymentIntent.last_payment_error?.message,
      processed_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) throw error;
}

async function handleRefund(charge: Stripe.Charge) {
  const { error } = await supabase
    .from('refunds')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString()
    })
    .eq('stripe_charge_id', charge.id);

  if (error) throw error;
}

async function handleAccountUpdate(account: Stripe.Account) {
  const { error } = await supabase
    .from('users')
    .update({
      stripe_account_status: account.charges_enabled ? 'active' : 'pending',
      stripe_account_requirements: account.requirements?.currently_due || []
    })
    .eq('stripe_account_id', account.id);

  if (error) throw error;
}