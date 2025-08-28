-- Create lead_sources table for managing integrations
CREATE TABLE public.lead_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration_logs table for tracking webhook activity
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.lead_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  payload JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for lead_sources
CREATE POLICY "Users can view their own lead sources" 
ON public.lead_sources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead sources" 
ON public.lead_sources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead sources" 
ON public.lead_sources 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead sources" 
ON public.lead_sources 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for integration_logs
CREATE POLICY "Users can view logs for their lead sources" 
ON public.integration_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lead_sources 
    WHERE lead_sources.id = integration_logs.source_id 
    AND lead_sources.user_id = auth.uid()
  )
);

CREATE POLICY "System can insert integration logs" 
ON public.integration_logs 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lead_sources_updated_at
BEFORE UPDATE ON public.lead_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_lead_sources_user_id ON public.lead_sources(user_id);
CREATE INDEX idx_integration_logs_source_id ON public.integration_logs(source_id);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);