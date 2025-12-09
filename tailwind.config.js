/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(59, 130, 246, 0.5)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'neon-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'neon-yellow': '0 0 20px rgba(234, 179, 8, 0.5)',
      },
      colors: {
        'factory': {
          'dark': '#0f172a',
          'blue': '#1e40af',
          'cyan': '#06b6d4',
        }
      }
    },
  },
  plugins: [],
}