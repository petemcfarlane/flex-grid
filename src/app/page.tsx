'use client';

import React from 'react';
import Link from 'next/link';
import { useGridStatus, useTariffData, useFlexOpportunities } from '@/hooks/useEnergy';

import { Header } from '@/components/features/Header';
import { GridStatusCard } from '@/components/features/GridStatusCard';
import { PriceChart } from '@/components/features/PriceChart';
import { FlexCard } from '@/components/features/FlexCard';
import { Card } from '@/components/ui';

export default function DashboardPage() {
  const { data: gridStatus, isLoading: gridLoading } = useGridStatus();
  const { data: tariffData, isLoading: tariffLoading } = useTariffData();
  const { data: flexOpp } = useFlexOpportunities();

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6 pt-20">
        {/* Grid Status */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Grid Status</h2>
          <GridStatusCard status={gridStatus} isLoading={gridLoading} />
        </div>

        {/* Price Chart */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Real-time Price</h2>
          {tariffLoading ? (
            <Card className="h-64 bg-slate-800 animate-pulse" />
          ) : tariffData ? (
            <div className="space-y-2">
              <PriceChart data={tariffData} />
              <p className="text-xs text-slate-400">
                Next price drop: 2:30 PM (8.1p)
              </p>
            </div>
          ) : null}
        </div>

        {/* Flex Opportunity */}
        {flexOpp && flexOpp.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Flex Opportunity</h2>
            <FlexCard opportunity={flexOpp[0]} />
          </div>
        )}

        {/* Navigation to Map */}
        <div>
          <Link
            href="/map"
            className="inline-block w-full text-center py-3 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            View Asset Map →
          </Link>
        </div>
      </main>
    </div>
  );
}
