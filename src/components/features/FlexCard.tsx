'use client';

import React from 'react';
import { Card, Button } from '@/components/ui';
import { FlexOpportunity } from '@/types/energy';
import { useFlexOptIn } from '@/hooks/useEnergy';
import { useToast } from '@/lib/toast';

interface FlexCardProps {
  opportunity: FlexOpportunity;
}

export const FlexCard: React.FC<FlexCardProps> = ({ opportunity }) => {
  const { mutate: optIn, isPending } = useFlexOptIn();
  const toast = useToast();

  const handleOptIn = () => {
    optIn(opportunity.id, {
      onSuccess: () => {
        toast.success(`✅ Opted in! You'll earn £${opportunity.reward} by ${opportunity.type}ing for ${opportunity.durationHours}h`);
      },
      onError: () => {
        toast.error('Failed to opt in. Please try again.');
      },
    });
  };

  return (
    <Card variant="elevated" className="bg-gradient-to-br from-purple-600 to-blue-600 border-0">
      <h3 className="text-xl font-bold text-white mb-2">{opportunity.title}</h3>
      <p className="text-white/90 text-sm mb-4">{opportunity.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold text-white">
          £{opportunity.reward.toFixed(2)}
        </div>
        <div className="text-xs text-white/75">
          {opportunity.durationHours}h window
        </div>
      </div>

      <Button
        onClick={handleOptIn}
        disabled={isPending}
        variant="primary"
        size="lg"
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
      >
        {isPending ? 'Opting in...' : '[Opt-In to Flex Event]'}
      </Button>
    </Card>
  );
};
