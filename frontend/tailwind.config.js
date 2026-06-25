/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        secBackground: "#111827",
        cardBg: "#1A1F2E",
        borderColor: "#2A3144",
        primaryAccent: "#7C3AED",
        secondaryAccent: "#06B6D4",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        textMain: "#F8FAFC",
        textMuted: "#94A3B8",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'glass-grad': 'linear-gradient(135deg, rgba(26, 31, 46, 0.6) 0%, rgba(17, 24, 39, 0.4) 100%)',
        'glow-grad': 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-purple': '0 0 15px rgba(124, 58, 237, 0.4)',
        'neon-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
