import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f5",
          100: "#e6ede8",
          200: "#c9dbd0",
          300: "#a3c2ae",
          400: "#749f85",
          500: "#4f7d62",
          600: "#3c634d",
          700: "#314f3f",
          800: "#2a4035",
          900: "#24362d",
        },
        warm: {
          50: "#fbf8f4",
          100: "#f4ecdf",
          200: "#e7d5b8",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(20, 30, 25, 0.06)",
        card: "0 4px 20px rgba(20, 30, 25, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
