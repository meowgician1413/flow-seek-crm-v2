import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LeadProvider } from './contexts/LeadContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { CommunicationProvider } from './contexts/CommunicationContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { ContentProvider } from './contexts/ContentContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Toaster } from './components/ui/sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MobileLayout } from './components/layout/MobileLayout';

// Pages
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import Integrations from './pages/Integrations';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Files } from './pages/Files';
import { Pages } from './pages/Pages';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <LeadProvider>
            <TemplateProvider>
              <CommunicationProvider>
                <ActivityProvider>
                  <ContentProvider>
                    <IntegrationProvider>
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
                      <Route path="/leads/:id" element={
                        <ProtectedRoute>
                          <MobileLayout>
                            <LeadDetail />
                          </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/integrations" element={
                        <ProtectedRoute>
                          <MobileLayout>
                            <Integrations />
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
                      <Route path="/files" element={
                        <ProtectedRoute>
                          <MobileLayout>
                            <Files />
                          </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/pages" element={
                        <ProtectedRoute>
                          <MobileLayout>
                            <Pages />
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
                    </IntegrationProvider>
                  </ContentProvider>
                </ActivityProvider>
              </CommunicationProvider>
            </TemplateProvider>
          </LeadProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
