import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LeadProvider } from "@/contexts/LeadContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Dashboard } from "@/pages/Dashboard";
import { Leads } from "@/pages/Leads";
import { LeadDetail } from "@/pages/LeadDetail";
import { Templates } from "@/pages/Templates";
import { Settings } from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <LeadProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MobileLayout>
                    <Dashboard />
                  </MobileLayout>
                </ProtectedRoute>
              } />
              <Route path="/leads" element={
                <ProtectedRoute>
                  <MobileLayout>
                    <Leads />
                  </MobileLayout>
                </ProtectedRoute>
              } />
              <Route path="/lead/:id" element={
                <ProtectedRoute>
                  <LeadDetail />
                </ProtectedRoute>
              } />
              <Route path="/templates" element={
                <ProtectedRoute>
                  <MobileLayout>
                    <Templates />
                  </MobileLayout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <MobileLayout>
                    <Settings />
                  </MobileLayout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </LeadProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
