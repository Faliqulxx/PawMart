import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PawMart POS — Sistem Kasir Pet Shop Modern",
  description: "Aplikasi kasir (Point of Sale) modern untuk pet shop dengan manajemen transaksi cepat, katalog produk, kontrol stok, dan profil hewan peliharaan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#F7F5F1] text-[#1F2937]">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
