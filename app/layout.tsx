import "./globals.css";
// Add the Leaflet CSS here to fix the TS error and ensure map styling
import "leaflet/dist/leaflet.css"; 

import type { Metadata } from "next";
import CartFlyAnimation from "@/components/ui/CartFlyAnimation";
import { Playfair_Display } from "next/font/google"; 

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kumpra.ph | Multi-Store Ecommerce",
  description: "Your premium neighborhood marketplace",

  // ✅ ADDED: this sets your browser tab icon (favicon)
  icons: {
    icon: "/img/green_logo.png",
    shortcut: "/img/green_logo.png",
    apple: "/img/green_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={playfair.className}>
      <body className="antialiased">
        {children}
        <CartFlyAnimation />
      </body>
    </html>
  );
}