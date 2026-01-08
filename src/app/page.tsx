'use client';

import React from 'react';
import Link from 'next/link';
import { useGridStatus, useTariffData, useFlexOpportunities } from '@/hooks/useEnergy';
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
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Live Grid</h1>
          <p className="text-slate-400 text-sm">Real-time energy settlement and flex opportunities</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
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
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex justify-around items-center h-16">
        <button className="flex-1 flex flex-col items-center justify-center py-2 text-emerald-500 border-b-2 border-emerald-500">
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium mt-1">Home</span>
        </button>
        <Link
          href="/map"
          className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-xl">🗺️</span>
          <span className="text-xs font-medium mt-1">Map</span>
        </Link>
        <button className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">👤</span>
          <span className="text-xs font-medium mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
