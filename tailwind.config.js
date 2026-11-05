/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        surface: '#f5f7fa',
        line: '#dfe5ee',
        ink: { 900: '#0f1b2d', 700: '#2b3a52', 500: '#526077', 400: '#7b889c' },
        brand: { 50: '#eef4ff', 100: '#dbe7ff', 600: '#1f5fd1', 700: '#184fb3' },
        teal: { 50: '#e8f7f5', 700: '#0f766e' },
      },
    },
  },
  plugins: [],
};
