/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      //自定義max-width
      maxWidth: {
        xxs: '15rem'
      }
    },
  },
  plugins: [],
}

