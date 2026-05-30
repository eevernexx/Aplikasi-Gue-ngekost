import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Globe, Moon, Sun, Trash2, User } from 'lucide-react';
import Header from '../components/layout/Header';
import { useUserStore } from '../store/useUserStore';
import { useThemeStore } from '../store/useThemeStore';
import { useT } from '../i18n';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-app-border bg-card p-4 shadow-soft-sm">
      <div className="mb-3 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-primary" />}
        <h2 className="text-sm font-semibold text-text-main">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="flex rounded-xl bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
            value === o.key ? 'bg-card text-primary shadow-soft-sm' : 'text-text-sub'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const { t, lang, setLang } = useT();
  const fullName = useUserStore((s) => s.fullName);
  const setFullName = useUserStore((s) => s.setFullName);
  const resetData = useUserStore((s) => s.resetData);
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const [name, setName] = useState(fullName);
  const [saved, setSaved] = useState(false);

  const saveName = () => {
    setFullName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const confirmReset = () => {
    if (window.confirm(t('set.resetConfirm'))) resetData();
  };

  return (
    <>
      <Header title={t('set.title')} subtitle={t('set.subtitle')} showBack />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 px-5 pt-1"
      >
        <Section icon={User} title={t('set.profile')}>
          <label className="mb-1.5 block text-xs font-medium text-text-sub">
            {t('set.fullName')}
          </label>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('set.fullNamePh')}
              className="min-w-0 flex-1 rounded-xl border border-app-border bg-surface px-3 py-3 text-base text-text-main outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={saveName}
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-soft-sm active:scale-95 transition-transform"
            >
              {t('common.save')}
            </button>
          </div>
          {saved && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-light">
              <Check size={14} /> {t('set.nameSaved')}
            </p>
          )}
        </Section>

        <Section icon={Globe} title={t('set.appearance')}>
          <p className="mb-1.5 text-xs font-medium text-text-sub">{t('set.language')}</p>
          <Segmented
            value={lang}
            onChange={setLang}
            options={[
              { key: 'id', label: t('set.langId') },
              { key: 'en', label: t('set.langEn') },
            ]}
          />
          <p className="mb-1.5 mt-4 text-xs font-medium text-text-sub">{t('set.theme')}</p>
          <Segmented
            value={theme}
            onChange={setTheme}
            options={[
              { key: 'light', label: t('set.themeLight'), icon: <Sun size={15} /> },
              { key: 'dark', label: t('set.themeDark'), icon: <Moon size={15} /> },
            ]}
          />
        </Section>

        <Section icon={Trash2} title={t('set.data')}>
          <p className="mb-1 text-sm font-medium text-text-main">{t('set.resetTitle')}</p>
          <p className="mb-3 text-xs leading-relaxed text-text-sub">{t('set.resetDesc')}</p>
          <button
            type="button"
            onClick={confirmReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/5 py-3 text-sm font-semibold text-danger active:scale-[0.99] transition-transform"
          >
            <Trash2 size={16} /> {t('set.resetBtn')}
          </button>
        </Section>

        <p className="pb-2 text-center text-xs text-text-sub">
          Gue Ngekost · {t('set.version')} 1.0.0
        </p>
      </motion.div>
    </>
  );
}
