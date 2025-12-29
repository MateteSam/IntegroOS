import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  // Mock user for local development without auth
  const [user, setUser] = useState<User | null>({
    id: '00000000-0000-0000-0000-000000000000',
    email: 'admin@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Session listening disabled for bypass
    return () => { };
  }, []);

  const signOut = async () => {
    console.log('Sign out bypassed');
  };

  return { user, loading, signOut, isAuthenticated: true };
}
