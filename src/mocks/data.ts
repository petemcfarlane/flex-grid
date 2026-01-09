import { SettlementPeriod, Asset, FlexOpportunity } from '@/types/energy';

/**
 * Generate mock tariff data for 48 half-hourly periods
 */
export function generateMockTariff(date = new Date()): SettlementPeriod[] {
  const periods: SettlementPeriod[] = [];
  const basePrice = 14.2; // pence per kWh (from the design)

  for (let period = 1; period <= 48; period++) {
    const hour = Math.floor((period - 1) / 2);
    const minute = (period - 1) % 2 === 0 ? 0 : 30;
    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // Simulate realistic pricing with morning/evening peaks
    let cost = basePrice;
    if (hour >= 7 && hour < 9) cost += 8; // Morning peak
    else if (hour >= 17 && hour < 21) cost += 12; // Evening peak
    else if (hour >= 22 || hour < 6) cost -= 5; // Night off-peak
    else cost += 2; // Day baseline

    // Add some randomness
    cost += (Math.random() - 0.5) * 2;
    cost = Math.max(5, Math.min(35, cost)); // Clamp between 5p and 35p

    periods.push({
      period,
      time,
      cost: Math.round(cost * 100) / 100,
    });
  }

  return periods;
}

/**
 * Mock managed assets
 */
export const mockAssets: Asset[] = [
  {
    id: 'tesla-1',
    name: 'Tesla Model 3',
    type: 'ev',
    status: 'charging',
    location: { lat: 51.5074, lng: -0.1278 }, // London
    power: 7.5,
    soc: 65,
  },
  {
    id: 'heatpump-1',
    name: 'Heat Pump - 2 Haymarket',
    type: 'heat_pump',
    status: 'optimized',
    location: { lat: 51.5051, lng: -0.1296 }, // London
    power: 3.2,
  },
  {
    id: 'battery-1',
    name: 'Home Battery Storage',
    type: 'battery',
    status: 'idle',
    location: { lat: 51.5135, lng: -0.1204 }, // London
    soc: 45,
  },
  {
    id: 'solar-1',
    name: 'Roof Solar Array',
    type: 'solar',
    status: 'idle',
    location: { lat: 51.5200, lng: -0.1250 }, // London
    power: 0,
  },
  {
    id: 'ev-manchester',
    name: 'Nissan Leaf',
    type: 'ev',
    status: 'idle',
    location: { lat: 53.4808, lng: -2.2426 }, // Manchester
    power: 6.6,
    soc: 82,
  },
  {
    id: 'battery-cardiff',
    name: 'Powerwall - Cardiff',
    type: 'battery',
    status: 'charging',
    location: { lat: 51.4816, lng: -3.1791 }, // Cardiff, Wales
    power: 5.0,
    soc: 58,
  },
];

/**
 * Mock flex opportunities
 */
export const mockFlexOpportunities: FlexOpportunity[] = [
  {
    id: 'flex-1',
    title: 'Flex Opportunity',
    description: 'The grid is under pressure. Earn £1.20 by delay your EV charge by 2 hours',
    reward: 1.2,
    durationHours: 2,
    deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    type: 'delay',
  },
];

/**
 * Get current settlement period (mock)
 */
export function getCurrentPeriod(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const period = Math.floor((hour * 60 + minute) / 30) + 1;
  return Math.min(48, period);
}
