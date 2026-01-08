'use client';

import React from 'react';
import { Card, Badge } from '@/components/ui';
import { Asset } from '@/types/energy';

interface AssetCardProps {
  asset: Asset;
  onToggle?: (assetId: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onToggle }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'charging':
      case 'optimized':
        return 'success';
      case 'discharging':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'ev':
        return '🔌';
      case 'heat_pump':
        return '🔥';
      case 'battery':
        return '🔋';
      case 'solar':
        return '☀️';
      default:
        return '⚡';
    }
  };

  return (
    <Card className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{getAssetIcon(asset.type)}</span>
          <div>
            <h4 className="font-semibold text-white">{asset.name}</h4>
            <Badge variant={getStatusColor(asset.status)} className="text-xs">
              {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
            </Badge>
          </div>
        </div>
        {asset.soc !== undefined && (
          <div className="text-xs text-slate-400 ml-11">
            Battery: {asset.soc}%
          </div>
        )}
        {asset.power !== undefined && asset.power > 0 && (
          <div className="text-xs text-slate-400 ml-11">
            Power: {asset.power} kW
          </div>
        )}
      </div>

      <div>
        <button
          onClick={() => onToggle?.(asset.id)}
          className="w-12 h-6 bg-slate-700 rounded-full relative transition-colors hover:bg-slate-600"
          aria-label={`Toggle ${asset.name}`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              asset.status === 'charging' || asset.status === 'optimized'
                ? 'right-1'
                : 'left-1'
            }`}
          />
        </button>
      </div>
    </Card>
  );
};
