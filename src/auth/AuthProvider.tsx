import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

type AuthCtx = {
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx>({
  session: null, loading: true, isAdmin: false,
  signInWithEmail: async () => {}, signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session ?? null);
  }, []);

  const refreshIsAdmin = useCallback(async () => {
    const uid = session?.user?.id;
    if (!uid) { setIsAdmin(false); return; }

    // ✅ RLS-safe self check (no RPC)
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', uid)
      .maybeSingle();

    setIsAdmin(Boolean(data) && !error);
  }, [session?.user?.id]);

  useEffect(() => {
    (async () => {
      await loadSession();
      // run admin check before clearing loading to avoid flicker
      await refreshIsAdmin();
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
      setTimeout(async () => { await refreshIsAdmin(); }, 0); // defer to avoid deadlocks
    });
    return () => subscription.unsubscribe();
  }, [loadSession, refreshIsAdmin]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); }, []);

  const value = useMemo(() => ({ session, loading, isAdmin, signInWithEmail, signOut }), [session, loading, isAdmin, signInWithEmail, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};