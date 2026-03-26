import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090B',
        surface: '#131316',
        card: '#18181B',
        elevated: '#1C1C20',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-strong': 'rgba(255, 255, 255, 0.12)',
        primary: '#FAFAFA',
        secondary: '#A1A1AA',
        tertiary: '#71717A',
        accent: '#C8A55A',
        'accent-muted': 'rgba(200, 165, 90, 0.12)',
        chart: {
          gold: '#C8A55A',
          teal: '#2DD4BF',
          sky: '#38BDF8',
          rose: '#FB7185',
          violet: '#A78BFA',
          emerald: '#34D399',
          amber: '#FBBF24',
        },
        control: {
          bg: 'rgba(0, 0, 0, 0.25)',
          border: 'rgba(255, 255, 255, 0.08)',
          focus: 'rgba(200, 165, 90, 0.4)',
        },
        semantic: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
          info: '#38BDF8',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      zIndex: {
        sidebar: '20',
        header: '30',
        overlay: '40',
        modal: '50',
      },
    },
  },
  plugins: [],
};

export default config;
