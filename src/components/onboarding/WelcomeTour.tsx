import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Users, Zap, FileText, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
}

interface WelcomeTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    title: 'Welcome to LeadFlow',
    description: 'Your all-in-one CRM solution for managing leads and growing your business.',
    icon: Users,
    features: [
      'Track leads through your sales pipeline',
      'Automate follow-ups and notifications',
      'Generate professional templates',
      'Monitor performance with analytics'
    ]
  },
  {
    title: 'Manage Your Leads',
    description: 'Organize, track, and convert leads with our powerful lead management system.',
    icon: Users,
    features: [
      'Add leads from multiple sources',
      'Track status and progress',
      'Set follow-up reminders',
      'View detailed lead history'
    ]
  },
  {
    title: 'Powerful Integrations',
    description: 'Connect with your favorite tools and automate your workflow.',
    icon: Zap,
    features: [
      'Webhook integrations',
      'AI-powered lead scoring',
      'Email automation',
      'Real-time notifications'
    ]
  },
  {
    title: 'Professional Templates',
    description: 'Create and manage email templates for consistent communication.',
    icon: FileText,
    features: [
      'Ready-to-use templates',
      'Custom template builder',
      'Variable substitution',
      'A/B testing capabilities'
    ]
  },
  {
    title: 'Analytics & Insights',
    description: 'Track your performance and make data-driven decisions.',
    icon: BarChart3,
    features: [
      'Conversion rate tracking',
      'Lead source analytics',
      'Performance reports',
      'ROI calculations'
    ]
  }
];

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Step {currentStep + 1} of {tourSteps.length}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Icon className="h-8 w-8" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-1">{step.title}</h2>
                <p className="text-white/90 text-sm">{step.description}</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-6">
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-3">Key Features:</h3>
              
              {step.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {tourSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : index < currentStep
                        ? 'bg-primary/50'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="flex items-center gap-2 btn-gradient"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Skip option */}
            <div className="text-center mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip tour
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};