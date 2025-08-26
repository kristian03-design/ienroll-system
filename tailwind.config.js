/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#00BFFF",
        "primary-dark": "#0099CC",
        secondary: "#F8F9FA",
        "secondary-dark": "#E9ECEF",
        teal: "#20B2AA",
        "teal-dark": "#008B8B",
        accent: "#FFA500",
        "accent-dark": "#FF8C00",
        success: "#28A745",
        warning: "#FFC107",
        danger: "#DC3545",
        info: "#17A2B8",
        "sky-blue": "#00BFFF",
        teal: "#0d9488",
        "light-gray": "#f8fafc",
        orange: "#f97316",
        yellow: "#fbbf24",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
