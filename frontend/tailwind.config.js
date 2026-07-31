/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#131313',
        'surface-dim': '#131313',
        'surface-bright': '#3a3939',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        primary: '#00dbe9', // Electric Cyan
        'primary-bright': '#dbfcff',
        'on-primary': '#00363a',
        'primary-container': '#00f0ff',
        'on-primary-container': '#006970',
        secondary: '#a9f900', // Toxic Lime
        'secondary-container': '#a9f900',
        'on-secondary-container': '#223600',
        'secondary-fixed-dim': '#94db00',
        tertiary: '#ffcaed', // Neon Magenta
        'tertiary-fixed-dim': '#fface8',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#b9cacb',
        outline: '#849495',
        'outline-variant': '#3b494b',
      },
      fontFamily: {
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 219, 233, 0.4)',
        'neon-cyan-lg': '0 0 35px rgba(0, 219, 233, 0.7)',
        'neon-lime': '0 0 20px rgba(169, 249, 0, 0.4)',
        'neon-magenta': '0 0 20px rgba(255, 202, 237, 0.4)',
      },
      animation: {
        'scanline': 'scan 4s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2s infinite ease-in-out',
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 219, 233, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 219, 233, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
