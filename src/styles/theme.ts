export const theme = {
  brand: {
    primary: "#0F766E",
    primaryHover: "#0B5F59",
    primaryActive: "#094B47",
    primarySoft: "#E6F4F1",
  },
  neutral: {
    0: "#FFFFFF",
    25: "#FCFDFD",
    50: "#F6F8F8",
    100: "#EEF2F1",
    200: "#DCE4E2",
    300: "#C4D0CD",
    400: "#83918E",
    500: "#62716E",
    600: "#465350",
    700: "#2D3936",
    800: "#1E2926",
    900: "#101916",
  },
  success: { solid: "#15803D", soft: "#EAF7EE", text: "#166534" },
  warning: { solid: "#B45309", soft: "#FFF7E8", text: "#92400E" },
  danger: { solid: "#C2413A", soft: "#FFF0EF", text: "#A3332D" },
  typography: {
    fontSans: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
    fontMono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
    sizes: { xs: "12px", sm: "14px", base: "16px", lg: "18px", xl: "20px", "2xl": "24px", "3xl": "30px", "4xl": "36px" },
  },
  spacing: { 0: "0", 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px" },
  radii: { sm: "6px", md: "8px", lg: "12px", pill: "999px" },
  shadows: { sm: "0 1px 2px rgb(16 25 22 / 0.06)", md: "0 8px 24px rgb(16 25 22 / 0.10)", lg: "0 20px 48px rgb(16 25 22 / 0.14)" },
  breakpoints: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1536px" },
  density: { comfortable: { controlHeight: "44px", gap: "16px", cellPadding: "16px" }, compact: { controlHeight: "36px", gap: "10px", cellPadding: "10px" } },
  motion: { fast: "120ms", base: "180ms", slow: "240ms", easing: "cubic-bezier(0.2, 0, 0, 1)" },
} as const;

export type Density = keyof typeof theme.density;
