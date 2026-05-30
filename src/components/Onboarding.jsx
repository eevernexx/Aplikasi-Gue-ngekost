import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useT } from '../i18n';

export default function Onboarding() {
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const { t, lang, setLang } = useT();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('onb.nameReq'));
      return;
    }
    completeOnboarding(name);
  };

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-surface px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
            <Wallet size={30} />
          </span>
          <p className="text-sm font-medium text-text-sub">{t('onb.welcome')}</p>
          <h1 className="text-2xl font-bold text-text-main">Gue Ngekost</h1>
          <p className="mt-2 text-sm text-text-sub">{t('onb.tagline')}</p>
        </div>

        <div className="mb-5 flex rounded-xl bg-card p-1 shadow-soft-sm">
          {[
            { key: 'id', label: t('set.langId') },
            { key: 'en', label: t('set.langEn') },
          ].map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setLang(o.key)}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                lang === o.key ? 'bg-accent text-primary' : 'text-text-sub'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <label className="mb-1.5 block text-sm font-medium text-text-main">
            {t('onb.question')}
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            autoFocus
            placeholder={t('onb.namePh')}
            className="w-full rounded-xl border border-app-border bg-card px-4 py-3.5 text-base text-text-main outline-none focus:border-primary"
          />
          {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-soft active:scale-[0.98] transition-transform"
          >
            {t('onb.start')} <ArrowRight size={18} />
          </button>
          <p className="mt-3 text-center text-xs text-text-sub">{t('onb.langHint')}</p>
        </form>
      </motion.div>
    </div>
  );
}
