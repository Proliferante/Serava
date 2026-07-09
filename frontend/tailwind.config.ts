import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Serava design tokens (from Figma)
        cream: "#e2cdae", // primary light text
        "cream-93": "#f7f1e5", // section background
        sand: "#dfc59f", // buttons/outline
        tan: "#c59f72", // accent headings
        "tan-63": "#c9a877",
        "brown-dark": "#492100", // dark brown text
        "brown-48": "#a57a4e",
        olive: "#9aa66f",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
