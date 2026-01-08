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
* **State & Sync:** TanStack Query v5 for robust server-state management.
* **Visuals:** Recharts for time-series data; Mapbox GL for regional mapping.
* **PWA & Theming:** next-pwa for offline support; next-themes for dark mode; react-hot-toast for notifications.
* **UI Components:** Custom accessible component library (Button, Card, Badge) built on Tailwind CSS.
* **Additional:** Zustand for client state (optional), Axios for HTTP requests.

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
- **Price Chart:** 48 half-hourly settlement periods with dynamic pricing (5p–35p/kWh)
- **Current Period Highlighting:** Visual indicator of current trading period
- **Flex Opportunity Card:** Prominent CTA for demand-side response events
- **Opt-In Toast:** Confirmation notification on flex event acceptance

### Asset Map Page (/map)
- **Mapbox GL Map:** Interactive map centered on London region
- **Managed Assets Panel:** List of connected devices (EV, Heat Pump, Battery, Solar)
- **Asset Controls:** Toggle switches and status badges
- **Responsive Layout:** Side-by-side map + assets on desktop, stacked on mobile

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
- Tariff data fetching (1m cache)
- Asset management queries
- Flex opt-in mutations with optimistic updates

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

## 📊 Roadmap

- [ ] **Replace Mapbox placeholders** with real GeoJSON DNO regions
- [ ] **Connect to real APIs:** Octopus Energy, Agile Tariff, DNO APIs
- [ ] **Implement real GraphQL server** for asset management
- [ ] **Add authentication** (OAuth, multi-tenant)
- [ ] **Form validation & input sanitization**
- [ ] **E2E tests** (Playwright/Cypress)
- [ ] **Accessibility audit** (a11y improvements)
- [ ] **WebSocket integration** for sub-second telemetry
- [ ] **Advanced filtering & sorting** in asset list

## 🏗 Accessibility (a11y)

Current state:
- ✅ Semantic HTML (buttons, nav, headings)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation on toggles
- ⚠️ Need: Color contrast review, screen reader testing, focus management

## 🔄 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Build to check for TS errors: `npm run build`
4. Commit with clear messages
5. Push and open a PR

## 📄 License

MIT

---

**Built with ❤️ for a renewable energy future.**
