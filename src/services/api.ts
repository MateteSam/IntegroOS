import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaithNexusInvitationTemplate } from '../templates/FaithNexusInvitation';
import { ProductLaunchTemplate } from '../templates/ProductLaunchTemplate';
import { FlashSaleTemplate } from '../templates/FlashSaleTemplate';
import { CaseStudyTemplate } from '../templates/CaseStudyTemplate';
import { WeeklyDigestTemplate } from '../templates/WeeklyDigestTemplate';
import { ContentRoundupTemplate } from '../templates/ContentRoundupTemplate';
import { WelcomeEmailTemplate } from '../templates/WelcomeEmailTemplate';
import { OrderConfirmationTemplate } from '../templates/OrderConfirmationTemplate';
import { WebinarInviteTemplate } from '../templates/WebinarInviteTemplate';
import { EventReminderTemplate } from '../templates/EventReminderTemplate';
import { WinBackTemplate } from '../templates/WinBackTemplate';
import { emailService } from './emailService';

// Types
export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'sending' | 'scheduled' | 'completed' | 'paused';
  subject: string;
  recipients: number;
  opens: number;
  clicks: number;
  createdAt: string;
  scheduledFor?: string;
  template?: string;
  htmlContent?: string;
  recipientEmails?: string[];
  fromEmail?: string;
  attachments?: { filename: string; content: string }[];
}

export interface Contact {
  id: string;
  email: string;
  name: string;
  tags: string[];
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  preview: string;
  createdAt: string;
  htmlContent?: string;
}

export interface Lead {
  id: string;
  email: string;
  domain: string;
  confidence: number;
  verified: boolean;
}

// Template Categories
export const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '📋' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'newsletter', label: 'Newsletter', icon: '📰' },
  { id: 'onboarding', label: 'Onboarding', icon: '🚀' },
  { id: 'sales', label: 'Sales', icon: '💰' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'engagement', label: 'Engagement', icon: '💝' },
];

// Mock data
// Storage Keys (Rotated to clear old dummy data)
const STORAGE_KEYS = {
  CAMPAIGNS: 'integro_v2_campaigns',
  CONTACTS: 'integro_v2_contacts',
  TEMPLATES: 'integro_v3_templates',
};

// Default Templates - Professional library
const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'faith-nexus-2026',
    name: 'Faith Nexus VIP Invitation',
    category: 'events',
    preview: 'Premium Art Deco invitation for Faith Nexus 2026 Virtual Launch',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: FaithNexusInvitationTemplate(),
  },
  {
    id: 'product-launch',
    name: 'Product Launch Announcement',
    category: 'marketing',
    preview: 'Bold hero image, feature highlights, and social proof badges',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: ProductLaunchTemplate(),
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale / Discount Promo',
    category: 'sales',
    preview: 'Urgency-focused design with countdown and discount codes',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: FlashSaleTemplate(),
  },
  {
    id: 'case-study',
    name: 'Case Study Showcase',
    category: 'marketing',
    preview: 'Client testimonial with before/after metrics',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: CaseStudyTemplate(),
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Digest Newsletter',
    category: 'newsletter',
    preview: 'Multi-column layout with featured articles',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: WeeklyDigestTemplate(),
  },
  {
    id: 'content-roundup',
    name: 'Curated Content Roundup',
    category: 'newsletter',
    preview: 'Card-based grid for articles and resources',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: ContentRoundupTemplate(),
  },
  {
    id: 'welcome-email',
    name: 'Welcome Email Series',
    category: 'onboarding',
    preview: 'Warm onboarding with getting started steps',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: WelcomeEmailTemplate(),
  },
  {
    id: 'order-confirmation',
    name: 'Order Confirmation',
    category: 'sales',
    preview: 'Receipt layout with order details table',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: OrderConfirmationTemplate(),
  },
  {
    id: 'webinar-invite',
    name: 'Webinar Invitation',
    category: 'events',
    preview: 'Speaker bio section, agenda, and calendar button',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: WebinarInviteTemplate(),
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    category: 'events',
    preview: 'Countdown timer with quick details',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: EventReminderTemplate(),
  },
  {
    id: 'win-back',
    name: 'Re-engagement / Win-Back',
    category: 'engagement',
    preview: 'Personalized messaging with special offer',
    createdAt: new Date().toISOString().split('T')[0],
    htmlContent: WinBackTemplate(),
  },
];

// Helper to load data
const loadData = <T>(key: string, defaultData: T[] = []): T[] => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultData;
  }
};

// Helper to save data
const saveData = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Initialize Data
let campaigns: Campaign[] = loadData(STORAGE_KEYS.CAMPAIGNS);
let contacts: Contact[] = loadData(STORAGE_KEYS.CONTACTS);
let templates: Template[] = loadData(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);

// No hardcoded dummy data - all data comes from user actions

// API Service
class APIService {
  // Campaigns
  async fetchCampaigns(search?: string): Promise<Campaign[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return search
      ? campaigns.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
      : campaigns;
  }

  async fetchCampaign(id: string): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) throw new Error('Campaign not found');
    return campaign;
  }

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCampaign: Campaign = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Untitled',
      status: 'draft',
      subject: data.subject || '',
      recipients: data.recipients || 0,
      opens: 0,
      clicks: 0,
      createdAt: new Date().toISOString().split('T')[0],
      template: data.template,
      htmlContent: data.htmlContent,
      recipientEmails: data.recipientEmails || [],
      fromEmail: data.fromEmail,
      attachments: data.attachments || [],
    };
    campaigns = [newCampaign, ...campaigns];
    saveData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return newCampaign;
  }

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = campaigns.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Campaign not found');
    campaigns[index] = { ...campaigns[index], ...data };
    saveData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    return campaigns[index];
  }

  async deleteCampaign(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = campaigns.findIndex(c => c.id === id);
    if (index > -1) {
      campaigns = campaigns.filter(c => c.id !== id);
      saveData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }
  }

  // Contacts
  async fetchContacts(search?: string): Promise<Contact[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return search
      ? contacts.filter(c =>
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.name.toLowerCase().includes(search.toLowerCase())
      )
      : contacts;
  }

  async createContact(data: Partial<Contact>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      email: data.email || '',
      name: data.name || '',
      tags: data.tags || [],
      status: 'subscribed',
      createdAt: new Date().toISOString().split('T')[0],
    };
    contacts = [newContact, ...contacts];
    saveData(STORAGE_KEYS.CONTACTS, contacts);
    return newContact;
  }

  async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contact not found');
    contacts[index] = { ...contacts[index], ...data };
    saveData(STORAGE_KEYS.CONTACTS, contacts);
    return contacts[index];
  }

  async deleteContact(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = contacts.findIndex(c => c.id === id);
    if (index > -1) {
      contacts = contacts.filter(c => c.id !== id);
      saveData(STORAGE_KEYS.CONTACTS, contacts);
    }
  }

  // Templates
  async fetchTemplates(): Promise<Template[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return templates;
  }

  async createTemplate(data: Partial<Template>): Promise<Template> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTemplate: Template = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Untitled',
      category: data.category || 'general',
      preview: data.preview || '',
      createdAt: new Date().toISOString().split('T')[0],
      htmlContent: data.htmlContent,
    };
    templates = [newTemplate, ...templates];
    saveData(STORAGE_KEYS.TEMPLATES, templates);
    return newTemplate;
  }

  async deleteTemplate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = templates.findIndex(t => t.id === id);
    if (index > -1) {
      templates = templates.filter(t => t.id !== id);
      saveData(STORAGE_KEYS.TEMPLATES, templates);
    }
  }

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) {
      console.warn(`Template with ID ${id} not found. Available IDs:`, templates.map(t => t.id));
      throw new Error(`Template with ID ${id} not found`);
    }
    templates[index] = { ...templates[index], ...data };
    saveData(STORAGE_KEYS.TEMPLATES, templates);
    return templates[index];
  }

  // Leads
  async searchLeads(domain: string): Promise<Lead[]> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Mock: return sample leads
    return [
      {
        id: '1',
        email: `contact@${domain}`,
        domain,
        confidence: 0.95,
        verified: true,
      },
      {
        id: '2',
        email: `info@${domain}`,
        domain,
        confidence: 0.87,
        verified: true,
      },
    ];
  }

  // Email Sending
  async sendCampaign(campaignId: string): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: string[];
  }> {

    await new Promise(resolve => setTimeout(resolve, 500));
    const campaign = campaigns.find(c => c.id === campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!campaign.htmlContent) {
      throw new Error('Campaign has no email content');
    }

    if (!campaign.recipientEmails || campaign.recipientEmails.length === 0) {
      throw new Error('Campaign has no recipients');
    }

    // Update campaign status to sending
    const index = campaigns.findIndex(c => c.id === campaignId);
    if (index !== -1) {
      campaigns[index].status = 'sending';
      saveData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Personalization Loop
    for (const recipientEmail of campaign.recipientEmails) {
      // Find contact to get name
      const contact = contacts.find(c => c.email.toLowerCase() === recipientEmail.toLowerCase());
      const name = contact ? contact.name : 'Friend'; // Default fallback
      const firstName = name.split(' ')[0];

      // Determine Base URL for Tracking
      // In Production, we rely on the VITE_APP_URL environment variable to generate absolute links.
      // If not set, we attempt to use the window origin (client-side only logic, risky for emails but better than localhost)
      // or fallback to a known default.
      const trackingBase = import.meta.env.PROD
        ? (import.meta.env.VITE_APP_URL || 'https://campaign-craftsman.netlify.app') + '/.netlify/functions'
        : 'http://localhost:3001/api';

      // Construct RSVP Link
      // Ensure we encode params to handle spaces/symbols
      const rsvpLink = `${trackingBase}/rsvp?email=${encodeURIComponent(recipientEmail)}&name=${encodeURIComponent(name)}`;

      // Determine Time/Date variables
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const companyName = 'Faith Nexus';

      // Replace Variables Globally (Handles both {var} and {{var}})
      let personalizedHtml = campaign.htmlContent
        .replace(/\{\{?\s*name\s*\}?\}/g, name)
        .replace(/\{\{?\s*first_name\s*\}?\}/g, firstName)
        .replace(/\{\{?\s*email\s*\}?\}/g, recipientEmail)
        .replace(/\{\{?\s*rsvp_link\s*\}?\}/g, rsvpLink)
        .replace(/\{\{?\s*company\s*\}?\}/g, companyName)
        .replace(/\{\{?\s*date\s*\}?\}/g, currentDate);

      // Send Individual Email
      const result = await emailService.sendEmail({
        to: recipientEmail,
        subject: campaign.subject.replace(/{name}/g, name), // Also personalize subject if needed
        html: personalizedHtml,
        from: campaign.fromEmail,
        attachments: campaign.attachments
      });

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
        errors.push(`${recipientEmail}: ${result.error}`);
      }
    }

    // Update campaign status and stats
    if (index !== -1) {
      campaigns[index].status = sentCount > 0 ? 'completed' : 'paused';
      // Cumulative stats
      campaigns[index].recipients = sentCount + failedCount;
      saveData(STORAGE_KEYS.CAMPAIGNS, campaigns);
    }

    return {
      success: sentCount > 0,
      sent: sentCount,
      failed: failedCount,
      errors: errors
    };
  }
}

export const apiService = new APIService();

// React Query Hooks

// Campaigns
export const useCampaigns = (search?: string) => {
  return useQuery({
    queryKey: ['campaigns', search],
    queryFn: () => apiService.fetchCampaigns(search),
  });
};

export const useCampaign = (id: string) => {
  return useQuery({
    queryKey: ['campaigns', id],
    queryFn: () => apiService.fetchCampaign(id),
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Campaign>) => apiService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) =>
      apiService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};

// Contacts
export const useContacts = (search?: string) => {
  return useQuery({
    queryKey: ['contacts', search],
    queryFn: () => apiService.fetchContacts(search),
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Contact>) => apiService.createContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      apiService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Templates
export const useTemplates = () => {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => apiService.fetchTemplates(),
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Template>) => apiService.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Template> }) =>
      apiService.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

// Leads
export const useSearchLeads = (domain: string) => {
  return useQuery({
    queryKey: ['leads', domain],
    queryFn: () => apiService.searchLeads(domain),
    enabled: !!domain,
  });
};

// Campaign Sending
export const useSendCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) => apiService.sendCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
};
