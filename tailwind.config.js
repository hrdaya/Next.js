/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        'sans-jp': ['var(--font-noto-sans-jp)'],
        'sans-kr': ['var(--font-noto-sans-kr)'],
        'sans-sc': ['var(--font-noto-sans-sc)'],
      },
    },
  },
  plugins: [],
};
