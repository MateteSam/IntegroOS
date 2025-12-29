import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthGate } from "@/components/AuthGate";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BrandProvider } from "@/contexts/BrandContext";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrandProvider>
        <AuthGate>
          <App />
          <Toaster />
          <Sonner />
        </AuthGate>
      </BrandProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
