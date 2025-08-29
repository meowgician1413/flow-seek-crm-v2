import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LeadProvider } from '../contexts/LeadContext';
import { TemplateProvider } from '../contexts/TemplateContext';
import { CommunicationProvider } from '../contexts/CommunicationContext';
import { ActivityProvider } from '../contexts/ActivityContext';
import { ContentProvider } from '../contexts/ContentContext';
import { IntegrationProvider } from '../contexts/IntegrationContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Toaster } from '../components/ui/sonner';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MobileLayout } from '../components/layout/MobileLayout';

// Pages
import { AuthPage } from './AuthPage';
import { Dashboard } from './Dashboard';
import { Leads } from './Leads';
import { LeadDetail } from './LeadDetail';
import Integrations from './Integrations';
import { Templates } from './Templates';
import { Settings } from './Settings';
import { Files } from './Files';
import { Pages } from './Pages';
import { NotFound } from './NotFound';

const Index = () => {
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
        <MobileLayout title="Dashboard">
          <Dashboard />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
        <MobileLayout title="Dashboard">
          <Dashboard />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/leads" element={
                        <ProtectedRoute>
        <MobileLayout title="Leads">
          <Leads />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/leads/:id" element={
                        <ProtectedRoute>
        <MobileLayout title="Lead Details">
          <LeadDetail />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/integrations" element={
                        <ProtectedRoute>
        <MobileLayout title="Integrations">
          <Integrations />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/templates" element={
                        <ProtectedRoute>
        <MobileLayout title="Templates">
          <Templates />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                      <Route path="/files" element={
                        <ProtectedRoute>
        <MobileLayout title="Files">
          <Files />
        </MobileLayout>
                        </ProtectedRoute>
                      } />
                       <Route path="/pages" element={
                         <ProtectedRoute>
                           <MobileLayout title="Pages">
                             <Pages />
                           </MobileLayout>
                         </ProtectedRoute>
                       } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
        <MobileLayout title="Settings">
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
};

export default Index;
