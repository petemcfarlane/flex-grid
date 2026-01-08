'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { GridStatus } from '@/types/energy';

interface GridStatusCardProps {
  status: GridStatus | undefined;
  isLoading?: boolean;
}

export const GridStatusCard: React.FC<GridStatusCardProps> = ({ status, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <div className="h-12 bg-slate-700 rounded mb-2" />
        <div className="h-6 bg-slate-700 rounded w-1/2" />
      </Card>
    );
  }

  const getStatusBadgeVariant = (statusStr: string) => {
    switch (statusStr) {
      case 'low':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const statusLabel =
    status?.status === 'low'
      ? 'Low Carbon'
      : status?.status === 'moderate'
      ? 'Moderate'
      : 'High Carbon';

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm mb-1">Grid Status</p>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold text-white">{status?.carbonIntensity}</div>
          <div className="text-xs text-slate-400">gCO₂/kWh</div>
        </div>
      </div>
      <Badge variant={getStatusBadgeVariant(status?.status || 'high')}>
        {statusLabel}
      </Badge>
    </Card>
  );
};
