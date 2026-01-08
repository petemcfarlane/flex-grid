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
  ReferenceLine,
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
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentPeriodIndex = currentHour * 2 + (currentMinute >= 30 ? 1 : 0);

  // Find the current period in the data based on timestamp
  let currentDataIndex = currentPeriodIndex; // Default fallback to calculated index
  if (data[0]?.timestamp) {
    const nowTimestamp = now.getTime();
    const foundIndex = data.findIndex((period, index) => {
      const periodTime = new Date(period.timestamp!).getTime();
      const nextPeriodTime = data[index + 1] ? new Date(data[index + 1].timestamp!).getTime() : Infinity;
      return nowTimestamp >= periodTime && nowTimestamp < nextPeriodTime;
    });
    if (foundIndex !== -1) currentDataIndex = foundIndex;
  }

  // Show 12 hours (24 periods) before and after current time for rolling 24-hour window
  const startIndex = Math.max(0, currentDataIndex - 24);
  const endIndex = Math.min(data.length, currentDataIndex + 24);
  const visibleData = data.slice(startIndex, endIndex);

  // Use all visible half-hourly periods directly
  const chartData = visibleData.map((period, index) => ({
    time: period.time,
    cost: period.cost,
    isCurrent: startIndex + index === currentDataIndex,
    period: period.period,
  }));

  // Find the current period's time for the reference line
  const currentBarIndex = currentDataIndex - startIndex;
  const currentBarTime = chartData[currentBarIndex]?.time;

  const getBarColor = (item: any) => {
    if (item.isCurrent) return '#10b981'; // Emerald for current
    if (item.cost < 10) return '#3b82f6'; // Blue for cheap
    if (item.cost > 20) return '#f97316'; // Orange for expensive
    return '#64748b'; // Slate grey for normal
  };

  return (
    <div className="w-full h-64 bg-slate-800 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 15, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#cbd5e1', fontSize: 10 }}
            interval={5}
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
          <ReferenceLine 
            x={currentBarTime}
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth={2}
            label={{ value: 'Now', position: 'top', fill: '#10b981', fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
