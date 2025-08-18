/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Important for dark mode support
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Enhanced dark theme colors
        dark: {
          primary: "#0f0f23", // Deep dark blue
          secondary: "#1a1a2e", // Dark blue-gray
          tertiary: "#16213e", // Medium blue-gray
          surface: "#0e1628", // Card background
          elevated: "#1e293b", // Elevated surface
          border: "#334155", // Border color
          accent: "#3b82f6", // Blue accent
          success: "#10b981", // Green
          warning: "#f59e0b", // Yellow/Orange
          error: "#ef4444", // Red
          text: {
            primary: "#f8fafc", // Near white
            secondary: "#cbd5e1", // Light gray
            muted: "#64748b", // Muted gray
          },
        },
        // Legacy colors (keeping for compatibility)
        bgDark: "#18181b",
        cardDark: "#23232a",
        accent: "#6366f1",
        textDark: "#e5e7eb",
        textMuted: "#a1a1aa",
      },
      backgroundImage: {
        "dark-gradient":
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        "dark-card-gradient":
          "linear-gradient(145deg, #1e293b 0%, #0e1628 100%)",
      },
      boxShadow: {
        "dark-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
        "dark-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
        "dark-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
