'use client';

import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { GridStatus } from '@/types/energy';
import { useRegionalStatus } from '@/hooks/useEnergy';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface GridStatusCardProps {
  status: GridStatus | undefined;
  isLoading?: boolean;
  generation?: {
    generationmix: Array<{ fuel: string; perc: number }>;
  };
}

export const GridStatusCard: React.FC<GridStatusCardProps> = ({ status, isLoading, generation }) => {
  const [postcodeInput, setPostcodeInput] = useState('');
  const [submittedPostcode, setSubmittedPostcode] = useState<string | undefined>(undefined);
  const [hoveredFuel, setHoveredFuel] = useState<string | null>(null);
  const { data: regionalData, isLoading: regionalLoading } = useRegionalStatus(submittedPostcode);
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

  const getStatusDescription = (statusStr: string) => {
    switch (statusStr) {
      case 'low':
        return 'Great time to use energy - lots of renewable power on the grid';
      case 'moderate':
        return 'Average carbon intensity - a mix of renewable and fossil fuel power';
      case 'high':
        return 'High fossil fuel usage - consider delaying energy-intensive activities';
      default:
        return '';
    }
  };

  // Get renewable percentage
  const renewablePerc = generation?.generationmix
    ?.filter(g => ['wind', 'solar', 'hydro', 'biomass'].includes(g.fuel))
    .reduce((sum, g) => sum + g.perc, 0) || 0;

  // Sort generation mix by percentage descending
  const sortedMix = [...(generation?.generationmix || [])]
    .sort((a, b) => b.perc - a.perc)
    .filter(g => g.perc > 0); // Show all sources with >0%

  const fuelEmojis: Record<string, string> = {
    wind: '💨',
    solar: '☀️',
    nuclear: '⚛️',
    gas: '🔥',
    coal: '🪨',
    hydro: '💧',
    biomass: '🌱',
    imports: '⚡',
    other: '❓',
  };

  const fuelColors: Record<string, string> = {
    wind: '#0ea5e9',      // sky-500
    solar: '#fbbf24',     // amber-400
    nuclear: '#8b5cf6',   // violet-500
    gas: '#ef4444',       // red-500
    coal: '#6b7280',      // gray-500
    hydro: '#06b6d4',     // cyan-500
    biomass: '#10b981',   // emerald-500
    imports: '#f59e0b',   // amber-500
    other: '#9ca3af',     // gray-400
  };

  const fuelOrder = ['wind', 'solar', 'nuclear', 'hydro', 'biomass', 'imports', 'gas', 'coal', 'other'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && hoveredFuel) {
      const data = payload.find((p: any) => p.dataKey === hoveredFuel);
      if (data) {
        return (
          <div className="bg-slate-800 border border-slate-600 rounded px-2 py-1.5 shadow-lg">
            <p className="text-xs text-slate-200 capitalize font-medium">{data.dataKey}</p>
            <p className="text-xs text-white font-semibold">{data.value.toFixed(1)}%</p>
          </div>
        );
      }
    }
    return null;
  };

  const renderGenerationMix = (mix: Array<{ fuel: string; perc: number }> | undefined) => {
    if (!mix || mix.length === 0) return null;

    const sortedMix = [...mix]
      .filter(g => g.perc > 0)
      .sort((a, b) => {
        const aIndex = fuelOrder.indexOf(a.fuel);
        const bIndex = fuelOrder.indexOf(b.fuel);
        return aIndex - bIndex;
      });
    const chartData = [
      { name: 'Generation Mix', ...Object.fromEntries(sortedMix.map(g => [g.fuel, g.perc])) }
    ];

    return (
      <div className="space-y-2">
        <ResponsiveContainer width="100%" height={40}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.5)' }} />
            {sortedMix.map((item, index) => (
              <Bar
                key={item.fuel}
                dataKey={item.fuel}
                stackId="fuel"
                fill={fuelColors[item.fuel] || '#9ca3af'}
                isAnimationActive={false}
                onMouseEnter={() => setHoveredFuel(item.fuel)}
                onMouseLeave={() => setHoveredFuel(null)}
                radius={index === 0 ? [6, 0, 0, 6] : index === sortedMix.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {sortedMix.map(item => (
            <div key={item.fuel} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: fuelColors[item.fuel] }}
              />
              <span className="text-slate-300 capitalize">{item.fuel}</span>
              <span className="text-white font-semibold">{item.perc.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col gap-4">
      {/* Postcode Input */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Postcode (e.g., LA10)"
            value={postcodeInput}
            onChange={(e) => setPostcodeInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && postcodeInput) {
                setSubmittedPostcode(postcodeInput);
              }
            }}
            className="flex-1 px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-emerald-500 min-w-0"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (postcodeInput) {
                  setSubmittedPostcode(postcodeInput);
                }
              }}
              disabled={!postcodeInput || regionalLoading}
              className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm rounded font-medium transition-colors whitespace-nowrap"
            >
              {regionalLoading ? '...' : 'Check'}
            </button>
            {submittedPostcode && (
              <button
                onClick={() => {
                  setSubmittedPostcode(undefined);
                  setPostcodeInput('');
                }}
                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded font-medium transition-colors whitespace-nowrap"
              >
                National
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Regional or National Status */}
      {submittedPostcode && regionalData?.data?.[0] ? (
        <>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div>
              <p className="text-slate-400 text-sm mb-1">
                Your Region ({regionalData.data[0].shortname || regionalData.data[0].dnoregion})
              </p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">
                  {regionalData.data[0].data?.[0]?.intensity?.forecast || regionalData.data[0].intensity?.actual || '—'}
                </div>
                <div className="text-xs text-slate-400">gCO₂/kWh</div>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(regionalData.data[0].data?.[0]?.intensity?.index || regionalData.data[0].intensity?.index || 'high')}>
              {regionalData.data[0].data?.[0]?.intensity?.index === 'low' ? 'Low Carbon' : regionalData.data[0].data?.[0]?.intensity?.index === 'moderate' ? 'Moderate' : 'High Carbon'}
            </Badge>
          </div>

          {/* Regional generation mix if available */}
          {regionalData.data[0].data?.[0]?.generationmix && (
            <div className="space-y-3 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-300">Generation Mix</p>
                <p className="text-xs text-emerald-400 font-semibold">
                  {([...regionalData.data[0].data[0].generationmix]
                    .filter(g => ['wind', 'solar', 'hydro', 'biomass'].includes(g.fuel))
                    .reduce((sum, g) => sum + g.perc, 0)).toFixed(0)}% Renewable
                </p>
              </div>
              {renderGenerationMix(regionalData.data[0].data[0].generationmix)}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between pb-2 border-b border-slate-700">
            <div>
              <p className="text-slate-400 text-sm mb-1">Grid Carbon Intensity (UK)</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-white">{status?.carbonIntensity}</div>
                <div className="text-xs text-slate-400">gCO₂/kWh</div>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(status?.status || 'high')}>
              {statusLabel}
            </Badge>
          </div>
        </>
      )}

      <p className="text-xs text-slate-400 leading-relaxed">
        {submittedPostcode && regionalData?.data 
          ? 'Regional carbon intensity for your area. Lower is greener!'
          : getStatusDescription(status?.status || 'high')}
      </p>

      {/* Generation Mix - National only when no postcode selected */}
      {!submittedPostcode && generation?.generationmix && (
        <div className="space-y-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-300">Generation Mix</p>
            <p className="text-xs text-emerald-400 font-semibold">{renewablePerc.toFixed(0)}% Renewable</p>
          </div>
          {renderGenerationMix(generation.generationmix)}
        </div>
      )}

      <p className="text-xs text-slate-500 italic">
        gCO₂/kWh = grams of CO₂ produced per kilowatt-hour of electricity
      </p>
    </Card>
  );
};
