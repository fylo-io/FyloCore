import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "var(--border)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary))",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary))",
          foreground: "var(--secondary-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive))",
          foreground: "var(--destructive-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted))",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent))"
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        form: {
          background: "var(--form-background)",
          title: "var(--form-title)"
        },
        input: {
          background: "var(--input-background)",
          border: "var(--input-border)",
          text: "var(--input-text)"
        },
        header: {
          background: "var(--header-background)",
          border: "var(--header-border)",
          text: "var(--header-text)",
          dropdown: "var(--header-dropdown)"
        },
        sidePanel: {
          text_secondary: "var(--sidepanel-text-secondary)",
          text_primary: "var(--sidepanel-text-primary)",
          background: "var(--sidepanel-background)",
          border: "var(--sidepanel-outer-border)"
        }
      },
      fontFamily: {
        supermolot_neue: ["var(--font-supermolot-neue)"]
      },
      boxShadow: {
        container: "0px 1px 15.1px 4px rgba(10, 10, 10, 0.06)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      },
      backgroundImage: {
        "custom-gradient": "linear-gradient(252.61deg, #0167F8 -49.2%, #6EDE8A 130.36%)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;

export default config;
