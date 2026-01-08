'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useManagedAssets, useToggleAsset } from '@/hooks/useEnergy';
import { MapboxMap } from '@/components/features/MapboxMap';
import { AssetCard } from '@/components/features/AssetCard';
import { Card } from '@/components/ui';

export default function MapPage() {
  const { data: assets, isLoading } = useManagedAssets();
  const { mutate: toggleAsset } = useToggleAsset();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="text-slate-400 hover:text-white text-sm mb-2 inline-block"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold text-white mb-1">Asset Map</h1>
          <p className="text-slate-400 text-sm">Manage your regional energy assets</p>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 flex gap-4 p-4 max-w-4xl mx-auto w-full min-h-0">
        <div className="flex-1 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
          <MapboxMap />
        </div>

        {/* Assets Panel */}
        <div className="w-80 flex flex-col">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white">Managed Assets</h2>
            <p className="text-xs text-slate-400">
              {assets?.length || 0} connected devices
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
              <Card className="animate-pulse h-20" />
            ) : assets && assets.length > 0 ? (
              assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset.id)}
                  className="cursor-pointer"
                >
                  <AssetCard
                    asset={asset}
                    onToggle={() => toggleAsset(asset.id)}
                  />
                </div>
              ))
            ) : (
              <Card className="text-center text-slate-400 py-8">
                No assets found
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-slate-900 border-t border-slate-800 flex justify-around items-center h-16 sticky bottom-0">
        <Link
          href="/"
          className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors"
        >
          <span className="text-xl">🏠</span>
          <span className="text-xs font-medium mt-1">Home</span>
        </Link>
        <button className="flex-1 flex flex-col items-center justify-center py-2 text-emerald-500 border-b-2 border-emerald-500">
          <span className="text-xl">🗺️</span>
          <span className="text-xs font-medium mt-1">Map</span>
        </button>
        <button className="flex-1 flex flex-col items-center justify-center py-2 text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">👤</span>
          <span className="text-xs font-medium mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
