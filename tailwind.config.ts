import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F3F6FA",
        surface: "#FFFFFF",
        navy: {
          DEFAULT: "#0F1A2C",
          800: "#0F1A2C",
          900: "#080F1C"
        },
        blue: {
          DEFAULT: "#1A6BFF",
          50: "#EEF4FE",
          100: "#D9E7FD",
          200: "#B8D4FC",
          500: "#3B82F6",
          600: "#1A6BFF",
          700: "#1054CC"
        },
        orange: {
          DEFAULT: "#FF9500",
          50: "#FFF8ED",
          100: "#FFEECF",
          500: "#FF9500",
          600: "#E08300"
        },
        pastel: {
          blue: "#EEF4FE",
          green: "#EAF7EE",
          purple: "#F0EEFF",
          amber: "#FFF7ED",
          rose: "#FFF0F2"
        },
        border: "#E7ECF3"
      },
      fontFamily: {
        heading: ["var(--font-plus-jakarta)", "'Plus Jakarta Sans'", "sans-serif"],
        body: ["var(--font-dm-sans)", "'DM Sans'", "sans-serif"],
        table: ["var(--font-inter)", "'Inter'", "sans-serif"]
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "20px",
        "3xl": "26px",
        full: "9999px"
      },
      boxShadow: {
        card: "0 2px 12px -2px rgba(18, 38, 63, 0.05), 0 1px 4px 0 rgba(18, 38, 63, 0.02)",
        floating: "0 8px 24px -4px rgba(18, 38, 63, 0.08)",
        active: "0 4px 14px 0 rgba(26, 107, 255, 0.16)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.03)"
      }
    }
  },
  plugins: []
} satisfies Config;
