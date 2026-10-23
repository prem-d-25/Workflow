/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        muted: "var(--muted)",

        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          foreground: "var(--accent-foreground)",
        },

        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          soft: "var(--danger-soft)",
        },
      },
      borderRadius: {
        control: "var(--radius-control)",
        panel: "var(--radius-panel)",
      },
      fontFamily: {
        sans: ["Geist Sans Variable", "Geist Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        floating: "0 8px 24px rgba(16, 24, 40, 0.10)",
      },
    },
  },
  plugins: [],
}
