// TOLS Design System — Step 1: Framework + Persistent Fonts + Responsive + Motion
// This is the single source of truth for the exact framework clone

export const breakpoints = {
  mobile: 0,      // < 768
  tablet: 768,    // 768 - 1024
  desktop: 1024,  // >= 1024
  wide: 1440,
};

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
};

export const fonts = {
  // Persistent — loaded with font-display: swap, fallbacks to prevent FOUT
  body: '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  display: '"Archivo Black", "Oswald", ui-sans-serif, system-ui, sans-serif',
  heading: '"Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
};

// Framer Motion — professional presets (used across all pages)
// Shuffle uses spring for cards, easeOut for fades, no bouncy overshoot
export const motion = {
  spring: {
    soft: { type: "spring", stiffness: 300, damping: 30 },
    stiff: { type: "spring", stiffness: 400, damping: 25 },
    bouncy: { type: "spring", stiffness: 500, damping: 15 },
  },
  ease: {
    out: [0.16, 1, 0.3, 1], // easeOutExpo
    inOut: [0.65, 0, 0.35, 1],
  },
  durations: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
  },
  // Reusable variants
  fadeIn: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  cardHover: {
    hover: { y: -2, transition: { type: "spring", stiffness: 400, damping: 25 } },
  },
};
