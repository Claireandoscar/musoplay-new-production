/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'patrick': ['Patrick Hand SC', 'cursive'],
      },
      colors: {
        'background': 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        'writing': 'var(--color-writing)',
        'special': 'var(--color-special)',
        'easy': 'var(--color-easy)',
        'medium': 'var(--color-medium)',
        'hard': 'var(--color-hard)',
      }
    },
  },
  plugins: [require("daisyui")],
}