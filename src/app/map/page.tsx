'use client';

import { useState } from 'react';
import { useManagedAssets, useToggleAsset } from '@/hooks/useEnergy';
import { Header } from '@/components/features/Header';
import { MapboxMap } from '@/components/features/MapboxMap';
import { AssetCard } from '@/components/features/AssetCard';
import { Card } from '@/components/ui';

export default function MapPage() {
  const { data: assets, isLoading } = useManagedAssets();
  const { mutate: toggleAsset } = useToggleAsset();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      <Header />

      {/* Map Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-4xl mx-auto w-full overflow-hidden pt-20">
        <div className="w-full h-64 lg:flex-1 lg:h-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 lg:sticky lg:top-0">
          <MapboxMap assets={assets} />
        </div>

        {/* Assets Panel */}
        <div className="w-full lg:w-80 flex flex-col">
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
      </main>
    </div>
  );
}
