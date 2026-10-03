export const theme = {
  brand: {
    primary: "#0F766E",
    primaryHover: "#0B5F59",
    primaryActive: "#094B47",
    primarySoft: "#E6F4F1",
  },
  neutral: {
    surface: "#FFFFFF",
    canvas: "#F6F8F8",
    ink: "#101916",
    muted: "#62716E",
    border: "#DCE4E2",
  },
  semantic: {
    success: { solid: "#15803D", soft: "#EAF7EE", ink: "#166534" },
    warning: { solid: "#B45309", soft: "#FFF7E8", ink: "#92400E" },
    danger: { solid: "#C2413A", soft: "#FFF0EF", ink: "#A3332D" },
    info: { solid: "#2563EB", soft: "#EFF6FF", ink: "#1E40AF" },
  },
  typography: {
    h1: { size: "32px", lineHeight: "1.15" },
    h2: { size: "24px", lineHeight: "1.25" },
    h3: { size: "20px", lineHeight: "1.35" },
    body: { size: "16px", lineHeight: "1.5" },
    small: { size: "14px", lineHeight: "1.5" },
    caption: { size: "12px", lineHeight: "1.4" },
  },
  spacing: { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px" },
  radii: { sm: "6px", md: "8px", lg: "12px" },
  shadows: {
    sm: "0 1px 2px rgb(16 25 22 / 0.06)",
    md: "0 8px 24px rgb(16 25 22 / 0.1)",
    lg: "0 20px 48px rgb(16 25 22 / 0.14)",
  },
  density: {
    comfortable: { controlHeight: "44px", gap: "16px", padding: "16px" },
    compact: { controlHeight: "36px", gap: "10px", padding: "10px" },
  },
  motion: { fast: "120ms", base: "180ms", slow: "240ms", easing: "cubic-bezier(0.2, 0, 0, 1)" },
};

export const densityTokens = theme.density;
export default theme;
