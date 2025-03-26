import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  STRIPE_RESTRICTED_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1)
});

// Validate environment variables
const env = envSchema.parse({
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  STRIPE_RESTRICTED_KEY: import.meta.env.VITE_STRIPE_RESTRICTED_KEY,
  STRIPE_WEBHOOK_SECRET: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
});

// Export validated config
export const config = {
  supabase: {
    url: env.SUPABASE_URL,
    anonKey: env.SUPABASE_ANON_KEY
  },
  stripe: {
    publishableKey: env.STRIPE_PUBLISHABLE_KEY,
    restrictedKey: env.STRIPE_RESTRICTED_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET
  },
  environment: process.env.NODE_ENV || 'development'
} as const;