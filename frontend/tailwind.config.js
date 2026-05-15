/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF', 100: '#D9E8FF', 200: '#B3D0FF', 300: '#80B0FF',
          400: '#4D8FFF', 500: '#1A6AE0', 600: '#0052CC', 700: '#003EA5',
          800: '#002D7A', 900: '#001C52',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7' },
        surface: '#FFFFFF',
        bg: '#EEF2F8',
      },
      fontFamily: { sans: ['Rubik', 'Segoe UI', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,62,165,0.07), 0 4px 16px 0 rgba(0,62,165,0.05)',
        'card-hover': '0 4px 16px 0 rgba(0,62,165,0.14)',
      },
    },
  },
  plugins: [],
};
