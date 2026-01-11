import { useEffect, useState } from 'react';
import { getDatabase, PreferencesDoc, TariffDoc } from '@/lib/db';

/**
 * Hook to manage user preferences (postcode, theme) with RxDB persistence
 * Subscribes to database changes for real-time multi-tab synchronization
 */
export function usePreferences() {
  const [postcode, setPostcode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Subscribe to preferences changes for multi-tab sync
  useEffect(() => {
    let subscription: any = null;
    let channel: BroadcastChannel | null = null;

    const setupSubscription = async () => {
      try {
        const db = await getDatabase();
        
        // Subscribe to the observable for real-time updates across tabs
        subscription = db.preferences
          .find()
          .$ // Get the observable
          .subscribe((docs: PreferencesDoc[]) => {
            if (docs.length > 0) {
              // Set postcode even if empty (enables national mode sync across tabs)
              setPostcode(docs[0].postcode || '');
            } else {
              setPostcode('');
            }
            setLoading(false);
          });

        // Listen for BroadcastChannel messages from other tabs
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          channel = new BroadcastChannel('flexgrid-prefs');
          channel.addEventListener('message', async (event) => {
            if (event.data.type === 'postcode-changed') {
              // Force re-fetch from database
              const docs = await db.preferences.find().exec();
              if (docs.length > 0) {
                setPostcode(docs[0].postcode || '');
              }
            }
          });
        }
      } catch (error) {
        console.error('Failed to subscribe to preferences:', error);
        setLoading(false);
      }
    };

    setupSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (channel) {
        channel.close();
      }
    };
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
      
      // Notify other tabs via BroadcastChannel
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel('flexgrid-prefs');
          channel.postMessage({ type: 'postcode-changed', postcode: newPostcode });
          channel.close();
        } catch (error) {
          console.error('Failed to send BroadcastChannel message:', error);
        }
      }
      
      // Don't manually set postcode - let observable update it
      // This ensures multi-tab sync works correctly
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
