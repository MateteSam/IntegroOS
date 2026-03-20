export type ThemeMode = 'Sovereign_Dark' | 'Sovereign_Light';

export interface User {
  id: string;
  email: string;
  full_name?: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  type?: string;
  status: 'active' | 'completed' | 'archived';
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: number;
  read: boolean;
}

export interface BrandProfile {
  id: string;
  name: string;
  colors: { primary: string; secondary: string; accent1?: string; accent2?: string };
  typography: { heading: string; body: string };
  dna?: string;
}

export interface AITask {
  id: string;
  label: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
}
