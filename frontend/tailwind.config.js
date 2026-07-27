/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#7C3AED",
        background: "#FFFFFF",
        surface: "#E9EEF5",
        text: "#161616",
        success: "#2DD4BF",
        error: "#FF6B6B",
        warning: "#FFA366",
        info: "#C4B5FD"
      }
    },
  },
  plugins: [],
}
