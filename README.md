<div align="center">

# 🏠 Gue Ngekost

**Cashflow & daily-life tracker buat anak kost** — finance, food log, dan packing list dalam satu Progressive Web App. Mobile-first, offline-first, dan full Bahasa Indonesia.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#-lisensi)

</div>

---

## 📖 Tentang Proyek

**Gue Ngekost** adalah aplikasi pengelolaan keuangan dan kebutuhan harian yang dirancang khusus untuk **anak kost / mahasiswa rantau**. Dibangun sebagai *single-page application* yang ringan, bisa di-*install* layaknya aplikasi native, dan **berjalan sepenuhnya offline** — semua data tersimpan lokal di perangkat tanpa perlu backend atau login.

> Dibuat dengan fokus pada *user experience* mobile: animasi halus, *bottom sheet*, *swipe-to-delete*, dan *count-up animation* untuk pengalaman yang terasa native.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| 📊 **Dashboard** | Saldo dengan animasi *count-up*, ringkasan pemasukan/pengeluaran bulan ini, *quick actions*, progress budget, dan transaksi terakhir. |
| 💸 **Cashflow** | Catat pemasukan & pengeluaran, filter per bulan, tab kategori, list dikelompokkan per tanggal, dan *swipe-to-delete*. |
| 🍜 **Food Tracker** | Log makan harian dengan navigasi per hari, timeline per waktu (pagi/siang/sore/malam), serta ringkasan kalori & biaya. |
| 🎒 **Packing List** | Daftar bawaan multi-trip dengan *progress bar*, detail trip pakai *circular progress*, kategori *collapsible*, dan preset cepat. |
| 📈 **Analitik** | Grafik cashflow 6 bulan, *donut chart* pengeluaran per kategori, *area chart* harian, dan pie kebiasaan makan (semua *lazy-loaded*). |
| 📱 **PWA** | *Installable*, *offline-first* dengan Workbox, dan *auto-update service worker*. |

Seluruh data disimpan lokal di browser (`localStorage` via **Zustand persist**). Tersedia *seed data* agar aplikasi langsung terlihat berisi saat pertama dibuka.

---

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS 3 (dengan *CSS variables* untuk theming)
- **State Management:** Zustand (+ `persist` middleware)
- **Animasi:** Framer Motion
- **Charts:** Recharts
- **Routing:** React Router v6
- **Icons:** Lucide React
- **PWA:** vite-plugin-pwa (Workbox)
- **Utilities:** date-fns, nanoid

---

## 🚀 Cara Menjalankan

> Membutuhkan **Node.js >= 18**

```bash
# 1. Clone repository
git clone https://github.com/eevernexx/Aplikasi-Gue-ngekost.git
cd Aplikasi-Gue-ngekost

# 2. Install dependencies
npm install

# 3. Jalankan development server
npm run dev          # http://localhost:5173
```

### Script Lainnya

```bash
npm run build        # build produksi -> folder dist/
npm run preview      # preview hasil build
npm run icons        # regenerate ikon PWA (scripts/generate-icons.mjs)
```

---

## 📁 Struktur Proyek

```
src/
├── components/
│   ├── charts/      # CashflowChart, SpendingDonut, DailyBarChart
│   ├── layout/      # AppShell, Header, BottomNav, ErrorFallback
│   └── ui/          # StatCard, BottomSheet, FAB, SwipeToDelete, Badge,
│                    # EmptyState, TransactionItem, FoodItem, PackingItem,
│                    # AddTransactionSheet, AddFoodSheet
├── hooks/           # useCountUp, useLocalDate
├── lib/             # formatters, analytics
├── pages/           # Dashboard, Cashflow, FoodTracker,
│                    # PackingList, PackingTripDetail, Analytics
├── store/           # useFinanceStore, useFoodStore, usePackingStore
└── styles/          # index.css
scripts/             # generate-icons.mjs
```

---

## 🎨 Catatan Teknis & Keputusan Desain

Beberapa keputusan teknis yang diambil agar aplikasi *production-ready*:

1. **Single service worker** — SW di-*generate* sepenuhnya oleh `vite-plugin-pwa` (Workbox), menghindari konflik dua SW yang saling rebutan kontrol.
2. **Single manifest** — manifest didefinisikan satu kali di `vite.config.js` agar browser tidak salah baca.
3. **Ikon PWA asli** — `scripts/generate-icons.mjs` (sharp) menghasilkan PNG 192/512/maskable/apple yang valid, bukan placeholder.
4. **Error boundary** — pakai `react-error-boundary`, otomatis di-*reset* tiap ganti route.
5. **Count-up animation** — satu implementasi hook `useCountUp` berbasis `requestAnimationFrame` + *easeOutCubic*.
6. **Seed data relatif** — data contoh dihitung relatif terhadap hari ini (date-fns), jadi selalu terlihat "baru" kapan pun dibuka.

---

## 📦 Deploy

Hasil `npm run build` berupa *static files* di folder `dist/` yang bisa di-deploy ke **Vercel**, **Netlify**, **GitHub Pages**, atau hosting statis mana pun.

> ⚠️ Untuk SPA routing, pastikan host melakukan *fallback* semua route ke `index.html`.

---

## 📄 Lisensi

Dirilis di bawah lisensi **MIT** — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">

Dibuat dengan ☕ & 🍜 oleh **[Aryasatya Muhammad Aqsel](https://github.com/eevernexx)**

</div>
