import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Variable font: one file per subset. Listing every weight makes Turbopack
// emit a font URL with multiple queries and the CI/Vercel build fails.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Whe&Back®",
  description:
    "Aiutami a Cambiare il Mondo, Compra e Vendi anche Tu! La piattaforma e-commerce etica con cashback e referral.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
