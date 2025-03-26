-- Add service fee configuration
CREATE TABLE IF NOT EXISTS service_fee_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_percentage numeric NOT NULL DEFAULT 10.0,
  min_fee numeric,
  max_fee numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE service_fee_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage service fees
CREATE POLICY "Admins can manage service fees"
  ON service_fee_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Anyone can read active service fee
CREATE POLICY "Anyone can read active service fee"
  ON service_fee_config
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default service fee configuration
INSERT INTO service_fee_config (fee_percentage)
VALUES (10.0);

-- Add service fee tracking to payment transactions
ALTER TABLE payment_transactions
  ADD COLUMN IF NOT EXISTS base_amount numeric,
  ADD COLUMN IF NOT EXISTS fee_percentage numeric;

-- Create function to calculate service fee
CREATE OR REPLACE FUNCTION calculate_service_fee(amount numeric)
RETURNS numeric AS $$
DECLARE
  fee_config service_fee_config;
  fee numeric;
BEGIN
  -- Get active fee configuration
  SELECT * INTO fee_config
  FROM service_fee_config
  WHERE is_active = true
  LIMIT 1;

  -- Calculate fee
  fee := amount * (fee_config.fee_percentage / 100.0);
  
  -- Apply min/max constraints if set
  IF fee_config.min_fee IS NOT NULL THEN
    fee := GREATEST(fee, fee_config.min_fee);
  END IF;
  
  IF fee_config.max_fee IS NOT NULL THEN
    fee := LEAST(fee, fee_config.max_fee);
  END IF;
  
  RETURN fee;
END;
$$ LANGUAGE plpgsql;

-- Create view for fee analytics
CREATE OR REPLACE VIEW service_fee_analytics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as transactions,
  SUM(base_amount) as total_base_amount,
  SUM(service_fee) as total_fees,
  AVG(service_fee) as avg_fee,
  MIN(service_fee) as min_fee,
  MAX(service_fee) as max_fee
FROM payment_transactions
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;