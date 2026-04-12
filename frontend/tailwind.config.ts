import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#0f1629',
          tertiary: '#141d35',
        },
        accent: {
          cyan: '#00d4ff',
          green: '#00ff88',
          amber: '#ffaa00',
          red: '#ff3344',
        },
        text: {
          primary: '#e8eef7',
          muted: '#5a7a9f',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 12px rgba(0,212,255,0.3)',
        'glow-sm': '0 0 6px rgba(0,212,255,0.2)',
        'glow-green': '0 0 10px rgba(0,255,136,0.3)',
        'glow-amber': '0 0 10px rgba(255,170,0,0.3)',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 4s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
