/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7c5cff",
        primarySoft: "#c8b6ff",
        accent: "#ffb4d9",
        ink: "#1f1b33",
        mist: "#f5f3ff",
        glass: "rgba(255, 255, 255, 0.55)",
        glassBorder: "rgba(255, 255, 255, 0.35)",
      },
    },
  },
  plugins: [],
};
