/*
  # Payment System Improvements

  1. New Tables
    - `payment_status` enum table for consistent status values
    - Additional indexes for performance
    - Improved foreign key constraints
  
  2. Changes
    - Added missing foreign key constraints
    - Added status validation
    - Added transaction tracking
    
  3. Security
    - Added RLS policies for payment tables
*/

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Add status validation to payment transactions
ALTER TABLE payment_transactions 
  DROP COLUMN status,
  ADD COLUMN status payment_status NOT NULL DEFAULT 'pending';

-- Add missing foreign key constraints with proper deletion behavior
ALTER TABLE payment_transactions
  DROP CONSTRAINT IF EXISTS payment_transactions_ticket_id_fkey,
  ADD CONSTRAINT payment_transactions_ticket_id_fkey 
    FOREIGN KEY (ticket_id) 
    REFERENCES tickets(id) 
    ON DELETE RESTRICT;

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_ticket_id ON payment_transactions(ticket_id);

-- Add transaction tracking
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS transaction_ref uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message text;

-- Ensure RLS is enabled
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read their payment transactions" ON payment_transactions;
CREATE POLICY "Users can read their payment transactions"
  ON payment_transactions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );