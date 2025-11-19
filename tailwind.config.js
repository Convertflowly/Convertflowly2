/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB800',
          light: '#FFC933',
          dark: '#E69400',
        },
        accent: {
          DEFAULT: '#2B173B',
          light: '#3A1F4F',
          dark: '#140821',
        },
        dark: {
          DEFAULT: '#050012',
          card: '#170A2C',
          lighter: '#22123D',
        },
        magenta: {
          DEFAULT: '#FF4DD2',
          light: '#FF7BE0',
          dark: '#E024B8',
        },
        neutral: {
          DEFAULT: '#9CA3AF',
          light: '#E5E7EB',
          dark: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      animation: {
        'float-subtle': 'float-subtle 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        'gold-glow': 'gold-glow 2s ease-in-out infinite alternate',
        'professional-float': 'professional-float 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
