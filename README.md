# Gue Ngekost

Aplikasi pencatatan keuangan & gaya hidup harian buat anak kost. Mobile-first **Progressive Web App (PWA)** yang bisa di-install di HP, dan kini **responsif penuh** dari HP kecil sampai desktop.

> 🇬🇧 Default **Bahasa Indonesia**, dengan **toggle English** sekali ketuk — sekalian buat belajar bahasa Inggris. Ganti kapan saja di **Pengaturan** atau di layar pertama (onboarding).

## Fitur

- **Onboarding** — sekali di awal, aplikasi menanyakan nama lengkap kamu (disimpan lokal, tanpa login).
- **Dashboard** — sapaan dinamis dengan **namamu** (pagi/siang/sore/malam), saldo, ringkasan bulan ini, aksi cepat, progres budget.
- **Cashflow** — catat pemasukan/pengeluaran, kelompok per hari, swipe-to-delete.
- **Food Tracker** — catat makan harian per waktu, kalori & biaya.
- **Packing List** — checklist barang per trip dengan progress & preset cepat.
- **Analitik** — grafik cashflow 6 bulan, donut kategori, insight & rekomendasi (bilingual), export PDF.
- **Pengaturan** — ubah nama, ganti **bahasa (ID/EN)**, tema terang/gelap, reset seluruh data.
- **Tema** — mode terang/gelap, mengikuti preferensi sistem.

## Responsif & UX

- **HP (termasuk rasio 20:9 / 21:9)** — bottom tab bar, aman dari notch/punch-hole (safe-area atas & bawah), tanpa overflow horizontal (teruji dari 320px).
- **Tablet & Desktop (16:10 / 16:9)** — bottom bar berubah jadi **sidebar rail** vertikal; konten melebar ke kolom yang nyaman & terpusat (bukan sekadar HP yang diperbesar).
- **Keyboard-aware bottom sheet** — saat keyboard muncul, input & tombol simpan tetap terlihat dan bisa di-scroll (pakai `visualViewport`, ukuran `dvh`, dukungan safe-area).
- **Anti zoom iOS** — input dipaksa 16px di HP agar Safari tidak auto-zoom saat fokus.
- **FAB** mengikuti kolom aplikasi, bukan menempel ke pinggir layar di tablet/desktop.

## Teknologi

- React 18 + Vite
- React Router
- Zustand (state + persist ke localStorage)
- Tailwind CSS
- Framer Motion (animasi)
- Recharts (grafik)
- vite-plugin-pwa (installable & offline)

## Menjalankan

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Stabilitas (PWA)

- Service worker memakai `cleanupOutdatedCaches`, `clientsClaim`, `skipWaiting`, dan `navigateFallback` agar klien tidak nyangkut di aset/route lama.
- `lazyWithRetry` memuat ulang **sekali** jika sebuah code-split chunk usang setelah deploy — mencegah layar kosong (blank screen) di tab Analitik.

## Catatan

Semua data disimpan lokal di browser (localStorage). Tidak ada backend, tidak ada login.
