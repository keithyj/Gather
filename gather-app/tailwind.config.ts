import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#19201D",
        paper: "#FAF8F2",
        moss: "#2F5B4A",
        clay: "#D46C4B",
        mist: "#E6EAE1"
      },
      boxShadow: {
        card: "0 18px 45px rgba(25, 32, 29, 0.12)",
        paper: "0 14px 30px rgba(25, 32, 29, 0.16)"
      },
      fontFamily: { display: ["Georgia", "serif"] }
    }
  },
  plugins: []
} satisfies Config;
