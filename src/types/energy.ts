/**
 * Energy domain types
 */

export interface SettlementPeriod {
  period: number; // Timestamp or 1-48
  time: string; // HH:mm format
  timestamp?: string; // ISO timestamp for ordering
  cost: number; // pence per kWh
}

export interface Tariff {
  name: string;
  periods: SettlementPeriod[];
  date: string;
  updateTime: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'ev' | 'heat_pump' | 'battery' | 'solar';
  status: 'charging' | 'optimized' | 'idle' | 'discharging';
  location: {
    lat: number;
    lng: number;
  };
  power?: number; // kW
  soc?: number; // State of charge percentage
}

export interface DNORegion {
  id: string;
  name: string;
  geojson: any;
  assets: Asset[];
}

export interface GridStatus {
  intensity: number; // gCO2/kWh
  status: 'high' | 'moderate' | 'low';
  carbonIntensity: number;
  generationmix: Array<{
    fuel: string;
    perc: number;
  }>;
}

export interface FlexOpportunity {
  id: string;
  title: string;
  description: string;
  reward: number; // pounds
  durationHours: number;
  deadline: string;
  type: 'delay' | 'shift' | 'reduce';
}
