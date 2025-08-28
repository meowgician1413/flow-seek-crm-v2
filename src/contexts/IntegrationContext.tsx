import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeadSource, IntegrationLog } from '@/types/integration';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface IntegrationContextType {
  sources: LeadSource[];
  logs: IntegrationLog[];
  loading: boolean;
  createSource: (source: Omit<LeadSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateSource: (id: string, updates: Partial<LeadSource>) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  testWebhook: (id: string) => Promise<boolean>;
  refreshSources: () => Promise<void>;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSources((data || []) as LeadSource[]);
    } catch (error) {
      console.error('Error fetching lead sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select(`
          *,
          lead_sources!inner(user_id)
        `)
        .eq('lead_sources.user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs((data || []) as IntegrationLog[]);
    } catch (error) {
      console.error('Error fetching integration logs:', error);
    }
  };

  const createSource = async (sourceData: Omit<LeadSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .insert({
          ...sourceData,
          user_id: user.id,
          webhook_url: sourceData.type === 'webhook' ? 
            `https://pyulapnrniifktabiltp.supabase.co/functions/v1/webhook-receiver/${user.id}` : 
            null
        })
        .select()
        .single();

      if (error) throw error;
      setSources(prev => [data as LeadSource, ...prev]);
    } catch (error) {
      console.error('Error creating lead source:', error);
      throw error;
    }
  };

  const updateSource = async (id: string, updates: Partial<LeadSource>) => {
    try {
      const { data, error } = await supabase
        .from('lead_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setSources(prev => prev.map(source => source.id === id ? data as LeadSource : source));
    } catch (error) {
      console.error('Error updating lead source:', error);
      throw error;
    }
  };

  const deleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lead_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSources(prev => prev.filter(source => source.id !== id));
    } catch (error) {
      console.error('Error deleting lead source:', error);
      throw error;
    }
  };

  const testWebhook = async (id: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { source_id: id }
      });

      if (error) throw error;
      return data.success;
    } catch (error) {
      console.error('Error testing webhook:', error);
      return false;
    }
  };

  const refreshSources = async () => {
    setLoading(true);
    await fetchSources();
    await fetchLogs();
  };

  useEffect(() => {
    if (user) {
      fetchSources();
      fetchLogs();
    }
  }, [user]);

  return (
    <IntegrationContext.Provider value={{
      sources,
      logs,
      loading,
      createSource,
      updateSource,
      deleteSource,
      testWebhook,
      refreshSources
    }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegrations() {
  const context = useContext(IntegrationContext);
  if (context === undefined) {
    throw new Error('useIntegrations must be used within an IntegrationProvider');
  }
  return context;
}