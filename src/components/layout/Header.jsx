import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Moon, Settings as SettingsIcon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { useT } from '../../i18n';

function ThemeToggle() {
  const { t } = useT();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-text-main shadow-soft-sm active:scale-90 transition-transform"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function Header({ title, subtitle, showBack = false, right = null }) {
  const navigate = useNavigate();
  const { t } = useT();
  return (
    <header className="sticky top-0 z-30 bg-surface/85 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1.25rem)] backdrop-blur-md md:pt-6">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label={t('common.back')}
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
        {!showBack && (
          <button
            type="button"
            onClick={() => navigate('/settings')}
            aria-label={t('nav.settings')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-text-main shadow-soft-sm active:scale-90 transition-transform"
          >
            <SettingsIcon size={18} />
          </button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
