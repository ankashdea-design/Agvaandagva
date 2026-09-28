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
          50: "#f2f5ff",
          100: "#e4ebff",
          200: "#c7d6fe",
          300: "#a4b8fb",
          400: "#7f95f6",
          500: "#5b72ee",
          600: "#4151d8",
          700: "#3643b8",
          800: "#2e3894",
          900: "#293073",
        },
        warm: {
          50: "#f7f9fc",
          100: "#eef2f8",
          200: "#dde5f2",
        },
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 3px rgba(41, 48, 115, 0.05), 0 4px 12px rgba(41, 48, 115, 0.04)",
        card: "0 8px 32px rgba(41, 48, 115, 0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
        lift: "0 16px 48px rgba(41, 48, 115, 0.16), inset 0 1px 0 rgba(255,255,255,0.85)",
      },
    },
  },
  plugins: [],
};
export default config;
