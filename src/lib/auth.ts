import { supabase } from './supabase';
import { logger } from './logging';

// Auth state store
let authInitialized = false;
let authStateListeners: ((user: any) => void)[] = [];

// Initialize auth
export async function initAuth() {
  if (authInitialized) return;

  try {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      logger.info('Auth state changed:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Notify listeners
          authStateListeners.forEach(listener => listener(profile));
        }
      } else if (event === 'SIGNED_OUT') {
        // Notify listeners of sign out
        authStateListeners.forEach(listener => listener(null));
      }
    });

    // Check initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // Notify listeners of initial state
      authStateListeners.forEach(listener => listener(profile));
    }

    authInitialized = true;
    return () => subscription.unsubscribe();
  } catch (error) {
    logger.error('Error initializing auth:', error);
    throw error;
  }
}

// Subscribe to auth state changes
export function onAuthStateChange(callback: (user: any) => void) {
  authStateListeners.push(callback);
  return () => {
    authStateListeners = authStateListeners.filter(listener => listener !== callback);
  };
}

// Get current auth state
export async function getCurrentAuthState() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return profile;
  } catch (error) {
    logger.error('Error getting auth state:', error);
    return null;
  }
}