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
  const { data: gridResponse, isLoading: gridLoading } = useGridStatus();
  const { data: tariffData, isLoading: tariffLoading } = useTariffData();
  const { data: flexOpp } = useFlexOpportunities();

  const gridStatus = (gridResponse as any)?.status;
  const generation = (gridResponse as any)?.generation;

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6 pt-20">
        {/* Grid Status */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Grid Status</h2>
          <GridStatusCard status={gridStatus} isLoading={gridLoading} generation={generation} />
        </div>

        {/* Price Chart */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Real-time Price</h2>
          {tariffLoading ? (
            <Card className="h-64 bg-slate-800 animate-pulse" />
          ) : tariffData ? (
            <div className="space-y-3">
              {/* Tariff Selector */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-700/50 rounded border border-slate-600 hover:border-emerald-500/30 transition-colors cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tariff:</span>
                  <span className="text-sm font-medium text-white">Octopus Agile</span>
                </div>
                <span className="text-xs text-slate-500">Soon: Change tariff</span>
              </div>
              <PriceChart data={tariffData} />
              {(() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const currentPeriodIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);
                const currentPrice = tariffData[currentPeriodIndex]?.cost || 0;
                
                // Find next price drop
                let nextDrop = null;
                for (let i = currentPeriodIndex + 1; i < tariffData.length; i++) {
                  if (tariffData[i].cost < currentPrice) {
                    nextDrop = tariffData[i];
                    break;
                  }
                }
                
                return (
                  <div className="space-y-2">
                    {nextDrop ? (
                      <p className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Next price drop:</span> {nextDrop.time} ({nextDrop.cost}p)
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No lower prices today
                      </p>
                    )}
                    <p className="text-xs text-slate-500 italic">
                      Agile tariff updates prices every 30 minutes based on wholesale rates. 
                      <span className="block mt-1 flex flex-wrap gap-4">
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                          Cheap (&lt;10p)
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-slate-500"></span>
                          Normal
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-500"></span>
                          Expensive (&gt;20p)
                        </span>
                      </span>
                    </p>
                  </div>
                );
              })()}
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
