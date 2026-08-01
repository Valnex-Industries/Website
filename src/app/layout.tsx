import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Preloader } from "@/components/Preloader";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Valnex Industries | Precision That Powers Progress",
  description:
    "Valnex Industries engineers advanced chillers, flake cutters, hopper loaders, laser marking machines, volumetric feeders, mould temperature controllers, and dehumidifiers for the world's most demanding production lines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo2.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
