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
          DEFAULT: '#051F45', // Navy Đêm #051F45 (Giảm độ chói mắt)
          light: '#0D2C5B',
          dark: '#03142E',
          deep: '#020C1C',
        },
        'navy-night': {
          DEFAULT: '#051F45', // Navy Đêm
          light: '#0D2C5B',
          dark: '#03142E',
          deep: '#020C1C',
        },
        'conan-blue': {
          DEFAULT: '#0D2C5B',
          light: '#1B4785',
          dark: '#051F45',
        },
        'conan-red': {
          DEFAULT: '#E63946', // Chữ X nổi bật màu đỏ
          hover: '#D90429',
          dark: '#9B111E',
          light: '#FF6B6B',
        },
        'conan-gold': {
          DEFAULT: '#FFF4C8', // Vàng Cream Nắng (Vàng Nhạt Bơ) #FFF4C8
          light: '#FFFBEB',
          dark: '#FBECA8',
          accent: '#F59E0B',
        },
        'breezy-blue': {
          DEFAULT: '#BED9F4', // Breezy Blue (Xanh Nhạt Dịu) #BED9F4
          light: '#DCEBFA',
          dark: '#97C1ED',
          soft: '#F0F6FD',
        },
        'bree-baby': {
          DEFAULT: '#BED9F4', // Breezy Blue #BED9F4
          light: '#DCEBFA',
          dark: '#97C1ED',
          soft: '#F0F6FD',
        },
        'cream-sun': {
          DEFAULT: '#FFF4C8', // Vàng Cream Nắng #FFF4C8
          light: '#FFFBEB',
          dark: '#FBECA8',
        },
        'bree-moon': {
          DEFAULT: '#FFF4C8', // Vàng Cream Nắng #FFF4C8
          soft: '#FFFBEB',
          dark: '#FBECA8',
        },
        'matcha-tea': {
          DEFAULT: '#838F58', // Matcha Tea #838F58
          light: '#9BA96E',
          dark: '#6B7645',
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
