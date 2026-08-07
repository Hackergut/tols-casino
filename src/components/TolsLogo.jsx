import React from "react";

/**
 * TOLS wordmark recreated as CSS: heavy geometric sans, transparent fill
 * with a neon lime outline over a dark radial-gradient tile — matches the
 * reference logo while staying crisp and scalable.
 */
export default function TolsLogo({ className = "", size = "md" }) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl sm:text-3xl",
    lg: "text-3xl sm:text-4xl",
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1 leading-none ${className}`}
      style={{ background: "radial-gradient(circle at center, #161d3a 0%, #0a0e22 100%)" }}
    >
      <span
        className={`font-black tracking-tight ${sizeClass}`}
        style={{
          fontFamily: '"Archivo Black", "Inter", ui-sans-serif, system-ui, sans-serif',
          color: "#ffffff",
          letterSpacing: "0.01em",
        }}
      >
        T<span style={{ color: "#ccff00", textShadow: "0 0 10px rgba(204,255,0,0.5)" }}>O</span>LS
      </span>
    </span>
  );
}