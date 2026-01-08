'use client';

import { useState } from 'react';
import axios from 'axios';
import { useManagedAssets, useToggleAsset } from '@/hooks/useEnergy';
import { Header } from '@/components/features/Header';
import { MapboxMap } from '@/components/features/MapboxMap';
import { AssetCard } from '@/components/features/AssetCard';
import { Card } from '@/components/ui';

export default function MapPage() {
  const { data: assets, isLoading } = useManagedAssets();
  const { mutate: toggleAsset } = useToggleAsset();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [showRegions, setShowRegions] = useState(false);
  const [regionalData, setRegionalData] = useState<any>(null);
  const [loadingRegions, setLoadingRegions] = useState(false);

  const handleShowRegions = async () => {
    if (showRegions) {
      setShowRegions(false);
      return;
    }
    
    setLoadingRegions(true);
    try {
      const response = await axios.get('/api/regional-status');
      setRegionalData(response.data);
      setShowRegions(true);
    } catch (error) {
      console.error('Failed to load regional data:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      <Header />

      {/* Map Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-4xl mx-auto w-full overflow-hidden pt-20">
        <div className="w-full h-64 lg:flex-1 lg:h-auto rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 lg:sticky lg:top-0 relative">
          <MapboxMap assets={assets} showRegions={showRegions} regionalData={regionalData} />
          
          {/* Regional Overlay */}
          {showRegions && regionalData?.data && (
            <div className="absolute bottom-4 left-4 bg-slate-800 rounded-lg p-4 max-w-xs max-h-80 overflow-y-auto border border-slate-700 z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">Regions</h3>
                <button
                  onClick={handleShowRegions}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {(regionalData.data || []).filter((r: any) => r.regionid <= 14).map((region: any) => (
                  <div
                    key={region.regionid}
                    className={`p-2 rounded text-xs ${
                      region.intensity?.index === 'low'
                        ? 'bg-emerald-600/20 border border-emerald-500/30'
                        : region.intensity?.index === 'high'
                        ? 'bg-orange-600/20 border border-orange-500/30'
                        : 'bg-slate-600/20 border border-slate-500/30'
                    }`}
                  >
                    <div className="font-semibold text-white">{region.dnoregion}</div>
                    <div className="text-slate-300">{region.intensity?.actual} gCO₂/kWh</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show Regions Button */}
          <button
            onClick={handleShowRegions}
            disabled={loadingRegions}
            className="absolute top-4 right-4 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors z-10"
          >
            {loadingRegions ? '...' : showRegions ? 'Hide Regions' : 'Show Regions'}
          </button>
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
