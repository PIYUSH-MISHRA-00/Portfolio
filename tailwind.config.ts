import type { Config } from "tailwindcss";

/**
 * Colours are CSS custom properties defined in globals.css so light/dark is a
 * single attribute flip on <html> with no duplicated Tailwind variants.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        raised: "var(--raised)",
        line: "var(--line)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display sizes: identical hierarchy on a phone and a 4K monitor.
        hero: ["clamp(2.75rem, 11vw, 8.5rem)", { lineHeight: "0.92", letterSpacing: "-0.04em" }],
        display: ["clamp(1.75rem, 5vw, 3.25rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        title: ["clamp(1.25rem, 2.6vw, 1.75rem)", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.18em" }],
      },
      maxWidth: { shell: "78rem" },
      screens: { xs: "26rem" },
    },
  },
  plugins: [],
};

export default config;
