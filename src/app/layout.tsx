import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "AutoRadar — Inteligencia de Mercado Automotriz",
  description:
    "Detección de oportunidades en tiempo real en el mercado de autos usados de Uruguay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} ${outfit.variable} antialiased scanline`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-6 sm:py-8 lg:py-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
