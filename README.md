<div align="center">

# Gue Ngekost

**A mobile-first personal-finance & daily-life tracker for boarding-house residents in Indonesia.**

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite 5" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS 3" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-state-2D3748?logo=zustand&logoColor=white">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-22c55e">
</p>

</div>

---

## Overview

**Gue Ngekost** is an installable Progressive Web App (PWA) that lets boarding-house residents log income, expenses, meals, and trip-packing lists from a single phone-sized interface. The entire application runs client-side, so every record stays in the browser's `localStorage` — no account, no backend, and nothing ever leaves the device.

The app ships in **Bahasa Indonesia** by default with a one-tap switch to **English**, which doubles as a lightweight language-learning aid.

---

## Highlights

- **Offline-first PWA** — installable on Android, iOS, and desktop; fully usable without a network connection.
- **Privacy by design** — all data is persisted to `localStorage`; no telemetry, no analytics, no sign-up.
- **Bilingual (ID / EN)** — every label, tooltip, and PDF export respects the active locale.
- **Adaptive layout** — single-handed phone UI scales up to a sidebar-rail layout on tablet and desktop.
- **Accessibility-aware** — safe-area padding for notched devices, keyboard-aware bottom sheets, dark mode, and a hide-balance toggle for screenshots.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Time-aware greeting, balance card with hide toggle, monthly summary, quick actions, and budget progress. |
| **Cashflow** | Log income and expenses, grouped by day, with swipe-to-delete and per-month navigation. |
| **Food Tracker** | Record daily meals by mealtime; track calories and cost at a glance. |
| **Packing List** | Trip checklists with per-item progress tracking and quick presets. |
| **Analytics** | 6-month cashflow chart, spending-by-category donut, bilingual insights, and one-tap PDF export. |
| **Settings** | Display name, language (ID / EN), dark / light theme, monthly budget, and full data reset. |

### Responsive Layout

- **Phone** (320 px through tall 21:9) — bottom tab bar, safe-area padding for notch and punch-hole cutouts, zero horizontal overflow.
- **Tablet & Desktop** — bottom bar collapses into a vertical sidebar rail; content expands to a centered two-column grid.

### PWA & Reliability

- Installable and fully offline-capable via `vite-plugin-pwa`.
- `cleanupOutdatedCaches`, `clientsClaim`, and `skipWaiting` keep clients from sticking to stale assets after a deploy.
- `lazyWithRetry` transparently reloads a code-split chunk exactly once when it becomes stale, preventing the blank-screen failure mode on the Analytics tab.

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 18 |
| Build tool | Vite 5 |
| Routing | React Router DOM 6 |
| State management | Zustand (persisted to `localStorage`) |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion |
| Charts | Recharts |
| PDF export | jsPDF |
| Date utilities | date-fns |
| Icons | Lucide React |
| PWA | vite-plugin-pwa |

---

## Getting Started

### Prerequisites

- Node.js **18 or later**
- npm (bundled with Node.js)

### Install & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
# → http://localhost:5173
```

### Production Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

### Regenerate PWA Icons

```bash
npm run icons    # re-renders the favicon and PWA icons from public/favicon.svg
```

---

## Project Structure

```
gue-ngekost/
├── public/
│   ├── icons/             # PWA icons (192, 512, maskable, apple-touch)
│   └── favicon.svg
├── scripts/
│   └── generate-icons.mjs # Sharp-powered icon generator
├── src/
│   ├── components/
│   │   ├── charts/        # CashflowChart, DailyBarChart, SpendingDonut
│   │   ├── layout/        # AppShell, Header, Navigation, ErrorFallback
│   │   └── ui/            # Reusable sheets, cards, FAB, badges
│   ├── pages/             # Dashboard, Cashflow, FoodTracker, PackingList, Analytics, Settings
│   ├── store/             # Zustand stores (transactions, food, packing, settings)
│   ├── i18n/              # Indonesian / English translations
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and formatters
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Data & Privacy

All application state is persisted exclusively in the browser's `localStorage`. There is no backend, no remote sync, no authentication, and no analytics — nothing ever leaves the device. To wipe every record, open **Settings → Reset all data**, or clear the site's storage from the browser.

---

## Browser Support

Tested on the latest two stable releases of Chrome, Edge, Firefox, and Safari, including Chrome on Android and Safari on iOS. Installation as a PWA requires a Chromium-based browser on desktop and either Android Chrome or iOS Safari on mobile.

---

## Roadmap

- Optional encrypted JSON import / export for cross-device migration
- Recurring-transaction templates (rent, subscriptions)
- Per-category monthly budgets
- Widgets / shortcuts for quick logging

---

## License

Released under the [MIT License](LICENSE).

---

## Author

Crafted by **Aryasatya Muhammad Aqsel** — feedback and pull requests are welcome.
