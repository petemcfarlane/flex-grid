import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { GridStatus, Asset, FlexOpportunity } from '@/types/energy';
import { generateMockTariff, mockAssets, mockFlexOpportunities } from '@/mocks/data';

/**
 * Fetch real grid carbon intensity from UK API
 */
export function useGridStatus() {
  return useQuery({
    queryKey: ['grid-status'],
    queryFn: async (): Promise<GridStatus> => {
      try {
        const response = await axios.get('/api/grid-status');
        const apiData = response.data?.data;
        
        // API returns { data: [{ intensity: { actual, forecast, index } }] }
        let intensity = 150;
        let status: 'low' | 'moderate' | 'high' = 'low';
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          intensity = apiData[0].intensity?.actual || 150;
          status = apiData[0].intensity?.index || 'low';
        }
        
        return {
          intensity,
          carbonIntensity: intensity,
          status: status === 'high' ? 'high' : status === 'moderate' ? 'moderate' : 'low',
          generationmix: [],
        };
      } catch (error) {
        // Fallback if API is unavailable
        console.error('Grid status fetch error:', error);
        return {
          intensity: 150,
          carbonIntensity: 150,
          status: 'low',
          generationmix: [],
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch tariff data (mocked)
 */
export function useTariffData() {
  return useQuery({
    queryKey: ['tariff'],
    queryFn: async () => generateMockTariff(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Fetch managed assets (mocked)
 */
export function useManagedAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async (): Promise<Asset[]> => mockAssets,
    staleTime: 30000,
  });
}

/**
 * Fetch flex opportunities (mocked)
 */
export function useFlexOpportunities() {
  return useQuery({
    queryKey: ['flex-opportunities'],
    queryFn: async (): Promise<FlexOpportunity[]> => mockFlexOpportunities,
    staleTime: 10000,
  });
}

/**
 * Opt-in to flex opportunity (mock mutation)
 */
export function useFlexOptIn() {
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        success: true,
        message: `Successfully opted in to flex opportunity ${opportunityId}`,
      };
    },
  });
}

/**
 * Toggle asset (charge/discharge)
 */
export function useToggleAsset() {
  return useMutation({
    mutationFn: async (assetId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, assetId };
    },
  });
}
