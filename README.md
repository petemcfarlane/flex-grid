# FlexGrid Explorer ⚡

**A technical demo bridging the gap between grid data settlement and consumer energy flexibility.**

## 🎯 Project Overview

This project is a technical proof-of-concept for managing energy assets within a modern, flexible power grid. It is specifically designed to handle the shift toward **Half-Hourly Settlement**, demonstrating how high-frequency data can be transformed into actionable consumer insights and automated "Flexibility Events" for smart devices.

## 🚀 Key Engineering Pillars

### 1. Data-Driven Grid Visualization

* **Half-Hourly Settlement View:** A custom-built time-series architecture designed to handle the 48 discrete daily periods required for modern energy market competition.
* **Environmental Sync:** Real-time integration with Carbon Intensity APIs to trigger "Flex Events" when the grid is most renewable-heavy.

### 2. Mobile-First PWA Architecture

* **High-Performance UI:** Built as a Progressive Web App (PWA) with a focus on performance, accessibility (a11y), and small-screen utility.
* **Offline Capability:** Implemented service workers to ensure asset controls and usage data remain accessible in low-connectivity environments like plant rooms or garages.
* **Geospatial Intelligence:** Integrated map overlays using Mapbox GL to visualize regional grid regions and localized asset density.

### 3. Scalable Fullstack Patterns

* **API Design:** Modeled using modern patterns (REST/GraphQL) to manage complex relationships between users, properties, and IoT assets.
* **Design System Thinking:** Features a custom, themeable component library built for reusability across both consumer-facing apps and internal administrative tooling.

## 🛠 Tech Stack

* **Framework:** Next.js 16 (App Router), TypeScript, Tailwind CSS.
* **State & Sync:** TanStack Query v5 for server-state management; **RxDB** for local-first offline storage.
* **Visuals:** Recharts for time-series data; Mapbox GL for regional mapping.
* **PWA & Theming:** next-pwa for offline support; next-themes for dark mode; react-hot-toast for notifications.
* **UI Components:** Custom accessible component library (Button, Card, Badge) built on Tailwind CSS.
* **Additional:** RxJS for reactive data streams, Axios for HTTP requests.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard (home) page
│   ├── map/page.tsx       # Asset map page
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── index.ts
│   └── features/          # Feature-specific components
│       ├── PriceChart.tsx
│       ├── FlexCard.tsx
│       ├── AssetCard.tsx
│       ├── GridStatusCard.tsx
│       └── MapboxMap.tsx
├── hooks/                 # React hooks
│   └── useEnergy.ts      # Energy data queries and mutations
├── types/                 # TypeScript type definitions
│   └── energy.ts         # Domain types
├── lib/                   # Utilities and helpers
│   ├── providers.tsx      # React Query + Toast setup
│   ├── config.ts         # App configuration
│   └── toast.ts          # Toast notification wrapper
└── mocks/                # Mock data
    └── data.ts           # Mock tariffs, assets, flex opportunities

public/
├── manifest.json         # PWA manifest
└── icon-*.png           # PWA icons (placeholder)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Mapbox token (optional for development):
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

## 📱 Features

### Dashboard Page (/)
- **Grid Status Card:** Real-time carbon intensity from UK Carbon Intensity API
  - **Postcode Input:** Submit-on-Enter regional carbon intensity lookup
  - **Generation Mix Visualization:** Horizontal stacked bar chart showing fuel source breakdown
    - Built with Recharts BarChart component
    - Color-coded by fuel type (wind=sky blue, solar=amber, nuclear=violet, gas=red, coal=grey)
    - Custom tooltip with fuel name and percentage on hover
    - Ordered consistently: wind → solar → nuclear → hydro → biomass → imports → gas → coal → other
    - Displays renewable percentage badge above chart
    - Compact design with rounded corners on bar segments
- **Price Chart:** 48 half-hourly settlement periods with real Octopus Agile tariff data
  - Rolling 24-hour window with actual API integration
  - Tariff selector UI showing current tariff (future: change tariff capability)
- **Current Period Highlighting:** Visual indicator of current trading period
- **Flex Opportunity Card:** Prominent CTA for demand-side response events
- **Opt-In Toast:** Custom context-based toast notification system on flex event acceptance

### Asset Map Page (/map)
- **Mapbox GL Map:** Interactive map with UK regional carbon intensity visualization
  - **GeoJSON Region Boundaries:** Real UK DNO (Distribution Network Operator) licence areas
    - Source: NESO (National Energy System Operator) official boundaries
    - Downloaded from: https://www.neso.energy/data-portal/gis-boundaries-gb-dno-license-areas
    - Coordinate conversion: OSGB36 (British National Grid) → WGS84 using pyproj
    - 14 regions covering England, Scotland, and Wales
  - **Dynamic Carbon Intensity Coloring:**
    - Feature-state based styling using Mapbox GL expressions
    - Green (very low/low): Scotland, NW England
    - Grey (moderate): Midlands, central regions
    - Orange/Amber (high/very high): South Wales, SW England
    - Colors update in real-time based on API data
    - Region name mapping between API (DNO names) and GeoJSON (Area names)
  - **Regional Labels:** Color-coded badges at region centroids showing shortnames
  - Show/Hide Regions toggle button (top-left)
- **Managed Assets Panel:** List of connected devices (EV, Heat Pump, Battery, Solar)
- **Asset Controls:** Toggle switches and status badges
- **Responsive Layout:** Side-by-side map + assets on desktop, stacked on mobile

### Technical Implementation Notes

#### Generation Mix Chart
The horizontal stacked bar chart is implemented using:
```tsx
<BarChart layout="horizontal" height={40}>
  <Bar dataKey="percentage" stackId="a" radius={[10, 10, 10, 10]}>
    {data.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Bar>
  <Tooltip content={<CustomTooltip />} />
</BarChart>
```
- Uses Recharts with custom cell colors for each fuel type
- Tooltip shows fuel name and percentage
- Layout set to horizontal for compact vertical display

#### GeoJSON Regional Boundaries
The region visualization pipeline:
1. **Data Source:** NESO GB DNO License Areas GeoJSON (2024)
2. **Coordinate Transformation:**
   ```python
   # Convert OSGB36 to WGS84
   from pyproj import Transformer
   transformer = Transformer.from_crs("EPSG:27700", "EPSG:4326", always_xy=True)
   lon, lat = transformer.transform(x, y)
   ```
3. **Feature ID Assignment:** Add top-level `id` field to each feature (required for Mapbox feature-state)
4. **Layer Structure:**
   - `region-fill`: Fill layer with feature-state color expressions
   - `region-outline`: Line layer with matching colors (darker shades)
   - Layers inserted before symbol layers to appear under labels
5. **Feature State Updates:**
   ```tsx
   map.setFeatureState(
     { source: 'region-boundaries', id: featureId },
     { intensity: 'very low' | 'low' | 'moderate' | 'high' | 'very high' }
   );
   ```

## 🧪 Mock Data Architecture

All API calls are mocked for rapid iteration:

- **Tariff Data:** `generateMockTariff()` creates realistic 48-period pricing with morning/evening peaks
- **Assets:** Tesla Model 3 (charging), Heat Pump (optimized), Home Battery, Solar Array
- **Flex Opportunities:** Single "grid under pressure" scenario with £1.20 reward
- **Grid Status:** Real UK Carbon Intensity API (fallback to mock if unavailable)

## 🎨 Design System

### Color Palette
- **Primary:** Emerald-500 (flex actions, active states)
- **Background:** Slate-950 (dark theme)
- **Surface:** Slate-900 (cards, panels)
- **Border:** Slate-700
- **Text:** Slate-50 (primary), Slate-400 (secondary)

### Components
- **Button:** Primary, Secondary, Ghost variants; SM, MD, LG sizes
- **Card:** Default, Elevated variants with gradient options
- **Badge:** Success, Warning, Error, Default statuses

## 📖 API Layer

Uses **TanStack Query v5** for:
- Real-time grid status polling (30s interval)
- Regional carbon intensity data (postcode-based lookup)
- Tariff data fetching (1m cache) - **Real Octopus Agile API integration**
- Asset management queries
- Flex opt-in mutations with optimistic updates

### Real API Integrations
- **Carbon Intensity UK API:**
  - `/intensity` - National carbon intensity
  - `/generation` - Current generation mix by fuel type
  - `/regional` - All 14 UK DNO regions
  - `/regional/postcode/{postcode}` - Postcode-specific regional data
- **Octopus Energy API:**
  - `v1/products/AGILE-FLEX-22-11-25/electricity-tariffs/E-1R-AGILE-FLEX-22-11-25-A/standard-unit-rates/`
  - Returns 48 half-hourly periods with actual pricing
  - Proxied through Next.js API routes to avoid CORS

### API Proxy Routes
- `/api/grid-status` - Carbon Intensity national data
- `/api/regional-status` - All regional carbon intensity
- `/api/tariff-rates` - Octopus Agile pricing (48 periods)

### Mock Mutations
- `useFlexOptIn()` - Simulate flex event acceptance
- `useToggleAsset()` - Simulate device control

## 🔐 Environment Variables

```env
# Mapbox configuration
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...

# Optional
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## 📦 PWA Setup

The app is configured as a PWA with:
- Service worker (via next-pwa)
- Web manifest (`/public/manifest.json`)
- Offline-first patterns
- Installable on iOS/Android

To test PWA offline mode:
1. Build: `npm run build`
2. Start: `npm start`
3. Open DevTools → Application → Service Workers
4. Check "Offline" toggle to test fallback behavior

## 🚦 Development Workflow

1. **Component Development:** Add new components in `/src/components/features`
2. **Type Safety:** Update `/src/types/energy.ts` for new domain types
3. **Mock Data:** Extend `/src/mocks/data.ts` for additional scenarios
4. **Hooks:** Create query/mutation hooks in `/src/hooks/useEnergy.ts`
5. **Testing:** Use `npm run build` to catch TypeScript errors early

## � Known Issues

### Critical
- **Map: Asset markers disappear when regions shown** - Markers remain in DOM but are covered by GeoJSON layers. z-index and layer ordering attempted but issue persists. Needs investigation into Mapbox layer/marker rendering order.

### High Priority
- **Mobile: Asset list scroll broken** - On `/map` page in mobile view, the Managed Assets panel scroll is not working correctly. Users cannot scroll through the full asset list.
- **Postcode validation: Full postcodes rejected** - Grid Status postcode input only accepts outward codes (e.g., "SW1A"). Full postcodes with inward codes (e.g., "SW1A 1AA") return errors from the API. Need to strip the inward code (last part after space) before API call.

### Medium Priority
- None currently

## �📊 Roadmap

- [x] **Real API integrations:** Carbon Intensity UK, Octopus Agile Tariff
- [x] **GeoJSON DNO regions** with dynamic carbon intensity coloring
- [x] **Generation mix visualization** with horizontal stacked bar chart
- [x] **Postcode-based regional lookup**
- [x] **Custom toast notification system**
- [ ] **Fix marker visibility** when regions overlay is active (z-index/layer ordering)
- [ ] **Connect to more real APIs:** DNO-specific APIs, additional tariff providers
- [ ] **Implement real GraphQL server** for asset management
- [ ] **Add authentication** (OAuth, multi-tenant)
- [ ] **Form validation & input sanitization**
- [ ] **E2E tests** (Playwright/Cypress)
- [ ] **Accessibility audit** (a11y improvements)
- [ ] **WebSocket integration** for sub-second telemetry
- [ ] **Advanced filtering & sorting** in asset list
- [ ] **Tariff comparison and selection** UI

## 🏗 Accessibility (a11y)

Current state:
- ✅ Semantic HTML (buttons, nav, headings)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation on toggles
- ⚠️ Need: Color contrast review, screen reader testing, focus management

## 🧪 Testing Strategy

**Current State:** This is an early-stage prototype with no automated tests yet. However, testing is an important consideration for the next phase of development.

**Recommended Testing Layers:**
1. **Unit Tests (Vitest/Jest)**
   - Hook logic: `useGridStatus()`, `useTariffData()`, `useManagedAssets()` - test data transformations and error handling
   - Utility functions: tariff calculations, postcode validation, carbon intensity mappings
   - Type definitions and data structure conformance

2. **Integration Tests (Playwright/Cypress)**
   - API proxy layer (`/api/grid-status`, `/api/regional-status`, `/api/tariff-rates`) - verify correct data forwarding and error fallbacks
   - Map interactions: asset marker click-to-focus, region boundary rendering
   - Navigation between pages (dashboard → map)

3. **Component Tests (React Testing Library)**
   - GridStatusCard: postcode input validation, tariff period selection, generation mix chart rendering
   - AssetCard: asset state display, toggle interactions, status indicators
   - MapboxMap: marker visibility, region layer visibility, geographic bounds

4. **E2E Tests (Playwright)**
   - Full user workflows: view grid status → look up postcode → click asset → navigate to map → focus on asset
   - Offline behavior: PWA service worker activation, cached data fallbacks
   - Real API integration vs. mock fallback scenarios

5. **Data Pipeline Tests**
   - GeoJSON coordinate transformation accuracy (OSGB36 → WGS84)
   - Feature-state updates for region intensity coloring
   - Tariff period calculations for half-hourly settlement

As the codebase stabilizes and features are finalized, these testing layers will be progressively implemented, starting with critical path unit and integration tests.

## � Local-First Data Architecture

This project uses **RxDB** for offline-first data persistence, enabling instant interactions and multi-tab synchronization. This paradigm shift means:

- **No Loading Spinners:** All data operations happen against local IndexedDB with near-zero latency
- **Multi-Tab Sync:** All browser tabs share the same state automatically
- **Offline Works:** Full functionality with cached data when internet is unavailable
- **Realtime Updates:** Data subscriptions enable automatic UI updates when data changes anywhere

### Current Implementation

**Collections:**
1. **`preferences`** - User settings stored locally
   - Postcode: Persisted automatically when user enters it
   - Theme: Dark/Light mode preference (future)
   - Auto-loaded on app startup

2. **`tariffs`** - Cached half-hourly pricing data
   - Date-keyed (YYYY-MM-DD format)
   - 1-hour TTL for cache validation
   - Ready to extend with historical data for 7-14 day price comparisons

### Usage Example

```typescript
// Load cached postcode on app startup
const { postcode, savePostcode } = usePreferences();

// User enters postcode in GridStatusCard
await savePostcode('SW1A');  // Saved to IndexedDB instantly

// Next session: postcode auto-loads from local storage
```

### Future Enhancements

- **Tariff History:** Cache 7-14 days of pricing for historical comparison
- **Assets Periodic Sync:** Asset list with TTL-based refresh
- **GeoJSON Simplification:** Compress and cache region boundaries (currently 3MB)
- **HTTP Replication:** Two-way sync with backend for changes
- **Conflict Resolution:** Handle multi-device/multi-tab scenarios

## �🔄 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Build to check for TS errors: `npm run build`
4. Commit with clear messages
5. Push and open a PR

## 📄 License

MIT

---

**Built with ❤️ for a renewable energy future.**
