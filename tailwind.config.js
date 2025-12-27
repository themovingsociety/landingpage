/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#667eea',
          600: '#5568d3',
          700: '#4c5ab8',
          800: '#424a97',
          900: '#3d417a',
        },
      },
      fontFamily: {
        cormorant: ['var(--font-cormorant)', 'serif'],
        antic: ['var(--font-antic)', 'serif'],
        serif: ['var(--font-cormorant)', 'serif'], // Por defecto usa Cormorant
      },
    },
  },
  plugins: [],
}

