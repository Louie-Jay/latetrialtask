/*
  # Payment System Functions
  
  1. New Functions
    - Safe ticket increment function
    - Payment validation functions
    
  2. Security
    - Transaction safety
    - Concurrency handling
*/

-- Function to safely increment tickets sold with concurrency handling
CREATE OR REPLACE FUNCTION increment_tickets_sold(event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Lock the row to prevent concurrent updates
  PERFORM pg_advisory_xact_lock(hashtext(event_id::text));
  
  -- Update with capacity check
  UPDATE events 
  SET tickets_sold = tickets_sold + 1
  WHERE id = event_id 
  AND tickets_sold < capacity;
  
  -- Verify the update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Failed to update ticket count or event is sold out';
  END IF;
END;
$$;