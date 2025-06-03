import localFont from "next/font/local";

export const supermolot_neue = localFont({
  src: [
    {
      path: "../../public/fonts/TT_Supermolot_Neue_Variable.woff2",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-supermolot-neue",
  weight: "400 700"
});
