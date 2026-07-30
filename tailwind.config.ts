import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: "#FAF7F2",
          light: "#FFFDF9",
          dark: "#F4EFE6",
          accent: "#EAE3D5"
        },
        charcoal: {
          DEFAULT: "#1C1917",
          muted: "#44403C",
          light: "#78716C"
        },
        terracotta: {
          DEFAULT: "#D8A934",
          dark: "#A77816",
          light: "#F2D37A"
        },
        amberGold: {
          DEFAULT: "#D8A934",
          light: "#F2D37A",
          dark: "#A77816"
        },
        stoneBorder: "#E5DEC9"
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        warm: "0 20px 50px -10px rgba(28, 25, 23, 0.08)",
        card: "0 4px 20px -2px rgba(28, 25, 23, 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
