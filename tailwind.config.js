/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332', // dark forest green
          mid: '#40916C',
          light: '#52B788',
        },
        accent: '#D8F3DC',
        surface: '#F8FAF8',
        card: '#FFFFFF',
        'text-main': '#1C1917',
        'text-sub': '#6B7280',
        danger: '#DC2626',
        warning: '#D97706',
        'app-border': '#E5E7EB',
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
