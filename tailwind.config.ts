import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        brand: {
          gold: "hsl(var(--brand-gold))",
          honey: "hsl(var(--brand-honey))",
          amber: "hsl(var(--brand-amber))",
          coral: "hsl(var(--brand-coral))",
          rose: "hsl(var(--brand-rose))",
          lavender: "hsl(var(--brand-lavender))",
          periwinkle: "hsl(var(--brand-periwinkle))",
          "slate-blue": "hsl(var(--brand-slate-blue))",
          cyan: "hsl(var(--brand-cyan))",
          sage: "hsl(var(--brand-sage))",
        },
        neutral: {
          950: "hsl(var(--neutral-950))",
          925: "hsl(var(--neutral-925))",
          900: "hsl(var(--neutral-900))",
          875: "hsl(var(--neutral-875))",
          850: "hsl(var(--neutral-850))",
          800: "hsl(var(--neutral-800))",
          500: "hsl(var(--neutral-500))",
          100: "hsl(var(--neutral-100))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "var(--radius-xl)",
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-accent": "var(--shadow-glow-accent)",
        "glow-warm": "var(--shadow-glow-warm)",
        "glow-rainbow": "var(--shadow-glow-rainbow)",
        glass: "var(--shadow-glass)",
        "glass-subtle": "var(--shadow-glass-subtle)",
      },
      fontSize: {
        display: ["clamp(2.5rem, 4vw, 3.5rem)", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.02em" }],
        title: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.65", fontWeight: "400" }],
        caption: ["0.875rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(10px)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" },
        },
        "bounce-once": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "shimmer-sweep": {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "glow-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(24 95% 53% / 0.25), 0 0 40px hsl(24 95% 53% / 0.15)" 
          },
          "50%": { 
            boxShadow: "0 0 35px hsl(24 95% 53% / 0.4), 0 0 60px hsl(24 95% 53% / 0.25)" 
          },
        },
        "gentle-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "mesh-breathe": {
          "0%, 100%": { 
            opacity: "0.6",
            transform: "scale(1)",
          },
          "50%": { 
            opacity: "0.85",
            transform: "scale(1.08)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-out forwards",
        "scale-in": "scale-in 0.25s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "bounce-once": "bounce-once 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "slide-in-up": "slide-in-up 0.4s ease-out",
        "shimmer-sweep": "shimmer-sweep 2s linear infinite",
        "glow-pulse": "glow-pulse 2.5s ease-in-out infinite",
        "gentle-float": "gentle-float 4s ease-in-out infinite",
        "mesh-breathe": "mesh-breathe 6s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config;
