import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Cairo'", "ui-sans-serif", "system-ui"]
      },
      colors: {
        primary: {
          50: "#f0f7ff",
          100: "#dbeeff",
          200: "#b7dcfe",
          300: "#85c3fd",
          400: "#519efb",
          500: "#2a7ef5",
          600: "#1461d1",
          700: "#114dad",
          800: "#12418c",
          900: "#123770"
        },
        accent: {
          100: "#fff7e6",
          200: "#ffe0b3",
          300: "#ffc680",
          400: "#ffab52",
          500: "#ff9230"
        },
        surface: "#f6f7fb"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 43, 77, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

