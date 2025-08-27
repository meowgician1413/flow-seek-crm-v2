import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LeadProvider } from './contexts/LeadContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { Toaster } from './components/ui/toaster';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileLayout } from './components/layout/MobileLayout';

// Pages
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LeadProvider>
          <TemplateProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <MobileLayout>
                      <Dashboard />
                    </MobileLayout>
                  </ProtectedRoute>
                } />
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
                    <MobileLayout>
                      <LeadDetail />
                    </MobileLayout>
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
              <Toaster />
            </div>
          </TemplateProvider>
        </LeadProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
