/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace', 'system-ui'],
        minecraft: ['"VT323"', 'monospace', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace']
      },
      colors: {
        mc: {
          dark: '#111215',
          panel: '#282b30',
          border: '#3c3f41',
          green: '#4ade80',
          dirt: '#866043',
          stone: '#595959',
          wood: '#9a6b3d',
          gold: '#f59e0b',
          diamond: '#38bdf8',
          redstone: '#ef4444',
          nether: '#7f1d1d',
          end: '#581c87',
          obsidian: '#1e1b4b',
          portal: '#a855f7'
        }
      },
      boxShadow: {
        'pixel-sm': '2px 2px 0 0 rgba(0,0,0,0.6)',
        'pixel': '4px 4px 0 0 rgba(0,0,0,0.7)',
        'pixel-lg': '6px 6px 0 0 rgba(0,0,0,0.85)',
        'pixel-glow-gold': '0 0 15px rgba(245, 158, 11, 0.7), 4px 4px 0 0 rgba(0,0,0,0.8)',
        'pixel-glow-red': '0 0 15px rgba(239, 68, 68, 0.7), 4px 4px 0 0 rgba(0,0,0,0.8)',
        'pixel-glow-purple': '0 0 15px rgba(168, 85, 247, 0.7), 4px 4px 0 0 rgba(0,0,0,0.8)'
      }
    },
  },
  plugins: [],
}
