/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e5dafc",
          100: "#ab93f4",
          200: "#7c4dff",
          300: "#5b2ccf",
          500: "#5b2ccf",
          600: "#4b22b2",
          700: "#3d1b92",
        },

        cta: {
          DEFAULT: "#22bf59",
          dark: "#18a64a",
        },

        ink: {
          100: "#f5f7f9",
          200: "#eceff3",
          300: "#cbd5e1",
          700: "#334155",
          900: "#1a1a1a",
        },
      },

      boxShadow: {
        soft: "0 14px 35px rgba(91, 44, 207, 0.18)",
        cta: "0 16px 35px rgba(34, 191, 89, 0.25)",
        card: "0 12px 35px rgba(15, 23, 42, 0.08)",
      },

      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
        cairo: ["Cairo", "Inter", "system-ui", "sans-serif"],
      },

      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-2px)" },
          "40%": { transform: "translateX(2px)" },
          "60%": { transform: "translateX(-2px)" },
          "80%": { transform: "translateX(2px)" },
        },
      },

      animation: {
        shake: "shake 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};