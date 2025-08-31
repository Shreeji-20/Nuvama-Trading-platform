/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // Important for dark mode support
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Comfortable light theme colors
        light: {
          primary: "#fefefe", // Pure white with slight warmth
          secondary: "#f8fafc", // Very light gray
          tertiary: "#f1f5f9", // Light gray
          surface: "#ffffff", // Pure white surface
          elevated: "#f9fafb", // Slightly elevated surface
          border: "#e2e8f0", // Soft border color
          accent: "#3b82f6", // Blue accent (same as dark)
          success: "#059669", // Green (slightly darker for better contrast)
          warning: "#d97706", // Orange (adjusted for light background)
          error: "#dc2626", // Red (adjusted for light background)
          text: {
            primary: "#1e293b", // Dark blue-gray for main text
            secondary: "#475569", // Medium gray for secondary text
            muted: "#64748b", // Muted gray for less important text
          },
          card: {
            primary: "#ffffff", // White cards
            secondary: "#f8fafc", // Light gray cards
            hover: "#f1f5f9", // Hover state
          },
        },
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
        // Light theme gradients
        "light-gradient":
          "linear-gradient(135deg, #fefefe 0%, #f8fafc 50%, #f1f5f9 100%)",
        "light-card-gradient":
          "linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)",
        // Dark theme gradients
        "dark-gradient":
          "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        "dark-card-gradient":
          "linear-gradient(145deg, #1e293b 0%, #0e1628 100%)",
        // Custom dark solid backgrounds
        "dark-solid": "linear-gradient(135deg, #1f2937 0%, #1f2937 100%)", // gray-800 equivalent
        "dark-custom": "linear-gradient(135deg, #374151 0%, #374151 100%)", // gray-700 equivalent
        "dark-900": "linear-gradient(135deg, #111827 0%, #111827 100%)", // gray-900 equivalent
      },
      boxShadow: {
        // Light theme shadows - soft and subtle
        "light-sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "light-md":
          "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        "light-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        "light-xl":
          "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        "light-inner": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
        // Dark theme shadows
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
