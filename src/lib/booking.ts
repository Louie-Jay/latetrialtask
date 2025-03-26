import { supabase } from './supabase';
import { sendEmail } from './email';
import { processPayment } from './payment';

type BookingRequest = {
  userId: string;
  professionalId: string;
  eventDate: string;
  budgetRange: string;
  message: string;
};

type BookingConfirmation = {
  bookingId: string;
  amount: number;
};

export async function createBookingRequest({
  userId,
  professionalId,
  eventDate,
  budgetRange,
  message
}: BookingRequest) {
  try {
    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        professional_id: professionalId,
        event_date: eventDate,
        budget_range: budgetRange,
        message: message,
        status: 'pending'
      })
      .select('*, users!professional_id(*)')
      .single();

    if (bookingError) throw bookingError;

    // Get user details for email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Send email notification to professional
    await sendEmail({
      to: booking.users.email,
      templateName: 'booking_request',
      variables: {
        event_date: new Date(eventDate).toLocaleDateString(),
        budget_range: budgetRange,
        user_name: user.full_name,
        message: message
      }
    });

    return { success: true, booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Failed to create booking request' };
  }
}

export async function confirmBooking({
  bookingId,
  amount
}: BookingConfirmation) {
  try {
    // Calculate service fee (10%)
    const serviceFee = amount * 0.1;
    const totalAmount = amount + serviceFee;

    // Update booking with amounts
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .update({
        total_amount: amount,
        service_fee: serviceFee,
        status: 'confirmed'
      })
      .eq('id', bookingId)
      .select('*, users!user_id(*), users!professional_id(*)')
      .single();

    if (bookingError) throw bookingError;

    // Send confirmation email to user
    await sendEmail({
      to: booking.users!user_id.email,
      templateName: 'booking_confirmation',
      variables: {
        event_date: new Date(booking.event_date).toLocaleDateString(),
        professional_name: booking.users!professional_id.full_name,
        total_amount: totalAmount.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        }),
        service_fee: serviceFee.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })
      }
    });

    return { success: true, booking };
  } catch (error) {
    console.error('Error confirming booking:', error);
    return { success: false, error: 'Failed to confirm booking' };
  }
}

export async function processBookingPayment(bookingId: string) {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;

    // Process payment with service fee
    const totalAmount = booking.total_amount + booking.service_fee;
    const paymentResult = await processPayment(
      bookingId,
      totalAmount,
      booking.user_id
    );

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', bookingId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error('Error processing booking payment:', error);
    return { success: false, error: 'Failed to process payment' };
  }
}