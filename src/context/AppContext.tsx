import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, Notification } from '@/types';

// Define the state shape
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  unreadNotificationsCount: number;
  isLoading: boolean;
  error: string | null;
}

// Define action types
type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Define the context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateTheme: (theme: 'light' | 'dark' | 'system') => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// Initial state
const initialState: AppState = {
  user: {
    id: '00000000-0000-0000-0000-000000000000',
    full_name: 'Sovereign Administrator',
    email: 'admin@sovereign.os',
  } as any,
  isAuthenticated: true,
  theme: 'dark', // Default theme
  notifications: [],
  unreadNotificationsCount: 0,
  isLoading: false,
  error: null,
};

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadNotificationsCount: state.unreadNotificationsCount + 1,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        ),
        unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadNotificationsCount: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch({ type: 'SET_THEME', payload: savedTheme });
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    localStorage.setItem('theme', state.theme);

    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (state.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(state.theme);
    }
  }, [state.theme]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // In a real app, this would be an API call
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: '1',
        full_name: 'Demo User',
        email,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      dispatch({ type: 'SET_USER', payload: mockUser });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to login',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = () => {
    dispatch({ type: 'CLEAR_USER' });
  };

  // Update theme function
  const updateTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  // Mark notification as read
  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  // Clear all notifications
  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const value = {
    state,
    dispatch,
    login,
    logout,
    updateTheme,
    markNotificationRead,
    clearNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;