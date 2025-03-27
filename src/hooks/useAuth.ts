// import { useState, useEffect } from 'react';
// import { supabase } from '../lib/supabase';
// import { logger } from '../lib/logging';

// export function useAuth() {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let mounted = true;

//     const initialize = async () => {
//       try {
//         // Get initial session
//         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
//         if (sessionError) throw sessionError;

//         if (session?.user) {
//           // Get user profile
//           const { data: profile, error: profileError } = await supabase
//             .from('users')
//             .select('*')
//             .eq('id', session.user.id)
//             .single();

//           if (profileError) throw profileError;
//           if (mounted) setUser(profile);
//         }
//       } catch (err) {
//         logger.error('Auth initialization error:', err);
//         if (mounted) {
//           setError(err instanceof Error ? err.message : 'Failed to initialize auth');
//         }
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     // Set up auth state listener
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       if (!mounted) return;

//       try {
//         if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
//           if (session?.user) {
//             const { data: profile, error: profileError } = await supabase
//               .from('users')
//               .select('*')
//               .eq('id', session.user.id)
//               .single();

//             if (profileError) throw profileError;
//             setUser(profile);
//           }
//         } else if (event === 'SIGNED_OUT') {
//           setUser(null);
//         }
//       } catch (err) {
//         logger.error('Auth state change error:', err);
//         setError(err instanceof Error ? err.message : 'Auth error');
//       }
//     });

//     // Initialize
//     initialize();
//     setUser('admin');

//     return () => {
//       mounted = false;
//       subscription.unsubscribe();
//     };
    
//   }, []);

//   return { user, loading, error };
// }