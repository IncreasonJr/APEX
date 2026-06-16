import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        accent: "var(--accent)",
        border: "var(--border-color)",
      },
      fontFamily: {
        sans: ["Geist Sans", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "var(--font-mono)", "monospace"],
        display: ["Cal Sans", "var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
