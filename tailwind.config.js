/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'conan-navy': {
          DEFAULT: '#0B192C',
          light: '#1E3E62',
          dark: '#060E18',
          deep: '#050B14',
        },
        'conan-blue': {
          DEFAULT: '#1E3E62',
          light: '#2C5A88',
          dark: '#0B192C',
        },
        'conan-red': {
          DEFAULT: '#E63946',
          hover: '#D90429',
          dark: '#9B111E',
          light: '#FF6B6B',
        },
        'conan-gold': {
          DEFAULT: '#FEFDD0', // Vàng Ánh Trăng dịu mắt
          light: '#FFFEE6',
          dark: '#E2E1B0',
          accent: '#F59E0B',
        },
        'bree-baby': {
          DEFAULT: '#7DD3FC', // Xanh Baby
          light: '#BAE6FD',
          dark: '#38BDF8',
          soft: '#E0F2FE',
        },
        'bree-moon': {
          DEFAULT: '#FEFDD0', // Vàng Ánh Trăng #FEFDD0
          soft: '#FFFEE6',
          dark: '#E2E1B0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      animation: {
        'sound-wave': 'soundWave 1.2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        soundWave: {
          '0%, 100%': { height: '6px' },
          '50%': { height: '24px' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
