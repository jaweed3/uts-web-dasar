tailwind.config = {
  theme: {
    extend: {
      colors: {
        cream: "#f2f2f2",
        alice: "#f2f2f2",
        peri: "#cccccc",

        brand: {
          50: "#f2f2f2",
          100: "#e6e6e6",
          200: "#cccccc",
          300: "#b3b3b3",
          400: "#999999",
          500: "#7f7f7f",
          600: "#666666",
          700: "#595959",
          800: "#3f3f3f",
          900: "#2b2b2b",
          950: "#1f1f1f",
        },
      },
      fontFamily: {
        sans: [
          '"EB Garamond"',
          '"Goudy Bookletter 1911"',
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
        display: [
          '"Goudy Bookletter 1911"',
          '"EB Garamond"',
          "Georgia",
          '"Times New Roman"',
          "serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43, 43, 43, 0.06), 0 18px 40px -32px rgba(43, 43, 43, 0.28)",
        float: "0 24px 60px -30px rgba(43, 43, 43, 0.40)",
        glow: "0 18px 40px -20px rgba(89, 89, 89, 0.40)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-in": "toast-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
};
