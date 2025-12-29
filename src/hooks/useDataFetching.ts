import { useState, useEffect, useCallback } from 'react';
import useAnalytics from './useAnalytics';

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FetchState<T> {
  data: T | null;
  status: FetchStatus;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

export interface FetchOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  retries?: number;
  retryDelay?: number;
}

/**
 * Custom hook for standardized API calls with status tracking
 * 
 * @param fetchFn The async function that performs the data fetching
 * @param options Configuration options for the fetch behavior
 * @returns Object with data, status, and refetch function
 */
export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  options: FetchOptions = {}
): FetchState<T> & { refetch: () => Promise<T | null> } {
  const {
    enabled = true,
    onSuccess,
    onError,
    dependencies = [],
    retries = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    status: 'idle',
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false
  });

  const { trackError } = useAnalytics();

  const fetchData = useCallback(async (): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      error: null,
      isError: false
    }));

    let currentRetry = 0;

    const attemptFetch = async (): Promise<T | null> => {
      try {
        const data = await fetchFn();
        
        setState({
          data,
          status: 'success',
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false
        });

        if (onSuccess) {
          onSuccess(data);
        }

        return data;
      } catch (error) {
        if (currentRetry < retries) {
          currentRetry++;
          
          // Wait for the retry delay
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Try again
          return attemptFetch();
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState({
          data: null,
          status: 'error',
          error: errorObj,
          isLoading: false,
          isSuccess: false,
          isError: true
        });

        if (onError) {
          onError(errorObj);
        }

        trackError(errorObj.message, 'API_ERROR', {
          retries: currentRetry
        });

        return null;
      }
    };

    return attemptFetch();
  }, [fetchFn, onSuccess, onError, retries, retryDelay, trackError]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData, ...dependencies]);

  return {
    ...state,
    refetch: fetchData
  };
}

export default useDataFetching;