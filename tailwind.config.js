/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heebo: ['Heebo', 'sans-serif'],
      },
      colors: {
        brand: {
          purple: '#6C3BE0',
          navy: '#0F0E1F',
          card: '#1A1930',
          border: '#2D2B50',
        },
      },
    },
  },
  plugins: [],
}
