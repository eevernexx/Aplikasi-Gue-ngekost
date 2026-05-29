import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Header({ title, subtitle, showBack = false, right = null }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-surface/85 px-5 pb-3 pt-5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Kembali"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-soft-sm active:scale-90"
          >
            <ChevronLeft size={20} className="text-text-main" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          {subtitle && <p className="text-xs font-medium text-text-sub">{subtitle}</p>}
          <h1 className="truncate text-xl font-bold text-text-main">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  );
}
