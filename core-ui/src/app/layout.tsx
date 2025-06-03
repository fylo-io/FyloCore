import "@xyflow/react/dist/style.css";
import { Toaster } from "react-hot-toast";
import { supermolot_neue } from "../styles/fonts";
import "./globals.css";
import RootLayoutClient from "./layout-client";

export const metadata = {
  title: "Fylogenesis",
  icons: [
    { rel: "icon", type: "image/svg+xml", url: "/images/fylo-logo.svg" },
    { rel: "apple-touch-icon", url: "/fylo-logo.svg" }
  ]
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${supermolot_neue.variable} antialiased`}>
        <RootLayoutClient>
          <Toaster position="top-right" />
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
};

export default RootLayout;
