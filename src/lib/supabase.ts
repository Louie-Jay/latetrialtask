import { createClient } from '@supabase/supabase-js';
import { handleAuthError, handleDatabaseError } from './error';
import { logger } from './logging';
import { config } from './config';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create client with optimized config
export const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: {
    persistSession: true,
    storage: localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Get current session with retries and proper error handling
export const getCurrentSession = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        logger.warn('Session fetch attempt failed:', error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      return session;
    } catch (err) {
      if (i === retries - 1) {
        logger.error('All session fetch attempts failed:', err);
        throw new Error(handleAuthError(err as Error & { code?: string }));
      }
    }
  }
  return null;
};

// Get current user with profile and proper error handling
export const getCurrentUser = async () => {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      logger.info('No active session found');
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      if (profileError.message.includes('found no rows')) {
        logger.info('Creating new user profile');
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert([{
            id: session.user.id,
            email: session.user.email,
            role: 'user',
            points: 0,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) {
          logger.error('Error creating user profile:', createError);
          throw createError;
        }
        return newProfile;
      }
      throw profileError;
    }

    return profile;
  } catch (err) {
    logger.error('Error getting user:', err);
    throw new Error(handleDatabaseError(err as Error & { code?: string }));
  }
};

// Sign in with email and proper error handling
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;

    // Get user profile after successful sign in
    if (data.user) {
      const profile = await getCurrentUser();
      return { ...data, profile };
    }

    return data;
  } catch (err) {
    logger.error('Sign in error:', err);
    throw new Error(handleAuthError(err as Error & { code?: string }));
  }
};

// Sign up with email and proper error handling
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return data;
  } catch (err) {
    logger.error('Sign up error:', err);
    throw new Error(handleAuthError(err as Error & { code?: string }));
  }
};

// Sign out with proper error handling
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Clear any local storage or state
    localStorage.removeItem('supabase.auth.token');
  } catch (err) {
    logger.error('Sign out error:', err);
    throw new Error(handleAuthError(err as Error & { code?: string }));
  }
};