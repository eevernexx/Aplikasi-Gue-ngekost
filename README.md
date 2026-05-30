# Gue Ngekost

> A personal finance & daily-life tracker built for boarding-house residents in Indonesia.

<p>
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white">
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-green.svg">
</p>

---

## Overview

**Gue Ngekost** is a mobile-first Progressive Web App (PWA) that helps boarding-house residents manage their finances and daily routines — all stored locally in the browser with no account required.

The app ships in **Bahasa Indonesia** by default, with a one-tap toggle to **English**, making it useful as a language-learning tool as well.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Time-aware greeting, balance card (with hide toggle), monthly summary, quick actions, and budget progress |
| **Cashflow** | Log income and expenses, grouped by day, with swipe-to-delete |
| **Food Tracker** | Record daily meals per mealtime, track calories and cost |
| **Packing List** | Trip checklists with per-item progress tracking and quick presets |
| **Analytics** | 6-month cashflow chart, spending-by-category donut, bilingual insights, and PDF export |
| **Settings** | Change display name, toggle language (ID / EN), switch dark / light theme, reset all data |

### Responsive Layout

- **Phone (320 px → tall 21:9)** — bottom tab bar, safe-area padding for notch / punch-hole, zero horizontal overflow
- **Tablet & Desktop** — bottom bar becomes a vertical sidebar rail; content expands to a centered 2-column grid

### PWA & Reliability

- Installable and fully offline-capable via `vite-plugin-pwa`
- `cleanupOutdatedCaches`, `clientsClaim`, and `skipWaiting` prevent clients from sticking to stale assets after a deploy
- `lazyWithRetry` reloads a code-split chunk exactly once when it becomes stale, preventing blank screens on the Analytics tab

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

- Node.js 18 or later
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
npm run preview  # preview the production build locally
```

---

## Project Structure

```
gue-ngekost/
├── src/
│   ├── components/
│   │   ├── charts/       # CashflowChart, DailyBarChart, SpendingDonut
│   │   ├── layout/       # AppShell, Header, Navigation, ErrorFallback
│   │   └── ui/           # Reusable sheets, cards, FAB, badges
│   ├── pages/            # Dashboard, Cashflow, FoodTracker, PackingList, Analytics, Settings
│   ├── store/            # Zustand stores (transactions, food, packing, settings)
│   ├── i18n/             # Indonesian / English translations
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities and helpers
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Data & Privacy

All data is stored exclusively in the browser's `localStorage`. There is no backend, no network requests for user data, and no authentication — nothing leaves the device.

---

## License

Released under the [MIT License](LICENSE).
