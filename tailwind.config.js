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
    },
  },
  daisyui: {
    themes: [
      {
        musoplay: {
          "primary": "#3b82f6",
          "secondary": "#9333ea",
          "accent": "#FFD700",
          "neutral": "#191D24",
          "base-100": "#ffffff",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}