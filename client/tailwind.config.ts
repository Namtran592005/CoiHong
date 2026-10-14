import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#08080b',
          900: '#0d0d12',
          850: '#131319',
          800: '#1a1a21',
          700: '#26262f',
          600: '#3a3a45',
        },
        ink: {
          DEFAULT: '#f5f5f7',
          muted: '#b4b4bd',
          faint: '#93939e',
        },
        accent: {
          DEFAULT: '#eab308',
          soft: '#facc15',
          deep: '#ca8a04',
          dim: '#854d0e',
        },
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
        display: ['Shrikhand', 'Impact', 'Arial Narrow', 'sans-serif'],
        title: ['Oswald', 'Arial Narrow', 'Inter Variable', 'sans-serif'],
        label: ['Lexend', 'Inter Variable', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.125rem',
        card: '1.25rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 20px 50px -20px rgba(0,0,0,0.9)',
        lift: '0 24px 60px -24px rgba(0,0,0,0.95)',
        glowAccent: '0 8px 30px -8px rgba(245, 197, 24, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.97)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'splash-fill': {
          from: { width: '0%' },
          to: { width: '100%' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both',
        'splash-fill': 'splash-fill linear forwards',
        marquee: 'marquee 34s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config