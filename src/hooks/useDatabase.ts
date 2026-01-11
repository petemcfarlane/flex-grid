import { useEffect, useState } from 'react';
import { getDatabase, PreferencesDoc, TariffDoc } from '@/lib/db';

/**
 * Hook to manage user preferences (postcode, theme) with RxDB persistence
 */
export function usePreferences() {
  const [postcode, setPostcode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const db = await getDatabase();
        
        // Try to find existing preferences document
        const docs = await db.preferences.find().exec();
        
        if (docs.length > 0) {
          const prefs = docs[0] as PreferencesDoc;
          if (prefs.postcode) {
            setPostcode(prefs.postcode);
          }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Save postcode to RxDB
  const savePostcode = async (newPostcode: string) => {
    try {
      const db = await getDatabase();
      const docs = await db.preferences.find().exec();

      const prefsData = {
        id: 'user_prefs',
        postcode: newPostcode,
        lastUpdated: new Date().toISOString(),
      };

      if (docs.length > 0) {
        // Update existing document
        await docs[0].patch(prefsData);
      } else {
        // Insert new document
        await db.preferences.insert(prefsData);
      }

      setPostcode(newPostcode);
    } catch (error) {
      console.error('Failed to save postcode:', error);
      throw error;
    }
  };

  return { postcode, savePostcode, loading };
}

/**
 * Hook to manage tariff data caching with RxDB
 */
export function useTariffCache() {
  const [cachedTariffs, setCachedTariffs] = useState<TariffDoc | null>(null);

  // Get cached tariff for today
  const getCachedTariff = async () => {
    try {
      const db = await getDatabase();
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const docs = await db.tariffs.find({ selector: { id: today } }).exec();

      if (docs.length > 0) {
        return docs[0] as TariffDoc;
      }
      return null;
    } catch (error) {
      console.error('Failed to get cached tariff:', error);
      return null;
    }
  };

  // Cache tariff data
  const cacheTariff = async (periods: any[]) => {
    try {
      const db = await getDatabase();
      const today = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();

      const tariffData: TariffDoc = {
        id: today,
        date: today,
        periods,
        timestamp,
      };

      // Check if already cached
      const existing = await db.tariffs.find({ selector: { id: today } }).exec();

      if (existing.length > 0) {
        // Update existing
        await existing[0].patch(tariffData);
      } else {
        // Insert new
        await db.tariffs.insert(tariffData);
      }

      setCachedTariffs(tariffData);
      return tariffData;
    } catch (error) {
      console.error('Failed to cache tariff:', error);
      throw error;
    }
  };

  // Check if cache is still valid (less than 1 hour old)
  const isCacheValid = (doc: TariffDoc | null): boolean => {
    if (!doc) return false;
    const now = Date.now();
    const oneHourMs = 60 * 60 * 1000;
    return now - doc.timestamp < oneHourMs;
  };

  return { cachedTariffs, getCachedTariff, cacheTariff, isCacheValid };
}
