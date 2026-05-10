import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { shopConfig } from "@/config/shop";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${shopConfig.name} Cards`,
  description: `A mobile-first shop for manually priced Pokemon bulk cards in ${shopConfig.sellerLocation}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-stone-50 pb-16 text-stone-950 sm:pb-0">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
