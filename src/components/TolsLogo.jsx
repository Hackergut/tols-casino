import React from "react";

export default function TolsLogo({ className = "", size = "md" }) {
  const sizes = { sm: "text-3xl", md: "text-4xl", lg: "text-6xl" };
  return <span className={`font-display uppercase leading-none tracking-[-0.08em] text-lime ${sizes[size]} ${className}`}>TOLS</span>;
}