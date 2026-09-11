/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // SMRITI-SETU Restrained Healthcare Palette
        forest: {
          50: '#F4F7F4',
          100: '#E4EBE4',
          200: '#C3D4C4',
          300: '#9CBD9E',
          400: '#6C9B6E',
          500: '#467B48',
          600: '#346136',
          700: '#2A4E2C',
          800: '#1C4725', // Primary Forest Green
          900: '#14351B', // Deep Forest Navy
          950: '#0C2211',
        },
        cream: {
          DEFAULT: '#FAF8F5', // Soft Warm Background
          surface: '#F4EFE6', // Section Surface
          card: '#FFFFFF',
          border: '#E2DCD2', // Refined Muted Border
        },
        terracotta: {
          DEFAULT: '#B85C38', // NER Cultural Accent
          dark: '#934426',
          light: '#F8ECE6',
        },
        gold: {
          DEFAULT: '#C89B3C', // Warm Gold Accent
          dark: '#A67D28',
          light: '#FAF3E5',
        },
        charcoal: {
          DEFAULT: '#212529', // Body Text
          muted: '#6C757D',
          dark: '#121416',
        },
        govNavy: {
          dark: '#0B3B60',
          DEFAULT: '#004085',
          light: '#0056B3',
        },
        govYellow: {
          DEFAULT: '#FFC107',
          dark: '#E0A800',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'Noto Sans Assamese', 'Noto Sans Bengali', 'system-ui', 'sans-serif'],
        serif: ['Outfit', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 53, 27, 0.06)',
        'banner': '0 12px 32px -4px rgba(20, 53, 27, 0.10)',
        'gov': '0 2px 10px rgba(0, 64, 133, 0.08)',
      },
      maxWidth: {
        'content': '1200px', // Strict Single Layout Container Width
      }
    },
  },
  plugins: [],
};
