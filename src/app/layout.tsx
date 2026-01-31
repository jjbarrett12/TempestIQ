import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "TempestIQ - AI-Powered Lead Generation for Roofing & Insurance",
  description: "Turn severe weather events into qualified leads. Real-time alerts help roofing companies and insurance agencies reach customers first and grow their business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ScrollToTopOnLoad />
        {children}
      </body>
    </html>
  );
}
