/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Driven by CSS variables (see src/styles/index.css) so the whole
        // palette swaps for dark mode without touching component classes.
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          mid: 'rgb(var(--color-primary-mid) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
        },
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
        'text-sub': 'rgb(var(--color-text-sub) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'app-border': 'rgb(var(--color-border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -8px rgba(27, 67, 50, 0.12)',
        'soft-sm': '0 2px 12px -6px rgba(27, 67, 50, 0.10)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
};
