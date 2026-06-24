import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Festive primary (pink/magenta) — buttons, links, accents.
        brand: {
          50:  "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        // Deep grape — headings + dark header/footer.
        ink: {
          950: "#2e1065",
          900: "#3b0764",
          800: "#4c1d95",
          700: "#5b21b6",
        },
        // Sunny accent for small highlights / confetti touches.
        sun: {
          400: "#facc15",
          500: "#eab308",
        },
        cream: {
          50:  "#fffdfa",
          100: "#fff7f0",
          200: "#feecdc",
        },
      },
      fontFamily: {
        sans:    ["var(--font-nunito)", "system-ui", "sans-serif"],
        display: ["var(--font-fredoka)", "Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
