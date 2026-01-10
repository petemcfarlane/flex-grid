import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { GridStatus, Asset, FlexOpportunity, SettlementPeriod } from '@/types/energy';
import { generateMockTariff, mockAssets, mockFlexOpportunities } from '@/mocks/data';

/**
 * Fetch real grid carbon intensity from UK API
 */
export function useGridStatus() {
  return useQuery({
    queryKey: ['grid-status'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/grid-status');
        const apiData = response.data?.data;
        const generationData = response.data?.generation;
        
        // API returns { data: [{ intensity: { actual, forecast, index } }] }
        let intensity = 150;
        let status: 'low' | 'moderate' | 'high' = 'low';
        
        if (Array.isArray(apiData) && apiData.length > 0) {
          intensity = apiData[0].intensity?.actual || 150;
          status = apiData[0].intensity?.index || 'low';
        }
        
        return {
          status: {
            intensity,
            carbonIntensity: intensity,
            status: status === 'high' ? 'high' : status === 'moderate' ? 'moderate' : 'low',
            generationmix: generationData?.generationmix || [],
          },
          generation: generationData,
        };
      } catch (error) {
        // Fallback if API is unavailable
        console.error('Grid status fetch error:', error);
        return {
          status: {
            intensity: 150,
            carbonIntensity: 150,
            status: 'low',
            generationmix: [],
          },
          generation: null,
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Fetch tariff data from Octopus Energy Agile tariff
 */
export function useTariffData() {
  return useQuery({
    queryKey: ['tariff'],
    queryFn: async (): Promise<SettlementPeriod[]> => {
      try {
        const response = await axios.get('/api/tariff-rates');
        const periods = response.data?.periods || [];
        
        if (periods.length === 0) {
          // Fall back to mock data if API returns empty
          return generateMockTariff();
        }
        
        return periods;
      } catch (error) {
        console.error('Tariff data fetch error:', error);
        // Fallback to mock data if API is unavailable
        return generateMockTariff();
      }
    },
    staleTime: 60000, // 1 minute - rates can change frequently
    refetchInterval: 300000, // Refetch every 5 minutes
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
 * Fetch regional status data by postcode or all regions
 */
export function useRegionalStatus(postcode?: string) {
  return useQuery({
    queryKey: ['regional-status', postcode],
    queryFn: async () => {
      try {
        const params = postcode ? `?postcode=${encodeURIComponent(postcode)}` : '';
        const response = await axios.get(`/api/regional-status${params}`);
        return response.data;
      } catch (error) {
        console.error('Regional status fetch error:', error);
        return null;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: !!postcode || false, // Only fetch if postcode provided, or manually enabled
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
