import type { Metadata } from "next";
import { Nunito, Fredoka } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/schema";

// Self-hosted via next/font (no render-blocking external request). Nunito = body,
// Fredoka = rounded display face for the playful headings. Both exposed as CSS vars.
const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
});
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EZ Book A Party — Party FAQ & Video Library",
    template: "%s | EZ Book A Party FAQ",
  },
  description:
    "Quick answers to your party booking, payment, rental, setup, and policy questions — each with a short video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${fredoka.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
