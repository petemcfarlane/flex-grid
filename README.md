# FlexGrid Explorer ⚡

**Modern consumer app bridging grid operational data with energy asset flexibility.**

A technical proof-of-concept demonstrating offline-first state management, real-time multi-tab synchronization, and progressive web app patterns in a real-world energy context.

**Tech Stack:** Next.js 16 (App Router) | TypeScript | Tailwind CSS | TanStack Query v5 | RxDB | Mapbox GL | Recharts

## Overview

### What It Does
- **Real-time grid carbon intensity** from UK Grid Operator
- **Half-hourly tariff visualization** (48 settlement periods) with current period highlighting
- **Regional carbon intensity lookup** by postcode with multi-tab sync
- **Asset map** with DNO regional boundaries and dynamic intensity coloring
- **Flex opportunity card** for demand-side response events

### Why It Matters
Demonstrates how modern PWAs can handle real-time energy market data while maintaining smooth, offline-first UX. Shows production patterns: API proxying, local-first state, geospatial visualization, and multi-tab coordination via standard web APIs.

## Architecture Decisions

### 1. Offline-First with RxDB + BroadcastChannel
**Decision:** Use RxDB with localStorage + BroadcastChannel for cross-tab notifications instead of waiting for backend sync.

**Rationale:** 
- Instant UX (no loading spinners for preference changes)
- True multi-tab sync without polling
- Works offline with cached data
- Simpler than IndexedDB plugin complexity

**Trade-off:** Doesn't sync with backend yet (ready for HTTP replication layer).

**Implemented:** Postcode persistence auto-syncs across all browser tabs. Change postcode in Tab A → Tab B sees it immediately + fetches regional data.

**Code:** `src/hooks/useDatabase.ts` (RxDB + BroadcastChannel listener)

### 2. Server-Side API Proxying
**Decision:** Route external APIs through Next.js API routes rather than direct browser calls.

**Rationale:**
- Centralized error handling
- Future auth layer
- Rate limiting control
- Avoids CORS headers in browser

**Implemented:** `/api/grid-status`, `/api/tariff-rates`, `/api/regional-status`

**Real APIs:** Carbon Intensity UK, Octopus Energy Agile pricing. Mock: assets, flex events.

### 3. Feature-State Coloring for Dynamic Regional Data
**Decision:** Use Mapbox feature-state for region intensity instead of re-rendering or swapping GeoJSON.

**Rationale:** 
- Zero map re-renders when data updates
- Smooth transitions
- Efficient for 14 regions with real-time updates

**Trade-off:** Requires feature IDs in GeoJSON (added during prep).

**Implemented:** Regions color in real-time as carbon intensity changes. Feature-state expressions map intensity levels to colors (green=renewable, orange=fossil).

### 4. React Query + Observable Subscription Pattern
**Decision:** Use TanStack Query for server state, RxDB observables for local state. No global state library.

**Rationale:**
- Clear boundaries (remote vs. local)
- Query handles caching, polling, deduplication
- RxDB observables provide reactivity for UI updates
- Easier to reason about data flow

**Implemented:** 
- Query: carbon intensity (30s polling), tariff rates, regional data
- RxDB: postcode preference with observable subscription

## Implementation Status

### Complete ✅
| Feature | Status | Real API? |
|---|---|---|
| Carbon Intensity Dashboard | Live | Yes (UK Grid Operator) |
| Generation Mix Chart | Live | Yes (via Carbon Intensity) |
| Tariff Chart (48 periods) | Live | Yes (Octopus Energy) |
| Regional Postcode Lookup | Live | Yes (via CI API) |
| Multi-Tab Postcode Sync | Live | RxDB + BroadcastChannel |
| Asset Map with Regions | Live | Yes (NESO GeoJSON) |
| Dynamic Region Coloring | Live | Yes (real intensity data) |
| PWA Offline Support | Live | Service Worker ready |

### Mock / Future 🚧
- Asset list (Tesla, Heat Pump, Battery, Solar)
- Flex opportunity mutations
- Asset control API
- Authentication

## Project Structure

```
src/
├── app/                     # Next.js App Router
│   ├── page.tsx            # Dashboard (grid status, tariff, flex)
│   ├── map/page.tsx        # Asset map with regions
│   ├── layout.tsx          # Root providers (Query, Toast, Themes)
│   └── globals.css         # Base styles
├── components/
│   ├── ui/                 # Reusable (Button, Card, Badge)
│   └── features/           # Domain (GridStatusCard, MapboxMap, etc.)
├── hooks/
│   ├── useEnergy.ts        # TanStack Query hooks
│   └── useDatabase.ts      # RxDB with multi-tab sync
├── lib/
│   ├── db.ts               # RxDB init + collections schema
│   ├── providers.tsx       # Query + Toast setup
│   └── config.ts           # Mapbox token, API endpoints
├── types/energy.ts         # Domain types
└── mocks/data.ts           # Mock generators
```

## Getting Started

```bash
npm install
cp .env.example .env.local  # Add NEXT_PUBLIC_MAPBOX_TOKEN (optional)
npm run dev
# Open http://localhost:3000
```

**Build:** `npm run build` (strict TypeScript enforced)

## Multi-Tab Sync Deep Dive

**Problem:** RxDB with localStorage doesn't automatically notify other tabs of updates.

**Solution Architecture:**
1. **Tab A saves postcode** → `savePostcode('SW1A')` updates RxDB + broadcasts via BroadcastChannel
2. **Tab B receives broadcast** → Listener triggers re-fetch from local RxDB copy
3. **Both tabs update state** → Effect runs, both fetch regional data
4. **Instant sync** → No race conditions, no polling needed

**Files:**
- `src/hooks/useDatabase.ts` - RxDB setup + BroadcastChannel listener
- `src/components/features/GridStatusCard.tsx` - usePreferences hook integration

**Why not just RxDB observables?** Each tab has isolated RxDB instance. localStorage is shared but observables don't auto-fire. BroadcastChannel triggers manual re-fetch.

## Data Flow

```
┌─────────────────────────────────────────┐
│ Real APIs                               │
│ • Carbon Intensity                      │
│ • Octopus Energy                        │
│ • NESO GeoJSON (regions)                │
└─────────────────────────────────────────┘
                  ↓
        ┌──────────────────────┐
        │ Next.js API Routes   │
        │ (/api/grid-status)   │
        └──────────────────────┘
                  ↓
        ┌──────────────────────┐
        │ TanStack Query       │
        │ (polling, caching)   │
        └──────────────────────┘
                  ↓
        ┌──────────────────────┐
        │ React Components     │
        │ (Dashboard, Map)     │
        └──────────────────────┘

┌─────────────────────────────────────────┐
│ Local State (RxDB)                      │
│ • Postcode preference (localStorage)    │
│ • Observable subscriptions              │
│ • BroadcastChannel listeners            │
└─────────────────────────────────────────┘
```

## Next Steps (Priority)

### Critical
- [ ] Connect real asset APIs (Tesla, Home Assistant, Shelly)
- [ ] Implement authentication (OAuth2 multi-tenant)

### High Priority
- [ ] Tariff history (7-14 day caching + comparison UI)
- [ ] GeoJSON compression (3MB → 1.5MB)
- [ ] E2E tests (Playwright for critical paths)
- [ ] Asset periodic sync with TTL

### Medium
- [ ] HTTP replication for backend sync
- [ ] Conflict resolution (multi-device)
- [ ] WebSocket for sub-second telemetry
- [ ] Advanced asset filtering

## Production Notes

- **RxDB Dev-Mode:** Remove `RxDBDevModePlugin` before production (currently included for schema validation)
- **Service Worker:** next-pwa already configured for offline assets
- **Error Handling:** Currently basic—add Sentry/DataDog monitoring
- **Performance:** GeoJSON loads on every map view; consider deferral or compression
- **API Keys:** Rotate Mapbox + Octopus tokens regularly

## Testing

**Current:** No automated tests. Early stage.

**Recommended Path:**
1. **Unit (Vitest):** Hook logic, transformations, validation
2. **Integration (Playwright):** API proxy, multi-tab sync, map interactions
3. **Component (RTL):** Card rendering, input handling, toggles
4. **E2E:** Critical workflows (postcode → map → regional view)

## Design Decisions Summary

| Decision | Rationale | Trade-off |
|---|---|---|
| RxDB + BroadcastChannel | Instant UX, multi-tab sync | No backend sync (yet) |
| API Proxying | Centralized control, future auth | Extra hop |
| Feature-state coloring | Zero re-renders | Requires feature IDs |
| No global state lib | Simpler, Query + observables sufficient | Query learning curve |
| Mock assets | Faster iteration | Not connected to real devices |
| Tailwind only | Rapid prototyping | CSS-in-JS limitations |

## License

MIT

