import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
     colors: {
  brand: {
    50: "#fff8f5",
    100: "#ffeee6",
    200: "#ffd9c7",
    300: "#ffb999",
    400: "#ff9062",
    500: "#f76b35",
    600: "#e5541f",   // үндсэн өнгө
    700: "#c04317",
    800: "#9a3815",
    900: "#7d3115",
  },
  warm: {
    50: "#fdfaf6",
    100: "#f7efe3",
    200: "#ecdcc4",
  },
},
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(20, 30, 25, 0.04), 0 4px 12px rgba(20, 30, 25, 0.03)",
        card: "0 2px 8px rgba(20, 30, 25, 0.05), 0 8px 24px rgba(20, 30, 25, 0.06)",
        lift: "0 4px 16px rgba(20, 30, 25, 0.08), 0 12px 32px rgba(20, 30, 25, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
