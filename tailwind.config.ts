/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4151d8",
          700: "#3730a3",
          800: "#312e81",
          900: "#1e1b4b",
        },
      },
      boxShadow: {
        soft: "0 2px 12px rgba(65,81,216,0.08)",
        card: "0 8px 32px rgba(65,81,216,0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        lift: "0 16px 48px rgba(65,81,216,0.16), inset 0 1px 0 rgba(255,255,255,0.85)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};
