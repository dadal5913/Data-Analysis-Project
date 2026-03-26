import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1020",
        surface: "#121A2B",
        border: "#22304A",
        accent: "#4F8CFF"
      }
    }
  },
  plugins: []
};

export default config;
