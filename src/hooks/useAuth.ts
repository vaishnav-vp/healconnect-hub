import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getUserRole, type AppRole } from "@/lib/auth";

interface AuthState {
  user: User | null;
  role: AppRole | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const user = session?.user ?? null;
        
        if (user) {
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const role = await getUserRole(user.id);
            setAuthState({ user, role, loading: false });
          }, 0);
        } else {
          setAuthState({ user: null, role: null, loading: false });
        }
      }
    );

    // THEN check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null;
      
      if (user) {
        const role = await getUserRole(user.id);
        setAuthState({ user, role, loading: false });
      } else {
        setAuthState({ user: null, role: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return authState;
}
