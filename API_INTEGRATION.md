# API Integration Guide

## Current State: Mock Data

All API calls currently use mock data from `/src/mocks/data.ts`. This guide shows how to transition to real APIs as needed.

## 1. Carbon Intensity API (Already Live!)

**Status:** ✅ Already integrated and working

The app fetches **real** carbon intensity data from the UK Grid operator:

```typescript
// src/hooks/useEnergy.ts
export function useGridStatus() {
  return useQuery({
    queryKey: ['grid-status'],
    queryFn: async (): Promise<GridStatus> => {
      const response = await axios.get(
        'https://api.carbonintensity.org/intensity'
      );
      // Real API call - fallback to mock if unavailable
    },
  });
}
```

**To test:** Visit `/` and watch the "Grid Status" card update every 30 seconds.

---

## 2. Octopus Energy API (Tariff Data)

**Current:** Mock via `generateMockTariff()`  
**Goal:** Replace with real Agile Tariff pricing

### Steps to Integrate

1. **Get API Key**
   - Sign up for Octopus Energy Developer API
   - https://octopus.energy/api/
   - Store token in `.env.local`:
     ```env
     NEXT_PUBLIC_OCTOPUS_API_KEY=sk_live_xxx
     OCTOPUS_API_KEY=sk_xxx  # Server-side only
     ```

2. **Update Hook**
   ```typescript
   // src/hooks/useEnergy.ts
   export function useTariffData() {
     return useQuery({
       queryKey: ['tariff'],
       queryFn: async () => {
         const response = await axios.get(
           'https://api.octopus.energy/v1/products/AGILE-22-11-01/electricity-tariffs/E-1R-AGILE-22-11-01-A/standard-unit-rates/',
           {
             headers: {
               Authorization: `Basic ${Buffer.from(`${process.env.OCTOPUS_API_KEY}:`).toString('base64')}`,
             },
           }
         );
         return transformOctopusTariff(response.data);
       },
     });
   }

   function transformOctopusTariff(data: any): SettlementPeriod[] {
     return data.results.map((rate: any, idx: number) => ({
       period: idx + 1,
       time: new Date(rate.valid_from).toLocaleTimeString('en-GB', { 
         hour: '2-digit', 
         minute: '2-digit' 
       }),
       cost: rate.value_inc_vat * 100, // Convert to pence
     }));
   }
   ```

3. **Update Environment**
   - Add to `.env.example`
   - Set in deployment platform

---

## 3. Asset Data (Currently Mock)

**Current:** Hardcoded in `mockAssets`  
**Goal:** Connect to IoT platform or home automation system

### Example: Tesla Integration

```typescript
// src/hooks/useEnergy.ts
async function fetchTeslaAssets(): Promise<Asset[]> {
  const response = await axios.get(
    'https://owner-api.teslamotors.com/api/1/vehicles',
    {
      headers: {
        Authorization: `Bearer ${process.env.TESLA_API_TOKEN}`,
      },
    }
  );

  return response.data.response.map((vehicle: any) => ({
    id: `tesla-${vehicle.id}`,
    name: vehicle.display_name,
    type: 'ev',
    status: vehicle.charge_state.charging_state === 'Charging' ? 'charging' : 'idle',
    location: {
      lat: vehicle.drive_state.latitude,
      lng: vehicle.drive_state.longitude,
    },
    power: vehicle.charge_state.charger_power,
    soc: vehicle.charge_state.battery_level,
  }));
}
```

### Example: Home Assistant Integration

```typescript
async function fetchHomeAssistantAssets(): Promise<Asset[]> {
  const response = await axios.get(
    `${process.env.HOME_ASSISTANT_URL}/api/states`,
    {
      headers: {
        Authorization: `Bearer ${process.env.HOME_ASSISTANT_TOKEN}`,
      },
    }
  );

  // Filter and map Home Assistant entities to Asset type
  return response.data
    .filter((entity: any) => ['switch', 'sensor'].includes(entity.entity_id.split('.')[0]))
    .map((entity: any) => ({
      // ... transformation logic
    }));
}
```

---

## 4. Flex Events (Currently Mock)

**Current:** Single hardcoded event  
**Goal:** Connect to DNO flexibility platform

### Example: DNO API Integration

```typescript
export function useFlexOpportunities() {
  return useQuery({
    queryKey: ['flex-opportunities'],
    queryFn: async (): Promise<FlexOpportunity[]> => {
      const response = await axios.get(
        'https://api.dno-platform.com/flexibility-events',
        {
          headers: {
            Authorization: `Bearer ${process.env.DNO_API_KEY}`,
          },
        }
      );

      return response.data.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        reward: event.reward_gbp,
        durationHours: event.duration_minutes / 60,
        deadline: event.deadline_timestamp,
        type: event.flex_type as 'delay' | 'shift' | 'reduce',
      }));
    },
    refetchInterval: 10000,
  });
}

export function useFlexOptIn() {
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const response = await axios.post(
        `https://api.dno-platform.com/flexibility-events/${opportunityId}/opt-in`,
        { user_id: getCurrentUserId() },
        {
          headers: {
            Authorization: `Bearer ${process.env.DNO_API_KEY}`,
          },
        }
      );
      return response.data;
    },
  });
}
```

---

## 5. Map Overlays (DNO Regions)

**Current:** No GeoJSON overlays (Mapbox ready)  
**Goal:** Show regional grid zones

### Steps to Add DNO Regions

1. **Get GeoJSON**
   - Obtain from DNO (UK Power Networks, Westernpower, etc.)
   - Store in `public/geojson/dno-regions.json`

2. **Update MapboxMap Component**
   ```typescript
   useEffect(() => {
     if (!map.current) return;

     map.current.on('load', () => {
       // Add GeoJSON source
       map.current!.addSource('dno-regions', {
         type: 'geojson',
         data: '/geojson/dno-regions.json',
       });

       // Add layer
       map.current!.addLayer({
         id: 'dno-regions-layer',
         type: 'fill',
         source: 'dno-regions',
         paint: {
           'fill-color': '#10b981',
           'fill-opacity': 0.3,
         },
       });
     });
   }, []);
   ```

---

## 6. Authentication

**Current:** None  
**Goal:** Add user accounts

### Firebase Setup

```typescript
// src/lib/auth.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  return user;
}
```

### Update queries to include auth

```typescript
export function useManagedAssets() {
  const user = useAuth();

  return useQuery({
    queryKey: ['assets', user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const response = await axios.get(
        '/api/assets',
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!user,
  });
}
```

---

## 7. Backend API (Future)

For a production app, you'll want a backend to:
- Manage user accounts securely
- Store preferences
- Rate-limit API calls
- Handle payment/rewards

**Suggested Stack:**
- Node.js + Express / Python + FastAPI
- PostgreSQL for user data
- Redis for caching
- Deploy on Vercel (serverless), Railway, or traditional VPS

### Example Express endpoint

```typescript
// backend/routes/assets.ts
app.get('/api/assets', authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const assets = await db.query(
    'SELECT * FROM assets WHERE user_id = $1',
    [userId]
  );
  res.json(assets);
});
```

---

## 🔑 Environment Variables Checklist

```env
# Required for map
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...

# Octopus Energy
OCTOPUS_API_KEY=sk_...

# Tesla (if integrating)
TESLA_API_TOKEN=...

# DNO Flexibility API
DNO_API_KEY=...

# Firebase (if using)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Home Assistant (if integrating)
HOME_ASSISTANT_URL=http://...
HOME_ASSISTANT_TOKEN=...

# Backend
NEXT_PUBLIC_API_BASE_URL=https://your-api.com
```

---

## Testing Integration

1. **Mock Mode (Current)**
   ```bash
   npm run dev
   # Everything works with fake data
   ```

2. **Partial Integration**
   - Keep mocks for tariff, add real grid status
   - Gradually swap functions in `useEnergy.ts`

3. **Staged Rollout**
   - Feature flag for real vs. mock
   ```typescript
   const useRealAPIs = process.env.NEXT_PUBLIC_USE_REAL_APIS === 'true';

   if (useRealAPIs) {
     // Real API call
   } else {
     // Mock data
   }
   ```

---

## Summary

- **Grid Status**: ✅ Already live
- **Tariffs**: Ready to integrate (hooks prepared)
- **Assets**: Flexible (can connect Tesla, Home Assistant, custom APIs)
- **Flex Events**: DNO API integration example provided
- **Maps**: Mapbox ready (needs GeoJSON and token)

Start with **one API at a time** and test thoroughly before moving to the next. The mock layer makes this safe and fast!
