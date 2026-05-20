import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', md: '2rem', lg: '3rem' },
      screens: { sm: '640px', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1320px' },
    },
    extend: {
      colors: {
        ink: '#14130F',
        paper: '#F6F3EC',
        bone: '#ECE6D9',
        stone: '#8C7E66',     // reserved accent — use sparingly
        muted: '#6F6B62',
        line: 'rgba(20,19,15,0.08)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cormorant Garamond', 'serif'],
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // mobile-first; scales via responsive utilities
        'display-xl': ['clamp(2.75rem, 6vw + 1rem, 5.5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4vw + 1rem, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 2.5vw + 1rem, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },
      borderRadius: { xs: '2px', sm: '4px', DEFAULT: '6px' },
      spacing: { section: '6rem', 'section-lg': '9rem' },
      transitionTimingFunction: { editorial: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
};

export default config;
