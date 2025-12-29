/**
 * Common type definitions for the Marketing Brain Command Center
 */

// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  preferences: UserPreferences;
}

export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailUpdates: boolean;
  dashboardLayout?: string;
}

// Content related types
export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  author: string;
  tags: string[];
  platforms: SocialPlatform[];
  metrics?: ContentMetrics;
  content: string;
}

export type ContentType = 
  | 'post'
  | 'article'
  | 'image'
  | 'video'
  | 'story'
  | 'reel'
  | 'tweet'
  | 'carousel';

export type ContentStatus = 
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'archived';

export type SocialPlatform = 
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'pinterest';

export interface ContentMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  clickThroughRate?: number;
}

// Campaign related types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  goals: CampaignGoal[];
  platforms: SocialPlatform[];
  content: string[];
  metrics?: CampaignMetrics;
  tags: string[];
}

export type CampaignStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';

export interface CampaignGoal {
  type: CampaignGoalType;
  target: number;
  current: number;
}

export type CampaignGoalType = 
  | 'awareness'
  | 'engagement'
  | 'conversion'
  | 'sales'
  | 'traffic'
  | 'leads';

export interface CampaignMetrics {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  costPerClick?: number;
  costPerConversion?: number;
  roi?: number;
}

// Analytics related types
export interface AnalyticsData {
  timeframe: Timeframe;
  metrics: Record<string, number>;
  comparisons: Record<string, ComparisonData>;
  trends: TrendData[];
}

export type Timeframe = 
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom';

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
}

export interface TrendData {
  date: string;
  value: number;
}

// API related types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  pagination?: PaginationData;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

// UI related types
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action?: {
    label: string;
    url: string;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

// MLM specific types
export interface MLMBusinessData {
  businessName: string;
  companyName: string;
  industry: string;
  experience: string;
  currentRank: string;
  monthlyIncome: string;
  teamSize: string;
  mainProducts: string;
  targetMarket: string;
  referralLink: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    linkedin: string;
    tiktok: string;
  };
  goals: {
    income: string;
    teamSize: string;
    timeline: string;
  };
  challenges: string;
}
