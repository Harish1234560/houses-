'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type SupabaseContextType = {
  supabase: SupabaseClient | null;
  isLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoading: true,
});

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      const client = createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
      setSupabase(client);
    }
    setIsLoading(false);
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
