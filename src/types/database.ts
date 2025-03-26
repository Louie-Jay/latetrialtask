export type User = {
  id: string;
  email: string;
  role: string;
  points: number;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  venue: string;
  event_date: string;
  individual_price: number;
  group_price: number | null;
  discount_code: string | null;
  image_url: string | null;
  tickets_sold: number;
  capacity: number;
  created_at: string;
};

export type Venue = {
  id: string;
  name: string;
  description: string;
  address: string;
  capacity: number;
  image_url: string | null;
  amenities: string[];
  upcoming_events_count: number;
  created_at: string;
};

export type Ticket = {
  id: string;
  event_id: string;
  user_id: string;
  qr_code: string;
  purchase_date: string;
  price_paid: number;
  is_group_ticket: boolean;
  status: string;
  shared_by: string | null;
  shared_at: string | null;
  points_earned: number;
  created_at: string;
  event?: {
    name: string;
    event_date: string;
    venue: string;
  };
};

export type TicketShare = {
  id: string;
  ticket_id: string;
  shared_by: string;
  shared_to: string;
  bonus_points: number;
  status: string;
  created_at: string;
};

export type SocialShare = {
  id: string;
  user_id: string;
  ticket_id: string;
  platform: string;
  share_url: string | null;
  points_earned: number;
  created_at: string;
};

export type PaymentTransaction = {
  id: string;
  ticket_id: string;
  user_id: string;
  amount: number;
  service_fee: number;
  status: string;
  provider: string;
  provider_transaction_id: string | null;
  created_at: string;
};

export type RewardTier = {
  id: string;
  name: string;
  points_threshold: number;
  description: string;
  icon: string;
};

export type RewardBenefit = {
  id: string;
  tier_id: string;
  name: string;
  description: string;
  benefit_type: string;
  value: string;
};