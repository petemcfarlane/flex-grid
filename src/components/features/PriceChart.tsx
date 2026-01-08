'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SettlementPeriod } from '@/types/energy';
import { getCurrentPeriod } from '@/mocks/data';

interface PriceChartProps {
  data: SettlementPeriod[];
}

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '8px',
        }}
      >
        <p style={{ color: '#cbd5e1', margin: '0 0 4px 0' }}>{label}</p>
        <p style={{ color: '#cbd5e1', margin: '0' }}>
          {payload[0].value}p
        </p>
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const currentPeriod = getCurrentPeriod();

  // Transform data for Recharts - group into hours instead of 30-min periods for readability
  const chartData = [];
  for (let i = 0; i < data.length; i += 2) {
    const period1 = data[i];
    const period2 = data[i + 1];
    const avgCost = (period1.cost + (period2?.cost || period1.cost)) / 2;
    const periodNum = Math.floor(i / 2) + 1;

    chartData.push({
      time: period1.time,
      cost: Math.round(avgCost * 100) / 100,
      isCurrent: Math.floor(currentPeriod / 2) === periodNum,
      periodStart: period1.period,
    });
  }

  const getBarColor = (item: any) => {
    if (item.isCurrent) return '#10b981'; // Emerald for current
    if (item.cost < 10) return '#3b82f6'; // Blue for cheap
    if (item.cost > 20) return '#f97316'; // Orange for expensive
    return '#60a5fa'; // Light blue for normal
  };

  return (
    <div className="w-full h-64 bg-slate-800 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 15, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            interval={3}
          />
          <YAxis
            label={{ value: 'p/kWh', angle: -90, position: 'insideLeft', dx: -10 }}
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            domain={[0, 40]}
            width={30}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
