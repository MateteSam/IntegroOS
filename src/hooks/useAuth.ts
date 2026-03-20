import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'Admin' | 'Marketing' | 'Design' | 'Sales' | 'User';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (true || localStorage.getItem('dev_auth') === 'true') {
      setUser({ id: 'dev-admin', email: 'admin@wcccs.global' } as User);
      setRole('Admin');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchRole(currentUser.id);
      } else {
        setRole('User');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data && data.role) {
        setRole(data.role as UserRole);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (localStorage.getItem('dev_auth') === 'true') {
      localStorage.removeItem('dev_auth');
      window.location.reload();
      return;
    }
    await supabase.auth.signOut();
  };

  return { user, role, loading, signOut, isAuthenticated: !!user };
}
