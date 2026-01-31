import type { Metadata } from "next";
import "./globals.css";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";

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
    <html lang="en">
      <body>
        <ScrollToTopOnLoad />
        {children}
      </body>
    </html>
  );
}
