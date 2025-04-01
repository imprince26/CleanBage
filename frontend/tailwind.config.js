/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enables dark mode using the "class" strategy
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15803D", // Green - Eco-friendly theme
          light: "#4ADE80", // Light green for CTA buttons
          dark: "#0F6B30", // Dark green for dark mode UI
        },
        background: {
          light: "#F3F4F6", // Light mode background (gray-100)
          dark: "#111827", // Dark mode background (gray-900)
        },
        accent: "#3B82F6", // Blue for tech & trust
        warning: "#EAB308", // Yellow for bin alerts
        error: "#DC2626", // Red for full-bin warnings
      },
    },
  },
  plugins: [],
};
