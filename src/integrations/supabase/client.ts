/**
 * Enhanced Supabase Client with Offline Fallback
 * 
 * This client handles network issues gracefully and provides
 * offline-first capabilities for when Supabase is unavailable.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Connection state
let isConnected = false;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds

// Create client with error handling
let supabaseClient: SupabaseClient<Database> | null = null;

function createSupabaseClient(): SupabaseClient<Database> | null {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.debug('[Supabase] Missing URL or API key. Running in offline mode.');
    return null;
  }

  try {
    return createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'x-client-info': 'integro-os/1.0.0'
        }
      },
      // Add retry configuration
      db: {
        schema: 'public'
      }
    });
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error);
    return null;
  }
}

supabaseClient = createSupabaseClient();

/**
 * Check if Supabase is connected
 */
export async function checkConnection(): Promise<boolean> {
  const now = Date.now();

  // Use cached result if checked recently
  if (now - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return isConnected;
  }

  if (!supabaseClient) {
    isConnected = false;
    lastConnectionCheck = now;
    return false;
  }

  try {
    // Simple health check - try to access the database
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const { error } = await supabaseClient
      .from('ai_generations')
      .select('count')
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    isConnected = !error;
    lastConnectionCheck = now;

    if (error) {
      console.debug('[Supabase] Connection check failed:', error.message);
    } else {
      console.log('[Supabase] Connection verified');
    }

    return isConnected;
  } catch (error: any) {
    console.debug('[Supabase] Connection check error:', error.message);
    isConnected = false;
    lastConnectionCheck = now;
    return false;
  }
}

/**
 * Get connection status (cached)
 */
export function getConnectionStatus(): boolean {
  return isConnected;
}

/**
 * Safe query wrapper with offline fallback
 */
export async function safeQuery<T>(
  queryFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any; offline: boolean }> {
  if (!supabaseClient) {
    return { data: fallbackData, error: null, offline: true };
  }

  try {
    const result = await queryFn(supabaseClient);

    if (result.error) {
      // Check if it's a network error
      const isNetworkError =
        result.error.message?.includes('fetch') ||
        result.error.message?.includes('network') ||
        result.error.message?.includes('ERR_NAME_NOT_RESOLVED') ||
        result.error.code === 'ENOTFOUND';

      if (isNetworkError) {
        isConnected = false;
        console.warn('[Supabase] Network error, using fallback data');
        return { data: fallbackData, error: null, offline: true };
      }
    } else {
      isConnected = true;
    }

    return { ...result, offline: false };
  } catch (error: any) {
    console.debug('[Supabase] Query error:', error);
    isConnected = false;
    return { data: fallbackData, error, offline: true };
  }
}

/**
 * Safe mutation wrapper
 */
export async function safeMutation<T>(
  mutationFn: (client: SupabaseClient<Database>) => Promise<{ data: T | null; error: any }>,
  options?: {
    queueOffline?: boolean;
    onOffline?: () => void;
  }
): Promise<{ data: T | null; error: any; offline: boolean; queued?: boolean }> {
  if (!supabaseClient) {
    options?.onOffline?.();
    return { data: null, error: { message: 'Supabase not available' }, offline: true };
  }

  try {
    const result = await mutationFn(supabaseClient);

    if (result.error) {
      const isNetworkError =
        result.error.message?.includes('fetch') ||
        result.error.message?.includes('network') ||
        result.error.message?.includes('ERR_NAME_NOT_RESOLVED');

      if (isNetworkError) {
        isConnected = false;
        options?.onOffline?.();

        // Could queue for later sync here if needed
        if (options?.queueOffline) {
          // TODO: Implement offline queue
          return { data: null, error: null, offline: true, queued: true };
        }

        return { data: null, error: result.error, offline: true };
      }
    } else {
      isConnected = true;
    }

    return { ...result, offline: false };
  } catch (error: any) {
    console.debug('[Supabase] Mutation error:', error);
    isConnected = false;
    return { data: null, error, offline: true };
  }
}

// Export the raw client for direct use (with null check)
export const supabase = supabaseClient!;

// Export a safe getter for components that need to check
export function getSupabaseClient(): SupabaseClient<Database> | null {
  return supabaseClient;
}

// Check connection on load (non-blocking)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    checkConnection().then(connected => {
      if (!connected) {
        console.debug('[Supabase] Running in offline mode. Some features may be limited.');
      }
    });
  }, 1000);
}