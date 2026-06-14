import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        /* ── Shadcn/UI semantic colors ── */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* ── DTEK Core фоны ── */
        bg: {
          DEFAULT: '#07090d',
          '1': '#0a0e14',
        },

        /* ── DTEK Core поверхности ── */
        surface: {
          DEFAULT: '#0f141c',
          '2': '#141b25',
          '3': '#1a222e',
        },

        /* ── DTEK Core акцентные цвета ── */
        teal: {
          DEFAULT: '#2dd4bf',
          '2': '#14b8a6',
        },
        lime: '#5fcf80',
        amber: '#f5c451',
        orange: '#f59145',
        crit: '#f0566d',
        info: '#5b9bf5',

        /* ── DTEK Core текст ── */
        dim: '#95a3b3',
        mute: '#5d6b7c',
      },
      borderRadius: {
        /* Shadcn — три обязательных ключа */
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        /* DTEK — точные значения из дизайна */
        'dtek-sm': '7px',
        'dtek':    '11px',
        'dtek-lg': '16px',
        'dtek-xl': '22px',
      },
      boxShadow: {
        '1':  '0 1px 2px rgba(0,0,0,.4)',
        '2':  '0 12px 32px -8px rgba(0,0,0,.55)',
        'pop':'0 20px 50px -12px rgba(0,0,0,.7)',
      },
      keyframes: {
        /* Shadcn accordion */
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        /* DTEK анимации */
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
        pop: {
          from: { opacity: '0', transform: 'translateY(-6px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        fade: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        dotpulse: {
          '0%':   { boxShadow: '0 0 0 0 currentColor' },
          '70%':  { boxShadow: '0 0 0 6px transparent' },
          '100%': { boxShadow: '0 0 0 0 transparent' },
        },
        slidein: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        shimmer:   'shimmer 1.4s infinite',
        pop:       'pop 0.14s ease',
        fade:      'fade 0.15s ease',
        dotpulse:  'dotpulse 1.8s infinite',
        slidein:   'slidein 0.22s cubic-bezier(.2,.8,.2,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
