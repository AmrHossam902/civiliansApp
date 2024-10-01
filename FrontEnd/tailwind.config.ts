import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          lighter: "var(--primary-lighter)",
          light: "var(--primary-light)",
          dark: "var(--primary-dark)",
          darker: "var(--primary-darker)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          lighter: "var(--secondary-lighter)",
          light: "var(--secondary-light)",
          dark: "var(--secondary-dark)",
          darker: "var(--secondary-darker)"
        },

      }
    }
  },
  plugins: [nextui()],
};
export default config;
