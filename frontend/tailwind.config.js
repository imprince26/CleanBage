/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#15803D", 
          light: "#4ADE80", 
          dark: "#0F6B30",
        },
        background: {
          light: "#F3F4F6", 
          dark: "#111827",
        },
        accent: "#3B82F6", 
        warning: "#EAB308", 
        error: "#DC2626",
      },
    },
  },
  plugins: [],
};
