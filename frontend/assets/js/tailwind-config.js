tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          '"Plus Jakarta Sans"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 18px 40px -32px rgba(15, 23, 42, 0.35)",
        float: "0 24px 60px -30px rgba(15, 23, 42, 0.45)",
        glow: "0 18px 40px -20px rgba(21, 128, 61, 0.55)",
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
