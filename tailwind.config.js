/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'patrick': ['Patrick Hand SC', 'Patrick Hand', 'cursive'],
      },
      colors: {
        'background': '#fffdee',
        'background-alt': '#fffff5',
        'writing': '#1174B9',
        'special': '#AB08FF',
        'easy': '#00C22D',
        'medium': '#FF8A20',
        'hard': '#FF2376',
      }
    },
  },
  daisyui: {
    themes: [
      {
        musoplay: {
          "primary": "#1174B9",    // writing
          "secondary": "#AB08FF",  // special
          "accent": "#FF8A20",     // medium
          "neutral": "#fffdee",    // background
          "base-100": "#fffff5",   // other background
          "success": "#00C22D",    // easy
          "error": "#FF2376",      // hard
          // keeping some utility colors
          "info": "#3ABFF8",
          "warning": "#FBBD23",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
}