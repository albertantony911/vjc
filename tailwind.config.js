/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/**/*.js',
  ],

  theme: {
    extend: {
      colors: {
        'darkBlue': '#01377D',   
        'darkGreen': '#7ED348',
        'lightGreen': '#adf6c4',
        'lightBlue': '#009DD1',
      },
      animation: {
        'infinite-scroll': 'infinite-scroll 25s linear infinite',
      },
      keyframes: {
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
    },
  },
};
