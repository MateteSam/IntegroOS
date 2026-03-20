import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthGate } from "@/components/AuthGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandProvider } from "@/contexts/BrandContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import App from "./App";
import "./index.css";
import "./lib/ai/init-keys"; // Initialize API keys

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthGate>
        <App />
        <Toaster />
        <Sonner />
      </AuthGate>
    </ThemeProvider>
  </QueryClientProvider>
);
