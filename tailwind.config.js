/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8eb8ff",
          400: "#5691ff",
          500: "#2b66e6",
          600: "#1a4fc4",
          700: "#163da3",
          800: "#163484",
          900: "#162f6b",
        },
        navy: {
          50: "#f3f5fb",
          100: "#e7ebf5",
          200: "#d0d9ec",
          300: "#a9b6d4",
          400: "#6c7da3",
          500: "#3c4a6e",
          600: "#2a3756",
          700: "#1f2a44",
          800: "#18233b",
          900: "#121c2e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(18, 28, 46, 0.04), 0 1px 3px 0 rgba(18, 28, 46, 0.06)",
        card: "0 4px 6px -1px rgba(18, 28, 46, 0.06), 0 2px 4px -2px rgba(18, 28, 46, 0.06)",
        lift: "0 12px 32px -12px rgba(18, 28, 46, 0.18)",
        glow: "0 0 0 1px rgba(43, 102, 230, 0.15), 0 8px 24px -8px rgba(43, 102, 230, 0.25)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #1a4fc4 0%, #2b66e6 50%, #5691ff 100%)",
        "gradient-dark": "linear-gradient(135deg, #121c2e 0%, #1f2a44 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
