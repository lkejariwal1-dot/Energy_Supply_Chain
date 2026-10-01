/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        // Palette: Rich Charcoal bg / White text / Soft Gray muted / Muted Gold accent
        bg: {
          DEFAULT: '#121212',
          soft: '#0D0D0D'
        },
        surface: {
          DEFAULT: '#1A1A1A',
          raised: '#212121',
          hover: '#292929'
        },
        border: {
          DEFAULT: '#2E2E2E',
          strong: '#3D3D3D'
        },
        ink: {
          primary: '#FFFFFF',
          secondary: '#9E9E9E',
          muted: '#707070'
        },
        // "amber" token = primary CTA accent, Muted Gold
        amber: {
          DEFAULT: '#D4AF37',
          soft: '#2E2810',
          bright: '#E0C158'
        },
        // "cyan" token = secondary accent, softer champagne gold
        cyan: {
          DEFAULT: '#C5A880',
          soft: '#2B2419'
        },
        risk: {
          critical: '#E5484D',
          high: '#E2733A',
          medium: '#E8C13D',
          low: '#4FBF77',
          criticalSoft: '#3A1618',
          highSoft: '#33230F',
          mediumSoft: '#332C10',
          lowSoft: '#13301F'
        }
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 24px -12px rgba(0,0,0,0.5)'
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)'
      },
      backgroundSize: {
        grid: '28px 28px'
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' }
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        ticker: 'ticker 38s linear infinite',
        sweep: 'sweep 4s linear infinite'
      }
    }
  },
  plugins: []
}
