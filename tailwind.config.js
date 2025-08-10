/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // 추가 작성
  theme: {
    extend: {
      keyframes: {
        bounceSmall: {
          "0%, 100%": { transform: "translate(30%, 0)" },
          "50%": { transform: "translate(30%, -7px)" },
        },
        bounceBig: {
          "0%, 100%": { transform: "translate(30%, 0)" },
          "50%": { transform: "translate(30%, -3px)" },
        },
        raindropSmall: {
          "0%": { transform: "translateY(0)", opacity: 1 },
          "70%": { transform: "translateY(20px)", opacity: 0.6 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        raindropMid: {
          "0%": { transform: "translateY(0)", opacity: 1 },
          "70%": { transform: "translateY(20px)", opacity: 0.6 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        raindropBig: {
          "0%, 100%": { transform: "translate(30%, 0)", opacity: 1 },
          "50%": { transform: "translate(30%, 10px)", opacity: 0.6 },
        },
      },
      animation: {
        bounceSmall: "bounceSmall 2s infinite ease-in-out",
        bounceBig: "bounceBig 2s infinite ease-in-out",
        raindropSmall: "raindropSmall 3s infinite ease-in-out",
        raindropMid: "raindropMid 2.95s infinite ease-in-out",
        raindropBig: "raindropBig 3.2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
