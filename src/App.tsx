import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CommandShell } from "@/components/layout/CommandShell";
import Index from "./pages/Index";
import ContentNexus from "./pages/ContentNexus";
import MediaFoundry from "./pages/MediaFoundry";
import CentralIntelligence from "./pages/CentralIntelligence";
import BusinessIntelligence from "@/components/BusinessIntelligence";
import AutomationSuite from "@/components/AutomationSuite";
import StudioWorksPipeline from "@/components/StudioWorksPipeline";
import AgentDesignStudio from "./pages/AgentDesignStudio";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import Settings from "./pages/Settings";
import FaithNexusMicrosite from "./pages/FaithNexusMicrosite";
import SovereignLauncher from "./pages/SovereignLauncher";
import BookArchitectStudio from "./pages/BookArchitectStudio";
import LaunchFilmStudio from "./pages/LaunchFilmStudio";
import MotionVideoHub from "./pages/MotionVideoHub";
import { RevenueCommandCenter } from "@/components/RevenueCommandCenter";
import { LeadPipeline } from "@/components/LeadPipeline";
import { PlatformHealthMonitor } from "@/components/PlatformHealthMonitor";

import FaithNexusDashboard from "./pages/FaithNexusDashboard";
import FaithNexusStandaloneView from "./pages/FaithNexusStandaloneView";
import FaithNexusInvitation from "./pages/FaithNexusInvitation";
import ProjectDashboard from "./pages/ProjectDashboard";
import NotFound from "./pages/NotFound";
import IntegroMailDashboard from "./pages/integro-mail/Index";
import IntegroMailCampaigns from "./pages/integro-mail/Campaigns";
import IntegroMailContacts from "./pages/integro-mail/Contacts";
import IntegroMailTemplates from "./pages/integro-mail/Templates";
import IntegroMailLeads from "./pages/integro-mail/Leads";
import IntegroMailSettings from "./pages/integro-mail/Settings";
import WebTemplatesGallery from "./pages/WebTemplatesGallery";
import TemplatePreview from "./pages/TemplatePreview";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectRegistryProvider } from "./contexts/ProjectRegistry";
import { ProjectProvider } from "./contexts/ProjectContext";
import { AuthGate } from "@/components/AuthGate";
import { RestrictedRoute } from "@/components/RestrictedRoute";

// Professional Font Import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
          <ProjectProvider>
            <ProjectRegistryProvider>
              <BrowserRouter>
                <Routes>
                  {/* Default Entry -> OS Nexus */}
                  <Route path="/" element={<Navigate to="/os/nexus" replace />} />

                  {/* The Neural OS Shell */}
                  <Route path="/os" element={<AuthGate><CommandShell /></AuthGate>}>
                    <Route path="nexus" element={<Index />} />

                    {/* Role Restricted: Admin & Marketing only */}
                    <Route path="content" element={
                      <RestrictedRoute allowedRoles={['Admin', 'Marketing']}>
                        <ErrorBoundary><ContentNexus /></ErrorBoundary>
                      </RestrictedRoute>
                    } />

                    {/* Role Restricted: Admin & Design only */}
                    <Route path="media" element={
                      <RestrictedRoute allowedRoles={['Admin', 'Design']}>
                        <MediaFoundry />
                      </RestrictedRoute>
                    } />

                    <Route path="intelligence" element={<CentralIntelligence />} />

                    {/* Admins Only */}
                    <Route path="agents" element={
                      <RestrictedRoute allowedRoles={['Admin']}>
                        <AgentDesignStudio />
                      </RestrictedRoute>
                    } />

                    <Route path="workflows" element={
                      <RestrictedRoute allowedRoles={['Admin', 'Marketing']}>
                        <WorkflowBuilder />
                      </RestrictedRoute>
                    } />

                    {/* Role Restricted: Admin & Sales only */}
                    <Route path="intel" element={
                      <RestrictedRoute allowedRoles={['Admin', 'Sales']}>
                        <BusinessIntelligence />
                      </RestrictedRoute>
                    } />

                    <Route path="automation" element={<AutomationSuite />} />
                    <Route path="studio-pipeline" element={<StudioWorksPipeline />} />
                    <Route path="sovereign-launcher" element={<SovereignLauncher />} />
                    <Route path="book-studio" element={<BookArchitectStudio />} />

                    {/* ── Business Engine ─────────────────────────────────── */}
                    <Route path="revenue" element={<RevenueCommandCenter />} />
                    <Route path="leads" element={<LeadPipeline />} />
                    <Route path="platform-health" element={<PlatformHealthMonitor />} />

                    <Route path="faith-nexus" element={<FaithNexusDashboard />} />
                    <Route path="faith-standalone" element={<FaithNexusStandaloneView />} />
                    <Route path="launch-studio" element={<MotionVideoHub />} />
                    <Route path="projects" element={<ProjectDashboard />} />
                    <Route path="web-templates" element={<WebTemplatesGallery />} />
                    <Route path="web-templates/:templateId" element={<TemplatePreview />} />
                    
                    {/* ── IntegroMail Pro Engine ──────────────────────────── */}
                    <Route path="integro-mail" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><ErrorBoundary><IntegroMailDashboard /></ErrorBoundary></RestrictedRoute>} />
                    <Route path="integro-mail/campaigns" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><IntegroMailCampaigns /></RestrictedRoute>} />
                    <Route path="integro-mail/contacts" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><IntegroMailContacts /></RestrictedRoute>} />
                    <Route path="integro-mail/templates" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><IntegroMailTemplates /></RestrictedRoute>} />
                    <Route path="integro-mail/leads" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><IntegroMailLeads /></RestrictedRoute>} />
                    <Route path="integro-mail/settings" element={<RestrictedRoute allowedRoles={['Admin', 'Marketing']}><IntegroMailSettings /></RestrictedRoute>} />

                    <Route path="settings" element={<Settings />} />
                    {/* Fallback for OS routes */}
                    <Route path="*" element={<Navigate to="/os/nexus" replace />} />
                  </Route>

                  {/* Public Microsites */}
                  <Route path="/p/faith-nexus" element={<FaithNexusMicrosite />} />
                  <Route path="/p/talk-world" element={<SovereignLauncher />} />
                  <Route path="/p/invitation" element={<FaithNexusInvitation />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ProjectRegistryProvider>
          </ProjectProvider>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
