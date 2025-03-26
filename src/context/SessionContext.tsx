import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import supabase from "../../supabase";
import LoadingScreen from "../components/LoadingScreen";

type AppUser = (User & { role?: "admin" | "user" | "promoter" | "dj" | null }) | null;


interface SessionContextType {
  session: Session | null;
  user: AppUser;
  updateUserRole: (newRole: "admin" | "user" | null) => Promise<void>;
  setAuthUser: (user: AppUser) => void;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  updateUserRole: async () => {},
  setAuthUser: () => {},
});

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

type Props = { children: React.ReactNode };
export const SessionProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setAuthUser] = useState<AppUser>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserRole = async (newRole: "admin" | "user" | "promoter" | "dj" | null) => {
    if (!user) return;

    try {
      const { data: updatedUser, error } = await supabase.auth.updateUser({
        data: { role: newRole }
      });

      if (error) throw error;
      
      setAuthUser(updatedUser?.user ? { 
        ...updatedUser.user, 
        role: newRole ?? undefined 
      } : null);
    } catch (error) {
      console.error("Role update failed:", error);
    }
  };

  useEffect(() => {
    const authStateListener = supabase.auth.onAuthStateChange(
      async (_, session) => {
        setSession(session);
        setAuthUser(session?.user ? { 
          ...session.user, 
          role: session.user.user_metadata?.role 
        } : null);
        setIsLoading(false);
      }
    );

    // Initial session check
    const checkSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setAuthUser(initialSession?.user ? { 
        ...initialSession.user, 
        role: initialSession.user.user_metadata?.role 
      } : null);
      setIsLoading(false);
    };

    checkSession();

    return () => {
      authStateListener.data.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, updateUserRole, setAuthUser }}>
      {isLoading ? <LoadingScreen onLoadComplete={() => {}} /> : children}
    </SessionContext.Provider>
  );
};
