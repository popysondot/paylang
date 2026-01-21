/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          green: '#10b981',
          orange: '#f59e0b',
        },
        surface: {
          DEFAULT: '#000000',
          black: '#000000',
          tint: '#080808',
        }
      }
    },
  },
  plugins: [],
}
