/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/*.html`],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["dark"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
