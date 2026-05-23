/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "Segoe UI", "sans-serif"],
        display: ["Space Grotesk", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
