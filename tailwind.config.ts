import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: "'Inter Variable', Arial, Helvetica, sans-serif",
        "dm-serif-display": "'DM Serif Display', serif",
      },
    },
  },
  plugins: [],
} satisfies Config;
