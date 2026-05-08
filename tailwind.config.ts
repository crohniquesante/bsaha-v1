import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: "#4A7C5F",
        gold: "#B8922A",
        cream: "#FAF8F3",
        dark: "#1E2A22"
      }
    }
  },
  plugins: []
};

export default config;
