import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { CommandShell } from "@/components/layout/CommandShell";
import Index from "./pages/Index";
import ContentNexus from "./pages/ContentNexus";
import MediaFoundry from "./pages/MediaFoundry";
import CentralIntelligence from "./pages/CentralIntelligence";
import BusinessIntelligence from "@/components/BusinessIntelligence";
import AutomationSuite from "@/components/AutomationSuite";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Professional Font Import
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600;700;800&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <ProjectProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Default Entry -> OS Nexus */}
              <Route path="/" element={<Navigate to="/os/nexus" replace />} />

              {/* The Neural OS Shell */}
              <Route path="/os" element={<CommandShell />}>
                <Route path="nexus" element={<Index />} />
                <Route path="content" element={<ErrorBoundary><ContentNexus /></ErrorBoundary>} />
                <Route path="media" element={<MediaFoundry />} />
                <Route path="intelligence" element={<CentralIntelligence />} />
                <Route path="intel" element={<BusinessIntelligence />} />
                <Route path="automation" element={<AutomationSuite />} />
                {/* Fallback for OS routes */}
                <Route path="*" element={<Navigate to="/os/nexus" replace />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ProjectProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
