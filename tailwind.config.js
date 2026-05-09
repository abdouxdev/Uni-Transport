/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#1D4ED8',
        'primary-light': '#EFF6FF',
        accent: '#0EA5E9',
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        surface: '#FFFFFF',
        'surface-alt': '#F8FAFC',
        border: '#E2E8F0',
        muted: '#64748B',
        foreground: '#0F172A',
      }
    },
  },
  plugins: [],
}
