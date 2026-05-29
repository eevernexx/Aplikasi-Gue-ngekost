import { AlertTriangle } from 'lucide-react';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle size={28} className="text-danger" />
      </div>
      <h2 className="mb-1 text-base font-semibold text-text-main">Ada yang error nih</h2>
      <p className="mb-4 max-w-xs text-sm text-text-sub">
        {error?.message || 'Terjadi kesalahan tak terduga.'}
      </p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft-sm active:scale-95 transition-transform"
      >
        Coba Lagi
      </button>
    </div>
  );
}
