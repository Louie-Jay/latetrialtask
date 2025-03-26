export type ErrorWithCode = Error & { code?: string };

export function handleAuthError(error: ErrorWithCode): string {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 8 characters long.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

export function handlePaymentError(error: ErrorWithCode): string {
  switch (error.code) {
    case 'card_error':
      return 'Your card was declined. Please try another card.';
    case 'expired_card':
      return 'Your card has expired. Please use a different card.';
    case 'incorrect_cvc':
      return 'Your card\'s security code is incorrect.';
    case 'processing_error':
      return 'An error occurred while processing your card. Please try again.';
    case 'insufficient_funds':
      return 'Your card has insufficient funds.';
    default:
      return error.message || 'An error occurred processing your payment.';
  }
}

export function handleStorageError(error: ErrorWithCode): string {
  switch (error.code) {
    case 'storage/unauthorized':
      return 'You don\'t have permission to perform this action.';
    case 'storage/canceled':
      return 'Upload was cancelled.';
    case 'storage/unknown':
      return 'An unknown error occurred. Please try again.';
    default:
      return error.message || 'Failed to upload file. Please try again.';
  }
}

export function handleDatabaseError(error: ErrorWithCode): string {
  switch (error.code) {
    case '23505': // Unique violation
      return 'This record already exists.';
    case '23503': // Foreign key violation
      return 'This operation would break data relationships.';
    case '23502': // Not null violation
      return 'Required fields are missing.';
    default:
      return error.message || 'A database error occurred. Please try again.';
  }
}